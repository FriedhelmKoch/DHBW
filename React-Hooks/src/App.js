import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const initialCount = 0
  const [count, setCount] = useState(initialCount);                   // useState mit einer variablen
  const [name, setName] = useState({ firstName: '', lastName: '' });  // useState mit object
  const [items, setItems] = useState([]);                             // useState mit array
  const [x, setX] = useState(0);                                      // Mausposition x, y
	const [y, setY] = useState(0);
  const [display, setDisplay] = useState(true);                       // Mausposition ein- ausschalten

  const addItem = () => {
		setItems([
			...items, { id: items.length, value: Math.floor(Math.random() * 10) + 1 }
		])
	};

	const logMousePosition = e => {
		console.log('Mouse event');
		setX(e.clientX);
		setY(e.clientY);
	};

	useEffect(() => {
    // componentDidMount, componentDidUpdate
		console.log('useEffect called');
    window.addEventListener('mousemove', logMousePosition);   // auslesen Mausposition
    // componentWillUnmount 
    return () => {
      console.log('Component unmounting code');
      window.removeEventListener('mousemove', logMousePosition);
    }
  }, []);
  

  return (
    <div className="App">
      <header>
        <h1>React Hooks</h1>

        <hr />
        <h2>Beispiel für ein "useState 'Previous' State Hook"</h2>
        <h3>Count: {count}</h3>
        <button onClick={() => setCount(initialCount)}>Reset</button>
        <button onClick={() => setCount(prevCount => prevCount + 1)}>
          +
        </button>
        <button onClick={() => setCount(prevCount => prevCount - 1)}>
          -
        </button>

        <hr />
        <h2>Beispiel für ein "useState 'Object' Hook"</h2>
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
          <h3>Vorname: {name.firstName}</h3>
          <h3>Nachname: {name.lastName}</h3>
          <h3>JSON-Object: {JSON.stringify(name)}</h3>
        </form>
        
        <hr />
        <h2>Beispiel für ein "useState 'Array' Hook"</h2>
        <div>
          <button onClick={addItem}>Neues Listenelement mit Zufallszahl</button>
          <ul className="listContainer">
            {items.map(item => (
              <li className="listItem" key={item.id}>Item mit Zufallszahl: {item.value}<br /></li>
            ))}
          </ul>
        </div>

        <hr />
        <h2>Beispiel für einen "useEffect" Hook</h2>
        <button onClick={() => setDisplay(!display)}>Anzeige aus-/anschalten</button>
        {display &&     // Conditional rendering
          <p>
            Mausposition - X: {x} Y: {y}
          </p>
        }

      </header>
    </div>
  );
}

export default App;
