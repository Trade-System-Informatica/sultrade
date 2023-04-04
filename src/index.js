import React from 'react';
import ReactDOM from 'react-dom';
import {storeConfig, persistor} from './store/storeConfig'
import {PersistGate} from 'redux-persist/integration/react'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

import './index.css'
import './css/magnific-popup.css'
import './css/nice-select.css'
import {Provider} from 'react-redux'

const store = storeConfig

const Redux = () => (
  <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <App />
      </PersistGate>
  </Provider>
)


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
serviceWorkerRegistration.register();
