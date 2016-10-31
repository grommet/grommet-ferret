// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

var _ = require('lodash');
var express = require('express');
var router = express.Router();
var ws = require("ws");
var stringify = require("json-stringify-pretty-compact");
var data = require('./data');
var generator = require('./generator');
var filter = require('./filter');
var map = require('./map');
var ldap = require('./ldap');

var RESPONSE_DELAY = 0;
var TASK_UPDATE_INTERVAL = 1000;

var latestGruToken = undefined;

// Actions

function filteredItems (items, queryParams) {
  if (queryParams.userQuery) {
    items = filter.filterUserQuery(items, queryParams.userQuery);
  }
  if (queryParams.query) {
    items = filter.filterQuery(items, queryParams.query);
  }
  if (queryParams.filter) {
    items = filter.filterFilter(items, queryParams.filter);
  }
  return items;
}

function getItems (url, queryParams) {
  var items = data.getItems(queryParams.category) || [];
  var unfilteredTotal = items.length;
  items = filteredItems(items, queryParams);

  if (queryParams.sort) {
    filter.sort(items, queryParams.sort);
  }

  var startIndex = +queryParams.start; // coerce to be a number
  if (queryParams.referenceUri) {
    items.some(function(item, index) {
      if (queryParams.referenceUri === item.uri) {
        startIndex = Math.max(index - Math.floor(queryParams.count / 2), 0);
        return true;
      }
      return false;
    });
  }

  // prune for start+count
  var total = items.length;
  items = items.slice(startIndex, startIndex + queryParams.count);

  return {
    category: queryParams.category,
    start: startIndex,
    count: items.length,
    total: total,
    unfilteredTotal: unfilteredTotal,
    items: items
  };
}

function updateAggregateCounts (counts, resource, value, intervals) {
  var count = null;
  for (var i = 0; i < counts.length; i++) {
    if (value === counts[i].value) {
      count = counts[i];
      break;
    }
  }

  if (!count) {
    count = {value: value, count: 0};
    if (intervals) {
      count.intervals = _.map(intervals, _.clone);
    }
    counts.push(count);
  }
  count.count += 1;

  if (count.intervals) {
    count.intervals.forEach(function(interval) {
      if (! interval.count) {
        interval.count = 0;
      }
      if (resource.created >= interval.start &&
        resource.created <= interval.stop) {
        interval.count += 1;
      }
    });
  }
}

function getAggregate (url, queryParams) {
  var items = data.getItems(queryParams.category) || [];
  items = filteredItems(items, queryParams);

  var attributes;
  if (Array.isArray(queryParams.attribute)) {
    attributes = queryParams.attribute;
  } else {
    attributes = [queryParams.attribute];
  }
  var result = attributes.map(function(attribute) {
    return {
      attribute: attribute,
      counts: []
    };
  });

  var intervals = null;
  if (queryParams.interval) {
    intervals = [];
    var stop =  new Date();
    stop.setHours(23, 59, 59, 999);
    for (var i = 0; i < queryParams.count; i++) {
      var start = new Date(stop.getTime() + 1);
      start.setDate(start.getDate() - 1);
      intervals.push({start: start.toISOString(), stop: stop.toISOString()});
      stop = new Date(start.getTime() - 1);
    }
  }

  items.some(function(resource) {
    result.forEach(function(attributeResult) {

      var value;
      if (resource.hasOwnProperty(attributeResult.attribute)) {
        value = resource[attributeResult.attribute];
      } else if (resource.attributes &&
        resource.attributes.hasOwnProperty(attributeResult.attribute)) {
        value = resource.attributes[attributeResult.attribute];
      }

      if (undefined !== value) {
        updateAggregateCounts(attributeResult.counts,
          resource, value, intervals);
      }
    });
  });

  return result;
}

// WebSocket interaction

var socketServer;
var connections = [];

function closeConnection (connection) {
  if (connection.ws) {
    connection.ws.close();
    connection.ws = null;
    var index = connections.indexOf(connection);
    connections.splice(index, 1);
  }
}

