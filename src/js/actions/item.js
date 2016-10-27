// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItem, watchItems, watchAssociated, stopWatching,
  getItem, postItem, putItem, deleteItem } from './Api';
import { watchTask } from './task';

export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_LOAD_SUCCESS = 'ITEM_LOAD_SUCCESS';
export const ITEM_LOAD_FAILURE = 'ITEM_LOAD_FAILURE';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const ITEM_ADD = 'ITEM_ADD';
export const ITEM_ADD_SUCCESS = 'ITEM_ADD_SUCCESS';
export const ITEM_ADD_FAILURE = 'ITEM_ADD_FAILURE';
export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_UPDATE_SUCCESS = 'ITEM_UPDATE_SUCCESS';
export const ITEM_UPDATE_FAILURE = 'ITEM_UPDATE_FAILURE';
export const ITEM_REMOVE = 'ITEM_REMOVE';
export const ITEM_REMOVE_SUCCESS = 'ITEM_REMOVE_SUCCESS';
export const ITEM_REMOVE_FAILURE = 'ITEM_REMOVE_FAILURE';
export const ITEM_LOAD_ACTIVITY = 'ITEM_LOAD_ACTIVITY';
export const ITEM_LOAD_ACTIVITY_SUCCESS = 'ITEM_LOAD_ACTIVITY_SUCCESS';
export const ITEM_LOAD_ACTIVITY_FAILURE = 'ITEM_LOAD_ACTIVITY_FAILURE';
export const ITEM_UNLOAD_ACTIVITY = 'ITEM_UNLOAD_ACTIVITY';
export const ITEM_LOAD_ASSCOCIATED = 'ITEM_LOAD_ASSCOCIATED';
export const ITEM_LOAD_ASSOCIATED_SUCCESS = 'ITEM_LOAD_ASSOCIATED_SUCCESS';
export const ITEM_UNLOAD_ASSOCIATED = 'ITEM_UNLOAD_ASSOCIATED';

const ITEM_WATCH = 'item';
const ITEM_WATCH_ASSOCIATED = 'item associated';
const ITEM_WATCH_ACTIVITY = 'item activity';

export function loadItem (uri, watch = true) {
  return function (dispatch) {
    dispatch({ type: ITEM_LOAD, uri: uri });
    if (watch) {
      watchItem(ITEM_WATCH, uri,
        (item) => {
          dispatch(loadItemSuccess(item));
        },
        (error) => dispatch(loadItemFailure(error))
      );
    } else {
      getItem(uri)
      .then(item => dispatch(loadItemSuccess(item)))
      .catch(error => dispatch(loadItemFailure(error)));
    }
  };
}

export function loadItemSuccess (item) {
  return { type: ITEM_LOAD_SUCCESS, item: item };
}

export function loadItemFailure (error) {
  return { type: ITEM_LOAD_FAILURE, error: error };
}

export function unloadItem (item, watched = true) {
  return function (dispatch) {
    if (watched) {
      stopWatching(ITEM_WATCH);
      dispatch(unloadItemActivity(item)); // web only
    }
    // must be last as it will clear everything
    dispatch({ type: ITEM_UNLOAD });
  };
}

export function addItem (item) {
  return function (dispatch) {
    dispatch({ type: ITEM_ADD, item: item });
    postItem(item)
    .then(response => {
      watchTask(response.taskUri)
      .then(task => dispatch(addItemSuccess(task)))
      .catch(error => dispatch(addItemFailure(error)));
      return response;
    });
  };
}

export function addItemSuccess (task) {
  return { type: ITEM_ADD_SUCCESS, task: task };
}

export function addItemFailure (error) {
  return { type: ITEM_ADD_FAILURE, error: error };
}

export function updateItem(item) {
  return function (dispatch) {
    dispatch({ type: ITEM_UPDATE, item: item });
    putItem(item)
    .then(response => {
      watchTask(response.taskUri)
      .then(task => dispatch(updateItemSuccess(task)))
      .catch(error => dispatch(updateItemFailure(error)));
      return response;
    });
  };
}

export function updateItemSuccess(task) {
  return { type: ITEM_UPDATE_SUCCESS, task: task };
}

export function updateItemFailure(error) {
  return { type: ITEM_UPDATE_FAILURE, error: error };
}

export function removeItem(category, uri) {
  return function (dispatch) {
    dispatch({ type: ITEM_REMOVE, uri: uri });
    deleteItem(uri)
    .then(response => {
      watchTask(response.taskUri)
      .then(task => dispatch(removeItemSuccess(task)))
      .catch(error => dispatch(removeItemFailure(error)));
      return response;
    });
  };
}

export function removeItemSuccess(task) {
  return { type: ITEM_REMOVE_SUCCESS, task: task };
}

export function removeItemFailure(error) {
  return { type: ITEM_REMOVE_FAILURE, error: error };
}

export function loadItemAssociated(uri) {
  return function (dispatch) {
    dispatch({ type: ITEM_LOAD_ASSCOCIATED, uri: uri });
    watchAssociated(ITEM_WATCH_ASSOCIATED, uri,
      (result) => dispatch(loadItemAssociatedSuccess(result))
    );
  };
}

export function loadItemAssociatedSuccess(result) {
  return { type: ITEM_LOAD_ASSOCIATED_SUCCESS, result: result };
}

export function unloadItemAssociated(item) {
  return function (dispatch) {
    stopWatching(ITEM_WATCH_ASSOCIATED);
    dispatch({ type: ITEM_UNLOAD_ASSOCIATED });
  };
}

export function loadItemActivity(uri) {
  return function (dispatch) {
    dispatch({ type: ITEM_LOAD_ACTIVITY, uri: uri });
    let params = {
      category: ['alerts', 'tasks'],
      start: 0,
      count: 3,
      sort: 'created:desc',
      query: "associatedResourceUri:" + uri
    };
    watchItems(ITEM_WATCH_ACTIVITY, params,
      (result) => dispatch(loadItemActivitySuccess(result)),
      (error) => dispatch(loadItemActivityFailure(error))
    );
  };
}

export function loadItemActivitySuccess(result) {
  return { type: ITEM_LOAD_ACTIVITY_SUCCESS, result: result };
}

export function loadItemActivityFailure(error) {
  return { type: ITEM_LOAD_ACTIVITY_FAILURE, error: error };
}

export function unloadItemActivity(item) {
  return function (dispatch) {
    stopWatching(ITEM_WATCH_ACTIVITY);
    dispatch({ type: ITEM_UNLOAD_ACTIVITY });
  };
}
