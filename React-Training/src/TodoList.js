import React, { Component } from 'react';
import Panel from "./Panel";
import './App.css';

class TodoList extends Component {

    render() {
        return(
        
            /* der state wird als props aufgenommen */
            <Panel title="Todos">
                <ul className="App-todo">
                    
                    {this.props.todos.map(function(todo) {
                        return (
                            <li key={todo.id}>#{todo.id}: {todo.title}</li>  // key dient React, um die Liste bei React intern zu verwalten, dabei muss die Key-id eindeutig sein!
                        )
                    })}
                </ul>
            </Panel>
        )
    }
}

export default TodoList;
