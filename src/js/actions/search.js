// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { getSearchSuggestions } from './Api';

export const SEARCH_SUGGESTIONS = 'SEARCH_SUGGESTIONS';
export const SEARCH_SUGGESTIONS_SUCCESS = 'SEARCH_SUGGESTIONS_SUCCESS';
export const SEARCH_SUGGESTIONS_FAILURE = 'SEARCH_SUGGESTIONS_FAILURE';
export const SEARCH_SUGGESTIONS_CLEAR = 'SEARCH_SUGGESTIONS_CLEAR';

export function searchSuggestions (text) {
  return function (dispatch) {
    dispatch({ type: SEARCH_SUGGESTIONS, text: text });
    getSearchSuggestions(text)
    .then(suggestions => dispatch(searchSuggestionsSuccess(text, suggestions)))
    .catch(error => dispatch(searchSuggestionsSuccess(error)));
  };
}

export function searchSuggestionsSuccess (text, suggestions) {
  return { type: SEARCH_SUGGESTIONS_SUCCESS,
    text: text, suggestions: suggestions };
}

export function searchSuggestionsFailure (error) {
  return { type: SEARCH_SUGGESTIONS_FAILURE, error: error };
}

export function clearSearchSuggestions () {
  return { type: SEARCH_SUGGESTIONS_CLEAR };
}
