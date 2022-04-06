import React from 'react';
import * as ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux'
import App from './App'
import { store, history } from './helpers';

ReactDOM.render(
  <Router history={ history }>
    <Provider store={store}>
      <App/>
    </Provider>
  </Router>, 
  document.getElementById('root')
);
