// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import { ITEM_SUCCESS, ITEM_ACTIVATE } from '../actions';

const initialState = {
  uri: null,
  result: {}
};

const handlers = {
  [ITEM_ACTIVATE]: (state, action) => ({ uri: action.uri }),
  [ITEM_SUCCESS]: (state, action) => ({ result: action.result, watcher: action.watcher })
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
