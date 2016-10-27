// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { getItems, watchItems, stopWatching, postPowerOnVm, postPowerOffVm,
  postRestartVm, pageSize } from './Api';

export const VM_LOAD_SIZES = 'VM_LOAD_SIZES';
export const VM_LOAD_SIZES_SUCCESS = 'VM_LOAD_SIZES_SUCCESS';
export const VM_LOAD_SIZES_FAILURE = 'VM_LOAD_SIZES_FAILURE';
export const VM_UNLOAD_SIZES = 'VM_UNLOAD_SIZES';
export const VM_LOAD_IMAGES = 'VM_LOAD_IMAGES';
export const VM_LOAD_IMAGES_SUCCESS = 'VM_LOAD_IMAGES_SUCCESS';
export const VM_LOAD_IMAGES_FAILURE = 'VM_LOAD_IMAGES_FAILURE';
export const VM_UNLOAD_IMAGES = 'VM_UNLOAD_IMAGES';
export const VM_LOAD_NETWORKS = 'VM_LOAD_NETWORKS';
export const VM_LOAD_NETWORKS_SUCCESS = 'VM_LOAD_NETWORKS_SUCCESS';
export const VM_LOAD_NETWORKS_FAILURE = 'VM_LOAD_NETWORKS_FAILURE';
export const VM_LOAD_SNAPSHOTS = 'VM_LOAD_SNAPSHOTS';
export const VM_LOAD_SNAPSHOTS_SUCCESS = 'VM_LOAD_SNAPSHOTS_SUCCESS';
export const VM_LOAD_SNAPSHOTS_FAILURE= 'VM_LOAD_SNAPSHOTS_FAILURE';
export const VM_UNLOAD_SNAPSHOTS = 'VM_UNLOAD_SNAPSHOTS';
export const VM_ADD_MULTIPLE = 'VM_ADD_MULTIPLE';
export const VM_ADD_MULTIPLE_SUCCESS = 'VM_ADD_MULTIPLE_SUCCESS';
export const VM_ADD_MULTIPLE_FAILURE = 'VM_ADD_MULTIPLE_FAILURE';
export const VM_POWER_ON = 'VM_POWER_ON';
export const VM_POWER_ON_SUCCESS = 'VM_POWER_ON_SUCCESS';
export const VM_POWER_OFF = 'VM_POWER_OFF';
export const VM_POWER_OFF_SUCCESS = 'VM_POWER_OFF_SUCCESS';
export const VM_RESTART = 'VM_RESTART';
export const VM_RESTART_SUCCESS = 'VM_RESTART_SUCCESS';
export const VM_RESPONSIVE = 'VM_RESPONSIVE';

const  VM_WATCH_SNAPSHOTS = 'vm snapshots';

function defaultParams (category) {
  return {
    category: category,
    count: pageSize,
    sort: "name:asc",
    start: 0
  };
}

export function loadVmSizes (searchText) {
  return function (dispatch) {
    dispatch({ type: VM_LOAD_SIZES });
    let params = defaultParams('virtual-machine-sizes');
    params.userQuery = searchText;
    params.sort = 'vCpus:asc';
    getItems(params)
    .then(response => dispatch(loadVmSizesSuccess(response)))
    .catch(error => dispatch(loadVmSizesFailure(error)));
  };
}

export function loadVmSizesSuccess (result) {
  return { type: VM_LOAD_SIZES_SUCCESS, result: result };
}

export function loadVmSizesFailure (error) {
  return { type: VM_LOAD_SIZES_FAILURE, error: error };
}

export function unloadVmSizes () {
  return function (dispatch) {
    dispatch({ type: VM_UNLOAD_SIZES });
  };
}

export function loadVmImages (searchText) {
  return function (dispatch) {
    dispatch({ type: VM_LOAD_IMAGES });
    let params = defaultParams('images');
    params.userQuery = searchText;
    getItems(params)
    .then(result => dispatch(loadVmImagesSuccess(result)))
    .catch(error => dispatch(loadVmImagesFailure(error)));
  };
}

export function loadVmImagesSuccess (result) {
  return { type: VM_LOAD_IMAGES_SUCCESS, result: result };
}

export function loadVmImagesFailure (error) {
  return { type: VM_LOAD_IMAGES_FAILURE, error: error };
}

export function unloadVmImages () {
  return function (dispatch) {
    dispatch({ type: VM_UNLOAD_IMAGES });
  };
}

export function loadVmNetworks (searchText) {
  return function (dispatch) {
    dispatch({ type: VM_LOAD_NETWORKS });
    let params = defaultParams('networks');
    params.userQuery = searchText;
    getItems(params)
    .then(result => dispatch(loadVmNetworksSuccess(result)))
    .catch(error => dispatch(loadVmNetworksFailure(error)));
  };
}

export function loadVmNetworksSuccess (result) {
  return { type: VM_LOAD_NETWORKS_SUCCESS, result: result };
}

export function loadVmNetworksFailure (error) {
  return { type: VM_LOAD_NETWORKS_FAILURE, error: error };
}

export function loadVmSnapshots (uri) {
  return function (dispatch) {
    dispatch({ type: VM_LOAD_SNAPSHOTS, uri: uri });
    let params = {
      category: 'snapshots',
      start: 0,
      count: 10,
      query: "virtualMachineUri:" + uri
    };
    watchItems(VM_WATCH_SNAPSHOTS, params,
      (result) => dispatch(loadVmSnapshotsSuccess(result)),
      (error) => dispatch(loadVmSnapshotsFailure(error))
    );
  };
}

export function loadVmSnapshotsSuccess (result) {
  return { type: VM_LOAD_SNAPSHOTS_SUCCESS, result: result };
}

export function loadVmSnapshotsFailure (error) {
  return { type: VM_LOAD_SNAPSHOTS_FAILURE, error: error };
}

export function unloadVmSnapshots (vm) {
  return function (dispatch) {
    stopWatching(VM_WATCH_SNAPSHOTS);
    dispatch({ type: VM_UNLOAD_SNAPSHOTS });
  };
}

export function addMultipleVms (vmState) {
  return function (dispatch) {
    dispatch({ type: VM_ADD_MULTIPLE, vmState: vmState });
    console.log('!!! Adding multiple VMs is TBD');
    // postItem(item, (err, res) => {
    //   if (err) {
    //     dispatch(itemAddFailure(err));
    //   } else if (res.ok) {
    //     getItem(res.body.taskUri, (err, res) => {
    //       if (err) {
    //         throw err;
    //       } else if (res.ok) {
    //         var task = res.body;
    //         dispatch(itemAddSuccess());
    //         dispatch(indexSelect(item.category,
    //           task.attributes.associatedResourceUri));
    //       }
    //     });
    //   }
    // });
  };
}

export function powerOnVm (uri) {
  return function (dispatch) {
    postPowerOnVm(uri);
  };
}

export function powerOffVm (uri) {
  return function (dispatch) {
    postPowerOffVm(uri);
  };
}

export function restartVm (uri) {
  return function (dispatch) {
    postRestartVm(uri);
  };
}

export function vmResponsive (responsive) {
  return { type: VM_RESPONSIVE, responsive: responsive };
}
