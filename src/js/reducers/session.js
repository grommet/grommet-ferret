// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { SESSION_INIT,
  SESSION_LOGIN, SESSION_LOGIN_SUCCESS, SESSION_LOGIN_FAILURE,
  SESSION_RESET_PASSWORD, SESSION_RESET_PASSWORD_SUCCESS,
  SESSION_LOGOUT } from '../actions/actions';

const initialState = {
  enableAutoPlay: false,
  error: undefined,
  passwordReset: false, // TODO: should come from the server
  publishRoute: false,
  role: undefined,
  state: 'initial', // initial | changing | ready
  token: undefined,
  userName: undefined
};

const homeForRole = (role) => {
  if ('virtualization user' === role) {
    return '/virtual-machines';
  } else {
    return '/dashboard';
  }
};

const stateForLogin = (action) => ({
  userName: action.userName,
  role: action.role,
  home: homeForRole(action.role),
  token: action.token,
  needPasswordReset: action.needPasswordReset,
  publishRoute: 'Gru' === action.userName,
  enableAutoPlay: (action.userName &&
    'u' === action.userName[action.userName.length-1])
});

const handlers = {
  [SESSION_INIT]: (_, action) => stateForLogin(action),

  [SESSION_LOGIN]: (_, action) => ({
    state: 'changing',
    userName: action.userName
  }),

  [SESSION_LOGIN_SUCCESS]: (_, action) => ({
    ...stateForLogin(action),
    state: 'ready',
    error: undefined
  }),

  [SESSION_LOGIN_FAILURE]: (_, action) => ({
    state: 'initial',
    error: action.error
  }),

  [SESSION_RESET_PASSWORD]: (_, action) => ({
    state: 'changing',
    error: undefined
  }),

  [SESSION_RESET_PASSWORD_SUCCESS]: (_, action) => ({
    state: 'ready',
    needPasswordReset: false}),

  [SESSION_LOGOUT]: () => ({
    state: 'initial',
    userName: null,
    token: undefined
  })
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
