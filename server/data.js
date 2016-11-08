// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

// name: [resource, ...]
let _categories = {};

// uri: resource
let _resources = {};

// uri: {name: {parents: [parent_item, ...],
//              children: [child_item, ...]}}
let _associations = {};

// auth: {category: {attributes: [], view: ''}}
let _preferences = {};

let _status = {};

let _settings = {};

let _certifcates = {};

let _update = {};

let _backup = {};

let _support = {};

let _sessions = {};

function categoryId(categoryName) {
  let result;
  if (Array.isArray(categoryName)) {
    result = categoryName.join(',');
  } else {
    result = categoryName;
  }
  return result;
}

export function getItems (categoryName, raw) {
  let result = [];
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
    result = result.map((item) => {
      if (item._indexAttributes) {
        item = { attributes: (item._indexAttributes || {}), ...item };
      }
      delete item._indexAttributes;
      delete item._resourceAttributes;
      return item;
    });
  }
  return result;
}

export function getResource (uri, raw) {
  // move _resourceAttributes to top
  let resource = _resources[uri];
  if (resource && !raw) {
    if (resource._resourceAttributes) {
      resource = { ...(resource._resourceAttributes || {}), ...resource };
    }
    delete resource._resourceAttributes;
    delete resource._indexAttributes;
  }
  return resource;
}

export function getAssociations (uri) {
  return _associations[uri];
}

export function addCategory (name) {
  _categories[name] = [];
}

export function addResource (categoryName, resource) {
  _resources[resource.uri] = resource;
  if (_categories[categoryName]) {
    _categories[categoryName].push(resource);
  }
}

export function updateResource (categoryName, resource) {
  _resources[resource.uri] = resource;
  if (_categories[categoryName]) {
    _categories[categoryName] =
      _categories[categoryName].filter((res) => {
        return (res.uri !== resource.uri);
      });
    _categories[categoryName].push(resource);
  }
}

export function deleteResource (categoryName, uri) {
  delete _resources[uri];
  if (_categories[categoryName]) {
    _categories[categoryName] =
      _categories[categoryName].filter((res) => {
        return (res.uri !== uri);
      });
  }
}

export function addAssociation (name, parentUri, childUri) {
  if (!_associations.hasOwnProperty(parentUri)) {
    _associations[parentUri] = {};
  }
  let assoc = _associations[parentUri];
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
}

export function getPreferences (auth, categoryName) {
  var result = null;
  var id = categoryId(categoryName);
  if (_preferences.hasOwnProperty(auth) &&
    _preferences[auth].hasOwnProperty(id)) {
    result = _preferences[auth][id];
  }
  return result;
}

export function setPreferences (auth, categoryName, data) {
  var id = categoryId(categoryName);
  if (!_preferences.hasOwnProperty(auth)) {
    _preferences[auth] = {};
  }
  _preferences[auth][id] = data;
}

export function getStatus () {
  return _status;
}

export function setStatus (status) {
  _status = status;
}

export function getSettings () {
  return _settings;
}

export function setSettings (settings) {
  _settings = settings;
}

export function getCertificate (address) {
  return _certifcates[address];
}

export function setCertificate (address, data) {
  _certifcates[address] = data;
}

export function getUpdate () {
  return _update;
}

export function setUpdate (update) {
  _update = update;
}

export function getBackup () {
  return _backup;
}

export function setBackup (backup) {
  _backup = backup;
}

export function getSupport () {
  return _support;
}

export function setSupport (support) {
  _support = support;
}

export function getSession (token) {
  return _sessions[token];
}

export function addSession (token, data) {
  _sessions[token] = data;
}
