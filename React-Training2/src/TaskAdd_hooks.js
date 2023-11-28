//
// Implemented with Hooks
//
import React, { useState } from 'react';
import Card from "./Card";

const TaskAdd = ({ onAdd }) => {
  const [newTodo, setNewTodo] = useState("2020-04-22T09.30.00Z Uhr: Teil 3 - Web-Enineering II");

  const onTodoAdd = () => {
    onAdd(newTodo);
  };

  const onTodoInputChange = (event) => {
    console.log(event.target.value);
    setNewTodo(event.target.value);
  };

  let buttonStyles = {
    backgroundColor: newTodo.length < 5 ? "yellow" : "green",
  };

  return (
    <Card title="Task hinzufügen">
      <input
        type="text"
        onChange={onTodoInputChange}
        value={newTodo}
      />
      {newTodo !== "" && (
        <button
          onClick={onTodoAdd}
          style={buttonStyles}>
          Task hinzufügen ({newTodo.length})
        </button>
      )}
    </Card>
  );
};

export default TaskAdd;
