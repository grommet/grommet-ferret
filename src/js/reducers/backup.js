// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { BACKUP_LOAD, BACKUP_LOAD_SUCCESS,
  BACKUP_CHECK, BACKUP_CHECK_SUCCESS, BACKUP_CHECK_FAILURE
} from '../actions/actions';

const initialState = {};

const handlers = {

  [BACKUP_LOAD]: (state, action) => (initialState),

  [BACKUP_LOAD_SUCCESS]: (state, action) => (action.backup),

  [BACKUP_CHECK]: (state, action) => ({ ...state, valid: undefined }),

  [BACKUP_CHECK_SUCCESS]: (state, action) => ({ ...state, valid: true }),

  [BACKUP_CHECK_FAILURE]: (state, action) => ({ ...state, valid: false })

};

export default function backupReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...handler(state, action) };
}
