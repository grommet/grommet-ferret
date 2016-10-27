// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { SETTINGS_LOAD_SUCCESS, HYPERVISOR_CHANGE, HYPERVISOR_LOAD_CERTIFICATE,
  HYPERVISOR_LOAD_CERTIFICATE_SUCCESS,
  HYPERVISOR_VERIFY_SUCCESS, HYPERVISOR_VERIFY_FAILURE
} from '../actions/actions';

const handlers = {

  [SETTINGS_LOAD_SUCCESS]: (state, action) => ({
    ...action.settings.hypervisor
  }),

  [HYPERVISOR_CHANGE]: (state, action) => (
    { ...action.hypervisor, verified: false }
  ),

  [HYPERVISOR_LOAD_CERTIFICATE]: (state, action) => ({
    trust: false
  }),

  [HYPERVISOR_LOAD_CERTIFICATE_SUCCESS]: (state, action) => {
    const trust = ('trusted' === action.response.result);
    return {
      certificate: action.response.certificate,
      trust: trust
    };
  },

  [HYPERVISOR_VERIFY_SUCCESS]: (state, action) => {
    return {
      verified: true
    };
  },

  [HYPERVISOR_VERIFY_FAILURE]: (state, action) => {
    return {
      verified: false,
      error: action.error
    };
  }
};

const initialState = {};

export default function hypervisorReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
