// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var _ = require('lodash');

// name: [resource, ...]
var _categories = {};

// uri: resource
var _resources = {};

// uri: {name: {parents: [parent_item, ...],
//              children: [child_item, ...]}}
var _associations = {};

// auth: {category: {attributes: [], view: ''}}
var _preferences = {};

var _status = {};

var _settings = {};

var _certifcates = {};

var _update = {};

var _backup = {};

var _support = {};

var _sessions = {};

function categoryId(categoryName) {
  var result;
  if (Array.isArray(categoryName)) {
    result = categoryName.join(',');
  } else {
    result = categoryName;
  }
  return result;
}

var Data = {

  getItems: function(categoryName, raw) {
    var result = [];
    if (categoryName) {
      if (Array.isArray(categoryName)) {
        for (var i = 0; i < categoryName.length; i++) {
          result = result.concat(_categories[categoryName[i]]);
        }
      } else {
        result = _categories[categoryName];
      }
    } else {
      // global
      for (var name in _categories) {
        if (_categories.hasOwnProperty(name)) {
          result = result.concat(_categories[name]);
        }
      }
    }
    if (result && !raw) {
      // add _indexAttributes
      result = result.map(function(item) {
        if (item._indexAttributes) {
          item = _.extend({
            attributes: item._indexAttributes || {}
          }, item);
        }
        delete item._indexAttributes;
        delete item._resourceAttributes;
        return item;
      });
    }
    return result;
  },

  getResource: function(uri, raw) {
    // move _resourceAttributes to top
    var resource = _resources[uri];
    if (resource && !raw) {
      if (resource._resourceAttributes) {
        resource = _.extend({}, resource._resourceAttributes || {}, resource);
      }
      delete resource._resourceAttributes;
      delete resource._indexAttributes;
    }
    return resource;
  },

  getAssociations: function(uri) {
    return _associations[uri];
  },

  addCategory: function(name) {
    _categories[name] = [];
  },

  addResource: function(categoryName, resource) {
    _resources[resource.uri] = resource;
    if (_categories[categoryName]) {
      _categories[categoryName].push(resource);
    }
  },

  updateResource: function(categoryName, resource) {
    _resources[resource.uri] = resource;
    if (_categories[categoryName]) {
      _categories[categoryName] = _categories[categoryName].filter(function(res) {
        return (res.uri !== resource.uri);
      });
      _categories[categoryName].push(resource);
    }
  },

  deleteResource: function(categoryName, uri) {
    delete _resources[uri];
    if (_categories[categoryName]) {
      _categories[categoryName] = _categories[categoryName].filter(function(res) {
        return (res.uri !== uri);
      });
    }
  },

  addAssociation: function(name, parentUri, childUri) {
    if (!_associations.hasOwnProperty(parentUri)) {
      _associations[parentUri] = {};
    }
    var assoc = _associations[parentUri];
    if (!assoc.hasOwnProperty(name)) {
      assoc[name] = {
        parents: [],
        children: []
      };
    }
    assoc[name].children.push(childUri);

    if (!_associations.hasOwnProperty(childUri)) {
      _associations[childUri] = {};
    }
    assoc = _associations[childUri];
    if (!assoc.hasOwnProperty(name)) {
      assoc[name] = {
        parents: [],
        children: []
      };
    }
    assoc[name].parents.push(parentUri);
  },

  getPreferences: function(auth, categoryName) {
    var result = null;
    var id = categoryId(categoryName);
    if (_preferences.hasOwnProperty(auth) &&
      _preferences[auth].hasOwnProperty(id)) {
      result = _preferences[auth][id];
    }
    return result;
  },

  setPreferences: function(auth, categoryName, data) {
    var id = categoryId(categoryName);
    if (!_preferences.hasOwnProperty(auth)) {
      _preferences[auth] = {};
    }
    _preferences[auth][id] = data;
  },

  getStatus: function () {
    return _status;
  },

  setStatus: function (status) {
    _status = status;
  },

  getSettings: function () {
    return _settings;
  },

  setSettings: function (settings) {
    _settings = settings;
  },

  getCertificate: function(address) {
    return _certifcates[address];
  },

  setCertificate: function(address, data) {
    _certifcates[address] = data;
  },

  getUpdate: function () {
    return _update;
  },

  setUpdate: function (update) {
    _update = update;
  },

  getBackup: function () {
    return _backup;
  },

  setBackup: function (backup) {
    _backup = backup;
  },

  getSupport: function () {
    return _support;
  },

  setSupport: function (support) {
    _support = support;
  },

  getSession: function (token) {
    return _sessions[token];
  },

  addSession: function (token, data) {
    _sessions[token] = data;
  }

};

module.exports = Data;
