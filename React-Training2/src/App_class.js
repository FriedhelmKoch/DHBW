//
// APP.JS - HAUPTANWENDUNG WEB-ENGINEERING II (KLASSENKOMPONENTE)
// =============================================================================
// 
// Diese React-Anwendung demonstriert verschiedene Konzepte mit Klassenkomponenten:
// - State Management mit this.state und this.setState()
// - Event Handling in Klassenkomponenten
// - Lebenszyklus-Methoden (componentDidMount, componentDidUpdate)
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
// - Klassenkomponenten verwenden this.state und this.setState()
// - Methoden werden als Arrow-Functions definiert für korrektes 'this' Binding
// - render()-Methode gibt die UI zurück
// - componentDidMount() wird nach dem ersten Rendern aufgerufen
// 
// =============================================================================

import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from "./Button";
import Card from "./Card";
import TaskList from "./TaskList";
import TaskAdd from "./TaskAdd";
import Map from "./Maps";
import './App.css';

/**
 * =============================================================================
 * HAUPTPROGRAMM - APP-KLASSE
 * =============================================================================
 * 
 * Dies ist die Hauptkomponente der Anwendung als Klassenkomponente.
 * Sie verwaltet den gesamten State und koordiniert die Unterkomponenten.
 * 
 * WICHTIGE REACT KONZEPTE IN KLASSENKOMPONENTEN:
 * - State: Interne Daten der Komponente, die sich ändern können (this.state)
 * - Props: Daten, die von Parent- an Child-Komponenten übergeben werden (this.props)
 * - Lifecycle Methods: Werden zu bestimmten Zeitpunkten automatisch aufgerufen
 * - Event Handler: Reagieren auf Benutzerinteraktionen
 * - render(): Gibt die Benutzeroberfläche zurück (muss vorhanden sein)
 */
class App extends Component {
  /**
   * CONSTRUCTOR - Wird beim Erstellen der Komponente aufgerufen
   * 
   * Aufgaben:
   * - super(props) aufrufen (erforderlich)
   * - Initialen State definieren
   * - Event Handler binden (bei normalen Funktionen notwendig)
   * 
   * In dieser Komponente verwenden wir Arrow-Functions, daher ist kein Binding nötig.
   */
  constructor(props) {
    // Immer super(props) zuerst aufrufen!
    super(props);

    /**
     * STATE INITIALISIERUNG
     * 
     * State enthält alle änderbaren Daten der Komponente.
     * Wenn sich State ändert, wird die Komponente automatisch neu gerendert.
     * 
     * State sollte als einfaches JavaScript-Objekt definiert werden.
     */
    this.state = {
      // Einfache String-Variable für den Namen
      name: "Mars",
      
      // Numerischer Zähler
      counter: 0,
      
      // Array von Todo-Objekten mit eindeutigen IDs
      todos: [
        { 
          id: uuidv4(), 
          title: "2020-04-08T08.30.00Z Uhr: Teil 1 - Web-Engineering II" 
        },
        { 
          id: uuidv4(), 
          title: "2020-04-22T11.45.00Z Uhr: Nachbereitung Kurs" 
        },
      ],
      
      // Startposition für die Karte (Berlin)
      startGeoData: [52.520007, 13.404954],
      
      // Aktuelle Position von der Karte
      resultGeoData: [52.520007, 13.404954]
    };

    /**
     * HINWEIS ZUM BINDING:
     * 
     * Bei normalen Methoden (nicht Arrow-Functions) müsste man sie hier binden:
     * this.handleClick = this.handleClick.bind(this);
     * 
     * Wir verwenden Arrow-Functions, daher entfällt dieses Binding.
     */
  }

  /**
   * =============================================================================
   * EVENT HANDLER METHODEN
   * =============================================================================
   * 
   * Diese Methoden werden aufgerufen, wenn der Benutzer mit der App interagiert.
   * Sie ändern den State mit this.setState(), was ein Neurendern auslöst.
   * 
   * WICHTIG: Methoden als Arrow-Functions definieren, damit 'this' korrekt gebunden ist.
   */

  /**
   * Ändert den Namen im State
   * 
   * Wird vom "Kopftext ändern" Button aufgerufen.
   * setState() ist die einzige Möglichkeit, den State zu ändern.
   */
  changeName = () => {
    // setState aktualisiert den State und löst ein Neurendern der Komponente aus
    this.setState({
      name: "Venus"
    });
  };

  /**
   * Erhöht den Zähler um 1
   * 
   * Verwendet den vorherigen State für korrekte Updates.
   * Bei State-Updates, die vom vorherigen State abhängen, sollte man
   * die Funktionsform von setState verwenden.
   */
  incrementCounter = () => {
    // Funktionsform von setState für Updates basierend auf vorherigem State
    this.setState(prevState => ({
      counter: prevState.counter + 1
    }));
  };

