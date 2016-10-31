// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

// watch uses Web Sockets (https://en.wikipedia.org/wiki/WebSocket)
// to provide asynchronous updates to REST GET responses.
// The back-end server needs to support both Web Sockets generally
// and then the particular protocol used here.
// If the back-end server does not provide these, this module falls
// back to polling.

const RECONNECT_TIMEOUT = 5000; // 5s
const POLL_TIMEOUT = 5000; // 5s
const PING_TIMEOUT = 30000; // 30s

let _state = {
  getFunction: undefined,
  initialized: false,
  nextRequestId: 1,
  pingTimer: undefined,
  pollTimer: undefined,
  requests: [], // {message: , context: }
  socketUrl: undefined,
  ws: undefined,
  wsReady: false
};

// Web Sockets

function _wsAvailable () {
  return ('WebSocket' in window || 'MozWebSocket' in window);
}

function _sendMessage (op, id, uri) {
  _state.ws.send(JSON.stringify({ op, id, uri }));
}

function _onOpen () {
  _state.wsReady = true;
  // send any requests we have queued up
  _state.requests.forEach(request => {
    _sendMessage('start', request.id, request.uri);
  });
  // stop polling
  clearInterval(_state.pollTimer);
  // start pinging
  clearInterval(_state.pingTimer);
  _state.pingTimer = setInterval(_ping, PING_TIMEOUT);
}

function _onError (error) {
  console.log('!!! watch _onError TODO', error);
}

function _onMessage (event) {
  const message = JSON.parse(event.data);
  // Figure out which message this corresponds to so we
  // know which action to deliver the response with.
  _state.requests.some(request => {
    if (request.id === message.id) {
      if ('error' === message.op) {
        request.error(message.result);
      } else {
        request.success(message.result);
      }
    }
  });
}

function _onClose () {
  // lost connection, retry in a bit
  _state.ws = null;
  _state.wsReady = false;
  _state.initialized = false;
  clearInterval(_state.pingTimer);
  _state.pollTimer = setTimeout(initialize, RECONNECT_TIMEOUT);
}

// Polling

function _getRequest (request) {
  if (!request.pollBusy) {
    request.pollBusy = true;
    _state.getFunction(request.uri)
    .then(request.success)
    .catch(request.error)
    .then(() => request.pollBusy = false);
  }
}

function _poll () {
  _state.requests.forEach(_getRequest);
}

// Pinging

function _ping () {
  _sendMessage('ping');
}

// External Interface

export function initialize (socketUrl, getFunction) {
  if (!_state.initialized) {
    if (_wsAvailable() && (_state.socketUrl || socketUrl)) {
      if (!_state.ws) {
        _state.socketUrl = _state.socketUrl || socketUrl;
        _state.ws = new WebSocket(_state.socketUrl);
        _state.ws.onopen = _onOpen;
        _state.ws.onerror = _onError;
        _state.ws.onmessage = _onMessage;
        _state.ws.onclose = _onClose;
      }
    } else {
      // no web sockets, fall back to polling
      clearInterval(_state.pollTimer);
      _state.pollTimer = setInterval(_poll, POLL_TIMEOUT);
    }
    _state.getFunction = _state.getFunction || getFunction;
    _state.initialized = true;
  }
}

export function watch (uri, success, error) {
  const request = {
    id: _state.nextRequestId,
    uri: uri,
    success: success,
    error: error
  };
  _state.nextRequestId += 1;
  _state.requests.push(request);

  if (_state.wsReady) {
    _sendMessage('start', request.id, request.uri);
  } else {
    // The web socket isn't ready yet, and might never be.
    // Proceed in polling mode until the web socket is ready.
    _getRequest(request);
    if (! _state.pollTimer) {
      _state.pollTimer = setInterval(_poll, POLL_TIMEOUT);
    }
  }
  // console.log('!!! watch', request.id, uri);
  return request.id;
}

export function disregard (requestId) {
  _state.requests = _state.requests.filter(request => {
    if (request.id === requestId && _state.wsReady) {
      _sendMessage('stop', request.id);
    }
    return (request.id !== requestId);
  });
  // console.log('!!! disregard', requestId);
}

export function refresh () {
  // get the current result for all requests and reset polling
  clearInterval(_state.pollTimer);
  _state.pollTimer = undefined;
  if (! _state.wsReady) {
    _poll();
    _state.pollTimer = setInterval(_poll, POLL_TIMEOUT);
  }
}
