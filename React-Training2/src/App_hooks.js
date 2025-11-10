//
// APP.JS - HAUPTANWENDUNG WEB-ENGINEERING II
// =============================================================================
// 
// Diese React-Anwendung demonstriert verschiedene Konzepte:
// - State Management mit React Hooks (useState, useEffect)
// - Event Handling in Funktionskomponenten
// - Komponenten-Komposition
// - Integration von Leaflet Maps
// 
// Die App besteht aus mehreren Komponenten:
// - Card: Wiederverwendbare Container-Komponente
// - Button: Beispiel für eine einfache Komponente
// - TaskList: Liste von Aufgaben
// - TaskAdd: Formular zum Hinzufügen von Aufgaben
// - Map: Interaktive Karte mit Leaflet
// 
// Für Entwickler ohne React-Erfahrung:
// - useState: Verwaltet State in Funktionskomponenten
// - useEffect: Führt Side Effects aus (wie componentDidMount)
// - const [value, setValue] = useState(initialValue): State Hook Pattern
// 
// =============================================================================

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from "./Button";
import Card from "./Card";
import TaskList from "./TaskList";
import TaskAdd from "./TaskAdd";
import Map from "./Maps";
import './App.css';

/**
 * HAUPTPROGRAMM - APP FUNKTIONSKOMPONENTE
 * 
 * Moderne React-Apps verwenden Funktionskomponenten mit Hooks
 * statt Klassenkomponenten. Diese Komponente:
 * - Verwaltet State mit useState Hook
 * - Führt Side Effects mit useEffect Hook aus
 * - Rendert die Benutzeroberfläche
 */
const App = () => {
  // ===========================================================================
  // STATE DECLARATIONS MIT useState HOOK
  // ===========================================================================
  
  /**
   * STATE: name
   * - useState gibt ein Array zurück: [aktuellerWert, setterFunktion]
   * - "Mars" ist der initiale Wert
   * - setName aktualisiert den Wert und triggert ein Re-Render
   */
  const [name, setName] = useState("Mars");
  
  /**
   * STATE: counter
   * - Numerischer Zähler, startet bei 0
   * - setCounter aktualisiert den Zähler
   */
  const [counter, setCounter] = useState(0);
  
  /**
   * STATE: todos
   * - Array von Todo-Objekten mit id und title
   * - uuidv4() generiert eindeutige IDs
   */
  const [todos, setTodos] = useState([
    { id: uuidv4(), title: "2020-04-08T08.30.00Z Uhr: Teil 1 - Web-Engineering II" },
    { id: uuidv4(), title: "2020-04-22T11.45.00Z Uhr: Nachbereitung Kurs" },
  ]);
  
  /**
   * STATE: startGeoData
   * - Startposition für die Karte (Berlin)
   * - const [wert, setter] = ... aber setter wird nicht verwendet
   */
  const [startGeoData] = useState([52.520007, 13.404954]);
  
  /**
   * STATE: resultGeoData
   * - Aktuelle Position von der Map-Komponente
   * - Wird durch geoDataCallback aktualisiert
   */
  const [resultGeoData, setResultGeoData] = useState([52.520007, 13.404954]);

  // ===========================================================================
  // EVENT HANDLER FUNKTIONEN
  // ===========================================================================
  
  /**
   * Ändert den Namen im State
   * - Wird vom "Kopftext ändern" Button aufgerufen
   * - setName aktualisiert den State und triggert Re-Render
   */
  const changeName = () => {
    setName("Venus");
  };

  /**
   * Erhöht den Zähler um 1
   * - Verwendet Funktions-Update für korrekte State-Aktualisierung
   * - prevCounter gibt Zugriff auf den vorherigen State-Wert
   */
  const incrementCounter = () => {
    setCounter(prevCounter => prevCounter + 1);
  };

  /**
   * Fügt eine neue Aufgabe zur Todo-Liste hinzu
   * @param {string} title - Titel der neuen Aufgabe
   * - Verwendet Spread-Operator um neues Element vorne einzufügen
   * - uuidv4() generiert eine eindeutige ID
   */
  const addTodo = (title) => {
    setTodos(prevTodos => [{ id: uuidv4(), title }, ...prevTodos]);
  };

  /**
   * Callback für Geo-Daten von der Map-Komponente
   * @param {Array} geoData - Koordinaten [latitude, longitude]
   * - Wird von der Map-Komponente aufgerufen wenn sich die Position ändert
   */
  const geoDataCallback = (geoData) => {
    console.log(`DEBUG - Daten von Map-Komponente: ${JSON.stringify(geoData)}`);
    setResultGeoData(geoData);
  };

  // ===========================================================================
  // SIDE EFFECTS MIT useEffect HOOK
  // ===========================================================================
  
  /**
   * useEffect Hook - ersetzt componentDidMount, componentDidUpdate, componentWillUnmount
   * - Wird nach dem Rendern der Komponente ausgeführt
   * - Leeres Abhängigkeits-Array [] bedeutet: nur einmal nach dem Mount ausführen
   * - Hier: Fügt eine initiale Todo nach dem Laden der Komponente hinzu
   */
  useEffect(() => {
    // Diese Funktion wird einmal nach dem initialen Render ausgeführt
    const newToDo = { 
      id: uuidv4(), 
      title: "2020-04-24T09.00.00Z Uhr: Teil 2 - Web-Engineering II" 
    };
    setTodos(prevTodos => [...prevTodos, newToDo]);
  }, []); // Leeres Array = nur einmal ausführen

  // Debugging: Aktuelle Position in Console loggen
  console.log(`DEBUG - Aktuelle Position: ${JSON.stringify(resultGeoData)}`);

  // ===========================================================================
  // RENDER DER BENUTZEROBERFLÄCHE
  // ===========================================================================
  
  return (
    <div className="App">
      {/* HEADER BEREICH */}
      <div className="App-header">
        <h2>Hallo {name}</h2>
        <p>{name.length}</p>
      </div>

      <br />

      {/* BEISPIEL 1: CARD MIT BUTTON */}
      <Card title="Das ist eine Card mit Button">
        <p>Hier ein Absatz mittels &lt;p&gt;&lt;/p&gt;!</p>
        <Button label="Das ist die DHBW!" />
      </Card>

      <br />

      {/* BEISPIEL 2: CARD MIT EVENT HANDLER */}
      <Card title="Header-Venus">
        <button onClick={changeName}>Kopftext ändern in Venus</button>
      </Card>

      <br />

      {/* BEISPIEL 3: COUNTER MIT STATE MANAGEMENT */}
      <Card title="Counter">
        <h1>Counter: {counter}</h1>
        <button onClick={incrementCounter}>Hochzählen!</button>
      </Card>

      {/* BEISPIEL 4: TASK LISTE (ARRAY RENDERN) */}
      <h1>Task Liste</h1>
      <TaskList todos={todos} />

      <br />

      {/* BEISPIEL 5: TASK HINZUFÜGEN (FORMULAR) */}
      <TaskAdd onAdd={addTodo} />

      <br />

      {/* BEISPIEL 6: INTERAKTIVE KARTE */}
      <Card title="Straßenkarte mit verschiebbarem Kreis">
        <Map
          startGeoData={startGeoData}
          resultGeoData={geoDataCallback}
        />
      </Card>

      {/* Abschluss-Abstand */}
      <p>&nbsp;</p>
    </div>
  );
};

