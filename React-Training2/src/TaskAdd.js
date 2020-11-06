import React, { Component } from 'react';
import Card from "./Card";

class TaskAdd extends Component {

	constructor(props) {
		super(props);

		this.onTodoAdd = this.onTodoAdd.bind(this);
		this.onTodoInputChange = this.onTodoInputChange.bind(this);

		this.state = {
			newTodo: "2020-04-22T09.30.00Z Uhr: Teil 3 - Web-Enineering II"
		}
	}

	onTodoAdd() {
		// this.props.onAdd("Ich bin das neue Todo");
		this.props.onAdd(this.state.newTodo);
	}

	/**  
	Funktion muss den state aktualisieren! 
	Änderungen im Input-Feld werden aus "event.target.value" abgeholt 
	**/
	onTodoInputChange(event) {
		console.log(event.target.value);
		this.setState({
			newTodo: event.target.value
		})
	}

	render() {
		console.log(this);  // Debugging nach TodoAdd
		let buttonStyles = {
			backgroundColor: (this.state.newTodo.length < 5 ? "yellow" : "green")
		}
		return (
			<Card title="Task hinzufügen">
				{/* type - Eingabefeld definieren 
					onChange - bei veränderung wird die Funktinon ausgeführt
					value - und im Wert steht immer newTodo des States - den React immer automatisch aktualisiert! 
				*/} 
				<input 
					type="text" 
					onChange={this.onTodoInputChange}
					value={this.state.newTodo}
				/>
				{/* Button wird erst angezeigt, wenn im Input-Feld etwas steht */}
				{(this.state.newTodo !== "" ? (
					<button 
						onClick={this.onTodoAdd}
						style={buttonStyles}>
						Task hinzufügen ({this.state.newTodo.length})
					</button>
				) : null)}
			</Card>
		)
	}

}

export default TaskAdd;
