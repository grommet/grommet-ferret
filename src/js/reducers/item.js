// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ITEM_SUCCESS, ITEM_ACTIVATE, ITEM_NEW, ITEM_ADD, ITEM_ADD_SUCCESS,
  ITEM_NOTIFICATIONS_SUCCESS, ITEM_UNLOAD } from '../actions';

const NEW_ITEMS = {
  'server-profiles': {
    category: 'server-profiles',
    name: '',
    description: '',
    serverHardware: {},
    affinity: 'Device bay',
    firmware: '',
    connections: [],
    manageLocalStorage: false,
    logicalDrive: 'None',
    logicalDriveBootable: false,
    logicalDriveInitialize: false,
    manageSanStorage: false,
    hostOsType: 'Windows 2012',
    volumes: [],
    manageBootOrder: false
  }
};

const initialState = {
  uri: null,
  changing: false,
  item: {},
  notifications: []
};

const handlers = {
  [ITEM_UNLOAD]: (state, action) => ({ uri: null }),
  [ITEM_ACTIVATE]: (state, action) => {
    return { uri: action.uri, item: {}, notifications: [] };
  },
  [ITEM_SUCCESS]: (state, action) => {
    return {
      editable: NEW_ITEMS.hasOwnProperty(action.item.category),
      item: action.item,
      watcher: action.watcher
    };
  },
  [ITEM_NEW]: (state, action) => {
    let item;
    if (NEW_ITEMS.hasOwnProperty(action.category)) {
      item = NEW_ITEMS[action.category];
    } else {
      item = {
        category: action.category,
        name: ''
      };
    }
    return { item: item };
  },
  [ITEM_ADD]: (state, action) => ({ item: action.item, changing: true }),
  [ITEM_ADD_SUCCESS]: (state, action) => ({ item: {}, changing: false }),
  [ITEM_NOTIFICATIONS_SUCCESS]: (state, action) => {
    return { notifications: action.result, notificationsWatcher: action.watcher };
  }
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
