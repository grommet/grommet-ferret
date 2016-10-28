// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { STATUS_INITIALIZED, STATUS_PROGRESS, RESTART, RESTART_SUCCESS,
  SETTINGS_UPDATE, SETTINGS_UPDATE_PROGRESS,
  SETTINGS_UPDATE_SUCCESS, SETTINGS_UPDATE_FAILURE,
  SOFTWARE_UPDATE,
  SETTINGS_RESTORE, SETTINGS_RESTORE_SUCCESS } from '../actions/actions';

const PRODUCT_NAME = 'Ferret';

const TEXTS = {
  initializing: {
    label: 'Your ' + PRODUCT_NAME + ' is almost ready ...',
    message: 'Initializing your infrastructure...',
    colorIndex: 'light-2',
    busy: true,
    callToAction: null
  },
  initialized: {
    label: 'Your ' + PRODUCT_NAME + ' is ready to be shaped.',
    message: '',
    colorIndex: 'light-1',
    busy: false,
    callToAction: {
      label: 'Setup',
      path: '/settings/edit'
    }
  },
  settingUp: {
    label: 'Setting up your ' + PRODUCT_NAME + ' ...',
    message: 'Configuring your infrastructure...',
    colorIndex: 'light-2',
    busy: true,
    callToAction: null
  },
  updating: {
    label: 'Updating your ' + PRODUCT_NAME + ' ...',
    message: 'Updating software ...',
    colorIndex: 'light-2',
    busy: true,
    callToAction: null
  },
  restoring: {
    label: 'Restoring your ' + PRODUCT_NAME + ' ...',
    message: 'Uploading backup image...',
    colorIndex: 'light-2',
    busy: true,
    callToAction: null
  },
  restarting: {
    label: 'Restarting your ' + PRODUCT_NAME + ' ...',
    message: 'This shouldn\'t take too long ...',
    colorIndex: 'light-2',
    busy: true,
    callToAction: null
  },
  settingsFailure: {
    label: 'Unable to update the settings',
    message: 'Review the messages in Settings.',
    colorIndex: 'light-1',
    busy: false,
    callToAction: {
      label: 'Settings',
      path: '/settings/edit'
    }
  },
  ready: {
    label: 'Ready to go',
    message: 'Go build amazing things on top of it!',
    colorIndex: 'light-1',
    busy: false,
    callToAction: {
      label: 'Dashboard',
      path: '/dashboard'
    }
  },
  // Uncomment line 92 to see the in action.
  error: {
    label: 'Unable to initialize your ' + PRODUCT_NAME + '.',
    message: 'This is a simulated error message about what went wrong. ' +
      'This is a simulated resolution message indicating what the user ' +
      'should do in response to the errror, such as contact their authorized ' +
      'support representative and provide them with a support dump.',
    colorIndex: 'light-1',
    busy: false,
    callToAction: {
      label: 'Download support dump',
      icon: 'Download',
      path: '#'
    }
  }
};

const initialState = {
  state: 'initializing',
  ...TEXTS.initializing
  // progress: null
};

const handlers = {
  [STATUS_INITIALIZED]: (_, action) => ({
    state: action.statusState, ...TEXTS[action.statusState], progress: null}),
    // state: 'error', ...TEXTS.error}),
  [STATUS_PROGRESS]: (_, action) => ({
    progress: {percent: action.percent}
  }),
  [SETTINGS_UPDATE]: (_, action) => ({
    state: 'settingUp', progress: {percent: 0}, ...TEXTS.settingUp}),
  [SETTINGS_UPDATE_PROGRESS]: (_, action) => ({
    progress: {percent: action.task.percentComplete}}),
  [SETTINGS_UPDATE_SUCCESS]: (_, action) => ({
    state: 'ready', ...TEXTS.ready, progress: null}),
  [SETTINGS_UPDATE_FAILURE]: (_, action) => ({
    state: 'settingsFailure', ...TEXTS.settingsFailure, progress: null}),
  [SOFTWARE_UPDATE]: (_, action) => ({
    state: 'updating', ...TEXTS.updating}),
  [SETTINGS_RESTORE]: (_, action) => ({
    state: 'restoring', ...TEXTS.restoring}),
  [SETTINGS_RESTORE_SUCCESS]: (_, action) => ({
    state: 'ready', ...TEXTS.ready, progress: null}),
  [RESTART]: (_, action) => ({
    state: 'restarting', ...TEXTS.restarting}),
  [RESTART_SUCCESS]: (_, action) => ({
    state: 'ready', ...TEXTS.ready, progress: null})
};

export default function statusReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
