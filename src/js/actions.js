// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from 'grommet/utils/Rest';
import history from './RouteHistory';
import Query from 'grommet-index/utils/Query';
import IndexApi from './Api';
import _omit from 'lodash/object/omit';
import _isEmpty from 'lodash/lang/isEmpty';

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
export const DASHBOARD_SEARCH = 'DASHBOARD_SEARCH';
export const DASHBOARD_SEARCH_SUCCESS = 'DASHBOARD_SEARCH_SUCCESS';

// index page
export const INDEX_NAV = 'INDEX_NAV';
export const INDEX_LOAD = 'INDEX_LOAD';
export const INDEX_SELECT = 'INDEX_SELECT';
export const INDEX_QUERY = 'INDEX_QUERY';
export const INDEX_UNLOAD = 'INDEX_UNLOAD';

// item page
export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const ITEM_NEW = 'ITEM_NEW';
export const ITEM_ADD = 'ITEM_ADD';
export const ITEM_EDIT = 'ITEM_EDIT';
export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_REMOVE = 'ITEM_REMOVE';

// index api
export const INDEX_SUCCESS = 'INDEX_SUCCESS';
export const INDEX_AGGREGATE_SUCCESS = 'INDEX_AGGREGATE_SUCCESS';
export const ITEM_SUCCESS = 'ITEM_SUCCESS';
export const ITEM_FAILURE = 'ITEM_FAILURE';
export const ITEM_ADD_SUCCESS = 'ITEM_ADD_SUCCESS';
export const ITEM_ADD_FAILURE = 'ITEM_ADD_FAILURE';
export const ITEM_NOTIFICATIONS_SUCCESS = 'ITEM_NOTIFICATIONS_SUCCESS';
export const ITEM_NOTIFICATIONS_FAILURE = 'ITEM_NOTIFICATIONS_FAILURE';
export const ITEM_MAP_SUCCESS = 'ITEM_MAP_SUCCESS';
export const ITEM_MAP_FAILURE = 'ITEM_MAP_FAILURE';

export function init(email, token) {
  return { type: INIT, email: email, token: token };
}