var MAP_REGEXP = /^\/rest\/index\/trees\/aggregated(.+)$/;

function respondToRequest (connection, request) {
  var response = {op: 'update', id: request.id};

  try {
    if ('/rest/index/resources' === request.uri) {
      response.result = getItems(request.uri, request.params);
    } else if ('/rest/index/resources/aggregated' === request.uri) {
      response.result = getAggregate(request.uri, request.params);
    } else if (MAP_REGEXP.test(request.uri)) {
      var uri = MAP_REGEXP.exec(request.uri)[1];
      response.result = map.build(uri);
    } else {
      var resource = data.getResource(request.uri);
      if (resource) {
        response.result = resource;
      } else {
        response.op = 'error';
        response.result = 'unknown uri ' + request.uri;
      }
    }
  } catch (e) {
    console.log('!!! exception', e);
    response.op = 'error';
    response.result = e.message;
  }

  if (connection.ws) {
    var serializedResponse = JSON.stringify(response);
    console.log(response.op.toUpperCase(), request.uri,
      stringify(request.params), serializedResponse.length);
    setTimeout(function () {
      connection.ws.send(serializedResponse);
    }, RESPONSE_DELAY);
  }

  // if ('error' === response.op) {
  //   closeConnection(connection);
  // }
}

function parseQuery(string) {
  var params = string.split('&');
  var result = {};
  params.forEach(function (param) {
    var parts = param.split('=');
    // if we already have this parameter, it must be an array
    if (result[parts[0]]) {
      if (! Array.isArray(result[parts[0]])) {
        result[parts[0]] = [result[parts[0]]];
      }
      result[parts[0]].push(decodeURIComponent(parts[1]));
    } else {
      result[parts[0]] = decodeURIComponent(parts[1]);
    }
  });
  return result;
}

function onMessage (connection, request) {
  if ('start' === request.op) {
    // Split out query parameters
    var parts = request.uri.split('?');
    request.uri = parts[0];
    request.params = parseQuery(parts[1] || '');
    console.log('WATCH', request.uri, request.id, request.params);
    connection.requests.push(request);
    respondToRequest(connection, request);
  } else if ('stop' === request.op) {
    console.log('STOP', request.id);
    // Remove request
    connection.requests = connection.requests.filter(function (req) {
      return (req.id !== request.id);
    });
  } else if ('ping' === request.op) {
    var serializedResponse = JSON.stringify({ op: 'ping' });
    setTimeout(function () {
      connection.ws.send(serializedResponse);
    }, RESPONSE_DELAY);
  } else {
    if (connection.ws) {
      connection.ws.send({error: 'unknown op ' + request.op});
      closeConnection(connection);
    }
  }
}

function onConnection (ws) {
  var connection = {
    ws: ws,
    requests: []
  };
  connections.push(connection);

  ws.on('message', function incoming(message) {
    onMessage(connection, JSON.parse(message));
  });

  ws.on("close", function () {
    closeConnection(connection);
  });
}

function initializeSocket (server, prefix) {
  var path = prefix + "ws";
  socketServer = new ws.Server({server: server, path: path});
  console.log('Listening for web socket connections at ' + path);
  socketServer.on("connection", onConnection);
}

function requestMatches (request, events) {
  // If the request category(ies) or the request url match the change, respond
  var category;
  var uri;
  if (request.params && request.params.category) {
    category = request.params.category;
  } else {
    uri = request.uri;
  }
  return events.some(function (event) {
    if (category) {
      return (category === event.category ||
        (Array.isArray(category) &&
        category.indexOf(event.category) !== -1));
    } else {
      return (uri === event.uri);
    }
  });
}

function onResourceChange (resource, task) {
  var events = [];
  if (resource) {
    events.push({category: resource.category, uri: resource.uri});
  }
  if (task) {
    events.push({category: task.category, uri: task.uri});
  }
  connections.forEach(function (connection) {
    connection.requests.forEach(function (request) {
      if (requestMatches(request, events)) {
        respondToRequest(connection, request);
      }
    });
  });
}

