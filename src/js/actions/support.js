// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { getSupport, postSupport, delSupport, head } from './Api';
// import { taskCompleter } from './task';

export const SUPPORT_LOAD = 'SUPPORT_LOAD';
export const SUPPORT_LOAD_SUCCESS = 'SUPPORT_LOAD_SUCCESS';
export const SUPPORT_DUMP_CREATE = 'SUPPORT_DUMP_CREATE';
export const SUPPORT_DUMP_CREATE_SUCCESS = 'SUPPORT_DUMP_CREATE_SUCCESS';
export const SUPPORT_DUMP_CREATE_FAILURE = 'SUPPORT_DUMP_CREATE_FAILURE';
export const SUPPORT_DUMP_CHECK = 'SUPPORT_DUMP_CHECK';
export const SUPPORT_DUMP_CHECK_SUCCESS = 'SUPPORT_DUMP_CHECK_SUCCESS';
export const SUPPORT_DUMP_CHECK_FAILURE = 'SUPPORT_DUMP_CHECK_FAILURE';

export function loadSupport () {
  return function (dispatch) {
    dispatch({ type: SUPPORT_LOAD });
    getSupport()
    .then(support => dispatch(loadSupportSuccess(support)));
  };
}

export function loadSupportSuccess (support) {
  return { type: SUPPORT_LOAD_SUCCESS, support: support };
}

export function createSupportDump () {
  return function (dispatch) {
    dispatch({ type: SUPPORT_DUMP_CREATE });
    //   This should be a task but the Atlas server doesn't do that.
    //   Instead, just wait for request completion
    postSupport((err, res) => {
      if (!err && res.ok) {
        dispatch(createSupportDumpSuccess(res.body.supportDumpFile));
      } else {
        dispatch(createSupportDumpFailure(res.body || {message: res.text}));
      }
    });


    // postSupport(
    //   taskCompleter({
    //     initiated: (task) => {
    //       dispatch(loadSupport());// to detect that the old one was removed
    //     },
    //     failure: (message) => {
    //       dispatch(createSupportDumpFailure(message));
    //     },
    //     success: () => {
    //       dispatch(createSupportDumpSuccess());
    //       dispatch(loadSupport());
    //     }
    //   })
    // );
  };
}

export function createSupportDumpSuccess (file) {
  return { type: SUPPORT_DUMP_CREATE_SUCCESS, file: file };
}

export function createSupportDumpFailure (error) {
  return { type: SUPPORT_DUMP_CREATE_FAILURE, error: error };
}

export function checkSupportDump (url) {
  return function (dispatch) {
    dispatch({ type: SUPPORT_DUMP_CHECK });
    head(url)
    .then(() => dispatch(checkSupportDumpSuccess()))
    .catch(error => dispatch(checkSupportDumpFailure(error)));
  };
}

export function checkSupportDumpSuccess () {
  return { type: SUPPORT_DUMP_CHECK_SUCCESS };
}

export function checkSupportDumpFailure (error) {
  return { type: SUPPORT_DUMP_CHECK_FAILURE, error: error };
}

export function deleteSupportDump () {
  return function (dispatch) {
    delSupport()
    .then(() => dispatch(loadSupport()));
  };
}
