// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TBD from 'grommet/components/TBD';

import Items from './components/Items';
import Item from './components/Item';
import Details from './components/Details';
import ServerProfile from './components/server-profiles/ServerProfile';
import ServerProfileAdd from './components/server-profiles/ServerProfileAdd';
import ServerProfileEdit from './components/server-profiles/ServerProfileEdit';
import Enclosure from './components/enclosures/Enclosure';

var rootPath = "/"; //"/ferret/";
//if (NODE_ENV === 'development') {
//  rootPath = "/"; // webpack-dev-server
//}

const CATEGORIES = [
  'server-hardware'
];

const categoryRoutes = CATEGORIES.map((category) => {
  let result = {
    path: category, component: Items,
    childRoutes: [
      { path: 'details/*', component: Details },
      { path: '*', component: Item }
    ]
  };
  return result;
});

module.exports = {

  prefix: rootPath.slice(0, -1),

  path: (path) => (rootPath + path.slice(1)),

  routes: [
    { path: rootPath, component: Ferret,
      // TODO: crashes react-router, wait for fix
      //indexRoute: {
      //  onEnter: function (nextState, replaceState) {
      //    replaceState(null, '/dashboard')
      //  }},
      childRoutes: [
        { path: 'login', component: Login },
        { path: 'dashboard', component: Dashboard },
        { path: 'reports', component: TBD },
        { path: 'settings', component: TBD },
        { path: 'activity', component: Items,
          childRoutes: [
            { path: '*', component: Item }
          ]
        },
        { path: 'server-profiles', component: Items,
          childRoutes: [
            { path: 'add', component: ServerProfileAdd },
            { path: 'edit/*', component: ServerProfileEdit },
            { path: 'details/*', component: Details },
            { path: '*', component: ServerProfile }
          ]
        },
        { path: 'enclosures', component: Items,
          childRoutes: [
            { path: 'details/*', component: Details },
            { path: '*', component: Enclosure }
          ]
        },
        ...categoryRoutes
      ]
    }
  ]
};
