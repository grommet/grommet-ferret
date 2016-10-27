// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { UTILIZATION_LOAD, UTILIZATION_LOAD_SUCCESS,
  UTILIZATION_UNLOAD } from '../actions/actions';

const initialState = {
  attribute: undefined,
  result: {items: []}
};

const handlers = {

  [UTILIZATION_LOAD]: (state, action) => {
    if (state.attribute) {
      console.log('!!! UTILIZATION_LOAD mismatched attribute',
        action.attribute, state.attribute);
    }
    return {
      attribute: action.attribute
    };
  },

  [UTILIZATION_LOAD_SUCCESS]: (state, action) => ({
    result: action.result
  }),

  [UTILIZATION_UNLOAD]: (state, action) => (initialState)

};

export default function utilizationReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
