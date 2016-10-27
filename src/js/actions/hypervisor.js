// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { getCertificate, postConnection } from './Api';

export const HYPERVISOR_CHANGE = 'HYPERVISOR_CHANGE';
export const HYPERVISOR_LOAD_CERTIFICATE = 'HYPERVISOR_LOAD_CERTIFICATE';
export const HYPERVISOR_LOAD_CERTIFICATE_SUCCESS = (
  'HYPERVISOR_LOAD_CERTIFICATE_SUCCESS'
);
export const HYPERVISOR_LOAD_CERTIFICATE_FAILURE = (
  'HYPERVISOR_LOAD_CERTIFICATE_FAILURE'
);
export const HYPERVISOR_VERIFY = 'HYPERVISOR_VERIFY';
export const HYPERVISOR_VERIFY_SUCCESS = 'HYPERVISOR_VERIFY_SUCCESS';
export const HYPERVISOR_VERIFY_FAILURE = 'HYPERVISOR_VERIFY_FAILURE';

export function changeHypervisor (hypervisor) {
  return { type: HYPERVISOR_CHANGE, hypervisor: hypervisor };
}

export function loadHypervisorCertificate (hypervisor) {
  return function (dispatch) {
    dispatch({ type: HYPERVISOR_LOAD_CERTIFICATE, hypervisor: hypervisor });
    getCertificate({address: hypervisor.address})
    .then(response => {
      dispatch(loadHypervisorCertificateSuccess(hypervisor, res.body));
    })
    .catch(error => dispatch(loadHypervisorCertificateFailure(error)));
  };
}

export function loadHypervisorCertificateSuccess (hypervisor, response) {
  return {
    type: HYPERVISOR_LOAD_CERTIFICATE_SUCCESS,
    hypervisor: hypervisor,
    response: response
  };
}

export function loadHypervisorCertificateFailure (error) {
  return { type: HYPERVISOR_LOAD_CERTIFICATE_FAILURE, error: error };
}

export function verifyHypervisor (hypervisor) {
  return function (dispatch) {
    dispatch({ type: HYPERVISOR_VERIFY, hypervisor: hypervisor });
    postConnection(hypervisor.address, hypervisor.userName, hypervisor.password)
    .then(response => dispatch(verifyHypervisorSuccess(hypervisor, response)))
    .catch(error => dispatch(verifyHypervisorFailure(error)));
  };
}

export function verifyHypervisorSuccess (hypervisor, response) {
  return {
    type: HYPERVISOR_VERIFY_SUCCESS,
    hypervisor: hypervisor,
    response: response
  };
}

export function verifyHypervisorFailure (error) {
  return { type: HYPERVISOR_VERIFY_FAILURE, error: error };
}
