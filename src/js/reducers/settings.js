// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import update from 'react/lib/update';
import { SETTINGS_LOAD, SETTINGS_LOAD_SUCCESS, SETTINGS_LOAD_FAILURE,
  SETTINGS_CHANGE,
  SETTINGS_NODES_CHANGE,
  SETTINGS_UPDATE, SETTINGS_UPDATE_SUCCESS, SETTINGS_UPDATE_FAILURE,
  SETTINGS_RESPONSIVE
} from '../actions/actions';

const initialState = {
  productName: { short: 'Ferret', long: 'Ferret Virtual Machine Vending' },
  state: 'initial',
  settings: {
    network: {}
  }
};

const handlers = {
  [SETTINGS_LOAD]: (state, action) => ({
    state: 'loading',
    settings: initialState.settings
  }),

  [SETTINGS_LOAD_SUCCESS]: (state, action) => ({
    error: null,
    state: 'loaded',
    hypervisorState: 'loaded',
    settings: action.settings
  }),

  [SETTINGS_LOAD_FAILURE]: (state, action) => ({messageOrTask: messageOrTask}),

  [SETTINGS_CHANGE]: (state, action) => ({
    state: 'modified',
    settings: { ...state.settings, ...action.settings }
  }),

  [SETTINGS_NODES_CHANGE]: (state, action) => {
    return update(state, {
      settings: {
        nodes: { $set: action.nodes },
        nodesCommonUserName: { $set: action.commonUserName },
        nodesCommonPassword: { $set: action.commonPassword }
      }
    });
  },

  [SETTINGS_UPDATE]: (state, action) => ({ state: 'updating' }),

  [SETTINGS_UPDATE_SUCCESS]: (_, action) => ({ state: 'done',
    settings: action.settings }),

  [SETTINGS_UPDATE_FAILURE]: (_, action) => (
    { messageOrTask: action.messageOrTask }
  ),

  [SETTINGS_RESPONSIVE]: (state, action) => ({responsive: action.responsive})

};

export default function settingsReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
