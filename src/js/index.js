// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP
import 'whatwg-fetch';
import { polyfill as promisePolyfill } from 'es6-promise';
promisePolyfill();

import '../scss/index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import { getCurrentLocale, getLocaleData } from 'grommet/utils/Locale';
import { Router, browserHistory as history } from 'react-router';
import { routes } from './Routes';
import { configure as apiConfigure } from './actions/Api';
import { sessionInitialize } from './actions/session';
import store from './store';
import { routeChanged } from './actions/route';

let wsProtocol = 'ws';
if (window.location.protocol === 'https:') {
  wsProtocol = 'wss';
}

// The port number needs to align with devServerProxy and websocketHost in
// grommet-toolbox.config.js
let hostName = NODE_ENV === 'development' ?
  'localhost:8101' : window.location.host;
apiConfigure({
  webSocketUrl: `${wsProtocol}://${hostName}/ws`
});

let locale = getCurrentLocale();
addLocaleData(en);

let messages;
try {
  // rtl driven by hardcoding languages for now
  if ('he' === locale || 'ar' === locale.slice(0, 2)) {
    document.documentElement.classList.add("rtl");
  } else {
    document.documentElement.classList.remove("rtl");
  }
  messages = require('../messages/' + locale);
} catch (e) {
  messages = require('../messages/en-US');
}
var localeData = getLocaleData(messages, locale);

store.dispatch(sessionInitialize(window.location.pathname));

let element = document.getElementById('content');

ReactDOM.render((
  <Provider store={store}>
    <IntlProvider locale={localeData.locale} messages={localeData.messages}>
      <Router routes={routes} history={history} />
    </IntlProvider>
  </Provider>
), element);

document.body.classList.remove('loading');

// listen for history changes and initiate routeChanged actions for them
history.listen(function (location) {
  const publish = store.getState().session.publishRoute;
  store.dispatch(routeChanged(location, publish));
});
