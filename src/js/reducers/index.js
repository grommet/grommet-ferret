// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { INDEX_LOAD, INDEX_LOAD_SUCCESS, INDEX_LOAD_FAILURE, INDEX_UNLOAD,
  INDEX_QUERY, INDEX_FILTER, INDEX_SORT,
  INDEX_RESPONSIVE, INDEX_SELECT } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  config: undefined,
  responsive: 'multiple',
  result: undefined,
  selection: undefined
  // filter
  // query
  // sort
};

const handlers = {

  [INDEX_LOAD]: (state, action) => ({
    config: action.config,
    filter: action.filter,
    query: action.query,
    result: undefined,
    sort: action.sort
  }),

  [INDEX_UNLOAD]: (state, action) => ({
    config: undefined,
    filter: undefined,
    query: undefined,
    result: undefined,
    selection: undefined,
    sort: undefined
  }),

  [INDEX_QUERY]: (state, action) => ({
    query: action.query
  }),

  [INDEX_FILTER]: (state, action) => ({
    filter: action.filter
  }),

  [INDEX_SORT]: (state, action) => ({
    sort: action.sort
  }),

  [INDEX_LOAD_SUCCESS]: (state, action) => ({
    error: undefined,
    result: convertTimestamps(action.result)
  }),

  [INDEX_LOAD_FAILURE]: (state, action) => ({
    error: action.error
  }),

  [INDEX_RESPONSIVE]: (_, action)  => ({responsive: action.responsive}),

  [INDEX_SELECT]: (_, action)  => ({selection: action.selection})
};

export default function indexReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
