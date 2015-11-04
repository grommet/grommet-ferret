// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from '../actions';

const initialState = {
  email: null,
  token: null,
  error: null
};

const handlers = {
  [INIT]: (_, action) => ({email: action.email, token: action.token}),
  [LOGIN]: (_, action) => ({email: action.email, error: null}),
  [LOGIN_SUCCESS]: (_, action) => ({email: action.email, token: action.token, error: null}),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => ({token: null})
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
