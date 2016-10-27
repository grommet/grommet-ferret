// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItems, watchAggregate, stopWatching } from './Api';

export const NOTIFICATIONS_LOAD = 'NOTIFICATIONS_LOAD';
export const NOTIFICATIONS_LOAD_SUCCESS = 'NOTIFICATIONS_LOAD_SUCCESS';
export const NOTIFICATIONS_LOAD_FAILURE = 'NOTIFICATIONS_LOAD_FAILURE';
export const NOTIFICATIONS_LOAD_AGGREGATE_SUCCESS =
  'NOTIFICATIONS_LOAD_AGGREGATE_SUCCESS';
export const NOTIFICATIONS_LOAD_AGGREGATE_FAILURE =
  'NOTIFICATIONS_LOAD_AGGREGATE_FAILURE';
export const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE';
export const NOTIFICATIONS_UNLOAD = 'NOTIFICATIONS_UNLOAD';

const NOTIFICATIONS_WATCH = 'notifications';
const NOTIFICATIONS_WATCH_AGGREGATE = 'notifications aggregate';

function watchNotifications (config, preserveUris, dispatch) {
  const context = config.context;
  let queryText, filter;
  if (context.uri || context.category || context.global) {
    if (context.uri) {
      queryText = `associatedResourceUri:${context.uri} `;
    } else if (context.category) {
      queryText = `associatedResourceCategory:${context.category} `;
    } else {
      queryText = '';
    }
    filter = { state: ['active', 'locked', 'running'] };
    // The prototype server can handle OR'ing filter parameters but
    // the Atlas index service cannot. Put everything in query text instead.
    // let paramFilter = [];
    // for (let name in filter) {
    //   filter[name].forEach(value => {
    //     paramFilter.push(`${name}:${value}`);
    //   });
    // }
    let query = `${queryText}(state:Active OR state:Locked OR state:Running`;
    if (preserveUris) {
      preserveUris.forEach(uri => {
        query += ` OR uri:${uri}`;
      });
    }
    query += ")";

    const params = {
      category: config.includeCategories,
      start: 0,
      count: config.count || 5,
      query: query, //queryText,
      // filter: paramFilter,
      sort: 'status:asc'
    };

    watchItems(NOTIFICATIONS_WATCH, params,
      (result) => dispatch(loadNotificationsSuccess(result)),
      (error) => dispatch(loadNotificationsFailure(error))
    );

    if (config.aggregate) {
      const params = {
        category: config.includeCategories,
        query: query, //queryText,
        //filter: paramFilter,
        attribute: 'status'
      };
      watchAggregate(NOTIFICATIONS_WATCH_AGGREGATE, params,
        (result) => dispatch(loadNotificationsAggregateSuccess(result)),
        (error) => dispatch(loadNotificationsAggregateFailure(error))
      );
    }
  } else {
    unwatchNotifications(true);
  }

  return { queryText: queryText, filter: filter };
}

function unwatchNotifications (quiet) {
  stopWatching(NOTIFICATIONS_WATCH, quiet);
  stopWatching(NOTIFICATIONS_WATCH_AGGREGATE, quiet);
}

// config is {
//  context: { uri: , category: , global: }
//  count: N
//  aggregate: true|false
//  includeCategories: []
export function loadNotifications (config) {
  return function (dispatch) {
    const watching = watchNotifications(config, undefined, dispatch);
    dispatch({ type: NOTIFICATIONS_LOAD, config: config,
      queryText: watching.queryText, filters: watching.filters });
  };
}

export function updateNotifications (notifications) {
  return function (dispatch) {
    unwatchNotifications(true);
    const watching = watchNotifications(notifications.config,
      notifications.preserveUris, dispatch);
    dispatch({ type: NOTIFICATIONS_UPDATE,
      queryText: watching.queryText, filters: watching.filters });
  };
}

export function unloadNotifications () {
  return function (dispatch) {
    unwatchNotifications();
    // must be last as it will clear everything
    dispatch({ type: NOTIFICATIONS_UNLOAD });
  };
}

export function loadNotificationsSuccess (result) {
  return { type: NOTIFICATIONS_LOAD_SUCCESS, result: result };
}

export function loadNotificationsFailure (error) {
  return { type: NOTIFICATIONS_LOAD_FAILURE, error: error };
}

export function loadNotificationsAggregateSuccess (result) {
  return { type: NOTIFICATIONS_LOAD_AGGREGATE_SUCCESS,
    result: result };
}

export function loadNotificationsAggregateFailure (error) {
  return { type: NOTIFICATIONS_LOAD_AGGREGATE_FAILURE,
    error: error };
}
