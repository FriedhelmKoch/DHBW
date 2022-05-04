import React, { Component } from 'react';
// Externe Components
import { v4 as uuidv4 } from 'uuid';  // https://www.npmjs.com/package/uuid
// Eigene Components
import Button from "./Button";
import Card from "./Card";
import TaskList from "./TaskList";
import TaskAdd from "./TaskAdd";
import Map from "./Maps";
// Styles
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {   
      name: "Mars",
      counter: 0,
      todos: [
        {id: uuidv4(), title: "2020-04-08T08.30.00Z Uhr: Teil 1 - Web-Engineering II"},
        {id: uuidv4(), title: "2020-04-22T11.45.00Z Uhr: Nachbereitung Kurs"},
        {id: uuidv4(), title: "2020-04-24T09.00.00Z Uhr: Teil 2 - Web-Enineering II"}
      ],
      startGeoData: [52.520007,13.404954],  // [lat,lng]
      resultGeoData: []
    }

    this.changeName = this.changeName.bind(this);
    this.incrementCounter = this.incrementCounter.bind(this);

  }  

  changeName() {
    alert("changeName");

    this.setState({
      name: "Venus"
    })
  }

  incrementCounter() {
    this.setState({
      counter: this.state.counter + 1
    })
    /* oder ausführlich
    let c = this.state.counter;
    c = c + 1;
    this.setState({
      counter: c + 1
    })
    */
  }

  _addTodo(title) {
    let todos = this.state.todos;
    
    /* Wenn nicht "uuid" genutzt wird, dann eigene aufsteigende ID berechnen
    let maxId = 0;
    for(let todo of todos) {
      if (todo.id > maxId) {
        maxId = todo.id;
      }
    }
    todos.push({id: (maxId + 1), title: "4. Todo"});   // Todo unten anhängen */

    todos.unshift({id: uuidv4(), title: title});  // Todo landet oberhalb des Arrays
    this.setState({
      todos: todos
    })
  }

  /* Alternative zu addTodo, jedoch mit Spread-Operator */
  addTodo(title) {
    this.setState({
      todos: [{id: uuidv4(), title: title}, ...this.state.todos]
    })
  }

  geoDataCallback(geoData) {
    console.log(`DEBUG - Datas from child: ${JSON.stringify(geoData)}`);
    //
    //this.setState({...this.state, resultGeoData: childData})
  };

  render() {

    /* let output = (   // für Debugging */

    console.log(`DEBUG - Return Pos: ${JSON.stringify(this.state.resultGeoData)}`);

    return(

      <div className="App">

        <div className="App-header">
          <h2>Hallo {this.state.name}</h2>
          <p>{this.state.name.length}</p>
        </div>

        <br />
        <Card title="Das ist eine Card mit Button">
          <p>Hier ein Absatz mittels &lt;p&gt;&lt;/p&gt;!</p>
          <Button label="Das ist die DHBW!" />
        </Card>

        <br />
        <Card title="Header-Venus">
          <button onClick={this.changeName}>Kopftext ändern in Venus</button>
        </Card>

        <br />
        <Card title="Counter">
          <h1>Counter: {this.state.counter}</h1>
          <button onClick={this.incrementCounter}>Hochzählen!</button>
        </Card>

        <h1>Task Liste</h1>
        {/*hier muss der state als props der anderen Komponente übergeben werden!*/}
        <TaskList todos={this.state.todos} />  
        
        <br />
        <TaskAdd onAdd={this.addTodo.bind(this)} /> {/* Funktion übergeben */}

        <br />
        <Card title="Straßenkarte">
          <Map 
            startGeoData={this.state.startGeoData}
            resultGeoData = {this.geoDataCallback} 
          />
        </Card>

        <p>&nbsp;</p>

      </div>

    );

    /* console.log(output);
    return output;   // dienst dem Debugging und Kontrolle in der Konsole */

  }
}

export default App;