// REST interaction

router.get('/status', function(req, res) {
  var status = data.getStatus();
  if (status) {
    res.json(status);
  } else {
    res.status(404).send();
  }
});

router.put('/status', function(req, res) {
  data.setStatus(req.body);
  res.json(null);
});

function roleForUserName (userName) {
  if (! userName) {
    return null;
  } else if ('u' === userName[0].toLowerCase()) {
    return 'virtualization user';
  } else if ('r' === userName[0].toLowerCase()) {
    return 'read only';
  } else {
    return 'infrastucture administrator';
  }
}

router.post('/login-sessions', function(req, res) {
  if (! req.body.userName || ! req.body.password ||
    'error' === req.body.userName ||
    ('Gru' === req.body.userName && 'freeze ray' !== req.body.password)) {
    res.status(401, "Invalid username or password.").send();
  } else {
    var token = req.body.userName + '-' + (new Date()).getTime().toString(10);
    data.addSession(token, {
      userName: req.body.userName,
      role: roleForUserName(req.body.userName),
      roles: [roleForUserName(req.body.userName)]
    });
    if ('Gru' === req.body.userName) {
      latestGruToken = token;
    }
    var preferences = data.getPreferences(req.body.userName);
    var settings = data.getSettings();
    res.json({
      sessionID: token,
      needPasswordReset: (! settings.network && ! preferences)
    });
  }
});

router.delete('/login-sessions', function(req, res) {
  res.json(null);
});

router.post('/reset-password', function(req, res) {
  data.setPreferences(req.body.userName, 'users', {needPasswordReset: false});
  res.json(null);
});

router.get('/sessions', function(req, res) {
  var token = req.headers.auth;
  var session = data.getSession(token);
  if (session) {
    res.json(session);
  } else {
    res.status(404).send();
  }
});

router.get('/authz/role', function(req, res) {
  var token = req.headers.auth;
  var session = data.getSession(token);
  if (session) {
    res.json(session);
  } else {
    res.status(404).send();
  }
});

router.get('/preferences/index', function(req, res) {
  var preferences = data.getPreferences(req.headers.auth, req.query.category);
  if (! preferences) {
    res.status(404).send();
  } else {
    res.json(preferences);
  }
});

router.get('/settings', function(req, res) {
  var settings = data.getSettings();
  if (settings) {
    res.json(settings);
  } else {
    res.status(404).send();
  }
});

router.put('/settings', function(req, res) {
  var resource = data.getResource('/rest/appliances/1');
  var settings = req.body;
  settings.state = 'done';
  settings.modified = (new Date()).toISOString();
  // don't persist credentials
  delete settings.nodesCommonUserName;
  delete settings.nodesCommonPassword;
  settings.nodes.forEach(function (node) {
    delete node.userName;
    delete node.password;
    delete node.useCommonCredentials;
    // convert manage nodes to managed
    node.managed = node.manage;
    delete node.manage;
    if (! node.managed) {
      delete node.address;
    }
  });
  // don't persist errors
  delete settings.errors;

  data.setSettings(settings);
  if (settings.hypervisor && settings.hypervisor.certifcate) {
    data.setCertificate(settings.hypervisor.address,
      settings.hypervisor.certificate);
  }
  if (settings.directory && settings.directory.certifcate) {
    data.setCertificate(settings.directory.address,
      settings.directory.certificate);
  }
  var task = createTask('appliances', 'Update', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, null, function () {

    // simulate an error if the name has "error" in it
    if (settings.name.match(/invalid/)) {
      task.status = 'Critical';
      task.state = 'Error';
      task.taskErrors = [{
        message: "The appliance-1 IPv4 and IPv4 gateway addresses are not " +
          "in the same subnet (255.255.240.0).",
        recommendedActions: "Change either address or widen the subnet mask."
      }];
      settings.errors = {
        network: [
          {
            message: "The appliance-1 IPv4 and IPv4 gateway addresses are " +
              "not in the same subnet (255.255.240.0).",
            resolution: "Change either address or widen the subnet mask."
          },
          {
            message: "Supplied IP Address 10.0.0.1 is duplicate for one or " +
              "more fields.",
            resolution: "Specify unique IP Address for each IP Address field."
          }
        ],
        hypervisor: [
          {
            message: "Unable to authenticate vCenter at 10.0.0.1 with the " +
              "supplied credentials.",
            resolution: "Change the credentials and/or verify the IP address."
          }
        ],
        directory: [
          {
            message: "Unable to authenticate directory at ldap.my.com with " +
              "the supplied credentials.",
            resolution: "Change the credentials and/or verify the address."
          }
        ],
        nodes: [
          {
            message: "Unable to authenticate the node at 10.0.0.1 with the " +
              "supplied credentials.",
            resolution: "Change the credentials and/or verify the IP address."
          }
        ]
      };
      data.setSettings(settings);
    }

    data.setStatus({state: 'ready'});
  });
});

