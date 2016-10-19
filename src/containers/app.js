import React, {Component} from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from '../reducers/index';
import ZooniverseApp from './zooniverseApp';

const store = createStore(reducer)

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ZooniverseApp />
      </Provider>
    );
  }
}
