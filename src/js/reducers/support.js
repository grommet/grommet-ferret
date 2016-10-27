// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { SUPPORT_LOAD, SUPPORT_LOAD_SUCCESS,
  SUPPORT_DUMP_CREATE, SUPPORT_DUMP_CREATE_SUCCESS, SUPPORT_DUMP_CREATE_FAILURE,
  SUPPORT_DUMP_CHECK, SUPPORT_DUMP_CHECK_SUCCESS, SUPPORT_DUMP_CHECK_FAILURE
} from '../actions/actions';

const initialState = {};

const handlers = {

  [SUPPORT_LOAD]: (state, action) => (initialState),

  [SUPPORT_LOAD_SUCCESS]: (state, action) => (action.support),

  [SUPPORT_DUMP_CREATE]: (state, action) => ({ creating: true }),

  [SUPPORT_DUMP_CREATE_SUCCESS]: (state, action) => ({ file: action.file }),

  [SUPPORT_DUMP_CREATE_FAILURE]: (state, action) => ({ error: action.error }),

  [SUPPORT_DUMP_CHECK]: (state, action) => ({ ...state, valid: undefined }),

  [SUPPORT_DUMP_CHECK_SUCCESS]: (state, action) => ({ ...state, valid: true }),

  [SUPPORT_DUMP_CHECK_FAILURE]: (state, action) => ({ ...state, valid: false })

};

export default function supportReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...handler(state, action) };
}