router.get('/certificate', function(req, res) {
  var address = req.query.address;
  var certificate = data.getCertificate(address);
  if (certificate) {
    res.json({
      result: 'trusted',
      certificate: certificate
    });
  } else {
    // simulate delay
    setTimeout(function () {
      certificate = {
        name: 'Hewlett Packard Enterprise Class 3 Certificate (simulated)',
        issuedBy: 'Hewlett Packard Enterprise',
        expires: '2018-12-20T07:34:00'
      };
      res.json({
        result: 'not trusted',
        certificate: certificate
      });
    }, TASK_UPDATE_INTERVAL);
  }
});

router.post('/connection', function(req, res) {
  // simulate delay
  setTimeout(function () {
    if ('error' === req.body.userName || ! req.body.userName ||
      ! req.body.password) {
      res.status(400).json({
        message: "Invalid username or password."
      });
    } else {
      res.status(200).send();
    }
  }, TASK_UPDATE_INTERVAL);
});

router.get('/directory/search', function(req, res) {
  ldap(req.query, function (result) {
    res.json(result);
  }, function (error) {
    res.status(500).send();
  });
});

// for now, this is the path for performing a restore operation
router.post('/settings', function(req, res) {
  var resource = data.getResource('/rest/appliances/1');
  var file = req.files.file;
  var settings = JSON.parse(file.data.toString('utf-8', 0, file.size));
  data.setSettings(settings);
  var task = createTask('appliances', 'Restore', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, null, function () {
    data.setStatus({state: 'ready'});
  });
});

router.get('/update', function(req, res) {
  var update = data.getUpdate();
  if (update) {
    res.json(update);
  } else {
    res.status(404).send();
  }
});

router.post('/update/upload', function(req, res) {
  var resource = data.getResource('/rest/appliances/1');
  var file = req.files.file;
  var task = createTask('appliances', 'Upload software', resource, req);
  // we start this task at 50% to account for the time taken uploading
  task.percentComplete = 50;

  res.json({
    taskUri: task.uri
  });

  runTask(task, resource, function () {
    // simulate file contents
    var settings = data.getSettings();
    var version = (Math.round(parseFloat(settings.version, 10) * 10) + 1) / 10;
    var update = {
      version: version,
      file: {name: file.name},
      hypervisor: {version: 5.1},
      releaseNotes: 'http://ferret.grommet.io/release-notes',
      eula: 'http://ferret.grommet.io/eula',
      writtenOffer: 'http://ferret.grommet.io/written-offer'
    };

    // simulate an error if the file name has "invalid" in it
    if (update.file.name.match(/invalid/)) {
      task.status = 'Critical';
      task.state = 'Error';
      task.taskErrors = [{
        message: 'Simulated checksum or invalid file error.',
        recommendedActions: 'Upload another file.'
      }];
      update.errors = [{
        status: 'Critical',
        message: 'Simulated checksum or invalid file error.',
        resolution: 'Upload another file.',
        action: 'upload'
      }];
    }

    data.setUpdate(update);
  });
});

