import React, { Component } from "react";
import { MapContainer, TileLayer, MapConsumer } from "react-leaflet";
import "./Leaflet.css";
import L from "leaflet";
// Own Icons
import marker from "./marker-icon.png";
import markerShadow from "./marker-shadow.png";

/**
 * =============================================================================
 * LAYER CONTROL KOMPONENTE
 * =============================================================================
 * 
 * Diese Komponente erstellt das Layer-Control-Menü (oben rechts in der Karte)
 * Ermöglicht das Umschalten zwischen verschiedenen Kartenlayern:
 * - OpenStreetMap Standard
 * - OpenStreetMap DE
 * - Satellitenansicht
 * 
 * Verwendet Leaflet's L.control.layers() für die Layer-Verwaltung
 */
class LayerControl extends Component {
  componentDidMount() {
    const { map } = this.props;
    
    // Definition der verschiedenen Kartenlayer (Base Layers)
    // Jeder Layer hat eine URL und Attribution-Informationen
    this.baseLayers = {
      "OpenStreetMap Standard": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }
      ),
      "OpenStreetMap DE": L.tileLayer(
        "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }
      ),
      "Satellit": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="http://www.esri.com/">Esri</a>'
        }
      )
    };

    // Layer-Control zur Karte hinzufügen
    this.layerControl = L.control.layers(this.baseLayers).addTo(map);
    
    // Standard-Layer aktivieren
    this.baseLayers["OpenStreetMap Standard"].addTo(map);
  }

  componentWillUnmount() {
    // Cleanup: Layer-Control von der Karte entfernen
    if (this.layerControl) {
      this.layerControl.remove();
    }
  }

  render() {
    return null; // Diese Komponente rendert nichts, sie manipuliert nur die Karte
  }
}

/**
 * =============================================================================
 * LOCATION CONTROL KOMPONENTE
 * =============================================================================
 * 
 * Diese Komponente erstellt den Location-Button (unten links in der Karte)
 * Ermöglicht das Zoomen zur aktuellen Benutzerposition
 * 
 * Verwendet:
 * - map.locate() für die Standortermittlung
 * - Browser Geolocation API
 * - Fly-To-Animation für sanfte Bewegung
 */
class LocationControl extends Component {
  componentDidMount() {
    const { map, onLocationFound } = this.props;

    // Custom Control für Location-Button erstellen
    const locationControl = L.control({ position: 'bottomleft' });

    // HTML für den Button erstellen
    locationControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.innerHTML = `
        <button 
          style="
            background: white; 
            border: 2px solid rgba(0,0,0,0.2); 
            border-radius: 4px; 
            width: 30px; 
            height: 30px; 
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          "
          title="Zu meiner Position zoomen"
        >
          📍
        </button>
      `;
      
      // Click-Event Handler für den Button
      div.onclick = () => {
        this.locateUser();
      };

      return div;
    };

    // Control zur Karte hinzufügen
    locationControl.addTo(map);
    this.locationControl = locationControl;
  }

  /**
   * Standortermittlung des Benutzers
   * Verwendet Browser Geolocation API
   */
  locateUser = () => {
    const { map, onLocationFound } = this.props;
    
    console.log("Suche nach aktueller Position...");
    
    // Browser nach Standort fragen
    map.locate({ 
      setView: true, 
      maxZoom: 16,
      timeout: 10000,
      enableHighAccuracy: true 
    });

    // Erfolgs-Callback: Position gefunden
    map.on('locationfound', (e) => {
      console.log("Aktuelle Position gefunden:", e.latlng);
      
      // Zur gefundenen Position fliegen (Animation)
      map.flyTo(e.latlng, 16);
      
      // Genauigkeits-Kreis anzeigen
      const radius = e.accuracy;
      const accuracyCircle = L.circle(e.latlng, radius, {
        color: 'blue',
        weight: 1,
        opacity: 0.5,
        fillColor: 'blue',
        fillOpacity: 0.1
      }).addTo(map);
      
      // Temporären Marker für aktuelle Position
      const locationMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'current-location-marker',
          iconSize: [20, 20],
          html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>'
        })
      })
      .addTo(map)
      .bindPopup(`Aktuelle Position<br>Genauigkeit: ${Math.round(radius)} Meter`)
      .openPopup();

      // Cleanup: Temporäre Elemente nach 5 Sekunden entfernen
      setTimeout(() => {
        map.removeLayer(locationMarker);
        map.removeLayer(accuracyCircle);
      }, 5000);

      // Callback an Parent-Komponente
      if (onLocationFound) {
        onLocationFound([e.latlng.lat, e.latlng.lng]);
      }
    });

    // Fehler-Callback: Position konnte nicht ermittelt werden
    map.on('locationerror', (e) => {
      console.error("Position konnte nicht ermittelt werden:", e.message);
      alert("Position konnte nicht ermittelt werden. Bitte stellen Sie sicher, dass Standortberechtigungen aktiviert sind.");
    });
  }

  componentWillUnmount() {
    // Cleanup: Control von der Karte entfernen
    if (this.locationControl) {
      this.locationControl.remove();
    }
  }

  render() {
    return null;
  }
}

