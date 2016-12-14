// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { browserHistory as history } from 'react-router';
import { configure, updateHeaders, postLogin, getSession, postResetPassword,
  postLogout } from './Api';
import { loadStatus } from './status';
import { watchMasterRoute, ignoreMasterRoute } from './route';

export const SESSION_INIT = 'SESSION_INIT';
export const SESSION_LOGIN = 'SESSION_LOGIN';
export const SESSION_LOGIN_SUCCESS = 'SESSION_LOGIN_SUCCESS';
export const SESSION_LOGIN_FAILURE = 'SESSION_LOGIN_FAILURE';
export const SESSION_LOGOUT = 'SESSION_LOGOUT';
export const SESSION_RESET_PASSWORD = 'SESSION_RESET_PASSWORD';
export const SESSION_RESET_PASSWORD_SUCCESS = 'SESSION_RESET_PASSWORD_SUCCESS';
export const SESSION_RESET_PASSWORD_FAILURE = 'SESSION_RESET_PASSWORD_FAILURE';

let localStorage = window.localStorage;

export function sessionInitialize (path) {
  return function (dispatch) {
    let { role, token, userName, logoutAt } = localStorage;
    if (! logoutAt) {
      // This user has never logged out, generate a temporary token for them
      userName = 'Guest';
      token = 'simulated-token';
    }
    updateHeaders({ Auth: token });
    dispatch({
      type: SESSION_INIT, userName: userName, token: token, role: role
    });
    dispatch(loadStatus(path, token));
    if ('minion' === userName) {
      dispatch(watchMasterRoute());
    }
  };
}

export function sessionLogin (host, userName, password) {
  let token;
  return function (dispatch) {
    dispatch({ type: SESSION_LOGIN, host: host, userName: userName });
    configure({ host: host });
    postLogin(userName, password)
    .then(response => {
      token = response.sessionID;
      updateHeaders({ Auth: token, "Session-id": token });
      return getSession();
    })
    .then(session => {
      try {
        localStorage.userName = session.userName;
        localStorage.token = token;
        localStorage.role = session.roles[0];
        localStorage.removeItem('logoutAt');
      } catch (e) {
        alert(
          "Unable to preserve session, probably due to being in private" +
          "browsing mode."
        );
      }
      dispatch(sessionLoginSuccess(host, session.userName, token,
        session.roles[0], session.needPasswordReset));
      if (session.needPasswordReset) {
        history.push('/reset-password');
      } else {
        history.push('/status');
      }
    })
    .then(response => {
      if ('minion' === userName) {
        dispatch(watchMasterRoute());
      }
      return response;
    })
    .catch(error => dispatch(sessionLoginFailure(error)));
  };
}

export function sessionLoginSuccess (host, userName, token, role,
  needPasswordReset) {
  return {
    type: SESSION_LOGIN_SUCCESS, host: host, userName: userName, token: token,
    role: role, needPasswordReset: needPasswordReset
  };
}

export function sessionLoginFailure (error) {
  return { type: SESSION_LOGIN_FAILURE, error: error };
}

export function sessionResetPassword (userName, password) {
  return function (dispatch) {
    dispatch({ type: SESSION_RESET_PASSWORD, userName: userName });
    postResetPassword(userName, password)
    .then(() => dispatch(sessionResetPasswordSuccess()))
    .catch(error => dispatch(sessionResetPasswordFailure(error)));
  };
}

export function sessionResetPasswordSuccess () {
  return { type: SESSION_RESET_PASSWORD_SUCCESS, passwordReset: true };
}

export function sessionResetPasswordFailure (error) {
  return { type: SESSION_RESET_PASSWORD_FAILURE, error: error };
}

export function sessionLogout () {
  return function (dispatch) {
    dispatch({ type: SESSION_LOGOUT });
    postLogout();
    dispatch(ignoreMasterRoute());
    try {
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.logoutAt = (new Date()).toISOString();
    } catch (e) {
      // ignore
    }
    window.location.href = '/login';
  };
}
