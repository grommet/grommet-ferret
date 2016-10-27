// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItems, stopWatching, pageSize } from './Api';
import { mergeLocationConfiguration, pushSelection, pushQuery, pushFilter,
  pushSort } from './indexHistory';

export const INDEX_LOAD = 'INDEX_LOAD';
export const INDEX_LOAD_SUCCESS = 'INDEX_LOAD_SUCCESS';
export const INDEX_LOAD_FAILURE = 'INDEX_LOAD_FAILURE';
export const INDEX_SELECT = 'INDEX_SELECT';
export const INDEX_QUERY = 'INDEX_QUERY';
export const INDEX_FILTER = 'INDEX_FILTER';
export const INDEX_SORT = 'INDEX_SORT';
export const INDEX_MORE = 'INDEX_MORE';
export const INDEX_RESPONSIVE = 'INDEX_RESPONSIVE';
export const INDEX_UNLOAD = 'INDEX_UNLOAD';

const INDEX_WATCH = 'index';

function buildParams (config, query, filter, sort) {
  let result = {
    category: config.category,
    count: pageSize,
    start: 0
  };
  if (query || config.query) {
    const queryString = (query ? query.toString() : undefined);
    const configQueryString = (
      config.query ? config.query.toString() : undefined
    );
    if (queryString && configQueryString) {
      result.query = `${queryString} AND ${configQueryString}`;
    } else if (queryString) {
      result.query = queryString;
    } else if (configQueryString) {
      result.query = configQueryString;
    }
  }
  if (filter || config.filter) {
    const useFilter = (filter || config.filter);
    result.filter = [];
    for (let name in useFilter) {
      useFilter[name].forEach(value => {
        result.filter.push(`${name}:${value}`);
      });
    }
  }
  if (sort || config.sort) {
    result.sort = sort || config.sort;
  }
  return result;
}

export function loadIndex (config) {
  return function (dispatch) {
    // bring in any query from the location
    config = mergeLocationConfiguration(config);
    let params = buildParams(config);
    dispatch({ type: INDEX_LOAD, config: config,
      query: config.query, filter: config.filter, sort: config.sort });
    watchItems(INDEX_WATCH, params,
      (result) => dispatch(loadIndexSuccess(result)),
      (error) => dispatch(loadIndexFailure(error))
    );
  };
}

export function unloadIndex () {
  return function (dispatch) {
    stopWatching(INDEX_WATCH);
    dispatch({ type: INDEX_UNLOAD });
  };
}

export function selectIndex (index, selection) {
  if (typeof index === 'string') {
    index = {config: {path: index}};
  }
  pushSelection(index, selection);
  return ({ type: INDEX_SELECT, selection: selection });
}

export function moreIndex (index) {
  return function (dispatch) {
    dispatch({ type: INDEX_MORE });
    let params = buildParams(
      index.config, index.query, index.filter, index.sort
    );
    params = { ...params, ...{ count: (index.result.count + pageSize) } };
    watchItems(INDEX_WATCH, params,
      (result) => dispatch(loadIndexSuccess(result)),
      (error) => dispatch(loadIndexFailure(error))
    );
  };
}

export function queryIndex (index, query) {
  return function (dispatch) {
    dispatch({ type: INDEX_QUERY, query: query });
    pushQuery(index, query);
    const params = buildParams(index.config, query, index.filter, index.sort);
    watchItems(INDEX_WATCH, params,
      (result) => dispatch(loadIndexSuccess(result)),
      (error) => dispatch(loadIndexFailure(error))
    );
  };
}

export function filterIndex (index, filter) {
  return function (dispatch) {
    dispatch({ type: INDEX_FILTER, filter: filter });
    pushFilter(index, filter);
    const params = buildParams(index.config, index.query, filter, index.sort);
    watchItems(INDEX_WATCH, params,
      (result) => dispatch(loadIndexSuccess(result)),
      (error) => dispatch(loadIndexFailure(error))
    );
  };
}

export function sortIndex (index, sort) {
  return function (dispatch) {
    dispatch({ type: INDEX_SORT, sort: sort });
    pushSort(index, sort);
    const params = buildParams(index.config, index.query, index.filter, sort);
    watchItems(INDEX_WATCH, params,
      (result) => dispatch(loadIndexSuccess(result)),
      (error) => dispatch(loadIndexFailure(error))
    );
  };
}

export function loadIndexSuccess (result) {
  return { type: INDEX_LOAD_SUCCESS, result: result };
}

export function loadIndexFailure (error) {
  return { type: INDEX_LOAD_FAILURE, error: error };
}

export function responsiveIndex (responsive) {
  return { type: INDEX_RESPONSIVE, responsive: responsive };
}
