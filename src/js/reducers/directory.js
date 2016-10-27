// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { SETTINGS_LOAD_SUCCESS, DIRECTORY_CHANGE, DIRECTORY_TRUST,
  DIRECTORY_LOAD_CERTIFICATE, DIRECTORY_LOAD_CERTIFICATE_SUCCESS,
  DIRECTORY_VERIFY_SUCCESS,
  DIRECTORY_SEARCH, DIRECTORY_SEARCH_SUCCESS
} from '../actions/actions';

const initialState = {
  directory: { groups: [] },
  response: null,
  roles: [
    'Infrastucture administrator',
    'Virtualization administrator',
    'Virtualization user',
    'Read only'
  ],
  search: {}, // index, text
  searchResponse: null,
  phase: null // identity | trust | verify | search
};

const handlers = {

  [SETTINGS_LOAD_SUCCESS]: (state, action) => {
    let phase = (action.settings.directory.address ? 'search' : 'identity');
    return {
      directory: action.settings.directory,
      phase: phase
    };
  },

  [DIRECTORY_CHANGE]: (state, action) => {
    let response = state.response;
    let phase = state.phase;
    if (state.directory.address !== action.directory.address) {
      phase = 'identity';
      response = null;
    } else if (state.directory.baseDn !== action.directory.baseDn) {
      phase = 'verify';
      response = null;
    }
    return {
      directory: action.directory,
      phase: phase,
      response: response
    };
  },

  [DIRECTORY_TRUST]: (state, action) => ({ phase: 'verify' }),

  [DIRECTORY_LOAD_CERTIFICATE]: (state, action) => ({
    directory: action.directory
  }),

  [DIRECTORY_LOAD_CERTIFICATE_SUCCESS]: (state, action) => {
    const phase = ('trusted' === action.response.result ? 'verify' : 'trust');
    return {
      directory: {
        ...action.directory,
        certificate: action.response.certificate
      },
      phase: phase
    };
  },

  [DIRECTORY_VERIFY_SUCCESS]: (state, action) => {
    return {
      phase: 'search'
    };
  },

  [DIRECTORY_SEARCH]: (state, action) => ({
    search: action.search,
    searchResponse: null }),

  [DIRECTORY_SEARCH_SUCCESS]: (state, action) => {
    return {
      phase: 'search',
      search: action.search,
      searchResponse: action.response
    };
  }
};

export default function directoryReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  // console.log('!!! directoryReducer', action.type, action);
  return { ...state, ...handler(state, action) };
}
