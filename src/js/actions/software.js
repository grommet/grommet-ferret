// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { postSoftwareUpload, postSoftwareUpdate, getSoftware,
  delSoftware, refresh } from './Api';
import { loadStatus } from './status';
import { watchTask } from './task';

export const SOFTWARE_LOAD = 'SOFTWARE_LOAD';
export const SOFTWARE_LOAD_SUCCESS = 'SOFTWARE_LOAD_SUCCESS';
export const SOFTWARE_UPLOAD = 'SOFTWARE_UPLOAD';
export const SOFTWARE_UPLOAD_PROGRESS = 'SOFTWARE_UPLOAD_PROGRESS';
export const SOFTWARE_UPLOAD_SUCCESS = 'SOFTWARE_UPLOAD_SUCCESS';
export const SOFTWARE_UPLOAD_FAILURE = 'SOFTWARE_UPLOAD_FAILURE';
export const SOFTWARE_UPDATE = 'SOFTWARE_UPDATE';
export const SOFTWARE_UPDATE_SUCCESS = 'SOFTWARE_UPDATE_SUCCESS';
export const SOFTWARE_UPDATE_FAILURE = 'SOFTWARE_UPDATE_FAILURE';

export function loadSoftware () {
  return function (dispatch) {
    dispatch({ type: SOFTWARE_LOAD });
    getSoftware()
    .then(update => dispatch(loadSoftwareSuccess(update)));
  };
}

export function loadSoftwareSuccess (update) {
  return { type: SOFTWARE_LOAD_SUCCESS, update: update };
}

export function uploadSoftware (file) {
  return function (dispatch) {
    dispatch({ type: SOFTWARE_UPLOAD, file: file });
    // postSoftwareUpload still uses REST instead of fetch() since fetch()
    // doesn't support file upload progress events.
    postSoftwareUpload(file,
      (event) => {
        // progress handler
        dispatch(uploadSoftwareProgress(event.loaded, event.total));
        if (event.loaded === event.total) {
          refresh();
        }
      },
      (err, res) => {
        if (err || !res.ok) {
          dispatch(uploadSoftwareFailure(res.body || {message: res.text}));
        } else {
          // we received a task uri, wait for it to complete
          watchTask(res.body.taskUri)
          .then(getSoftware())
          .then(software => {
            dispatch(uploadSoftwareSuccess(software));
            dispatch(loadSoftware());
            refresh();
          })
          .catch(error => dispatch(uploadSoftwareFailure(error)));
        }
      }
    );
  };
}

export function uploadSoftwareProgress (loaded, total) {
  return { type: SOFTWARE_UPLOAD_PROGRESS, loaded: loaded, total: total };
}

export function uploadSoftwareSuccess (update) {
  return { type: SOFTWARE_UPLOAD_SUCCESS, update: update };
}

export function uploadSoftwareFailure (messageOrTask) {
  return { type: SOFTWARE_UPLOAD_FAILURE, messageOrTask: messageOrTask };
}

export function updateSoftware () {
  return function (dispatch) {
    dispatch({ type: SOFTWARE_UPDATE });
    postSoftwareUpdate()
    // don't wait for a task, instead, watch status
    .then(() => {
      dispatch(loadSoftware());
      dispatch(loadStatus());
    })
    .catch(error => dispatch(updateSoftwareFailure()));
  };
}

export function updateSoftwareSuccess () {
  return { type: SOFTWARE_UPDATE_SUCCESS };
}

export function updateSoftwareFailure (error) {
  return { type: SOFTWARE_UPDATE_FAILURE, error: error };
}

export function deleteSoftware () {
  return function (dispatch) {
    delSoftware()
    .then(() => dispatch(loadSoftware()));
  };
}
