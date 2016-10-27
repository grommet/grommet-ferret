// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItems, stopWatching } from './Api';
import { loadSettings } from './settings';
import { clearSearchSuggestions } from './search';

export const DASHBOARD_LOAD = 'DASHBOARD_LOAD';
export const DASHBOARD_UNLOAD = 'DASHBOARD_UNLOAD';

export const DASHBOARD_LOAD_UTILIZATION = 'DASHBOARD_LOAD_UTILIZATION';
export const DASHBOARD_LOAD_UTILIZATION_SUCCESS =
  'DASHBOARD_LOAD_UTILIZATION_SUCCESS';

export const DASHBOARD_LOAD_TASKS = 'DASHBOARD_LOAD_TASKS';
export const DASHBOARD_LOAD_TASKS_SUCCESS =
  'DASHBOARD_LOAD_TASKS_SUCCESS';
export const DASHBOARD_LOAD_TASKS_FAILURE =
  'DASHBOARD_LOAD_TASKS_FAILURE';

export const DASHBOARD_UNLOAD_ALERTS = 'DASHBOARD_UNLOAD_ALERTS';
export const DASHBOARD_UNLOAD_TASKS = 'DASHBOARD_UNLOAD_TASKS';

const DASHBOARD_WATCH_TASKS = 'dashboard tasks';

export function loadDashboard () {
  return function (dispatch) {
    dispatch({ type: DASHBOARD_LOAD });
    dispatch(loadSettings());
    dispatch(loadDashboardTasks());
  };
}

export function unloadDashboard (dashboard) {
  return function (dispatch) {
    dispatch(unloadDashboardTasks());
    // must be last as it will clear everything
    dispatch({ type: DASHBOARD_UNLOAD });
    dispatch(clearSearchSuggestions());
  };
}

export function loadDashboardTasks () {
  return function (dispatch) {
    dispatch({ type: DASHBOARD_LOAD_TASKS });
    let params = {
      category: 'tasks',
      start: 0,
      count: 10,
      sort: 'created:desc',
      query: "state:Running"
    };
    watchItems(DASHBOARD_WATCH_TASKS, params,
      (result) => dispatch(loadDashboardTasksSuccess(result)),
      (error) => dispatch(loadDashboardTasksFailure(error))
    );
  };
}

export function unloadDashboardTasks () {
  return function (dispatch) {
    stopWatching(DASHBOARD_WATCH_TASKS);
    dispatch({ type: DASHBOARD_UNLOAD_TASKS });
  };
}

export function loadDashboardTasksSuccess (result) {
  return { type: DASHBOARD_LOAD_TASKS_SUCCESS, result: result };
}

export function loadDashboardTasksFailure (error) {
  return { type: DASHBOARD_LOAD_TASKS_FAILURE, error: error };
}
