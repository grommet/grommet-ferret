// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { getCertificate, getDirectorySearch } from './Api';

export const DIRECTORY_CHANGE = 'DIRECTORY_CHANGE';
export const DIRECTORY_TRUST = 'DIRECTORY_TRUST';
export const DIRECTORY_LOAD_CERTIFICATE = 'DIRECTORY_LOAD_CERTIFICATE';
export const DIRECTORY_LOAD_CERTIFICATE_SUCCESS =
  'DIRECTORY_LOAD_CERTIFICATE_SUCCESS';
export const DIRECTORY_LOAD_CERTIFICATE_FAILURE =
  'DIRECTORY_LOAD_CERTIFICATE_FAILURE';
export const DIRECTORY_VERIFY = 'DIRECTORY_VERIFY';
export const DIRECTORY_VERIFY_SUCCESS = 'DIRECTORY_VERIFY_SUCCESS';
export const DIRECTORY_VERIFY_FAILURE = 'DIRECTORY_VERIFY_FAILURE';
export const DIRECTORY_SEARCH = 'DIRECTORY_SEARCH';
export const DIRECTORY_SEARCH_SUCCESS = 'DIRECTORY_SEARCH_SUCCESS';
export const DIRECTORY_SEARCH_FAILURE = 'DIRECTORY_SEARCH_FAILURE';

export function changeDirectory (directory) {
  return { type: DIRECTORY_CHANGE, directory: directory };
}

export function trustDirectory (directory) {
  return { type: DIRECTORY_TRUST, directory: directory };
}

export function loadDirectoryCertificate (directory) {
  return function (dispatch) {
    dispatch({ type: DIRECTORY_LOAD_CERTIFICATE, directory: directory });
    getCertificate({address: directory.address})
    .then(response => {
      dispatch(loadDirectoryCertificateSuccess(directory, response));
    })
    .catch(error => dispatch(loadDirectoryCertificateFailure(error)));
  };
}

export function loadDirectoryCertificateSuccess (directory, response) {
  return {
    type: DIRECTORY_LOAD_CERTIFICATE_SUCCESS,
    directory: directory,
    response: response
  };
}

export function loadDirectoryCertificateFailure (error) {
  return { type: DIRECTORY_LOAD_CERTIFICATE_FAILURE, error: error };
}

export function verifyDirectory(directory, credentials) {
  return function (dispatch) {
    dispatch({ type: DIRECTORY_VERIFY, directory: directory });
    getDirectorySearch(directory.address, directory.baseDn, '')
    .then(response => {
      dispatch(verifyDirectorySuccess(directory, response));
    })
    .catch(error => dispatch(verifyDirectoryFailure(error)));
  };
}

export function verifyDirectorySuccess (directory, response) {
  return {
    type: DIRECTORY_VERIFY_SUCCESS,
    directory: directory,
    response: response
  };
}

export function verifyDirectoryFailure (error) {
  return { type: DIRECTORY_VERIFY_FAILURE, error: error };
}

export function searchDirectory(directory, groupIndex, searchText) {
  return function (dispatch) {
    const search = {groupIndex: groupIndex, searchText: searchText };
    dispatch({ type: DIRECTORY_SEARCH, directory: directory, search: search });
    getDirectorySearch(directory.address, directory.baseDn, searchText)
    .then(response => {
      dispatch(searchDirectorySuccess(directory, search, response));
    })
    .catch(error => dispatch(searchDirectoryFailure(error)));
  };
}

export function searchDirectorySuccess (directory, search, response) {
  return {
    type: DIRECTORY_SEARCH_SUCCESS,
    directory: directory,
    search: search,
    response: response
  };
}

export function searchDirectoryFailure (error) {
  return { type: DIRECTORY_SEARCH_FAILURE, error: error };
}
