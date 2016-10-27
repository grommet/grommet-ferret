// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { ACTIVITY_ITEM_LOAD, ACTIVITY_ITEM_LOAD_SUCCESS,
  ACTIVITY_LOAD_CHILDREN_SUCCESS,
  ACTIVITY_ITEM_CLEAR, ACTIVITY_ITEM_ACTIVATE,
  ACTIVITY_ITEM_UNLOAD } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  uri: undefined,
  item: {},
  children: undefined
};

const handlers = {

  [ACTIVITY_ITEM_LOAD]: (state, action) => ({
    uri: action.uri,
    item: {}
  }),

  [ACTIVITY_ITEM_UNLOAD]: (state, action) => (initialState),

  [ACTIVITY_ITEM_LOAD_SUCCESS]: (state, action) => ({
    item: {
      ...action.item,
      created: new Date(action.item.created),
      modified: new Date(action.item.modified)
    }
  }),

  [ACTIVITY_LOAD_CHILDREN_SUCCESS]: (state, action) => ({
    children: convertTimestamps(action.result)
  }),

  [ACTIVITY_ITEM_CLEAR]: (state, action) => ({ item: action.item }),

  [ACTIVITY_ITEM_ACTIVATE]: (state, action) => ({ item: action.item })
};

export default function activityReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
