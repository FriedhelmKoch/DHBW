import React, { Component } from 'react';
import { addTask } from '../actions/index';
import { connect } from 'react-redux';
import TaskAdd from "./TaskAdd";
import Card from "./Card";

class TaskList extends Component {
	render() {
		return (
			<div>
				<Card title="Task-List">
					<ul>
						{this.props.tasks.map((task) => {
							return (
								<li key={task.id}>#{task.id.substring(0, 4)}...: {task.title}</li>  // key dient React, um die Liste bei React intern zu verwalten, dabei muss die Key-id eindeutig sein!
							)
						})}
					</ul>
				</Card>
				<br />
				<TaskAdd onAdd={(title) => {this.props.addTask(title)}} />
			</div>
		)
	}
}

let mapStateToProps = (state) => {
  return {
    tasks: state.tasks
  }
}
let mapDispatchToProps = {
  addTask: addTask
}
let TodoListContainer = 
  connect(mapStateToProps, mapDispatchToProps)(TaskList);

export default TodoListContainer;
