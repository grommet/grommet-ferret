// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { watchItem, stopWatching, postRoute } from './Api';

// route
export const ROUTE_CHANGED = 'ROUTE_CHANGED';
export const ROUTE_MASTER_CHANGED = 'ROUTE_MASTER_CHANGED';
export const ROUTE_MASTER_UNLOAD = 'ROUTE_MASTER_UNLOAD';
export const ROUTE_PLAY = 'ROUTE_PLAY';
export const ROUTE_STOP = 'ROUTE_STOP';

const ROUTE_WATCH = 'route';

export function routeChanged (location, publish) {
  return function (dispatch) {
    // publish first to preserve order of changes
    if (publish) {
      postRoute({ category: 'route', pathname: location.pathname });
    }
    dispatch({ type: ROUTE_CHANGED, location: location, at: new Date() });
  };
}

export function watchMasterRoute () {
  return function (dispatch) {
    watchItem(ROUTE_WATCH, '/rest/route/1',
      (masterRoute) => {
        dispatch({ type: ROUTE_MASTER_CHANGED, masterRoute: masterRoute });
      },
      (error) => console.log('!!! watchMasterRoute catch', error)
    );
  };
}

export function ignoreMasterRoute () {
  return function (dispatch) {
    stopWatching(ROUTE_WATCH, true);
    dispatch({ type: ROUTE_MASTER_UNLOAD });
  };
}

export function routePlay () {
  return { type: ROUTE_PLAY };
}

export function routeStop () {
  return { type: ROUTE_STOP };
}