  /**
   * Fügt eine neue Aufgabe zur Todo-Liste hinzu
   * 
   * @param {string} title - Titel der neuen Aufgabe
   * 
   * Verwendet Spread-Operator um das Array zu erweitern.
   * Die neue Aufgabe wird am Anfang der Liste eingefügt.
   */
  addTodo = (title) => {
    this.setState(prevState => ({
      // Neue Aufgabe am Anfang der Liste einfügen
      todos: [
        { 
          id: uuidv4(), // Eindeutige ID mit uuid generieren
          title 
        },
        ...prevState.todos // Vorherige Todos über Spread-Operator übernehmen
      ]
    }));
  };

  /**
   * Callback für Geo-Daten von der Map-Komponente
   * 
   * @param {Array} geoData - Koordinaten [latitude, longitude]
   * 
   * Wird von der Map-Komponente aufgerufen, wenn sich die Position ändert
   * (durch Verschieben des Markers oder Klick auf die Karte).
   */
  geoDataCallback = (geoData) => {
    console.log(`DEBUG - Daten von Map-Komponente: ${JSON.stringify(geoData)}`);
    
    this.setState({
      resultGeoData: geoData
    });
  };

  /**
   * =============================================================================
   * LIFECYCLE METHODEN
   * =============================================================================
   * 
   * Werden von React automatisch zu bestimmten Zeitpunkten aufgerufen.
   * Ermöglichen das Ausführen von Code zu bestimmten Phasen der Komponente.
   */

  /**
   * COMPONENT DID MOUNT
   * 
   * Wird aufgerufen NACHDEM die Komponente zum ersten Mal gerendert wurde.
   * 
   * Typische Verwendungen:
   * - API Calls
   * - Timer starten
   * - DOM-Manipulationen
   * - Daten von localStorage laden
   */
  componentDidMount() {
    console.log("App-Komponente wurde gemounted (zum ersten Mal gerendert)");
    
    // Beispiel: Eine weitere Todo nach dem Mounten hinzufügen
    const newToDo = { 
      id: uuidv4(), 
      title: "2020-04-24T09.00.00Z Uhr: Teil 2 - Web-Engineering II" 
    };
    
    this.setState(prevState => ({
      todos: [...prevState.todos, newToDo] // Neue Todo ans Ende der Liste
    }));
  }

  /**
   * COMPONENT DID UPDATE
   * 
   * Wird aufgerufen NACHDEM sich Props oder State geändert haben
   * und die Komponente neu gerendert wurde.
   * 
   * @param {Object} prevProps - Vorherige Props vor dem Update
   * @param {Object} prevState - Vorheriger State vor dem Update
   * 
   * Typische Verwendungen:
   * - Auf State/Props Änderungen reagieren
   * - Weitere API Calls basierend auf geänderten Daten
   * - DOM-Updates nach State-Änderungen
   */
  componentDidUpdate(prevProps, prevState) {
    // Debugging: Loggen wenn sich die Position ändert
    if (prevState.resultGeoData !== this.state.resultGeoData) {
      console.log(`Position geändert: ${JSON.stringify(this.state.resultGeoData)}`);
    }
  }

  /**
   * =============================================================================
   * RENDER METHODE
   * =============================================================================
   * 
   * Die render()-Methode gibt die UI der Komponente zurück.
   * - Wird automatisch aufgerufen wenn sich State oder Props ändern
   * - Muss immer reines JavaScript/JSX zurückgeben
   * - Darf Side Effects nicht direkt aufrufen
   * - Muss vorhanden sein in jeder Klassenkomponente
   * 
   * JSX SYNTAX ERKLÄRUNG:
   * - HTML-ähnliche Syntax in JavaScript
   * - className statt class (wegen JavaScript Keyword)
   * - {expression} für JavaScript-Ausdrücke in JSX
   * - Event Handler: onClick, onChange, etc.
   * - Selbstschließende Tags: <br />, <img />, etc.
   */
  render() {
    /**
     * STATE WERTE AUSLESEN
     * 
     * Zugriff auf State mit this.state.
     * Destructuring macht den Code lesbarer.
     */
    const { name, counter, todos, startGeoData, resultGeoData } = this.state;

    // Debugging in der Console
    console.log(`DEBUG - Aktuelle Position: ${JSON.stringify(resultGeoData)}`);

    /**
     * JSX RETURN
     * 
     * Die Struktur der Benutzeroberfläche.
     * Kann nur ein einziges Wurzelelement zurückgeben.
     */
    return (
      /* HAUPTCONTAINER DER ANWENDUNG */
      <div className="App">
        
        {/* HEADER BEREICH */}
        <div className="App-header">
          {/* Dynamische Werte in geschweiften Klammern */}
          <h2>Hallo {name}</h2>
          <p>Länge des Namens: {name.length} Zeichen</p>
        </div>

        {/* Vertikaler Abstand */}
        <br />

        {/* BEISPIEL 1: CARD MIT BUTTON */}
        <Card title="Das ist eine Card mit Button">
          <p>Hier ein Absatz mittels &lt;p&gt;&lt;/p&gt;!</p>
          <Button label="Das ist die DHBW!" />
        </Card>

        <br />

        {/* BEISPIEL 2: CARD MIT EVENT HANDLER */}
        <Card title="Header-Venus">
          {/*
            Event Handler werden ohne Klammern übergeben.
            this.changeName ist eine Referenz auf die Funktion.
          */}
          <button onClick={this.changeName}>
            Kopftext ändern in Venus
          </button>
        </Card>

        <br />

        {/* BEISPIEL 3: COUNTER MIT STATE MANAGEMENT */}
        <Card title="Counter">
          <h1>Counter: {counter}</h1>
          <button onClick={this.incrementCounter}>
            Hochzählen!
          </button>
        </Card>

        {/* BEISPIEL 4: TASK LISTE (ARRAY RENDERN) */}
        <h1>Task Liste</h1>
        {/*
          TaskList-Komponente erhält todos als Prop.
          todos ist ein Array von Objekten mit id und title.
        */}
        <TaskList todos={todos} />

        <br />

        {/* BEISPIEL 5: TASK HINZUFÜGEN (FORMULAR) */}
        {/*
          TaskAdd ruft this.addTodo mit dem neuen Titel auf.
          Demonstriert Child-to-Parent Kommunikation.
        */}
        <TaskAdd onAdd={this.addTodo} />

        <br />

        {/* BEISPIEL 6: INTERAKTIVE KARTE */}
        <Card title="Straßenkarte mit verschiebbarem Kreis">
          {/*
            Map-Komponente mit Props:
            - startGeoData: Anfangsposition (Berlin)
            - resultGeoData: Callback-Funktion für Positionsänderungen
          */}
          <Map
            startGeoData={startGeoData}
            resultGeoData={this.geoDataCallback}
          />
          
        </Card>

        {/* Abschluss-Abstand */}
        <p>&nbsp;</p>
      </div>
    );
  }
}

