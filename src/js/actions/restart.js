// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { postRestart } from './Api';
import { loadStatus } from './status';

export const RESTART = 'RESTART';
export const RESTART_FAILURE = 'RESTART_FAILURE';
export const RESTART_SUCCESS = 'RESTART_SUCCESS';

export function restart () {
  return function (dispatch) {
    dispatch({ type: RESTART });
    postRestart()
    .then(() => {
      dispatch(restartSuccess());
      // Give it a moment to shut down and then wait for status
      setTimeout(() => {
        dispatch(loadStatus());
      }, 100);
    })
    .catch(error => dispatch(restartFailure(error)));
  };
}

export function restartSuccess () {
  return { type: RESTART_SUCCESS };
}

export function restartFailure (error) {
  return { type: RESTART_FAILURE, error: error };
}
