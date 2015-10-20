// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import { INIT, LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from '../actions';

const initialState = {
  email: null,
  token: null,
  error: null
};

const handlers = {
  [INIT]: (_, action) => ({email: action.email, token: action.token}),
  [LOGIN]: (_, action) => ({email: action.email}),
  [LOGIN_SUCCESS]: (_, action) => ({email: action.email, token: action.token}),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => ({token: null})
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