router.post('/update', function(req, res) {
  var update = data.getUpdate();
  var resource = data.getResource('/rest/appliances/1');
  // simulate update
  data.setStatus({state: 'updating', percent: 0});
  var settings = data.getSettings();
  var task = createTask('appliances', 'Update software', resource, req);
  var taskSteps = 2 + settings.nodes.length;
  task.percentComplete = 0;

  delete update.errors;
  update.runningTaskUri = task.uri;
  data.setUpdate(update);

  res.json({
    taskUri: task.uri
  });

  // delay just a bit to simulate the appliance task starting later
  setTimeout(function () {

    // Update involves updating this appliance and each node.
    // Create tasks for each of these in the right sequence.
    var applianceTask = createTask('appliances',
      'Update hyperconverged management', resource, req);
    applianceTask.parentTaskUri = task.uri;

    // First, update this appliance.
    var index = 0;
    var timer = setInterval(function () {
      index += 1;
      if (index < 10) {
        data.setStatus({state: 'updating',
          percent: Math.floor((index / 10) * 100)});
        applianceTask.percentComplete = Math.floor((index / 10) * 100);
      } else {
        settings.version = update.version;
        data.setSettings(settings);
        data.setStatus({state: 'ready'});
        clearInterval(timer);

        // update the applianceTask that also tracks this.
        applianceTask.status = 'OK';
        applianceTask.state = 'Completed';
        applianceTask.percentComplete = undefined;
        applianceTask.modified = (new Date()).toISOString();
        task.percentComplete = Math.floor((1 / taskSteps) * 100);

        // done with appliance update, do each node one by one
        var nodeTasks = settings.nodes.map(function (node, index) {
          var nodeTask = createTask('appliances', 'Update ' + node.name,
            resource, req);
          nodeTask.parentTaskUri = task.uri;
          nodeTask.nodeIndex = index; // This is a cheat to get the name below
          return nodeTask;
        });
        runTasks(nodeTasks, function (nodeTask) {
          task.percentComplete =
            Math.floor(((2 + nodeTask.nodeIndex) / taskSteps) * 100);
          const node = settings.nodes[nodeTask.nodeIndex];
          if (update.file.name.match(/error/)) {
            nodeTask.status = 'Critical';
            nodeTask.state = 'Error';
            nodeTask.taskErrors = [{
              message: 'Simulated failure.',
              recommendedActions: 'Try again'
            }];
            if (! update.errors) {
              update.errors = [];
            }
            update.errors.push({
              status: 'Critical',
              message: 'Simulated failure on ' + node.name + '.',
              resolution: 'Try again',
              action: 'update'
            });
            data.setUpdate(update);
          }
        }, function () {
          if (update.file.name.match(/error/)) {
            task.status = 'Critical';
            task.state = 'Error';
            task.taskErrors = [{
              message: 'Unable to fully complete the update.',
              recommendedActions: 'Try again'
            }];
            if (! update.errors) {
              update.errors = [];
            }
            update.errors.push({
              status: 'Critical',
              message: 'Unable to fully complete the update.',
              resolution: 'Try again',
              action: 'update'
            });
            delete update.runningTaskUri;
            data.setUpdate(update);
          } else {
            data.setUpdate({});
            task.status = 'OK';
            task.state = 'Completed';
          }
          task.percentComplete = undefined;
          task.modified = (new Date()).toISOString();
        });
      }
    }, TASK_UPDATE_INTERVAL);

  }, 10);
});

router.delete('/update', function(req, res) {
  data.setUpdate({});
  res.status(200).send();
});

router.post('/restart', function(req, res) {
  // In a real product, this would create a task and preserve data.
  // In this prototype, restarting means the same as 'factory reset'
  // First, respond that we've got it.
  res.status(200).send();
  // Then, kill ourselves
  process.exit(0);
});

router.post('/backup', function(req, res) {
  var resource = data.getResource('/rest/appliances/1');
  data.setBackup({}); // clear prior one
  var task = createTask('appliances', 'Backup', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, null, function () {
    data.setBackup({
      file: '/rest/backup/' + (new Date()).getTime().toString(10)
    });
  });
});