/**
 * =============================================================================
 * HILFSFUNKTION: ENTFERNUNGSBERECHNUNG (HAVERSINE-FORMEL)
 * =============================================================================
 * 
 * Berechnet die Luftlinien-Entfernung zwischen zwei Koordinatenpunkten
 * unter Berücksichtigung der Erdkrümmung.
 * 
 * @param {number} lat1 - Breitengrad Punkt 1
 * @param {number} lon1 - Längengrad Punkt 1
 * @param {number} lat2 - Breitengrad Punkt 2
 * @param {number} lon2 - Längengrad Punkt 2
 * @returns {Object} - Entfernung in Metern und Kilometern
 * 
 * Die Haversine-Formel berechnet die kürzeste Entfernung auf einer Kugeloberfläche
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Erdradius in Kilometern
  
  // Grad in Radiant umrechnen
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  // Haversine-Formel
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  const distanceM = distanceKm * 1000;
  
  return {
    kilometers: distanceKm,
    meters: distanceM
  };
};

/**
 * =============================================================================
 * DRAGGABLE MARKER KOMPONENTE
 * =============================================================================
 * 
 * Haupt-Marker der Anwendung:
 * - Roter, runder Marker (verschoben von ursprünglichem Circle)
 * - Vollständig verschiebbar (draggable)
 * - Zeigt aktuelle Position und Entfernung zum Klick-Marker
 * - Zeichnet Linie zum gesetzten Marker
 * 
 * Verwendet L.marker mit draggable: true für die Verschiebbarkeit
 */
class DraggableMarker extends Component {
  constructor(props) {
    super(props);
    this.markerRef = null;    // Referenz zum Leaflet Marker
    this.lineRef = null;      // Referenz zur Polyline zwischen Markern
  }

  componentDidMount() {
    const { map, position, onPositionChange, freeMarkerPosition } = this.props;

    // Custom Icon für den verschiebbaren Marker erstellen
    // Verwendet L.divIcon für vollständige CSS-Kontrolle
    const positionIcon = L.divIcon({
      className: 'position-marker',
      iconSize: [30, 30],
      html: '<div style="background-color: red; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: move;"></div>'
    });

    // Marker erstellen und zur Karte hinzufügen
    this.markerRef = L.marker(position, {
      draggable: true,  // Wichtig: Marker ist verschiebbar
      icon: positionIcon
    }).addTo(map);

    // Initiales Popup und Linie erstellen
    this.updatePopupAndLine();

    // Event-Listener für das Verschieben des Markers
    this.markerRef.on('dragend', (e) => {
      const newPosition = e.target.getLatLng();
      console.log("Position verschoben zu:", newPosition);
      
      // Popup und Linie aktualisieren
      this.updatePopupAndLine();
      
      // Callback an Parent-Komponente
      if (onPositionChange) {
        onPositionChange([newPosition.lat, newPosition.lng]);
      }
    });
  }

