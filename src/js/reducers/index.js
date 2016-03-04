// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import update from 'react/lib/update';
import { INDEX_LOAD, INDEX_QUERY, INDEX_SUCCESS, INDEX_UNLOAD,
  INDEX_SELECT, ROUTE_CHANGED } from '../actions';

const statusFilter = {
  all: true,
  values: [
    { label: 'Critical', value: 'Critical' },
    { label: 'Warning', value: 'Warning' },
    { label: 'OK', value: 'OK' },
    { label: 'Disabled', value: 'Disabled' }
  ]
};

const statusAttribute = {name: 'status', label: 'Status', size: 'small',
  header: true, status: true, filter: statusFilter};

const activityCategoryMap = {alerts: 'Alert', tasks: 'Task'};

const initialState = {
  activeCategory: null,
  responsive: 'multiple',
  categories: {
    'enclosures': {
      label: "Enclosures",
      view: 'tiles',
      sort: 'name:asc',
      attributes: [
        statusAttribute,
        {name: 'name', label: 'Name', header: true}
      ]
    },
    'server-hardware': {
      label: "Server Hardware",
      view: 'list',
      sort: 'name:asc',
      attributes: [
        statusAttribute,
        {name: 'name', label: 'Name', header: true},
        {name: 'model', label: 'Model', secondary: true,
          filter: {
            all: true,
            values: [
              { label: 'bl460c gen1', value: 'bl460c gen1' },
              { label: 'bl460c gen2', value: 'bl460c gen2' },
              { label: 'bl460c gen3', value: 'bl460c gen3' }
            ]
          }
        }
      ]
    },
    'server-profiles': {
      label: "Server Profiles",
      view: 'table',
      sort: 'name:asc',
      attributes: [
        statusAttribute,
        {name: 'name', label: 'Name', header: true}
      ],
      addRoute: '/server-profiles/add'
    },
    'activity': {
      category: ['alerts', 'tasks'],
      label: "Activity",
      view: 'table',
      sort: 'created:desc',
      attributes: [
        {name: 'associatedResourceName', label: 'Resource', size: 'medium'},
        statusAttribute,
        {name: 'name', label: 'Name', header: true},
        {name: 'created', label: 'Time',
          timestamp: true, size: 'medium', secondary: true},
        {name: 'state', label: 'State', size: 'medium', secondary: true,
          filter: {
            all: true,
            values: [
              { label: 'Active', value: 'Active' },
              { label: 'Cleared', value: 'Cleared' },
              { label: 'Running', value: 'Running' },
              { label: 'Completed', value: 'Completed' }
            ]
          }},
        {name: 'category', label: 'Category', secondary: true,
          filter: {
            all: true,
            values: [
              { label: 'Alerts', value: 'alerts' },
              { label: 'Tasks', value: 'tasks' }
            ]
          },
          render: function (item) {
            return activityCategoryMap[item.category] || '';
          }}
      ]
    }
  }
};

const handlers = {

  [INDEX_LOAD]: (state, action) => {
    let changes = { activeCategory: { $set: action.category }, categories: {} };
    if (state.activeCategory &&
      (! action.query || state.activeCategory !== action.category)) {
      changes.categories[state.activeCategory] = {query: { $set: null }};
    }
    if (action.query || action.filters) {
      changes.categories[action.category] = {
        query: { $set: action.query },
        filters: { $set: action.filters }
      };
    }
    return update(state, changes);
  },

  [INDEX_UNLOAD]: (state, action) => {
    return update(state, {
      activeCategory: { $set: null },
      categories: {
        [state.activeCategory]: {
          watcher: { $set: null },
          result: { $set: null },
          query: { $set: null },
          filters: { $set: null }
        }
      }
    });
  },

  [INDEX_QUERY]: (state, action) => {
    return update(state, {
      categories: {
        [action.category]: {
          query: { $set: action.query },
          filters: { $set: action.filters }
        }
      }
    });
  },

  [INDEX_SUCCESS]: (state, action) => {
    return update(state, {
      categories: {
        [action.category]: {
          watcher: { $set: action.watcher },
          result: { $set: action.result }
        }
      }
    });
  },

  [INDEX_SELECT]: (_, action)  => ({selection: action.selection}),

  [ROUTE_CHANGED]: (state, action) => {
    let result = {};
    const pathParts = action.route.pathname.split('/');
    const category = pathParts[1];
    if (state.categories.hasOwnProperty(category)) {
      result.activeCategory = category;
      // TODO: uris should be opaque, we need a cleaner way to extract the
      // selection uri
      const restParts = action.route.pathname.split('/rest');
      if (restParts.length < 2) {
        result.selection = null;
      } else {
        result.selection = '/rest' + restParts[1];
      }
    } else {
      result.activeCategory = null;
      result.selection = null;
    }
    return result;
  }
};

export default function indexReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
