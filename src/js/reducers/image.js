// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { IMAGE_LOAD_OS_TYPES, IMAGE_LOAD_OS_TYPES_SUCCESS,
  IMAGE_ADD, IMAGE_ADD_PROGRESS, IMAGE_ADD_UPLOADED,
  IMAGE_ADD_SUCCESS, IMAGE_ADD_FAILURE,
  IMAGE_UPDATE, IMAGE_UPDATE_PROGRESS, IMAGE_UPDATE_UPLOADED,
  IMAGE_UPDATE_SUCCESS, IMAGE_UPDATE_FAILURE
} from '../actions/actions';

const initialState = {
  osTypes: [],
  uploads: []
};

function progress (state, action) {
  let uploads = state.uploads.slice(0);
  // preserve 50% for the subsequent task of unpacking the file
  const percent = Math.round(action.loaded / action.total * 50);
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads[i].percent = percent;
      break;
    }
  }
  return { uploads: uploads };
}

function uploaded (state, action) {
  let uploads = state.uploads.slice(0);
  // Done, remove it.
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads[i].state = 'Uploaded';
      break;
    }
  }
  return { uploads: uploads };
}

function complete (state, action) {
  let uploads = state.uploads.slice(0);
  // Done, remove it.
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads.splice(i, 1);
      break;
    }
  }
  return { uploads: uploads };
}

const handlers = {

  [IMAGE_LOAD_OS_TYPES]: (state, action) => ({ osTypes: [] }),

  [IMAGE_LOAD_OS_TYPES_SUCCESS]: (state, action) => {
    // trim properties
    let osTypes = action.result.items.map((i) => {
      return {name: i.name, uri: i.uri, label: i.name, value: i.uri};
    });
    return { osTypes: osTypes };
  },

  [IMAGE_ADD]: (state, action) => {
    let uploads = state.uploads.slice(0);
    uploads.push({
      file: action.file,
      state: 'Uploading',
      status: 'unknown',
      message: 'Add',
      percent: 0
    });
    return { uploads: uploads };
  },

  [IMAGE_ADD_PROGRESS]: progress,

  [IMAGE_ADD_UPLOADED]: uploaded,

  [IMAGE_ADD_SUCCESS]: complete,

  // TODO: Would be good to do something more helpful with this.
  [IMAGE_ADD_FAILURE]: complete,

  [IMAGE_UPDATE]: (state, action) => {
    let uploads = state.uploads.slice(0);
    uploads.push({
      file: action.file,
      state: 'Uploading',
      status: 'unknown',
      message: 'Update',
      percent: 0
    });
    return { uploads: uploads };
  },

  [IMAGE_UPDATE_PROGRESS]: progress,

  [IMAGE_UPDATE_UPLOADED]: uploaded,

  [IMAGE_UPDATE_SUCCESS]: complete,

  // TODO: Would be good to do something more helpful with this.
  [IMAGE_UPDATE_FAILURE]: complete

};

export default function imageReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
