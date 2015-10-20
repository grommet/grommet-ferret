// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var ITEM_COUNT = 1;
var TYPES = ['enclosures'] //, 'enclosure-groups', 'ethernet-networks', 'server-profiles', 'server-profile-templates', 'server-hardware'];

// derived from http://stackoverflow.com/questions/521295/javascript-random-seeds
var seed = 1234;
function random (scale) {
  var x = Math.sin(seed++) * 10000;
  return Math.round((x - Math.floor(x)) * scale);
}

function distribute (values) {
  var result;
  for (var i = 0; i < values.length; i++) {
    if (Array.isArray(values[i])) {
      if (random(values[i][1]) === 0) {
        result = values[i][0];
        break;
      }
    } else {
      result = values[i];
      break;
    }
  }
  return result;
}

function createCategories () {
  for (var categoryName in SCHEMA) {
    if (SCHEMA.hasOwnProperty(categoryName)) {
      data.addCategory(categoryName);
    }
  }
}

function alertForResource (resource, index) {
  var alerts = SCHEMA.alerts;
  var alert = {
    name: alerts.names[index % alerts.names.length],
    state: 'Active',
    status: resource.status,
    uri: '/rest/alerts/r' + index + '-' + resource.category,
    category: 'alerts',
    created: resource.created,
    modified: resource.modified,
    attributes: {
      associatedResourceCategory: resource.category,
      associatedResourceUri: resource.uri,
      associatedResourceName: resource.name
    }
  };

  data.addResource('alerts', alert);
}

function buildItem (categoryName, index, name, date) {
  var category = SCHEMA[categoryName];

  var resource = {
    name: name,
    state: 'Normal',
    uri: '/rest/' + categoryName + '/' + index,
    category: categoryName,
    created: date.toISOString(),
    modified: date.toISOString()
  };

  if (!category.noStatus) {
    resource.status = distribute([['Warning', 7], ['Error', 19], 'OK']);
  }
  // randomly reduce timestamp for the next item
  date.setHours(date.getHours() - random(20) + 1);

  if (category.indexAttributes) {
    resource._indexAttributes = {};
    for (var attributeName in category.indexAttributes) {
      if (category.indexAttributes.hasOwnProperty(attributeName)) {
        var value = category.indexAttributes[attributeName];
        if (typeof value === 'string') {
          resource._indexAttributes[attributeName] = value;
        } else if (value.hasOwnProperty('prefix')) {
          var valueIndex;
          if (value.unique) {
            valueIndex = (value.start || 0) + index;
          } else {
            valueIndex = ((index % 3) + 1);
          }
          resource._indexAttributes[attributeName] = value.prefix + valueIndex;
        }
      }
    }
  }

  if (category.resourceAttributes) {
    resource._resourceAttributes = category.resourceAttributes;
  }

  // ensure alerts for non-OK resources
  if (resource.status && 'OK' !== resource.status &&
    'alerts' !== categoryName && 'tasks' !== categoryName) {
    alertForResource(resource, index);
  }

  return resource;
}

function buildItems (categoryName) {
  var category = SCHEMA[categoryName];
  var date = new Date();
  var count = category.count || RESOURCE_COUNT;

  for (var i = 1; i <= count; i++) {
    var name;
    if (category.prefix) {
      name = category.prefix + ' ' + i;
    } else if (category.names) {
      name = category.names[i % category.names.length];
    }
    var resource = buildItem(categoryName, i, name, date);

    data.addResource(categoryName, resource);
  }
}

function createResources () {
  for (var categoryName in SCHEMA) {
    if (SCHEMA.hasOwnProperty(categoryName)) {
      buildItems(categoryName);
    }
  }
}

function createActivity () {
  // associate alerts and tasks with resources
  var resources = [];
  for (var categoryName in SCHEMA) {
    if (SCHEMA.hasOwnProperty(categoryName) &&
      'alerts' !== categoryName && 'tasks' !== categoryName) {
      resources = resources.concat(data.getItems(categoryName));
    }
  }

  var index = 0;
  data.getItems('alerts', true).forEach(function(alert) {
    if ('Active' !== alert.state) {
      var resource = resources[index];
      index += 1;
      alert.attributes = {
        associatedResourceCategory: resource.category,
        associatedResourceUri: resource.uri,
        associatedResourceName: resource.name
      };
      alert.state = 'Cleared';
      alert.status = distribute([['Error', 5], ['Warning', 3], 'OK']);
    }
  });

  index = 0;
  data.getItems('tasks', true).forEach(function(task) {
    var resource = resources[index];
    index += 1;
    task.attributes = {
      associatedResourceCategory: resource.category,
      associatedResourceUri: resource.uri,
      associatedResourceName: resource.name,
      parentTaskUri: null
    };
    task.state = distribute([['Running', 13], ['Error', 9], ['Warning', 7], 'Completed']);
    task.status = ('Running' === task.state ? 'Unknown' :
      {
        'Completed': 'OK',
        'Warning': 'Warning',
        'Error': 'Error'
      }[task.state]);
  });
}

function createAssociations () {
  for (var categoryName in SCHEMA) {
    if (SCHEMA.hasOwnProperty(categoryName)) {

      var category = SCHEMA[categoryName];
      if (category.hasOwnProperty('associations')) {

        for (var name in category.associations) {
          if (category.associations.hasOwnProperty(name)) {

            var schema = category.associations[name];
            var parents = data.getItems(categoryName);
            var children = data.getItems(schema.category);
            var childIndex = 0;

            parents.forEach(function(parent) {
              for (var i = 0; i < schema.count; i++) {
                if (childIndex < children.length) {
                  data.addAssociation(name, parent.uri, children[childIndex].uri);
                  childIndex += 1;
                }
              }
              if (schema.share) {
                childIndex = 0;
              }
            });
          }
        }
      }
    }
  }
}
