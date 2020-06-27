import React, { Component } from 'react';
import { incrementCounter } from '../actions/index';
import { connect } from 'react-redux';
import Card from "./Card";
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Card title="Counter">
          <h1>Ergebnis: {this.props.value}</h1>
          <button onClick={this.props.onIncrement}>Addiere</button>
        </Card>
      </div>
    );
  }
}

let mapStateToProps = function(state) {
  return {
    value: state.counter
  }
}
let mapDispatchToProps = {
  onIncrement: incrementCounter
}
let AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;
