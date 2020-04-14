/*
class Auto {

  constructor() {
    this.drive = this.drive.bind(this);
  }

  drive(){
    console.log(this);
    console.log(this.name);
  }
}

let bmw = new Auto();
bmw.name = "xyz4";

window.setTimeout(bmw.drive, 1000);
*/

/* Erklärung für map
let numbers =[2, 3, 5];
let numberNew = numbers.map(function(item) {
  return item * item;
})
consol.log(numbersNew); // 0: 4, 1: 9, 2: 25
*/

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

