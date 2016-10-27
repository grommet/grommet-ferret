// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { browserHistory as history } from 'react-router';
import Query from 'grommet-addons/utils/Query';

function _buildLocationSearch (query, filter, sort) {
  let result = '';
  if (query && query.toString().length > 0) {
    result += (result.length === 0 ? '?' : '&');
    result += `q=${encodeURIComponent(query.toString())}`;
  }
  if (filter) {
    for (let name in filter) {
      filter[name].forEach(value => {
        result += (result.length === 0 ? '?' : '&');
        result += `f=${encodeURIComponent(`${name}:${value}`)}`;
      });
    }
  }
  if (sort && sort.length > 0) {
    result += (result.length === 0 ? '?' : '&');
    result += `s=${encodeURIComponent(sort)}`;
  }
  return result;
}

function _parseLocationSearch (search) {
  let result = {};
  if (search.q) {
    result.query = new Query(decodeURIComponent(search.q));
  }
  if (search.f) {
    result.filter = {};
    if (typeof search.f === 'string') {
      const parts = decodeURIComponent(search.f).split(':');
      result.filter[parts[0]] = [parts[1]];
    } else if (Array.isArray(search.f)) {
      search.f.forEach(term => {
        const parts = decodeURIComponent(term).split(':');
        if (! result.filter[parts[0]]) {
          result.filter[parts[0]] = [];
        }
        result.filter[parts[0]].push(parts[1]);
      });
    }
  }
  if (search.s) {
    result.sort = decodeURIComponent(search.s);
  }
  return result;
}

export function mergeLocationConfiguration (config) {
  const loc = history.createLocation(document.location.pathname +
    document.location.search);
  return { ...config, ..._parseLocationSearch(loc.query) };
}

export function pushSelection (index, selection) {
  history.push({
    pathname: index.config.path + selection,
    search: document.location.search
  });
}

// TODO: explore using output of buildParams() in index instead
export function pushQuery (index, query) {
  history.push({
    pathname: document.location.pathname,
    search: _buildLocationSearch(query, index.filter, index.sort)
  });
}

export function pushFilter (index, filter) {
  history.push({
    pathname: document.location.pathname,
    search: _buildLocationSearch(index.query, filter, index.sort)
  });
}

export function pushSort (index, sort) {
  history.push({
    pathname: document.location.pathname,
    search: _buildLocationSearch(index.query, index.filter, sort)
  });
}
