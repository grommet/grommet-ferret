// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { VM_LOAD_IMAGES, VM_LOAD_IMAGES_SUCCESS,
  VM_LOAD_NETWORKS, VM_LOAD_NETWORKS_SUCCESS,
  VM_LOAD_SIZES, VM_LOAD_SIZES_SUCCESS,
  VM_LOAD_SNAPSHOTS_SUCCESS, VM_UNLOAD_SNAPSHOTS,
  VM_RESPONSIVE } from '../actions/actions';
import convertTimestamps from '../utils/ConvertTimestamps';

const initialState = {
  adding: false,
  images: [],
  networks: [],
  sizes: [],
  snapshots: {items: []}
};

const handlers = {

  [VM_LOAD_IMAGES]: (state, action) => ({ images: [] }),

  [VM_LOAD_IMAGES_SUCCESS]: (state, action) => {
    // trim properties
    let images = action.result.items.map((i) => {
      return {name: i.name, uri: i.uri, label: i.name, value: i.uri};
    });
    return { images: images };
  },

  [VM_LOAD_NETWORKS]: (state, action) => ({ networks: [] }),

  [VM_LOAD_NETWORKS_SUCCESS]: (state, action) => {
    // trim properties
    let networks = action.result.items.map((i) => {
      return {name: i.name, uri: i.uri, label: i.name, value: i.uri,
        vLanId: i.attributes.vLanId};
    });
    return { networks: networks };
  },

  [VM_LOAD_SIZES]: (state, action) => ({ sizes: [] }),

  [VM_LOAD_SIZES_SUCCESS]: (state, action) => {
    // simplify from index attributes
    let sizes = action.result.items.map((i) => {
      return { name: i.name, uri: i.uri,
        vCpus: i.vCpus, memory: i.memory, diskSpace: i.diskSpace,
        ...i.attributes };
    });
    return { sizes: sizes };
  },

  [VM_LOAD_SNAPSHOTS_SUCCESS]: (state, action) => ({
    snapshots: convertTimestamps(action.result)
  }),

  [VM_UNLOAD_SNAPSHOTS]: (state, action) => ({
    snapshots: {...initialState.snapshots}
  }),

  [VM_RESPONSIVE]: (state, action)  => ({ responsive: action.responsive })

};

export default function vmReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
