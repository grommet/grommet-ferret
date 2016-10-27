// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { ITEM_LOAD_SUCCESS, ITEM_LOAD, ITEM_ADD, ITEM_ADD_SUCCESS,
  ITEM_LOAD_ACTIVITY_SUCCESS, ITEM_UNLOAD_ACTIVITY,
  ITEM_LOAD_ASSOCIATED_SUCCESS,
  ITEM_UNLOAD } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  activity: undefined,
  associated: {links: [], categories: {}},
  changing: false,
  item: undefined,
  uri: undefined
};

const handlers = {

  [ITEM_UNLOAD]: (state, action) => (initialState),

  [ITEM_LOAD]: (state, action) => {
    if (state.uri) {
      console.log('!!! ITEM_LOAD mismatched uri', action.uri, state.uri);
    }
    return { uri: action.uri };
  },

  [ITEM_LOAD_SUCCESS]: (state, action) => ({
    editable: true, // unverified for now
    item: action.item
  }),

  [ITEM_ADD]: (state, action) => ({ item: action.item, changing: true }),

  [ITEM_ADD_SUCCESS]: (state, action) => ({ item: {}, changing: false }),

  [ITEM_LOAD_ACTIVITY_SUCCESS]: (state, action) => ({
    activity: convertTimestamps(action.result)
  }),

  [ITEM_UNLOAD_ACTIVITY]: (state, action) => ({
    activity: initialState.activity
  }),

  [ITEM_LOAD_ASSOCIATED_SUCCESS]: (state, action) => ({
    associated: action.result
  })
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
