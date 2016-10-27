// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Rest, { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import { initialize as initializeWatching, watch, disregard,
  refresh as refreshWatching } from './watch';

let _host = '';
let _headers = {
  ...headers,
  'X-API-Version': 200
};
let _webSocketUrl = undefined;

// XHR still for file upload progress
import request from 'superagent';
let _timeout = 20000;
// 20s, up from initial 10s due to use from slow mobile devices

// Configuration

export let pageSize = 20;
export let pollingInterval = 2000; // 2s
export let urlPrefix = '';

export function configure (options) {
  _host = options.host ? `http://${options.host}` : _host;
  pageSize = options.pageSize || pageSize;
  pollingInterval = options.pollingInterval || pollingInterval;
  _webSocketUrl = options.webSocketUrl || _webSocketUrl;
  urlPrefix = options.urlPrefix || urlPrefix;

  initializeWatching(_webSocketUrl, _get);
}

export function updateHeaders (headers) {
  _headers = {..._headers, ...headers};
  Rest.setHeaders(headers);///
}

// Internal help/generic functions

function _get (uri, params) {
  const options = { method: 'GET', headers: _headers };
  const query = buildQuery(params);
  return fetch(`${_host}${urlPrefix}${uri}${query}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _post (uri, dataArg) {
  const data = (typeof dataArg === 'object') ?
    JSON.stringify(dataArg) : dataArg;
  const options = { method: 'POST', headers: _headers, body: data };
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _put (uri, dataArg) {
  const data = (typeof dataArg === 'object') ?
    JSON.stringify(dataArg) : dataArg;
  const options = { method: 'PUT', headers: _headers, body: data };
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _delete (uri) {
  const options = { method: 'DELETE', headers: _headers };
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(processStatus)
    .then(response => response.json());
}

export function head (url, params) {
  const query = buildQuery(params);
  const options = { method: 'HEAD', headers: _headers };
  return fetch(`${_host}${urlPrefix}${url}${query}`, options);
}

// Index

export function getItems (params) {
  return _get('/rest/index/resources', params);
}

export function  getSearchSuggestions (text) {
  const params = { start: 0, count: Math.min(10, pageSize), query: text };
  return _get('/rest/index/search-suggestions', params);
}

// Item

export function getItem (uri) {
  return _get(uri);
}

export function postItem (item) {
  return _post(`/rest/${item.category}`, item).then(refresh);
}

export function putItem (item) {
  return _put(item.uri, item).then(refresh);
}

export function deleteItem (uri) {
  return _delete(uri).then(refresh);
}

// Watching

const watches = {};

function normalizeAggregate (result, handler) {
  handler(result[0].counts); // for now
}

export function watchItems (name, params, successHandler, errorHandler) {
  stopWatching(name, true);
  const query = buildQuery(params);
  const uri = `/rest/index/resources${query}`;
  const watcher = watch(uri, successHandler, errorHandler);
  watches[name] = watcher;
}

export function watchItem (name, uri, successHandler, errorHandler) {
  stopWatching(name, true);
  const watcher = watch(uri, successHandler, errorHandler);
  watches[name] = watcher;
}

export function watchAggregate (name, params, successHandler, errorHandler) {
  stopWatching(name, true);
  const query = buildQuery(params);
  const uri = `/rest/index/resources/aggregated${query}`;
  const watcher = watch(uri,
    (result) => normalizeAggregate(result, successHandler),
    errorHandler);
  watches[name] = watcher;
}

export function watchAssociated (name, uriArg, successHandler, errorHandler) {
  stopWatching(name, true);
  const uri = `/rest/index/trees/aggregated${uriArg}`;
  const watcher = watch(uri, successHandler, errorHandler);
  watches[name] = watcher;
}

export function stopWatching (name, quiet) {
  if (watches[name]) {
    disregard(watches[name]);
    delete watches[name];
  } else if (! quiet) {
    console.warn('stopWatching undefined watcher', name);
  }
}

export function refresh (response) {
  refreshWatching();
  return response;
}

// Status

export function getStatus () {
  return _get('/rest/status');
}

// Session

export function postLogin (userName, password) {
  const params = { userName: userName, password: password,
    authLoginDomain: 'LOCAL' };
  return _post('/rest/login-sessions', params);
}

export function postResetPassword (userName, password) {
  const params = { userName: userName, password: password };
  return _post('/rest/reset-password', params);
}

export function postLogout () {
  return _delete('/rest/login-sessions');
}

export function getRole () {
  return _get('/rest/authz/role');
}

export function getSession () {
  return _get('/rest/sessions');
}

// Settings

export function getSettings () {
  return _get('/rest/settings');
}

export function getCertificate (params) {
  return _get('/rest/settings', params);
}

export function postConnection (address, userName, password) {
  // We do a post to avoid sending credentials as more visible parameters
  const params = {address: address, userName: userName, password: password};
  return _post('/rest/connection', params);
}

export function getDirectorySearch (address, baseDn, searchText) {
  const params = {address: address, baseDn: baseDn, searchText: searchText};
  return _get('/rest/directory/search', params);
}

export function putSettings (settings) {
  return _put('/rest/settings', settings);
}

// export function postSettings (data) {
//   // This is the Restore action
//   let headers = {..._headers};
//   delete headers['Content-Type'];
//   const options = { method: 'POST', headers: headers, body: data };
//   return fetch(`${_host}${urlPrefix}/rest/settings`, options)
//   .then(processStatus)
//   .then(response => response.json());
// }

export function getSoftware () {
  return _get('/rest/update');
}

export function postSoftwareUpload (file, progressHandler, handler) {
  // We need to keep using XHR until fetch() has a way to track long upload
  // progress. Since we don't do file uploading from mobile platforms,
  // we can get away with this.
  request.post(`${_host}${urlPrefix}/rest/update/upload`)
  .timeout(_timeout)
  // remove Content-Type since we're sending a file
  .set({ ..._headers, "Content-Type": undefined})
  .attach('file', file)
  .on('progress', progressHandler)
  .end(handler);
}

export function postSoftwareUpdate () {
  return _post('/rest/update');
}

export function delSoftware () {
  return _delete('/rest/update');
}

export function postRestart () {
  return _post('/rest/restart');
}

export function getBackup () {
  return _get('/rest/backup');
}

export function postBackup () {
  return _post('/rest/backup');
}

export function delBackup () {
  return _delete('/rest/backup');
}

export function getSupport () {
  return _get('/rest/support');
}

export function postSupport () {
  return _post('/rest/support');
}

export function delSupport () {
  return _delete('/rest/support');
}

// Image

export function postImage (image, file, progressHandler, handler) {
  // We need to keep using XHR until fetch() has a way to track long upload
  // progress. Since we don't do file uploading from mobile platforms,
  // we can get away with this.
  request.post(`${_host}${urlPrefix}/rest/images`)
  .timeout(_timeout)
  // remove Content-Type since we're sending a file
  .set({ ..._headers, "Content-Type": undefined})
  .field('name', image.name)
  .attach('file', file)
  .on('progress', progressHandler)
  .end(handler);
}

export function putImage (image, file, progressHandler, handler) {
  // We need to keep using Rest until fetch() has a way to track long upload
  // progress. Since we don't do file uploading from mobile platforms,
  // we can get away with this.
  request.put(`${_host}${urlPrefix}${image.uri}`)
  .timeout(_timeout)
  .set({ ..._headers, "Content-Type": undefined})
  .field('uri', image.uri)
  .field('name', image.name)
  .field('status', image.status)
  .field('state', image.state)
  .field('created', image.created)
  .attach('file', file)
  .on('progress', progressHandler)
  .end(handler);
}

// Virtual Machine

export function postPowerOnVm (uri) {
  return _post(`${uri}/on`).then(refresh);
}

export function postPowerOffVm (uri) {
  return _post(`${uri}/off`).then(refresh);
}

export function postRestartVm (uri) {
  return _post(`${uri}/restart`).then(refresh);
}

// Route

export function postRoute (route) {
  return _post(`/rest/route`, route);
}
