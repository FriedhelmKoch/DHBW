import React, { Component } from 'react';
import Card from "./Card";

class TaskAdd extends Component {

	constructor(props) {
		super(props);

		this.onTaskAdd = this.onTaskAdd.bind(this);
		this.onTaskInputChange = this.onTaskInputChange.bind(this);

		this.state = {
			newTask: "Lucky Luke Heft am Bahnhof mitbringen"
		}
	}

	onTaskAdd() {
		this.props.onAdd(this.state.newTask);
	}
	onTaskInputChange(event) {
		this.setState({
			newTask: event.target.value
		})
	}

	render() {
		return (
			<Card title="Task hinzufügen">
				<input 
					type="text" 
					onChange={this.onTaskInputChange}
					value={this.state.newTask}
				/>
				{(this.state.newTask !== "" ? (
					<button 
						onClick={this.onTaskAdd}>
						Task hinzufügen - Anzahl Zeichen: ({this.state.newTask.length})
					</button>
				) : null)}
			</Card>
		)
	}
}

TaskAdd.propTypes = {
  onAdd: React.PropTypes.func.isRequired
}

export default TaskAdd;