import React, { useState } from 'react';
import './App.css';

function App() {

  const [name, setName] = useState({ firstName: '', lastName: '' });  // useState mit object
  const [items, setItems] = useState([]);   // useState mit array

  const addItem = () => {
		setItems([
			...items, { id: items.length, value: Math.floor(Math.random() * 10) + 1 }
		])
	}

  return (
    <div className="App">
      <header>
        <h2>React Hooks</h2>
        
        <hr />
        <h2>Beispiel für ein "useState Object Hook"</h2>
        <form>
          <input
            type="text"
            value={name.firstName}
            onChange={e => setName({ ...name, firstName: e.target.value })}
          />
          <input
            type="text"
            value={name.lastName}
            onChange={e => setName({ ...name, lastName: e.target.value })}
          />
          <h2>Your first name is - {name.firstName}</h2>
          <h2>Your last name is - {name.lastName}</h2>
          <h2>{JSON.stringify(name)}</h2>
        </form>
        
        <hr />
        <h2>Beispiel für ein "useState Array Hook"</h2>
        <div>
          <button onClick={addItem}>Neues Listenelement mit Zufallszahl</button>
          <ul>
            {items.map(item => (
              <li key={item.id}>Item mit Zufallszahl: {item.value}</li>
            ))}
          </ul>
        </div>

        <hr />

      </header>
    </div>
  );
}

export default App;