// Export der Komponente für die Verwendung in index.js
export default App;

/**
 * =============================================================================
 * REACT HOOKS - ERKLÄRUNG FÜR EINSTEIGER
 * =============================================================================
 * 
 * useState HOOK:
 * const [wert, setWert] = useState(initialwert);
 * - Verwaltet State in Funktionskomponenten
 * - Bei Änderung: Komponente wird neu gerendert
 * 
 * useEffect HOOK:
 * useEffect(() => { ... }, [dependencies]);
 * - Führt Side Effects aus (API Calls, Timer, etc.)
 * - Zweites Argument: Abhängigkeiten-Array
 *   - []: Nur einmal nach Mount ausführen
 *   - [variable]: Ausführen wenn variable sich ändert
 *   - kein Array: Bei jedem Render ausführen
 * 
 * useCallback HOOK:
 * - Memoisiert Funktionen (nicht in dieser App verwendet)
 * 
 * useMemo HOOK:
 * - Memoisiert berechnete Werte (nicht in dieser App verwendet)
 * 
 * =============================================================================
 * WICHTIGE REACT KONZEPTE - CHEAT SHEET
 * =============================================================================
 * 
 * 1. STATE UPDATES:
 *    // Einfach
 *    setWert(neuerWert);
 *    
 *    // Basierend auf vorherigem State
 *    setWert(prev => prev + 1);
 * 
 * 2. EVENT HANDLER:
 *    <button onClick={handleClick}>  // RICHTIG
 *    <button onClick={handleClick()}> // FALSCH (wird sofort ausgeführt)
 * 
 * 3. ARRAYS IM STATE:
 *    // Neues Element hinzufügen
 *    setItems(prev => [...prev, newItem]);
 *    
 *    // Element entfernen
 *    setItems(prev => prev.filter(item => item.id !== id));
 * 
 * 4. CONDITIONAL RENDERING:
 *    {isVisible && <div>Inhalt</div>}
 *    {items.length > 0 ? <List /> : <p>Leer</p>}
 * 
 * 5. LIST RENDERING:
 *    {items.map(item => (
 *      <li key={item.id}>{item.name}</li>
 *    ))}
 * 
 * 6. PROPS AN KINDER:
 *    <ChildComponent title="Text" data={stateValue} />
 * 
 * 7. CALLBACKS VON KINDERN:
 *    const handleData = (data) => { ... };
 *    <ChildComponent onDataReceived={handleData} />
 */