export function login(email, password) {
  return function (dispatch) {
    Rest.post('/rest/login-sessions',
      {email: email, password: password})
      .end(function(err, res) {
        if (err || !res.ok) {
          dispatch(loginFailure(res.body));
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

export function routeChanged(route, prefix) {
  return { type: ROUTE_CHANGED, route: route, prefix: prefix };
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

export function dashboardLayout(graphicSize, count, legendPlacement, tiles) {
  return function (dispatch) {
    dispatch({
      type: DASHBOARD_LAYOUT,
      graphicSize: graphicSize,
      count: count,
      legendPlacement: legendPlacement
    });
    // reset what we're watching for
    tiles.filter((tile) => (tile.history)).forEach((tile) => {
      IndexApi.stopWatching(tile.watcher);
      let params = {
        category: tile.category,
        query: tile.query,
        attribute: tile.attribute,
        interval: tile.interval,
        count: count
      };
      let watcher = IndexApi.watchAggregate(params, (result) => {
        dispatch(indexAggregateSuccess(watcher, tile.name, result));
      });
    });
  };
}

export function dashboardLoad(tiles) {
  return function (dispatch) {
    dispatch({ type: DASHBOARD_LOAD });
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
    dispatch({ type: DASHBOARD_UNLOAD });
    tiles.forEach((tile) => {
      IndexApi.stopWatching(tile.watcher);
    });
  };
}

export function dashboardSearch(text) {
  return function (dispatch) {
    dispatch({ type: DASHBOARD_SEARCH, text: text });
    if (text && text.length > 0) {
      let params = {
        start: 0,
        count: 5,
        query: text
      };
      Rest.get('/rest/index/search-suggestions', params).end((err, res) => {
        if (err) {
          throw err;
        } else if (res.ok) {
          dispatch({ type: DASHBOARD_SEARCH_SUCCESS, result: res.body });
        }
      });
    }
  };
}

function defaultParams(category, index) {
  return {
    category: index.category || category,
    count: IndexApi.pageSize,
    sort: index.sort,
    start: 0
  };
}

export function indexNav(path, category, query) {
  let queryString = '';
  for (let name in query) {
    queryString += (queryString.length === 0 ? '?' : '&');
    queryString += `${name}=${encodeURIComponent(query[name])}`;
  }
  history.pushState(null, (path || `/${category}`) + queryString);
  return { type: INDEX_NAV, category, query };
}

export function indexLoad(category, index, selection) {
  return function (dispatch) {
    // bring in any query from the location
    const loc = history.createLocation(document.location.pathname + document.location.search);
    const queryFilters = _omit(loc.query, 'q');
    let filters = !_isEmpty(queryFilters) ? {} : index.filters;
    let params = defaultParams(category, index);
    let query = index.query;

    for (let filter in queryFilters) {
      let value = queryFilters[filter];
      if (!Array.isArray(value)) {
        value = [value];
      }
      filters = { ...filters, [filter]: value };
    }

    if (loc.query.q) {
      query = new Query(loc.query.q);
    }
    if (query) {
      params = { ...params, ...{ query } };
    }
    if (filters) {
      params = { ...params, ...{ filters } };
    }
    if (selection) {
      params = { ...params, ...{referenceUri: selection } };
    }
    dispatch({ type: INDEX_LOAD, category, query, filters });
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexUnload(index) {
  return function (dispatch) {
    if (index.activeCategory) {
      IndexApi.stopWatching(index.watcher);
      dispatch({ type: INDEX_UNLOAD });
    }
  };
}

export function indexSelect(category, selection) {
  // We have to special case activity since it's a combo category
  if ('tasks' === category || 'alerts' === category) {
    category = 'activity';
  }
  history.pushState(null, '/' + category + selection + document.location.search);
  return { type: INDEX_SELECT, selection: selection };
}

export function indexMore(category, index) {
  return function (dispatch) {
    IndexApi.stopWatching(index.watcher);
    let params = defaultParams(category, index);
    let query = index.query;
    let filters = index.filters;
    params = { ...params, ...{ query, filters,
      count: (index.result.count + IndexApi.pageSize) } };
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexMoreBefore(category, index) {
  return function (dispatch) {
    IndexApi.stopWatching(index.watcher);
    let params = defaultParams(category, index);
    let query = index.query;
    let filters = index.filters;
    params = { ...params, ...{ query, filters,
        start: (Math.max(index.result.start -= IndexApi.pageSize)),
        count: (index.result.count + IndexApi.pageSize) } };
    let watcher = IndexApi.watchItems(params, (result) => {
      dispatch(indexSuccess(watcher, category, result));
    });
  };
}

export function indexQuery(category, index, query, filters) {
  return function (dispatch) {
    filters = _omit(filters, _isEmpty);
    let historyState = {
      ...filters
    };
    if (query) {
      historyState.q = query.text;
    }
    history.pushState(null, document.location.pathname, historyState);
    IndexApi.stopWatching(index.watcher);
    dispatch({ type: INDEX_QUERY, category, query, filters });
    let params = defaultParams(category, index);
    params = { ...params, ...{ query }, ...{ filters } };
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

function watchNotifications(dispatch, uri, activityUri) {
  let params = { category: ['alerts', 'tasks'], start: 0, count: 10 };
  let specialUri = (activityUri ? " OR uri:" + activityUri : '');
  let query = "associatedResourceUri:" + uri +
    " AND (state:Active OR state:Locked OR state:Running" + specialUri + ")";
  params.query = query;
  let notificationsWatcher = IndexApi.watchItems(params, (result) => {
    dispatch(itemNotificationsSuccess(notificationsWatcher, uri, result));
  }, (error) => {
    dispatch(itemNotificationsFailure(notificationsWatcher, uri, error));
  });
}

export function itemLoad(uri) {
  return function (dispatch) {
    dispatch({ type: ITEM_LOAD, uri: uri });

    let watcher = IndexApi.watchItem(uri, (result) => {
      dispatch(itemSuccess(watcher, uri, result));
    }, (error) => {
      dispatch(itemFailure(watcher, uri, error));
    });

    watchNotifications(dispatch, uri);

    let mapWatcher = IndexApi.watchMap(uri, (result) => {
      dispatch(itemMapSuccess(mapWatcher, uri, result));
    }, (error) => {
      dispatch(itemMapFailure(mapWatcher, uri, error));
    });
  };
}

export function itemUnload(item) {
  return function (dispatch) {
    dispatch({ type: ITEM_UNLOAD });
    IndexApi.stopWatching(item.watcher);
    IndexApi.stopWatching(item.notificationsWatcher);
  };
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
            dispatch(indexSelect(item.category,
              task.attributes.associatedResourceUri));
          }
        });
      }
    });
  };
}

export function itemEdit(category, item) {
  history.pushState(null, '/' + category + '/edit' + item.uri + document.location.search);
  return { type: ITEM_EDIT, item: item };
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

export function itemRemove(category, item) {
  return function (dispatch) {
    Rest.del(item.uri).end((err, res) => {
      const taskUri = res.body.taskUri;
      IndexApi.stopWatching(item.notificationsWatcher);
      dispatch({ type: ITEM_REMOVE, uri: item.uri, deleteTaskUri: taskUri });
      watchNotifications(dispatch, item.uri, taskUri);
      //history.pushState(null, '/' + category + document.location.search);
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

export function itemFailure(watcher, uri, error) {
  return {
    type: ITEM_FAILURE,
    watcher: watcher,
    uri: uri,
    error: error
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

export function itemNotificationsSuccess(watcher, uri, result) {
  return { type: ITEM_NOTIFICATIONS_SUCCESS, watcher: watcher, uri: uri, result: result };
}

export function itemNotificationsFailure(watcher, uri, result) {
  return { type: ITEM_NOTIFICATIONS_FAILURE, watcher: watcher, uri: uri, result: result };
}

export function itemMapSuccess(watcher, uri, result) {
  return { type: ITEM_MAP_SUCCESS, watcher: watcher, uri: uri, result: result };
}

export function itemMapFailure(watcher, uri, result) {
  return { type: ITEM_MAP_FAILURE, watcher: watcher, uri: uri, result: result };
}
