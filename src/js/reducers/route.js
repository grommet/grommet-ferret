// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ROUTE_CHANGED } from '../actions';

const initialState = null;

const handlers = {
  [ROUTE_CHANGED]: (_, action) => action.route
};

export default function routeReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
