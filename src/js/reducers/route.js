// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ROUTE_CHANGED } from '../actions';

const initialState = null;

const handlers = {
  [ROUTE_CHANGED]: (_, action) => {
    return { ...action.route, ...{
      prefix: action.prefix,
      appPathname: action.route.pathname.slice(action.prefix.length - 1)
    }};
  }
};

export default function routeReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
