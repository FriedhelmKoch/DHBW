// ./frontend/src/App.js (Beispielhafter Inhalt basierend auf Ihren früheren Angaben)
import React, { useEffect, useState } from 'react';

function App() {
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api') // Beachten Sie unsere Diskussion hierzu!
      .then(response => response.json())
      .then(data => setBackendMessage(data.message))
      .catch(err => console.error('Error: ', err));
  }, []);

  return (
    <div>
      <h1>Meine React App</h1>
      <p>Message from Backend: {backendMessage}</p>
    </div>
  );
}

export default App;
