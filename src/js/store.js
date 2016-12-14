// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// TODO: fix webpack loader to allow import * from './reducers'
import session from './reducers/session';
import route from './reducers/route';
import status from './reducers/status';
import settings from './reducers/settings';
import software from './reducers/software';
import backup from './reducers/backup';
import support from './reducers/support';
import hypervisor from './reducers/hypervisor';
import directory from './reducers/directory';
import nav from './reducers/nav';
import search from './reducers/search';
import index from './reducers/index';
import item from './reducers/item';
import image from './reducers/image';
import vm from './reducers/vm';
import dashboard from './reducers/dashboard';
import utilization from './reducers/utilization';
import activity from './reducers/activity';
import notifications from './reducers/notifications';

export default compose(
  applyMiddleware(thunk)
)(createStore)(combineReducers({session, route, nav, status,
  settings, software, backup, support, hypervisor, directory,
  search, index, item, image, vm, dashboard, utilization,
  activity, notifications}));