router.get('/backup', function(req, res) {
  var backup = data.getBackup();
  if (backup) {
    res.json(backup);
  } else {
    res.status(404).send();
  }
});

router.delete('/backup', function(req, res) {
  data.setBackup({});
  res.status(200).send();
});

// How support dumps should work:

router.post('/support', function(req, res) {
  var resource = data.getResource('/rest/appliances/1');
  data.setSupport({}); // clear prior one
  var task = createTask('appliances', 'Create support dump', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, null, function () {
    data.setSupport({
      file: '/rest/support/' + (new Date()).getTime().toString(10)
    });
  });
});

router.get('/support', function(req, res) {
  var support = data.getSupport();
  if (support) {
    res.json(support);
  } else {
    res.status(404).send();
  }
});

router.delete('/support', function(req, res) {
  data.setSupport({});
  res.status(200).send();
});

// How Atlas server does suppprt dumps:

router.post('/support-dumps', function(req, res) {
  // var resource = data.getResource('/rest/appliances/1');
  setTimeout(function () {
    res.json({
      supportDumpFile: '/rest/support-dumps/' +
        'phoenix-vm-nithya-CI-2016_02_19-10_15_42.795139.sdmp'
    });
  }, TASK_UPDATE_INTERVAL * 9); // The UI times out at 10s
});

router.post('/images', function(req, res) {
  // Simulate taking a while to upload the image
  setTimeout(function () {
    var categoryName = 'images';
    var file = req.files.file;
    var now = new Date();

    var resource = _.extend({
      category: categoryName,
      uri: '/rest/' + categoryName + '/' + now.getTime(),
      status: 'Unknown',
      state: 'Offline',
      created: now.toISOString(),
      modified: now.toISOString()
    }, req.body, {fileName: file.name});
    data.addResource(categoryName, resource);

    var task = createTask(categoryName, 'Add', resource, req);
    // we start at 50% complete since the upload took the first 50%
    task.percentComplete = 50;

    res.json({
      taskUri: task.uri
    });

    runTask(task, resource, function () {
      resource.status = "Disabled";
      resource.state = "Offline";

      // simulate an error if the file name has "invalid" in it
      if (file.name.match(/invalid/)) {
        task.status = 'Critical';
        task.state = 'Error';
        task.taskErrors = [{
          message: 'Simulated checksum or invalid file error.',
          recommendedActions: 'Upload another file.'
        }];
      }
    });
  }, TASK_UPDATE_INTERVAL * 5);
});

// router.put('/images/:id', function(req, res) {
//   // Simulate taking a while to upload the image
//   setTimeout(function () {
//     var categoryName = req.params.categoryName;
//     var resource = data.getResource('/rest' + req.url);
//     var updatedResource = req.body;
//     var now = new Date();
//     updatedResource.modified = now.toISOString();
//     var task = createTask(categoryName, 'Update', resource, req);
//
//     res.json({
//       taskUri: task.uri
//     });
//
//     runTask(task, resource, function () {
//       if (updatedResource.name.match(/error/i)) {
//         task.status = "Critical";
//         task.state = "Error";
//         task.taskErrors = [{
//           message: 'There was an error with this task.',
//           recommendedActions: "Don't use the term 'error' in the name."
//         }];
//       } else {
//         data.updateResource(categoryName, updatedResource);
//       }
//     });
//
//
//
//     var categoryName = 'images';
//     var file = req.files.file;
//     var now = new Date();
//
//     var resource = _.extend({
//       category: categoryName,
//       uri: '/rest/' + categoryName + '/' + now.getTime(),
//       status: 'Unknown',
//       state: 'Offline',
//       created: now.toISOString(),
//       modified: now.toISOString()
//     }, req.body, {fileName: file.name});
//     data.addResource(categoryName, resource);
//
//     var task = createTask(categoryName, 'Add', resource, req);
//     // we start at 50% complete since the upload took the first 50%
//     task.percentComplete = 50;
//
//     res.json({
//       taskUri: task.uri
//     });
//
//     runTask(task, resource, function () {
//       resource.status = "Disabled";
//       resource.state = "Offline";
//
//       // simulate an error if the file name has "invalid" in it
//       if (file.name.match(/invalid/)) {
//         task.status = 'Critical';
//         task.state = 'Error';
//         task.taskErrors = [{
//           message: 'Simulated checksum or invalid file error.',
//           recommendedActions: 'Upload another file.'
//         }];
//       }
//     });
//   }, TASK_UPDATE_INTERVAL * 5);
// });

