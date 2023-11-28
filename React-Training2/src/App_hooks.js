//
// Implemented with Hooks
//
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from "./Button";
import Card from "./Card";
import TaskList from "./TaskList";
import TaskAdd from "./TaskAdd";
import Map from "./Maps";
import './App.css';

const App = () => {
  const [name, setName] = useState("Mars");
  const [counter, setCounter] = useState(0);
  const [todos, setTodos] = useState([
    { id: uuidv4(), title: "2020-04-08T08.30.00Z Uhr: Teil 1 - Web-Engineering II" },
    { id: uuidv4(), title: "2020-04-22T11.45.00Z Uhr: Nachbereitung Kurs" },
  ]);
  const [startGeoData] = useState([52.520007, 13.404954]);
  const [resultGeoData, setResultGeoData] = useState([]);

  const changeName = () => {
    setName("Venus");
  };

  const incrementCounter = () => {
    setCounter(prevCounter => prevCounter + 1);
  };

  const addTodo = (title) => {
    setTodos(prevTodos => [{ id: uuidv4(), title }, ...prevTodos]);
  };

  const geoDataCallback = (geoData) => {
    console.log(`DEBUG - Datas from child: ${JSON.stringify(geoData)}`);
    // this.setState({...this.state, resultGeoData: childData})
  };

  useEffect(() => {
    const newToDo = { id: uuidv4(), title: "2020-04-24T09.00.00Z Uhr: Teil 2 - Web-Enineering II" };
    setTodos(prevTodos => [...prevTodos, newToDo]);
  }, []);

  console.log(`DEBUG - Return Pos: ${JSON.stringify(resultGeoData)}`);

  return (
    <div className="App">
      <div className="App-header">
        <h2>Hallo {name}</h2>
        <p>{name.length}</p>
      </div>

      <br />
      <Card title="Das ist eine Card mit Button">
        <p>Hier ein Absatz mittels &lt;p&gt;&lt;/p&gt;!</p>
        <Button label="Das ist die DHBW!" />
      </Card>

      <br />
      <Card title="Header-Venus">
        <button onClick={changeName}>Kopftext ändern in Venus</button>
      </Card>

      <br />
      <Card title="Counter">
        <h1>Counter: {counter}</h1>
        <button onClick={incrementCounter}>Hochzählen!</button>
      </Card>

      <h1>Task Liste</h1>
      <TaskList todos={todos} />

      <br />
      <TaskAdd onAdd={addTodo} />

      <br />
      <Card title="Straßenkarte">
        <Map
          startGeoData={startGeoData}
          resultGeoData={geoDataCallback}
        />
      </Card>

      <p>&nbsp;</p>
    </div>
  );
};

export default App;