  /**
   * Aktualisiert das Popup und die Verbindungslinie
   * Wird aufgerufen bei:
   * - Marker-Erstellung
   * - Marker-Verschiebung
   * - Neuem Klick-Marker
   */
  updatePopupAndLine = () => {
    const { map, position, freeMarkerPosition } = this.props;
    
    // Alte Linie entfernen (falls vorhanden)
    if (this.lineRef) {
      map.removeLayer(this.lineRef);
    }

    // Popup-Inhalt erstellen
    const lat = position[0].toFixed(6);
    const lng = position[1].toFixed(6);
    
    let popupContent = `
      <div style="text-align: center;">
        <strong>Aktuelle Position</strong><br>
        <small>Ziehe mich woanders hin!</small><br><br>
        <strong>Koordinaten:</strong><br>
        Breite: ${lat}°<br>
        Länge: ${lng}°
    `;

    // Entfernungsinformation hinzufügen, wenn ein freier Marker existiert
    if (freeMarkerPosition && freeMarkerPosition.length === 2) {
      const distance = calculateDistance(
        position[0], position[1],
        freeMarkerPosition[0], freeMarkerPosition[1]
      );

      popupContent += `
        <br><br>
        <strong>Entfernung zum Marker:</strong><br>
        ${distance.kilometers.toFixed(2)} Kilometer
      `;

      // Linie zwischen den beiden Punkten zeichnen
      const linePoints = [
        [position[0], position[1]],
        [freeMarkerPosition[0], freeMarkerPosition[1]]
      ];

      this.lineRef = L.polyline(linePoints, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10',  // Gestrichelte Linie
        lineJoin: 'round'
      }).addTo(map);
    }

    popupContent += `</div>`;

    // Popup am Marker setzen und öffnen
    if (this.markerRef) {
      this.markerRef.bindPopup(popupContent).openPopup();
    }
  }

  componentDidUpdate(prevProps) {
    // Marker-Position aktualisieren, wenn sich Props ändern
    if (prevProps.position !== this.props.position && this.markerRef) {
      this.markerRef.setLatLng(this.props.position);
    }

    // Popup und Linie aktualisieren bei Positionsänderungen
    if (prevProps.position !== this.props.position || 
        prevProps.freeMarkerPosition !== this.props.freeMarkerPosition) {
      this.updatePopupAndLine();
    }
  }

  componentWillUnmount() {
    // Cleanup: Alle Leaflet-Elemente von der Karte entfernen
    if (this.markerRef) {
      this.markerRef.remove();
    }
    if (this.lineRef) {
      this.lineRef.remove();
    }
  }

  render() {
    return null; // Diese Komponente rendert nichts, sie manipuliert nur die Karte
  }
}

/**
 * =============================================================================
 * HAUPT MAP KOMPONENTE
 * =============================================================================
 * 
 * Hauptkomponente der Kartenanwendung
 * Kombiniert alle Unterkomponenten und verwaltet den globalen State
 * 
 * Props:
 * - startGeoData: Startposition der Karte [lat, lng]
 * - resultGeoData: Callback für Positionsänderungen
 * 
 * State:
 * - currentPosition: Aktuelle Position des roten Markers
 * - freeMarkerPosition: Position des durch Klick gesetzten Markers
 */
