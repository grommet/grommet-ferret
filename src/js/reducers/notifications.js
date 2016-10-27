// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { NOTIFICATIONS_LOAD, NOTIFICATIONS_LOAD_SUCCESS,
  NOTIFICATIONS_LOAD_AGGREGATE_SUCCESS, NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_UNLOAD } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  aggregate: undefined,
  alert: undefined,
  config: undefined,
  filters: undefined,
  preserveUris: [],
  queryText: undefined,
  tasks: undefined
};

const handlers = {

  [NOTIFICATIONS_UNLOAD]: (state, action) => (initialState),

  [NOTIFICATIONS_LOAD]: (state, action) => ({
    config: action.config,
    queryText: action.queryText,
    filters: action.filters
  }),

  [NOTIFICATIONS_UPDATE]: (state, action) => ({
    queryText: action.queryText,
    filters: action.filters
  }),

  [NOTIFICATIONS_LOAD_SUCCESS]: (state, action) => {
    const result = convertTimestamps(action.result);
    let alert, tasks, busy;
    let preserveUris = state.preserveUris.slice(0);
    result.items.forEach((item) => {
      if ('tasks' === item.category) {
        if (! tasks) {
          tasks = [];
        }
        tasks.push(item);
      } else if (! state.aggregate) {
        if (! alert) {
          alert = item;
        } else if ('critical' !== alert.status.toLowerCase()) {
          alert = item;
        }
      }
      if ('running' === item.state.toLowerCase()) {
        busy = true;
        // Only persist the latest running task.
        preserveUris = [item.uri];
        // let found = preserveUris.some(uri => (item.uri === uri));
        // if (! found) {
        //   preserveUris.push(item.uri);
        // }
      }
    });
    return {
      alert: alert,
      busy: busy,
      preserveUris: preserveUris,
      tasks: tasks
    };
  },

  [NOTIFICATIONS_LOAD_AGGREGATE_SUCCESS]: (state, action) => {
    // convert to a more useful format
    let status, count;
    action.result.forEach((value) => {
      if ('critical' === value.value.toLowerCase() ||
        ('warning' === value.value.toLowerCase() && 'critical' !== status)) {
        status = value.value.toLowerCase();
        count = value.count;
      }
    });
    // We don't care to aggregate when the count is < 2
    let alert = state.alert;
    let aggregate;
    if (count > 1) {
      alert = undefined;
      // let queryText = `${state.query.toString()} AND status:${status}`;
      const filter = { ...state.filter, status: [status] };
      let pathFilter = [];
      for (let name in filter) {
        filter[name].forEach(value => {
          pathFilter.push('f=' + encodeURIComponent(`${name}:${value}`));
        });
      }
      const path = `/activity?${pathFilter.join('&')}`;
      aggregate = {
        status: status,
        count: count,
        path: path
      };
    }
    return { aggregate: aggregate, alert: alert };
  }
};

export default function notificationsReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
