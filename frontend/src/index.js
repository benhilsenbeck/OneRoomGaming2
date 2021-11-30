import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {createStore} from 'redux';
import allreducers from './reducers'
import {Provider} from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
require('dotenv').config();


const store = createStore(allreducers, composeWithDevTools());



ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

