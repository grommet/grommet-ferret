// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import store from './store';
import { browserHistory as history } from 'react-router';
// import { init } from './actions/actions';

const AUTO_ROUTES = [
  '/dashboard',
  '/virtual-machines',
  '/virtual-machines/add',
  '/virtual-machines',
  '/virtual-machines/rest/virtual-machines/1',
  '/virtual-machines',
  '/activity',
  '/utilization',
  '/images',
  '/virtual-machine-sizes',
  '/settings/edit'
];
const AUTO_ROUTE_INTERVAL = 10000; // 10s
let _autoRouteIndex = -1;
let _autoRouteTimer;

export function initialize () {
  store.subscribe(sessionWatcher);
}

function sessionWatcher () {
  const {route, session, status} = store.getState();
  if (route && route.location) {

    if (route.masterRoute && (! route.ignoreMasterUntil ||
      route.ignoreMasterUntil.getTime() < (new Date()).getTime())) {
      // we are following another user's navigation
      if (route.location.pathname !== route.masterRoute.pathname) {
        history.push(route.masterRoute.pathname);
      }
    } else if (route.location.pathname === '/') {
      history.replace(session.home);
    }

    // If this is the first time setup, remain on status when ready
    if ('initialized' === status.state) {
      _eventualPath = null;
    }

    // manage auto routing
    if (route.playing && ! _autoRouteTimer) {
      _autoRouteTimer = setInterval(() => {
        _autoRouteIndex += 1;
        if (_autoRouteIndex >= AUTO_ROUTES.length) {
          _autoRouteIndex = 0;
        }
        // find the DOM element driving the navigation
        const elems = document.querySelectorAll(
          `[href="${AUTO_ROUTES[_autoRouteIndex]}"]`
        );
        if (elems.length > 0) {
          const elem = elems[elems.length - 1];
          // focus on it for a little
          elem.focus();
          setTimeout(() => {
            elem.blur();
            history.push(AUTO_ROUTES[_autoRouteIndex]);
          }, 1000);
        } else {
          history.push(AUTO_ROUTES[_autoRouteIndex]);
        }
      }, AUTO_ROUTE_INTERVAL);
    } else if (! route.playing && _autoRouteTimer) {
      clearInterval(_autoRouteTimer);
      _autoRouteTimer = undefined;
      _autoRouteIndex = -1;
    }
  }
};
