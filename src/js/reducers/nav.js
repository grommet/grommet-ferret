// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { NAV_PEEK, NAV_ACTIVATE, NAV_RESPONSIVE, LOGOUT } from '../actions';

const initialState = {
  active: false,
  responsive: 'multiple',
  peek: false,
  items: [
    {path: '/dashboard', label: 'Dashboard'},
    {path: '/activity', label: 'Activity'},
    {path: '/enclosures', label: 'Enclosures',
      indexCategory: 'enclosures', resourceRoute: 'enclosure'},
    {path: '/server-hardware', label: 'Server Hardware',
      indexCategory: 'server-hardware', resourceRoute: 'server hardware'},
    {path: '/server-profiles', label: 'Server Profiles',
      indexCategory: 'server-profiles', resourceRoute: 'server profile'},
    {path: '/reports', label: 'Reports'},
    {path: '/settings', label: 'Settings'}
  ]
};

const handlers = {
  [NAV_PEEK]: (_, action) => ({peek: action.peek}),
  [NAV_ACTIVATE]: (_, action) => ({active: action.active}),
  [NAV_RESPONSIVE]: (_, action)  => ({responsive: action.responsive}),
  [LOGOUT]: (_, action) => ({active: false})
};

export default function navReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
