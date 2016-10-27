// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { DASHBOARD_LOAD,
  DASHBOARD_LOAD_UTILIZATION_SUCCESS,
  DASHBOARD_LOAD_TASKS_SUCCESS,
  DASHBOARD_UNLOAD } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  alerts: {items: []},
  tasks: {items: []},
  utilization: {}
};

const handlers = {

  [DASHBOARD_LOAD]: (state, action) => ({ ...initialState }),

  [DASHBOARD_UNLOAD]: (state, action) => ({ ...initialState }),

  [DASHBOARD_LOAD_UTILIZATION_SUCCESS]: (state, action) => ({
    utilization: action.result
  }),

  [DASHBOARD_LOAD_TASKS_SUCCESS]: (state, action) => ({
    tasks: convertTimestamps(action.result)
  })

};

export default function dashboardReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
