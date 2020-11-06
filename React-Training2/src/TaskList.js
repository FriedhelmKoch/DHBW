import React, { Component } from 'react';
import Card from "./Card";
import './App.css';

class TaskList extends Component {

	render() {
		return(
		
			/* der state wird als props aufgenommen */
			<Card title="Tasks">
				<ul className="App-todo">
						
					{this.props.todos.map(function(todo) {
						return (
							<li key={todo.id}>#{todo.id.substring(0, 4)}...: {todo.title}</li>  // key dient React, um die Liste bei React intern zu verwalten, dabei muss die Key-id eindeutig sein!
						)
					})}
				</ul>
			</Card>
		)
	}
}

export default TaskList;
