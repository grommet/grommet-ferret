// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { browserHistory as history } from 'react-router';
import { getSettings, putSettings } from './Api';
import { watchTask } from './task';

export * from './hypervisor';
export * from './directory';

// settings and setup
export const SETTINGS_LOAD = 'SETTINGS_LOAD';
export const SETTINGS_LOAD_SUCCESS = 'SETTINGS_LOAD_SUCCESS';
export const SETTINGS_LOAD_FAILURE = 'SETTINGS_LOAD_FAILURE';
export const SETTINGS_CHANGE = 'SETTINGS_CHANGE';
export const SETTINGS_UPDATE = 'SETTINGS_UPDATE';
export const SETTINGS_UPDATE_PROGRESS = 'SETTINGS_UPDATE_PROGRESS';
export const SETTINGS_UPDATE_SUCCESS = 'SETTINGS_UPDATE_SUCCESS';
export const SETTINGS_UPDATE_FAILURE = 'SETTINGS_UPDATE_FAILURE';
export const SETTINGS_NODES_CHANGE = 'SETTINGS_NODES_CHANGE';
export const SETTINGS_RESPONSIVE = 'SETTINGS_RESPONSIVE';

export function loadSettings () {
  return function (dispatch) {
    dispatch({ type: SETTINGS_LOAD });
    getSettings()
    .then(settings => dispatch(loadSettingsSuccess(settings)))
    .catch(error => dispatch(loadSettingsFailure(error)));
  };
}

export function loadSettingsSuccess (settings) {
  return { type: SETTINGS_LOAD_SUCCESS, settings: settings };
}

export function loadSettingsFailure (error) {
  return { type: SETTINGS_LOAD_FAILURE, error: error };
}

export function changeSettings (settings) {
  return { type: SETTINGS_CHANGE, settings: settings };
}

export function changeNodesSettings (nodes, commonUserName, commonPassword) {
  return { type: SETTINGS_NODES_CHANGE, nodes: nodes,
    commonUserName: commonUserName, commonPassword: commonPassword };
}

export function updateSettings (settings) {
  return function (dispatch) {
    dispatch({ type: SETTINGS_UPDATE, settings: settings });
    putSettings(settings)
    .then(response => {
      history.push('/status');
      watchTask(response.taskUri, (task) => {
        dispatch(updateSettingsProgress(task));
      })
      .then(task => {
        dispatch(updateSettingsSuccess(settings));
        history.push('/dashboard');
      })
      .catch(error => dispatch(updateSettingsFailure(error)));
      return response;
    });
  };
}

export function updateSettingsProgress (task) {
  return { type: SETTINGS_UPDATE_PROGRESS, task: task };
}

export function updateSettingsSuccess (settings) {
  return { type: SETTINGS_UPDATE_SUCCESS, settings: settings };
}

export function updateSettingsFailure (messageOrTask) {
  return { type: SETTINGS_UPDATE_FAILURE, messageOrTask: messageOrTask };
}

export function settingsResponsive (responsive) {
  return { type: SETTINGS_RESPONSIVE, responsive: responsive };
}
