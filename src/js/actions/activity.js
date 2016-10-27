// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItem, watchItems, stopWatching, putItem } from './Api';

export const ACTIVITY_ITEM_LOAD = 'ACTIVITY_ITEM_LOAD';
export const ACTIVITY_ITEM_UNLOAD = 'ACTIVITY_ITEM_UNLOAD';
export const ACTIVITY_ITEM_LOAD_SUCCESS = 'ACTIVITY_ITEM_LOAD_SUCCESS';
export const ACTIVITY_ITEM_LOAD_FAILURE = 'ACTIVITY_ITEM_LOAD_FAILURE';
export const ACTIVITY_LOAD_CHILDREN_SUCCESS = 'ACTIVITY_LOAD_CHILDREN_SUCCESS';
export const ACTIVITY_LOAD_CHILDREN_FAILURE = 'ACTIVITY_LOAD_CHILDREN_FAILURE';

const ACTIVITY_WATCH_ITEM = 'activity item';
const ACTIVITY_WATCH_ITEM_CHILDREN = 'activity item children';

export function loadActivityItem (uri) {
  return function (dispatch) {
    dispatch({ type: ACTIVITY_ITEM_LOAD, uri: uri });
    watchItem(ACTIVITY_WATCH_ITEM, uri,
      (item) => dispatch(loadActivityItemSuccess(item)),
      (error) => dispatch(loadActivityItemFailure(error))
    );
    let params = {
      category: 'tasks',
      start: 0,
      count: 100,
      query: "parentTaskUri:" + uri
    };
    watchItems(ACTIVITY_WATCH_ITEM_CHILDREN, params,
      (result) => dispatch(loadActivityChildrenSuccess(result)),
      (error) => dispatch(loadActivityChildrenFailure(error))
    );
  };
}

export function loadActivityItemSuccess (item) {
  return { type: ACTIVITY_ITEM_LOAD_SUCCESS, item: item };
}

export function loadActivityItemFailure (error) {
  return { type: ACTIVITY_ITEM_LOAD_FAILURE, error: error };
}

export function loadActivityChildrenSuccess (result) {
  return { type: ACTIVITY_LOAD_CHILDREN_SUCCESS, result: result };
}

export function loadActivityChildrenFailure (error) {
  return { type: ACTIVITY_LOAD_CHILDREN_FAILURE, error: error };
}

export function unloadActivityItem () {
  return function (dispatch) {
    stopWatching(ACTIVITY_WATCH_ITEM);
    stopWatching(ACTIVITY_WATCH_ITEM_CHILDREN);
    // must be last as it will clear everything
    dispatch({ type: ACTIVITY_ITEM_UNLOAD });
  };
}

export function clearAlert (alert) {
  return function (dispatch) {
    const nextAlert = { ...alert, state: 'Cleared' };
    // be optimistic
    dispatch(loadActivityItemSuccess(nextAlert));
    putItem(nextAlert);
  };
}

export function activateAlert (alert) {
  return function (dispatch) {
    const nextAlert = { ...alert, state: 'Active' };
    // be optimistic
    dispatch(loadActivityItemSuccess(nextAlert));
    putItem(nextAlert);
  };
}
