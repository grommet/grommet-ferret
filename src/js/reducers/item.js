// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import { ITEM_SUCCESS, ITEM_ACTIVATE, ITEM_NEW, ITEM_ADD, ITEM_ADD_SUCCESS } from '../actions';

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
  item: {}
};

const handlers = {
  [ITEM_ACTIVATE]: (state, action) => ({ uri: action.uri }),
  [ITEM_SUCCESS]: (state, action) => ({ item: action.item, watcher: action.watcher }),
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
  [ITEM_ADD_SUCCESS]: (state, action) => ({ item: {}, changing: false })
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
