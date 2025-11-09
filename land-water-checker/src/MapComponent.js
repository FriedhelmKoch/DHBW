/**
 * Parameter für MapComponent:
 * position: { lat, lon } - Die anzuzeigende Position
 * locationType: string - Land/Wasser Status für Marker-Farbe
 * mapCenter: [lat, lon] - Karten-Zentrum
 * mapZoom: number - Zoom-Level
 * showRadius: boolean - Ob Radius-Kreis angezeigt wird
 * height: string - Höhe der Karte (z.B. '500px')
 * 
 * MapComponent - React Komponente für interaktive Karten mit OpenStreetMap
 * 
 * Diese Komponente stellt eine interaktive Karte mit Leaflet bereit und zeigt
 * Positionen mit farbigen Markern basierend auf dem Land/Wasser-Status an.
 * 
 * @component
 * @version 1.0
 * @description Zeigt Positionen auf einer OSM-Karte mit farbcodierten Markern
 * 
 * @example
 * // Grundlegende Verwendung
 * <MapComponent
 *   position={{ lat: 52.5200, lon: 13.4050 }}
 *   locationType="Land (Berlin)"
 *   mapCenter={[52.5200, 13.4050]}
 *   mapZoom={12}
 * />
 * 
 * @example
 * // Ohne Radius-Kreis
 * <MapComponent
 *   position={{ lat: 54.8000, lon: 5.5000 }}
 *   locationType="Wasser (Nordsee)"
 *   showRadius={false}
 *   height="400px"
 * />
 */

import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Leaflet Marker Icons Fix
 * 
 * Standard Leaflet Marker-Icons haben Probleme mit Webpack/React.
 * Diese Konfiguration stellt sicher, dass die Icons korrekt geladen werden.
 * 
 * @see https://leafletjs.com/examples/custom-icons/
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Erstellt einen benutzerdefinierten Marker-Icon basierend auf dem Location-Type
 * 
 * @function createCustomIcon
 * @param {string} locationType - Der Typ der Position ("Land", "Wasser", oder "Unbekannt")
 * @returns {L.DivIcon} Ein Leaflet DivIcon mit entsprechender Farbe und Styling
 * 
 * @example
 * const icon = createCustomIcon("Land (Berlin)");
 * // Erstellt einen grünen Marker
 */
