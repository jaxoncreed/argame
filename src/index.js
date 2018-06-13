import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import thunkMiddleware from 'redux-thunk';

import { Route, BrowserRouter as Router } from 'react-router-dom';

import rootReducer from './modules';
import Home from './containers/HomeContainer';

const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware)
);

const routes = (
  <Home />
);

ReactDOM.render(
  <Provider store={store}>
    {routes}
  </Provider>,
  document.getElementById('root')
);