export default class Map extends Component {
  constructor(props) {
    super(props);
    
    // Instanzvariablen
    this.markArr = [];        // Array für Klick-Marker (max. 1)
    this.mapRef = null;       // Referenz zur Leaflet Map-Instanz
    
    // Konfiguration für Standard-Marker-Icon
    this.customIcon = L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: marker,
      shadowUrl: markerShadow
    });

    // Optionen für Klick-Marker (nicht verschiebbar)
    this.markerOptions = {
      clickable: true,
      draggable: false,
      icon: this.customIcon,
      opacity: .7
    };

    // Initialer State
    this.state = {
      currentPosition: props.startGeoData,    // Startposition (Berlin)
      freeMarkerPosition: null                // Wird durch Klicks gesetzt
    };
  }

  /**
   * Handler für Positionsänderung des roten Markers
   * @param {Array} newPosition - Neue Position [lat, lng]
   */
  handlePositionChange = (newPosition) => {
    console.log(`Neue Position: ${JSON.stringify(newPosition)}`);
    this.setState({ currentPosition: newPosition });
    
    // Callback an Parent-Komponente
    if (this.props.resultGeoData) {
      this.props.resultGeoData(newPosition);
    }
  };

  /**
   * Handler für gefundene Benutzerposition
   * @param {Array} location - Gefundene Position [lat, lng]
   */
  handleLocationFound = (location) => {
    console.log("Neue Location gefunden:", location);
    this.setState({ currentPosition: location });
    
    // Callback an Parent-Komponente
    if (this.props.resultGeoData) {
      this.props.resultGeoData(location);
    }
  };

  /**
   * Handler für Klick-Events auf die Karte
   * @param {Object} map - Leaflet Map-Instanz
   * @param {Object} e - Leaflet Event-Objekt
   */
  handleMapClick = (map, e) => {
    const { lat, lng } = e.latlng;
    console.log(`DEBUG - Klick-Position: ${lat},${lng}`);

    // Standard-Marker an Klick-Position setzen
    let mark = L.marker([lat, lng], this.markerOptions)
      .addTo(map)
      .bindPopup(`Klick-Position: ${JSON.stringify(e.latlng)}`)
      .openPopup();

    // Marker-Array verwalten (immer nur einen Marker anzeigen)
    this.markArr.push(mark);
    if (this.markArr.length > 1) {
      map.removeLayer(this.markArr[0]);
      this.markArr.shift();
    }

    // Position des frei gesetzten Markers speichern
    this.setState({ freeMarkerPosition: [lat, lng] });
    
    // Callback an Parent-Komponente
    if (this.props.resultGeoData) {
      this.props.resultGeoData([lat, lng]);
    }
  };

  /**
   * Map-Events einrichten
   * @param {Object} map - Leaflet Map-Instanz
   */
  setupMapEvents = (map) => {
    console.log("Map Center:", map.getCenter());
    this.mapRef = map;

    // Klick-Event auf die Karte
    map.on("click", (e) => {
      this.handleMapClick(map, e);
    });
  };

  componentDidUpdate(prevProps) {
    // Startposition aktualisieren, wenn sich Props ändern
    if (prevProps.startGeoData !== this.props.startGeoData) {
      this.setState({ currentPosition: this.props.startGeoData });
    }
  }

  render() {
    const { startGeoData } = this.props;
    const { currentPosition, freeMarkerPosition } = this.state;

    return (
      /**
       * =========================================================================
       * MAP CONTAINER - Das Herzstück der Anwendung
       * =========================================================================
       * 
       * MapContainer ist die Hauptkomponente von react-leaflet
       * - center: Startzentrum der Karte
       * - zoom: Start-Zoomlevel
       * - style: Dimensionen der Karte
       * 
       * TileLayer: Zeigt die Kartenkacheln von OpenStreetMap an
       * 
       * MapConsumer: Ermöglicht Zugriff auf die Leaflet Map-Instanz
       * 
       * Die Unterkomponenten werden über MapConsumer mit der Map-Instanz versorgt
       */
      <MapContainer
        center={startGeoData}
        zoom={13}
        style={{ height: "300px" }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map Events Setup */}
        <MapConsumer>
          {(map) => {
            this.setupMapEvents(map);
            return null;
          }}
        </MapConsumer>

        {/* Layer Control (oben rechts) */}
        <MapConsumer>
          {(map) => <LayerControl map={map} />}
        </MapConsumer>

        {/* Location Control (unten links) */}
        <MapConsumer>
          {(map) => (
            <LocationControl 
              map={map} 
              onLocationFound={this.handleLocationFound}
            />
          )}
        </MapConsumer>
        
        {/* Draggable Marker (Haupt-Marker) */}
        <MapConsumer>
          {(map) => (
            <DraggableMarker 
              map={map}
              position={currentPosition}
              freeMarkerPosition={freeMarkerPosition}
              onPositionChange={this.handlePositionChange}
            />
          )}
        </MapConsumer>
      </MapContainer>
    );
  }
}

/**
 * =============================================================================
 * ZUSAMMENFASSUNG DER FUNKTIONALITÄTEN
 * =============================================================================
 * 
 * 1. KARTENGRUNDLAGE:
 *    - OpenStreetMap als Basis-Karte
 *    - Layer-Switching zwischen verschiedenen Kartenstilen
 * 
 * 2. MARKER SYSTEM:
 *    - Roter, verschiebbarer Haupt-Marker (aktuelle Position)
 *    - Blaue Standard-Marker durch Klicks setzbar
 *    - Immer nur ein Klick-Marker gleichzeitig
 * 
 * 3. POSITIONSFEATURES:
 *    - 📍 Button für Standortermittlung
 *    - Fly-To-Animation zur eigenen Position
 *    - Genauigkeits-Anzeige
 * 
 * 4. ENTFERNUNGSBERECHNUNG:
 *    - Luftlinie zwischen rotem Marker und Klick-Marker
 *    Haversine-Formel für präzise Berechnung
 *    - Visuelle Linie zwischen den Punkten
 *    - Entfernungsanzeige im Popup
 * 
 * 5. INTERAKTION:
 *    - Marker verschieben per Drag & Drop
 *    - Klicks auf Karte setzen Marker
 *    - Popups mit Informationen
 *    - Responsive Design
 */
