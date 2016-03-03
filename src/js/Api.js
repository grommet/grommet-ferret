// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var merge = require('lodash/object/merge');
var RestWatch = require('./RestWatch');

var state = {
  urlPrefix: ''
};

function normalizeParams(params) {
  var result = merge({}, params);
  if (result.query && (typeof result.query === 'object')) {
    result.query = result.query.toString();
  }
  return result;
}

function normalizeAggregate(result, handler) {
  handler(result[0].counts); // for now
}

var Api = {

  pageSize: 20,

  urlPrefix: function(urlPrefix) {
    state.urlPrefix = urlPrefix;
  },

  watchItems: function (params, success, failure) {
    var url = state.urlPrefix + '/rest/index/resources';
    params = normalizeParams(params);
    var watcher = RestWatch.start(url, params, success, failure);
    return watcher;
  },

  watchItem: function (uri, success, failure) {
    var url = state.urlPrefix + uri;
    var watcher = RestWatch.start(url, {}, success, failure);
    return watcher;
  },

  watchAggregate: function (params, handler) {
    var url = state.urlPrefix + '/rest/index/resources/aggregated';
    params = normalizeParams(params);
    var watcher = RestWatch.start(url, params,
      function (result) {
        normalizeAggregate(result, handler);
      }
    );
    return watcher;
  },

  watchMap: function (uri, success, failure) {
    var url = state.urlPrefix + '/rest/index/trees/aggregated' + uri;
    var watcher = RestWatch.start(url, null, success, failure);
    return watcher;
  },

  stopWatching: function (watcher) {
    RestWatch.stop(watcher);
  },

  RestWatch: RestWatch

};

module.exports = Api;
