// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import update from 'react/lib/update';
import { DASHBOARD_LAYOUT, INDEX_AGGREGATE_SUCCESS, DASHBOARD_SEARCH, DASHBOARD_SEARCH_SUCCESS, DASHBOARD_UNLOAD } from '../actions';
import Query from 'grommet-index/utils/Query';

const initialState = {
  graphicSize: 'medium',
  legendPlacement: 'bottom',
  searchSuggestions: [],
  searchText: '',
  tiles: [
    {
      name: 'Server Profile Changes',
      history: true,
      type: 'area',
      wide: true,
      category: 'server-profiles',
      attribute: 'state',
      interval: 'days',
      count: 8
    },
    {
      name: 'Active Alerts',
      path: '/activity',
      type: 'circle',
      category: 'alerts',
      query: new Query('state:Active'),
      attribute: 'status'
    },
    {
      name: 'Server Profiles',
      type: 'circle',
      category: 'server-profiles',
      attribute: 'status'
    },
    {
      name: 'Server Hardware',
      type: 'distribution',
      category: 'server-hardware',
      attribute: 'model'
    }
  ]
};

const handlers = {
  [DASHBOARD_LAYOUT]: (state, action) => {
    // set all history tiles counts
    let tiles = state.tiles.map((tile) => {
      if (tile.wide) {
        tile = update(tile, {
          count: { $set: action.count }
        });
      }
      return tile;
    });
    return {
      tiles: tiles,
      legendPlacement: action.legendPlacement,
      graphicSize: action.graphicSize
    };
  },

  [INDEX_AGGREGATE_SUCCESS]: (state, action) => {
    let tiles = state.tiles.map((tile) => {
      if (tile.name === action.id) {
        tile = update(tile, {
          watcher: { $set: action.watcher },
          result: { $set: action.result }
        });
      }
      return tile;
    });
    return { tiles: tiles };
  },

  [DASHBOARD_SEARCH]: (state, action) => {
    let changes = { searchText: action.text };
    if (action.text.length === 0) {
      changes.searchSuggestions = [];
    }
    return changes;
  },

  [DASHBOARD_SEARCH_SUCCESS]: (state, action) => {
    // add label property
    let suggestions = action.result.map((s) => ({ ...s, ...{label: s.name} }));
    return { searchSuggestions: suggestions };
  },

  [DASHBOARD_UNLOAD]: (state, action) => ({ searchSuggestions: [] })
};

export default function dashboardReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