const createCustomIcon = (locationType) => {
  /**
   * @type {string}
   * Farbe des Markers basierend auf Location-Type:
   * - Blau (#3182ce) für Wasser
   * - Grün (#38a169) für Land
   * - Rot (#e53e3e) für Unbekannt
   */
  let color;
  if (locationType.includes('Wasser')) {
    color = '#3182ce'; // Blau für Wasser
  } else if (locationType.includes('Land')) {
    color = '#38a169'; // Grün für Land
  } else {
    color = '#e53e3e'; // Rot für Unbekannt
  }
  
  /**
   * @type {string}
   * HTML für den benutzerdefinierten Marker
   * Erstellt einen kreisförmigen Marker mit Schatten und Rand
   */
  const html = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `;
  
  return L.divIcon({
    html: html,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

/**
 * MapController - Funktionskomponente zur Steuerung der Kartenansicht
 * 
 * Diese Komponente verwendet den useMap Hook von react-leaflet, um
 * die Kartenansicht (Zentrum und Zoom) zu aktualisieren.
 * 
 * @component
 * @param {Object} props - Komponenten Properties
 * @param {Array<number>} props.center - [lat, lon] für Karten-Zentrum
 * @param {number} props.zoom - Zoom-Level der Karte
 * 
 * @see https://react-leaflet.js.org/docs/api-map/#usemap
 */
const MapController = ({ center, zoom }) => {
  /**
   * @type {Object}
   * useMap Hook gibt die Leaflet Map Instanz zurück
   */
  const map = useMap();
  
  /**
   * useEffect Hook zur Aktualisierung der Kartenansicht
   * Wird ausgelöst wenn sich center oder zoom ändern
   */
  React.useEffect(() => {
    if (center && zoom) {
      /**
       * Setzt die Kartenansicht auf neue Koordinaten und Zoom-Level
       * @param {Array<number>} center - Neue Kartenmitte [lat, lon]
       * @param {number} zoom - Neuer Zoom-Level
       * @param {Object} options - Animation Optionen
       */
      map.setView(center, zoom, {
        animate: true,    // Sanfte Animation
        duration: 1.5     // Dauer der Animation in Sekunden
      });
    }
  }, [map, center, zoom]);
  
  return null;
};

/**
 * Haupt-Kartenkomponente
 * 
 * @class MapComponent
 * @extends Component
 * 
 * @property {Object} props - Komponenten Properties
 * @property {Object} [props.position=null] - Die anzuzeigende Position { lat, lon }
 * @property {string} [props.locationType=''] - Land/Wasser Status für Marker-Farbe
 * @property {Array<number>} [props.mapCenter=[51.1657, 10.4515]] - Karten-Zentrum [lat, lon]
 * @property {number} [props.mapZoom=6] - Zoom-Level der Karte
 * @property {boolean} [props.showRadius=true] - Ob Radius-Kreis angezeigt wird
 * @property {string} [props.height='500px'] - Höhe der Karte (z.B. '500px', '100%')
 */
class MapComponent extends Component {
  /**
   * Optimiert das Rendering der Komponente
   * Verhindert unnötige Renders wenn sich nicht relevante Props ändern
   * 
   * @param {Object} nextProps - Die nächsten Props
   * @returns {boolean} True wenn Komponente neu gerendert werden soll
   */
  shouldComponentUpdate(nextProps) {
    // Nur neu rendern wenn sich wichtige Props ändern
    return (
      nextProps.position !== this.props.position ||
      nextProps.locationType !== this.props.locationType ||
      nextProps.mapCenter !== this.props.mapCenter ||
      nextProps.mapZoom !== this.props.mapZoom
    );
  }

  /**
   * Render-Methode der Komponente
   * 
   * @returns {React.Element} JSX Element der Kartenkomponente
   */
  render() {
    /**
     * Destrukturierung der Props mit Standardwerten
     */
    const { 
      position = null,
      locationType = '',
      mapCenter = [51.1657, 10.4515], // Deutschland Zentrum
      mapZoom = 6,
      showRadius = true,
      height = '500px'
    } = this.props;

    // Debug-Log für Entwicklungszwecke
    console.log('MapComponent Props:', { position, locationType, mapCenter, mapZoom });

    return (
      <div className="map-container">
        {/**
         * MapContainer - Hauptcontainer der Leaflet Karte
         * 
         * @see https://react-leaflet.js.org/docs/api-components/#mapcontainer
         */}
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: height, width: '100%' }}
          zoomControl={true}
          whenCreated={(mapInstance) => {
            /**
             * Callback wenn die Karte erstellt wurde
             * Speichert die Map-Instanz für spätere Verwendung
             */
            this.mapInstance = mapInstance;
          }}
        >
          {/**
           * MapController für dynamische Kartensteuerung
           */}
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {/**
           * TileLayer für OpenStreetMap Kartenkacheln
           * 
           * @see https://react-leaflet.js.org/docs/api-components/#tilelayer
           */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/**
           * Marker für die aktuelle Position
           * Wird nur gerendert wenn eine Position vorhanden ist
           */}
          {position && (
            <Marker 
              position={[position.lat, position.lon]}
              icon={createCustomIcon(locationType)}
            >
              {/**
               * Popup mit Informationen zur Position
               * 
               * @see https://react-leaflet.js.org/docs/api-components/#popup
               */}
              <Popup>
                <div>
                  <strong>Position:</strong><br />
                  {position.lat.toFixed(6)}, {position.lon.toFixed(6)}<br />
                  <strong>Status:</strong> {locationType}<br />
                  <strong>Zoom:</strong> {mapZoom}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/**
           * Kreis zur Visualisierung des Suchradius
           * Wird nur gerendert wenn eine Position vorhanden und showRadius true ist
           * 
           * @see https://react-leaflet.js.org/docs/api-components/#circle
           */}
          {position && showRadius && (
            <Circle
              center={[position.lat, position.lon]}
              radius={1000} // 1km Radius in Metern
              color={locationType.includes('Wasser') ? '#3182ce' : 
                     locationType.includes('Land') ? '#38a169' : '#e53e3e'}
              fillColor={locationType.includes('Wasser') ? '#3182ce' : 
                         locationType.includes('Land') ? '#38a169' : '#e53e3e'}
              fillOpacity={0.1}
              weight={2}
            />
          )}
        </MapContainer>
        
        {/**
         * Legende zur Erklärung der Marker-Farben
         */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color wasser" style={{backgroundColor: '#3182ce'}}></div>
            <span>Wasser</span>
          </div>
          <div className="legend-item">
            <div className="legend-color land" style={{backgroundColor: '#38a169'}}></div>
            <span>Land</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unbekannt" style={{backgroundColor: '#e53e3e'}}></div>
            <span>Unbekannt</span>
          </div>
        </div>
      </div>
    );
  }
}

export default MapComponent;
