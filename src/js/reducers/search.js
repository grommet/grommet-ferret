// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { SEARCH_SUGGESTIONS, SEARCH_SUGGESTIONS_SUCCESS,
  SEARCH_SUGGESTIONS_CLEAR } from '../actions/actions';

const initialState = {
  suggestions: [],
  text: ''
};

const handlers = {

  [SEARCH_SUGGESTIONS]: (state, action) => {
    let changes = { text: action.text };
    if (action.text.length === 0) {
      changes.suggestions = [];
    }
    return changes;
  },

  [SEARCH_SUGGESTIONS_SUCCESS]: (state, action) => {
    // add label property
    let suggestions = action.suggestions.map(
      (s) => ({ ...s, ...{label: s.name} })
    );
    return { suggestions: suggestions };
  },

  [SEARCH_SUGGESTIONS_CLEAR]: (state, action) => ({ ...initialState })

};

export default function searchReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
