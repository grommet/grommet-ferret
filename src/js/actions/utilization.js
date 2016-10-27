// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { browserHistory as history } from 'react-router';
import { watchItems, stopWatching } from './Api';
import { clearSearchSuggestions } from './search';

export const UTILIZATION_SHOW = 'UTILIZATION_SHOW';
export const UTILIZATION_LOAD = 'UTILIZATION_LOAD';
export const UTILIZATION_LOAD_SUCCESS = 'UTILIZATION_LOAD_SUCCESS';
export const UTILIZATION_LOAD_FAILURE = 'UTILIZATION_LOAD_FAILURE';
export const UTILIZATION_UNLOAD = 'UTILIZATION_UNLOAD';

const UTILIZATION_WATCH = 'utilization';

export function showUtilization (attribute) {
  history.push({
    pathname: '/utilization',
    search: "?area=" + encodeURIComponent(attribute) + "&color=" +
      encodeURIComponent('cpuUtilization')
  });
  return { type: UTILIZATION_SHOW };
}

export function loadUtilization (attribute, count, query) {
  return function (dispatch) {
    dispatch({ type: UTILIZATION_LOAD, attribute: attribute });
    let params = {
      category: 'virtual-machines',
      count: count,
      sort: attribute + ':desc',
      start: 0,
      query: query.toString()
    };
    watchItems(UTILIZATION_WATCH, params,
      (result) => dispatch(loadUtilizationSuccess(result)),
      (error) => dispatch(loadUtilizationFailure(error))
    );
  };
}

export function loadUtilizationSuccess (result) {
  return { type: UTILIZATION_LOAD_SUCCESS, result: result };
}

export function loadUtilizationFailure (error) {
  return { type: UTILIZATION_LOAD_FAILURE, error: error };
}

export function unloadUtilization (utilization) {
  return function (dispatch) {
    stopWatching(UTILIZATION_WATCH);
    // must be last as it will clear everything
    dispatch({ type: UTILIZATION_UNLOAD });
    dispatch(clearSearchSuggestions());
  };
}
