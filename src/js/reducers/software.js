// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { SOFTWARE_LOAD, SOFTWARE_LOAD_SUCCESS,
  SOFTWARE_UPLOAD, SOFTWARE_UPLOAD_PROGRESS,
  SOFTWARE_UPLOAD_SUCCESS, SOFTWARE_UPLOAD_FAILURE
} from '../actions/actions';

const initialState = {
  // From the server -
  // version:
  // releaseNotes:
  // errors: [{status: , message: , resolution: , action: update|upload }]
  // runningTaskUri:
  // UI state -
  // status:
  // message:
  // state:
  // percent:
  // errors:
  // action: update|upload
};

const handlers = {

  [SOFTWARE_LOAD]: (state, action) => ({ ...initialState }),

  [SOFTWARE_LOAD_SUCCESS]: (state, action) => {
    let status, message, nextAction, errors;
    if (action.update.errors) {
      status = 'critical';
      action.update.errors.forEach(error => {
        nextAction = error.action;
      });
      message = `Software ${nextAction} failed`;
      errors = action.update.errors;
    } else if (action.update.version) {
      status = 'ok';
      message = 'Upload software succeeded';
      nextAction = 'update';
    }

    return {
      ...action.update,
      state: undefined,
      status: status,
      message: message,
      action: nextAction,
      errors: errors
    };
  },

  [SOFTWARE_UPLOAD]: (state, action) => ({
    ...initialState,
    state: 'Uploading',
    status: 'unknown',
    message: 'Upload software',
    percent: 0,
    errors: undefined,
    action: undefined
  }),

  [SOFTWARE_UPLOAD_PROGRESS]: (state, action) => ({
    // preserve 50% for the subsequent task of unpacking the file
    percent: Math.round(action.loaded / action.total * 50),
    // When we are done uploading, turn off status and let
    // SOFTWARE_UPLOAD_SUCCESS take over. This lets SettingsEdit show
    // just the corresponding task notification.
    status: undefined
  }),

  [SOFTWARE_UPLOAD_SUCCESS]: (state, action) => ({
    ...action.update,
    state: undefined,
    percent: undefined,
    status: 'ok',
    message: 'Upload software succeeded',
    action: 'update'
  }),

  [SOFTWARE_UPLOAD_FAILURE]: (state, action) => ({
    state: undefined,
    percent: undefined,
    status: 'critical',
    message: 'Upload software failed',
    errors: (action.messageOrTask.taskErrors ?
      action.messageOrTask.taskErrors : [action.messageOrTask.message]),
    action: 'upload'
  })

};

export default function softwareReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