// Linked navigation

router.post('/route', function(req, res) {
  var token = req.headers.auth;
  if (token === latestGruToken) {
    var resource = data.getResource('/rest/route/1');
    var categoryName = 'route';
    if (! resource) {
      resource = {
        category: categoryName,
        uri: '/rest/route/1',
        pathname: req.body.pathname
      };
      data.addResource(categoryName, resource);
    } else {
      resource.pathname = req.body.pathname;
      data.updateResource(categoryName, resource);
    }
    res.status(200).json({});
    onResourceChange(resource);
  }
});

router.get('/route/1', function(req, res) {
  var resource = data.getResource('/rest/route/1');
  if (resource) {
    res.json(resource);
  } else {
    res.status(404).send();
  }
});

// index

router.get('/index/resources', function(req, res) {
  var result = getItems('/rest' + req.url, req.query);
  res.json(result);
});

router.get('/index/resources/aggregated', function(req, res) {
  var result = getAggregate('/rest' + req.url, req.query);
  res.json(result);
});

router.get(/^\/index\/search-suggestions/, function(req, res) {
  var items = data.getItems(req.query.category || null);
  items = filteredItems(items, req.query);

  var startIndex = +req.query.start; // coerce to be a number
  // prune for start+count
  items = items.slice(startIndex, startIndex + req.query.count);

  res.json(items.map(function(item) {
    return {
      name: item.name,
      category: item.category,
      uri: item.uri
    };
  }));
});

router.get(/^\/index\/trees\/aggregated(.+)$/, function(req, res) {
  var uri = req.params[0];
  res.json(map.build(uri));
});

router.get(/^\/index\/trees(.+)$/, function(req, res) {
  //var uri = req.params[0];
  res.status(501).send();
});

router.get('/:categoryName/*', function(req, res) {
  var resource = data.getResource('/rest' + req.url);
  if (resource) {
    res.json(resource);
  } else {
    res.status(404).send();
  }
});

var taskIndex = 1;

function createTask (categoryName, action, resource, req) {
  var now = new Date();
  var token = req.headers.auth;
  var session = data.getSession(token) || {userName: 'System'};

  var task = {
    category: 'tasks',
    uri: '/rest/tasks/' + now.getTime() + '-' + taskIndex,
    name: action,
    status: 'Unknown',
    state: 'Running',
    attributes: {
      associatedResourceUri: resource.uri,
      associatedResourceName: resource.name,
      associatedResourceCategory: categoryName,
      hidden: false,
      owner: session.userName
    },
    created: now.toISOString(),
    modified: now.toISOString()
  };
  data.addResource('tasks', task);
  taskIndex += 1;

  return task;
}

function runTask (task, resource, handler) {
  // allow caller to preset the percent complete
  if (! task.percentComplete) {
    task.percentComplete = 0;
  }
  var timer = setInterval(function() {
    task.percentComplete += 10;
    task.modified = (new Date()).toISOString();
    if (task.percentComplete >= 100) {
      if (resource) {
        resource.modified = task.modified;
      }
      task.percentComplete = undefined;
      task.status = 'OK';
      task.state = 'Completed';
      clearInterval(timer);
      if (handler) {
        handler();
      }
      onResourceChange(resource, task);
    }
    onResourceChange(undefined, task);
  }, TASK_UPDATE_INTERVAL);

  setTimeout(function () {
    onResourceChange(resource, task);
  }, 1);
}

function runTasks (tasks, perTaskHandler, handler) {
  var task = tasks.shift();
  if (task) {
    runTask(task, null, function () {
      if (perTaskHandler) {
        perTaskHandler(task);
      }
      runTasks (tasks, perTaskHandler, handler);
    });
  } else {
    handler();
  }
}

