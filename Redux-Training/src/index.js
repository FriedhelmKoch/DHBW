import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import TaskList from './components/TaskList';
import { createStore } from 'redux'
import { Provider } from 'react-redux';
import counter from './reducers/index';
import './index.css';

let store = createStore(counter);
console.log(store.getState());

ReactDOM.render(
  <Provider store={store}>
    <div>
      <h1 className="App">React Redux Training</h1>
      <App />
      <TaskList />
    </div>
  </Provider>,
  document.getElementById('root')
);