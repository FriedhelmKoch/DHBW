import React, { Component } from 'react';
import Button from "./Button";
import Panel from "./Panel";
import TodoList from "./TodoList";
import TodoAdd from "./TodoAdd";
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {   
      name: "Welt",
      counter: 0,
      todos: [
        {id: 1, title: "Obst kaufen"},
        {id: 2, title: "Programmieren lernen"},
        {id: 3, title: "3. TODO"}
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
    todos.unshift({id: (maxId + 1), title: title});  // Todo landet oberhalb
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
        <Panel title="Überschrift">
          <p>Ich bin ein Absatz!</p>
          <Button label="Klick mich!" />
        </Panel>

        <br />
        <Panel title="Noch eine Überschrift">
          <button onClick={this.changeName}>Verändere die Überschrift in Venus</button>
        </Panel>

        <br />
        <Panel title="Counter">
          <h1>Der aktuelle Zählerstand ist: {this.state.counter}</h1>
          <button onClick={this.incrementCounter}>Zähle hoch!</button>
        </Panel>

        <h1>ToDo-Liste</h1>
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
