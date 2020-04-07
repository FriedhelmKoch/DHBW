import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';  // https://www.npmjs.com/package/uuid
import Button from "./Button";
import Card from "./Card";
import TodoList from "./TodoList";
import TodoAdd from "./TodoAdd";
import './App.css';
import Language from './polymorph';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {   
      name: "Erde",
      counter: 0,
      todos: [
        {id: uuidv4(), title: "08.04. - 10:30 Uhr: Teil 1 - Web-Engineering II"},
        {id: uuidv4(), title: "09.04. - 09:00 Uhr: Nachbereitung Kurs"},
        {id: uuidv4(), title: "15.04. - 10:30 Uhr: Teil 2 - Web-Enineering II"}
      ]
    }
    this.changeName = this.changeName.bind(this);
    this.incrementCounter = this.incrementCounter.bind(this);
    this.addTodo = this.addTodo.bind(this);
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

    /* oder ausgührlich
    let c = this.state.counter;
    c = c + 1;
    this.setState({
      counter: c + 1
    })
    */
  }

  addTodo(title) {
    let todos = this.state.todos;
    let maxId = 0;
    for(let todo of todos) {
      if (todo.id > maxId) {
        maxId = todo.id;
      }
    }

    /*todos.push({id: (maxId + 1), title: "4. Todo"});   // Todo unten anhängen */
    todos.unshift({id: uuidv4(), title: title});  // Todo landet oberhalb
    this.setState({
      todos: todos
    })
  }
  
  render() {

    /*let output = (   // für Debugging */
    return(

      <div className="App">

        <div className="App-header">
          <h2>Hallo {this.state.name}</h2>
          <p>{this.state.name.length}</p>
        </div>

        <br />
        <Card title="Das ist eine Card mit Button">
          <p>Hier ein Absatz mittels &lt;p&gt;&lt;/p&gt;!</p>
          <Button label="Klick mich!" />
        </Card>

        <br />
        <Card title="Header-Titel">
          <button onClick={this.changeName}>Kopftext ändern in Venus</button>
        </Card>

        <br />
        <Card title="Counter">
          <h1>Klick-Zähler: {this.state.counter}</h1>
          <button onClick={this.incrementCounter}>Hochzählen!</button>
        </Card>

        <h1>To-Do Liste</h1>
        {/*hier muss der state als props der anderen Komponente übergeben werden!*/}
        <TodoList todos={this.state.todos} />  
        <br />
        <TodoAdd onAdd={this.addTodo} /> {/* Funktion übergeben */}
      
        <p></p>

      </div>
    );

    /*console.log(output);
    return output;   // dienst dem Debugging und Kontrolle in der Konsole */

  }
}

export default App;
