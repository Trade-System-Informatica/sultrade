import React from 'react';
import ReactDOM from 'react-dom';
import {storeConfig, persistor} from './store/storeConfig'
import {PersistGate} from 'redux-persist/integration/react'
import App from './App'
import * as serviceWorker from './serviceWorkerRegistration'

import './index.css'
import './css/magnific-popup.css'
import './css/nice-select.css'
import { Provider } from 'react-redux'
import $ from 'jquery';

const store = storeConfig

const Redux = () => (
  <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <App />
      </PersistGate>
  </Provider>
)

$('body').on('keydown', 'input, select', function (e) {
  if (e.key === "Enter") {
    var self = $(this), form = self.parents('form:eq(0)'), focusable, next;
    focusable = form.find('input,a,select,button').filter(':visible:not([readonly]):enabled');
    next = focusable.eq(focusable.index(this) + 1);
    if (next.length) {
      next.focus();
    } else {
    }
    return false;
  }
});


ReactDOM.render(
  <React.StrictMode>
    <Redux />
  </React.StrictMode>,
  document.getElementById('root')
);

//<PersistGate loading={null} persistor={persistor}>


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
