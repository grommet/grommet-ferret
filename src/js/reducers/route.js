// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { ROUTE_CHANGED, ROUTE_MASTER_CHANGED, ROUTE_MASTER_UNLOAD,
  ROUTE_PLAY, ROUTE_STOP } from '../actions/actions';

const initialState = {
  location: undefined,
  masterRoute: undefined,
  playing: false
};

const IGNORE_MASTER_DURATION = 1000 * 60 * 2; // 2 minutes

const handlers = {
  [ROUTE_CHANGED]: (state, action) => {
    let ignoreMasterUntil;
    if (state.masterRoute &&
      state.masterRoute.pathname !== action.location.pathname) {
      ignoreMasterUntil = new Date(
        action.at.getTime() + IGNORE_MASTER_DURATION
      );
    }
    return {
      location: action.location,
      ignoreMasterUntil: ignoreMasterUntil
    };
  },

  [ROUTE_MASTER_CHANGED]: (state, action) => (
    { masterRoute: action.masterRoute }
  ),

  [ROUTE_MASTER_UNLOAD]: (state, action) => ({ masterRoute: undefined }),

  [ROUTE_PLAY]: (state, action) => ({ playing: true }),

  [ROUTE_STOP]: (state, action) => ({ playing: false })
};

export default function routeReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