router.post('/:categoryName', function(req, res) {
  var categoryName = req.params.categoryName;
  var now = new Date();

  var resource = _.extend({
    category: categoryName,
    uri: '/rest/' + categoryName + '/' + now.getTime(),
    status: 'Unknown',
    state: 'Offline',
    created: now.toISOString(),
    modified: now.toISOString()
  }, req.body);
  if ('virtual-machines' === categoryName) {
    generator.addUtilization(resource);
  }
  data.addResource(categoryName, resource);

  var task = createTask(categoryName, 'Add', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, resource, function () {
    resource.status = "Disabled";
    resource.state = "Offline";
  });
});

router.post('/:categoryName/*/on', function(req, res) {
  var categoryName = req.params.categoryName;
  var resource = data.getResource('/rest' +
    req.url.slice(0, req.url.length - 3), true);
  resource.modified = (new Date()).toISOString();
  var task = createTask(categoryName, 'Power on', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, resource, function () {
    resource.status = "OK";
    resource.state =  "Online";
    generator.addUtilization(resource);
  });
});

router.post('/:categoryName/*/off', function(req, res) {
  var categoryName = req.params.categoryName;
  var resource = data.getResource('/rest' +
    req.url.slice(0, req.url.length - 4), true);
  resource.modified = (new Date()).toISOString();
  var task = createTask(categoryName, 'Power off', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, resource, function () {
    resource.status = "Disabled";
    resource.state = "Offline";
    generator.addUtilization(resource);
  });
});

router.post('/:categoryName/*/restart', function(req, res) {
  var categoryName = req.params.categoryName;
  var resource = data.getResource('/rest' +
    req.url.slice(0, req.url.length - 8), true);
  resource.modified = (new Date()).toISOString();
  var task = createTask(categoryName, 'Restart', resource, req);

  res.json({
    taskUri: task.uri
  });

  runTask(task, resource, function () {
    resource.status = "OK";
    resource.state =  "Online";
    generator.addUtilization(resource);
  });
});

router.put('/:categoryName/*', function(req, res) {
  var categoryName = req.params.categoryName;
  var resource = data.getResource('/rest' + req.url);
  var updatedResource = req.body;
  var now = new Date();
  updatedResource.modified = now.toISOString();

  if ('alerts' === categoryName || 'tasks' === categoryName) {
    data.updateResource(categoryName, updatedResource);
    res.status(200).json({});
    onResourceChange(updatedResource);
  } else {
    var task = createTask(categoryName, 'Update', resource, req);

    res.json({
      taskUri: task.uri
    });

    runTask(task, resource, function () {
      if (updatedResource.name.match(/error/i)) {
        task.status = "Critical";
        task.state = "Error";
        task.taskErrors = [{
          message: 'There was an error with this task.',
          recommendedActions: "Don't use the term 'error' in the name."
        }];
      } else {
        data.updateResource(categoryName, updatedResource);
      }
    });
  }
});

router.delete('/:categoryName/*', function(req, res) {
  var categoryName = req.params.categoryName;
  var resource = data.getResource('/rest' + req.url);

  var task = createTask(categoryName, 'Remove', resource, req);

  res.json({
    taskUri: task.uri
  });

  // We run the delete task with no resource
  runTask(task, { category: categoryName }, function () {
    data.deleteResource(categoryName, '/rest' + req.url);
    // Delete associated alerts and tasks, except this task
    var params = {
      category: ['alerts', 'tasks'], start: 0, count: 100,
      query: "associatedResourceUri:" + '/rest' + req.url
    };
    var items = getItems(null, params).items;
    items.forEach(function (item) {
      if (item.uri !== task.uri) {
        data.deleteResource(item.category, item.uri);
      }
    });
  });
});

module.exports = {
  router: router,
  setup: function (server, prefix) {
    generator.generate();
    initializeSocket(server, prefix);
    // generator.listen(onResourceChange);
  }
};
