// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import {
  getBackup, postBackup, delBackup, postSettings, headCheck
} from './Api';
import { watchTask } from './task';

export const BACKUP_LOAD = 'BACKUP_LOAD';
export const BACKUP_LOAD_SUCCESS = 'BACKUP_LOAD_SUCCESS';
export const BACKUP_LOAD_FAILURE = 'BACKUP_LOAD_FAILURE';
export const BACKUP = 'SETTINGS_BACKUP';
export const BACKUP_SUCCESS = 'BACKUP_SUCCESS';
export const BACKUP_FAILURE = 'BACKUP_FAILURE';
export const BACKUP_CHECK = 'BACKUP_CHECK';
export const BACKUP_CHECK_SUCCESS = 'BACKUP_CHECK_SUCCESS';
export const BACKUP_CHECK_FAILURE = 'BACKUP_CHECK_FAILURE';
export const RESTORE = 'RESTORE';
export const RESTORE_SUCCESS = 'RESTORE_SUCCESS';
export const RESTORE_FAILURE = 'RESTORE_FAILURE';

export function loadBackup () {
  return function (dispatch) {
    dispatch({ type: BACKUP_LOAD });
    getBackup()
    .then(backup => dispatch(loadBackupSuccess(backup)))
    .catch(error => dispatch(loadBackupFailure(error)));
  };
}

export function loadBackupSuccess (backup) {
  return { type: BACKUP_LOAD_SUCCESS, backup: backup };
}

export function loadBackupFailure (error) {
  return { type: BACKUP_LOAD_FAILURE, error: error };
}

export function createBackup () {
  return function (dispatch) {
    dispatch({ type: BACKUP });
    postBackup()
    .then (response => {
      dispatch(loadBackup()); // to detect that the old one was removed
      watchTask(reponse.taskUri)
      .then((task) => {
        dispatch(createBackupSuccess(task));
        dispatch(loadBackup());
      })
      .catch(error => dispatch(createBackupFailure(error)));
    });
  };
}

export function createBackupSuccess (task) {
  return { type: BACKUP_SUCCESS, task: task };
}

export function createBackupFailure (error) {
  return { type: BACKUP_FAILURE, error: error };
}

export function checkBackup (url) {
  return function (dispatch) {
    dispatch({ type: BACKUP_CHECK });
    headCheck(url)
    .then(() => dispatch(checkBackupSuccess()))
    .catch(error => dispatch(checkBackupFailure(error)));
  };
}

export function checkBackupSuccess () {
  return { type: BACKUP_CHECK_SUCCESS };
}

export function checkBackupFailure (error) {
  return { type: BACKUP_CHECK_FAILURE, error: error };
}

export function deleteBackup () {
  return function (dispatch) {
    delBackup()
    .then(() => dispatch(loadBackup()));
  };
}

export function restore (file) {
  return function (dispatch) {
    dispatch({ type: RESTORE, file: file });
    let data = new FormData();
    data.append('file', file);
    postSettings(data)
    .then(response => watchTask(reponse.taskUri))
    .then(() => {
      dispatch(restoreSuccess());
      history.push('/settings/edit');
    })
    .catch(error => dispatch(restoreFailure(error)));
  };
}

export function restoreSuccess () {
  return { type: RESTORE_SUCCESS };
}

export function restoreFailure (error) {
  return { type: RESTORE_FAILURE, error: error };
}
