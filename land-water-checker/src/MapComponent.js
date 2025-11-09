// Parameter für MapComponent:
// position: { lat, lon } - Die anzuzeigende Position
// locationType: string - Land/Wasser Status für Marker-Farbe
// mapCenter: [lat, lon] - Karten-Zentrum
// mapZoom: number - Zoom-Level
// showRadius: boolean - Ob Radius-Kreis angezeigt wird
// height: string - Höhe der Karte (z.B. '500px')

import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Marker Icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons für die Karte mit korrekten Farben
const createCustomIcon = (locationType) => {
  let color;
  if (locationType.includes('Wasser')) {
    color = '#3182ce'; // Blau für Wasser
  } else if (locationType.includes('Land')) {
    color = '#38a169'; // Grün für Land
  } else {
    color = '#e53e3e'; // Rot für Unbekannt
  }
  
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

// Komponente zur Kartensteuerung mit useMap Hook
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [map, center, zoom]);
  
  return null;
};

// Haupt Map Komponente
class MapComponent extends Component {
  shouldComponentUpdate(nextProps) {
    // Nur neu rendern wenn sich wichtige Props ändern
    return (
      nextProps.position !== this.props.position ||
      nextProps.locationType !== this.props.locationType ||
      nextProps.mapCenter !== this.props.mapCenter ||
      nextProps.mapZoom !== this.props.mapZoom
    );
  }

  render() {
    const { 
      position = null,
      locationType = '',
      mapCenter = [51.1657, 10.4515],
      mapZoom = 6,
      showRadius = true,
      height = '500px'
    } = this.props;

    console.log('MapComponent Props:', { position, locationType, mapCenter, mapZoom });

    return (
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: height, width: '100%' }}
          zoomControl={true}
          whenCreated={(mapInstance) => {
            // Setze die Map-Instanz für spätere Updates
            this.mapInstance = mapInstance;
          }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Aktuelle Position Marker */}
          {position && (
            <Marker 
              position={[position.lat, position.lon]}
              icon={createCustomIcon(locationType)}
            >
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
          
          {/* Suchradius anzeigen */}
          {position && showRadius && (
            <Circle
              center={[position.lat, position.lon]}
              radius={1000} // 1km Radius
              color={locationType.includes('Wasser') ? '#3182ce' : 
                     locationType.includes('Land') ? '#38a169' : '#e53e3e'}
              fillColor={locationType.includes('Wasser') ? '#3182ce' : 
                         locationType.includes('Land') ? '#38a169' : '#e53e3e'}
              fillOpacity={0.1}
              weight={2}
            />
          )}
        </MapContainer>
        
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
