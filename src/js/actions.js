// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import Rest from 'grommet/utils/Rest';
import history from './RouteHistory';
import Query from 'grommet-index/utils/Query';
import IndexApi from './Api';

// session
export const INIT = 'INIT';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// route
export const ROUTE_CHANGED = 'ROUTE_CHANGED';

// nav
export const NAV_PEEK = 'NAV_PEEK';
export const NAV_ACTIVATE = 'NAV_ACTIVATE';
export const NAV_RESPONSIVE = 'NAV_RESPONSIVE';

// dashboard
export const DASHBOARD_LAYOUT = 'DASHBOARD_LAYOUT';
export const DASHBOARD_LOAD = 'DASHBOARD_LOAD';
export const DASHBOARD_UNLOAD = 'DASHBOARD_UNLOAD';

// index page
export const INDEX_NAV = 'INDEX_NAV';
export const INDEX_LOAD = 'INDEX_LOAD';
export const INDEX_ACTIVATE = 'INDEX_ACTIVATE';
export const INDEX_SELECT = 'INDEX_SELECT';
export const INDEX_QUERY = 'INDEX_QUERY';
export const INDEX_MORE = 'INDEX_MORE';
export const INDEX_RESPONSIVE = 'INDEX_RESPONSIVE';
export const INDEX_UNLOAD = 'INDEX_UNLOAD';

// item page
export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_ACTIVATE = 'ITEM_ACTIVATE';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const ITEM_NEW = 'ITEM_NEW';
export const ITEM_ADD = 'ITEM_ADD';
export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_REMOVE = 'ITEM_REMOVE';

// index api
export const INDEX_SUCCESS = 'INDEX_SUCCESS';
export const INDEX_AGGREGATE_SUCCESS = 'INDEX_AGGREGATE_SUCCESS';
export const ITEM_SUCCESS = 'ITEM_SUCCESS';
export const ITEM_ADD_SUCCESS = 'ITEM_ADD_SUCCESS';
export const ITEM_ADD_FAILURE = 'ITEM_ADD_FAILURE';

export function init(email, token) {
  return { type: INIT, email: email, token: token };
}

export function login(email, password) {
  return function (dispatch) {
    Rest.post('/rest/login-sessions',
      {email: email, password: password})
      .end(function(err, res) {
        if (err || !res.ok) {
          dispatch(loginFailure(err));
        } else {
          dispatch(loginSuccess(email, res.body.sessionID));
        }
      });
  };
}

export function loginSuccess(email, token) {
  return { type: LOGIN_SUCCESS, email: email, token: token };
}

export function loginFailure(error) {
  return { type: LOGIN_FAILURE, error: error };
}

export function logout() {
  return { type: LOGOUT };
}

export function routeChanged(route) {
  console.log('!!! routeChanged', route);
  return { type: ROUTE_CHANGED, route: route };
}

export function navPeek(peek) {
  return { type: NAV_PEEK, peek: peek };
}

export function navActivate(active) {
  return { type: NAV_ACTIVATE, active: active };
}

export function navResponsive(responsive) {
  return { type: NAV_RESPONSIVE, responsive: responsive };
}

export function dashboardLayout(graphicSize, count, legendPlacement) {
  return {
    type: DASHBOARD_LAYOUT,
    graphicSize: graphicSize,
    count: count,
    legendPlacement: legendPlacement
  };
}

export function dashboardLoad(tiles) {
  return function (dispatch) {
    tiles.forEach((tile) => {
      let params = {
        category: tile.category,
        query: tile.query,
        attribute: tile.attribute,
        interval: tile.interval,
        count: tile.count
      };
      let watcher = IndexApi.watchAggregate(params, (result) => {
        dispatch(indexAggregateSuccess(watcher, tile.name, result));
      });
    });
  };
}

export function dashboardUnload(tiles) {
  return function (dispatch) {
    tiles.forEach((tile) => {
      IndexApi.stopWatching(tile.watcher);
    });
  };
}

function defaultParams(category, index) {
  return {
    category: category,
    count: IndexApi.pageSize,
    sort: index.sort,
    start: 0
  };
}

export function indexNav(category, query) {
  history.pushState(null, '/' + category, {q: query.fullText});
  return { type: INDEX_NAV, category: category, query: query };
}

