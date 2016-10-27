// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { postImage, putImage, getItems, pageSize, refresh } from './Api';
import { watchTask } from './task';

export const IMAGE_LOAD_OS_TYPES = 'IMAGE_LOAD_OS_TYPES';
export const IMAGE_LOAD_OS_TYPES_SUCCESS = 'IMAGE_LOAD_OS_TYPES_SUCCESS';
export const IMAGE_LOAD_OS_TYPES_FAILURE = 'IMAGE_LOAD_OS_TYPES_FAILURE';
export const IMAGE_ADD = 'IMAGE_ADD';
export const IMAGE_ADD_PROGRESS = 'IMAGE_ADD_PROGRESS';
export const IMAGE_ADD_UPLOADED = 'IMAGE_ADD_UPLOADED';
export const IMAGE_ADD_SUCCESS = 'IMAGE_ADD_SUCCESS';
export const IMAGE_ADD_FAILURE = 'IMAGE_ADD_FAILURE';
export const IMAGE_UPDATE = 'IMAGE_UPDATE';
export const IMAGE_UPDATE_PROGRESS = 'IMAGE_UPDATE_PROGRESS';
export const IMAGE_UPDATE_UPLOADED = 'IMAGE_UPDATE_UPLOADED';
export const IMAGE_UPDATE_SUCCESS = 'IMAGE_UPDATE_SUCCESS';
export const IMAGE_UPDATE_FAILURE = 'IMAGE_UPDATE_FAILURE';

export function loadImageOsTypes (searchText) {
  return function (dispatch) {
    dispatch({ type: IMAGE_LOAD_OS_TYPES });
    let params = {
      category: 'os-types',
      count: pageSize,
      sort: "name:asc",
      start: 0,
      userQuery: searchText
    };
    getItems(params)
    .then(response => dispatch(loadImageOsTypesSuccess(response)))
    .catch(error => dispatch(loadImageOsTypesFailure(error)));
  };
}

export function loadImageOsTypesSuccess (result) {
  return { type: IMAGE_LOAD_OS_TYPES_SUCCESS, result: result };
}

export function loadImageOsTypesFailure (error) {
  return { type: IMAGE_LOAD_OS_TYPES_FAILURE, error: error };
}

export function addImage (image, file) {
  return function (dispatch) {
    dispatch({ type: IMAGE_ADD, file: file.name });
    // postImage still uses REST instead of fetch() since fetch() doesn't
    // support file upload progress events.
    postImage(image, file,
      (event) => {
        // progress handler
        dispatch(addImageProgress(file.name, event.loaded, event.total));
      },
      (err, res) => {
        if (err || !res.ok) {
          dispatch(addImageFailure(file.name, res.body || {message: res.text}));
        } else {
          dispatch(addImageUploaded(file.name));
          refresh();
          // we received a task uri, wait for it to complete
          watchTask(res.body.taskUri)
          .then(task => dispatch(addImageSuccess(file.name, image)))
          .catch(error => dispatch(addImageFailure(error)));
        }
      }
    );
  };
}

export function addImageProgress (file, loaded, total) {
  return { type: IMAGE_ADD_PROGRESS, file: file, loaded: loaded, total: total };
}

export function addImageUploaded (file) {
  return { type: IMAGE_ADD_UPLOADED, file: file };
}

export function addImageSuccess (file, image) {
  return { type: IMAGE_ADD_SUCCESS, file: file, image: image };
}

export function addImageFailure (file, messageOrTask) {
  return { type: IMAGE_ADD_FAILURE, file: file, messageOrTask: messageOrTask };
}

export function updateImage (image, file) {
  return function (dispatch) {
    dispatch({ type: IMAGE_UPDATE, file: file.name });
    putImage(image, file,
      (event) => {
        // progress handler
        dispatch(updateImageProgress(file.name, event.loaded, event.total));
      },
      (err, res) => {
        if (err || !res.ok) {
          dispatch(addImageFailure(file.name, res.body || {message: res.text}));
        } else {
          dispatch(updateImageUploaded(file.name));
          refresh();
          // we received a task uri, wait for it to complete
          watchTask(res.body.taskUri)
          .then(task => dispatch(updateImageSuccess(file.name, image)))
          .catch(error => dispatch(updateImageFailure(error)));
        }
      }
    );
  };
}

export function updateImageProgress (file, loaded, total) {
  return {
    type: IMAGE_UPDATE_PROGRESS, file: file, loaded: loaded, total: total
  };
}

export function updateImageUploaded (file) {
  return { type: IMAGE_UPDATE_UPLOADED, file: file };
}

export function updateImageSuccess (image) {
  return { type: IMAGE_UPDATE_SUCCESS, image: image };
}

export function updateImageFailure (error) {
  return { type: IMAGE_UPDATE_FAILURE, error: error };
}