// Export der Komponente für die Verwendung in index.js
export default App;

/**
 * =============================================================================
 * ZUSAMMENFASSUNG FÜR REACT-NEULINGE - KLASSENKOMPONENTEN
 * =============================================================================
 * 
 * 1. KOMPONENTENSTRUKTUR:
 *    - Klasse die von React.Component erbt
 *    - constructor() für State-Initialisierung
 *    - render()-Methode MUSS vorhanden sein
 *    - Lifecycle-Methoden optional
 * 
 * 2. STATE MANAGEMENT:
 *    - State in constructor mit this.state = { ... } initialisieren
 *    - Änderungen NUR mit this.setState()
 *    - State-Änderungen lösen Neurendern aus
 *    - Funktionsform: this.setState(prevState => ({ ... }))
 * 
 * 3. EVENT HANDLING:
 *    - Methoden als Arrow-Functions definieren (kein Binding nötig)
 *    - onClick={this.handleClick} (ohne Klammern!)
 *    - 'this' ist in Arrow-Functions automatisch gebunden
 * 
 * 4. PROPS:
 *    - Zugriff mit this.props
 *    - Daten die von Parent zu Child fließen
 *    - Read-only, können nicht vom Child geändert werden
 * 
 * 5. LIFECYCLE METHODEN:
 *    - componentDidMount(): Nach erstem Rendern (API Calls, Timer)
 *    - componentDidUpdate(): Nach State/Props Änderungen
 *    - componentWillUnmount(): Vor dem Entfernen (Cleanup)
 *    - shouldComponentUpdate(): Performance-Optimierung
 * 
 * 6. JSX SYNTAX:
 *    - HTML-ähnlich in JavaScript
 *    - className statt class
 *    - {expression} für JavaScript in JSX
 *    - Selbstschließende Tags: <br />
 *    - Nur ein Wurzelelement pro render()
 * 
 * 7. KEY CONCEPTS:
 *    - Einweg-Datenfluss (Parent → Child)
 *    - Virtuelles DOM für Performance
 *    - Komponenten-Wiederverwendung
 *    - State ist lokal und encapsulated
 */

/**
 * =============================================================================
 * WICHTIGE UNTERSCHIEDE: KLASSEN vs FUNKTIONSKOMPONENTEN
 * =============================================================================
 * 
 * | Feature                | Klassenkomponente               | Funktionskomponente mit Hooks   |
 * |------------------------|----------------------------------|----------------------------------|
 * | State                  | this.state                       | useState Hook                   |
 * | State Update           | this.setState()                  | setState-Funktion               |
 * | Lifecycle              | componentDidMount etc.           | useEffect Hook                  |
 * | Event Handler          | Arrow-Functions                  | Normale Funktionen              |
 * | 'this' Binding         | Bei normalen Methoden nötig     | Nicht nötig                    |
 * | Code-Länge             | Mehr Code                       | Weniger Code                   |
 * | Lesbarkeit             | Komplexer                       | Einfacher                      |
 * 
 * MODERNE REACT-ENTWICKLUNG:
 * - Seit React 16.8 (2019) werden Funktionskomponenten mit Hooks empfohlen
 * - Klassenkomponenten sind weiterhin voll unterstützt
 * - Bestehende Projekte mit Klassenkomponenten müssen nicht migriert werden
 */