export function indexLoad(category, index) {
  return function (dispatch) {
    // bring in any query from the location
    const loc = history.createLocation(document.location.pathname + document.location.search);
    let params = defaultParams(category, index);
    let query = index.query;
    if (loc.query.q) {
      query = Query.create(loc.query.q);
      params = { ...params, ...{ query: query } };
    }
    dispatch(indexActivate(category, query));
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexUnload(index) {
  return function (dispatch) {
    dispatch(indexActivate(null));
    IndexApi.stopWatching(index.watcher);
  };
}

export function indexActivate(category, query) {
  return { type: INDEX_ACTIVATE, category: category, query: query };
}

export function indexSelect(category, selection) {
  history.pushState(null, '/' + category + '/' + selection + document.location.search);
  return { type: INDEX_SELECT, selection: selection };
}

export function indexMore(category, index) {
  return function (dispatch) {
    IndexApi.stopWatching(index.watcher);
    let params = defaultParams(category, index);
    params = { ...params, ...{ count: (index.result.count + IndexApi.pageSize) } };
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexQuery(category, index, query) {
  return function (dispatch) {
    history.pushState(null, document.location.pathname, {q: query.fullText});
    IndexApi.stopWatching(index.watcher);
    dispatch({ type: INDEX_QUERY, category: category, query: query });
    let params = defaultParams(category, index);
    params = { ...params, ...{ query: query } };
    // TODO: Need to get the query into the store, similar to how indexLoad does
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexSuccess(watcher, category, result) {
  return {
    type: INDEX_SUCCESS,
    watcher: watcher,
    category: category,
    result: result
  };
}

export function indexAggregateSuccess(watcher, id, result) {
  return {
    type: INDEX_AGGREGATE_SUCCESS,
    watcher: watcher,
    id: id,
    result: result
  };
}

export function indexResponsive(responsive) {
  return { type: INDEX_RESPONSIVE, responsive: responsive };
}

export function itemLoad(uri) {
  return function (dispatch) {
    dispatch(itemActivate(uri));
    let watcher = IndexApi.watchItem(uri, (result) => {
      dispatch(itemSuccess(watcher, uri, result));
    });
  };
}

export function itemUnload(watcher) {
  return function (dispatch) {
    dispatch(itemActivate(null));
    IndexApi.stopWatching(watcher);
  };
}

export function itemActivate(uri) {
  return { type: ITEM_ACTIVATE, uri: uri };
}

export function itemNew(category) {
  return { type: ITEM_NEW, category: category };
}

export function itemAdd(item) {
  return function (dispatch) {
    dispatch({ type: ITEM_ADD, item: item });
    Rest.post('/rest/' + item.category, item).end((err, res) => {
      if (err) {
        dispatch(itemAddFailure(err));
      } else if (res.ok) {
        Rest.get(res.body.taskUri).end((err, res) => {
          if (err) {
            throw err;
          } else if (res.ok) {
            var task = res.body;
            dispatch(itemAddSuccess());
            dispatch(indexSelect('server-profiles',
              task.attributes.associatedResourceUri));
          }
        });
      }
    });
  };
}

export function itemUpdate(item) {
  return function (dispatch) {
    Rest.put(item.uri, item).end((err, res) => {
      if (err) {
        dispatch(itemAddFailure(err));
      } else if (res.ok) {
        Rest.get(res.body.taskUri).end((err, res) => {
          if (err) {
            throw err;
          } else if (res.ok) {
            //var task = res.body;
            history.pushState(null, '/' + item.category + '/' + item.uri +
              document.location.search);
          }
        });
      }
    });
  };
}

export function itemRemove(category, uri) {
  return function (dispatch) {
    Rest.del(uri).end((err, res) => {
      dispatch({ type: ITEM_REMOVE, uri: uri });
      history.pushState(null, '/' + category + document.location.search);
    });
  };
}

export function itemSuccess(watcher, uri, result) {
  return {
    type: ITEM_SUCCESS,
    watcher: watcher,
    uri: uri,
    item: result
  };
}

export function itemAddSuccess() {
  return { type: ITEM_ADD_SUCCESS };
}

export function itemAddFailure(error) {
  return {
    type: ITEM_ADD_FAILURE,
    error: error
  };
}
