import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Leaflet Marker Icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Komponente zur Kartensteuerung
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.5
    });
  }, [map, center, zoom]);
  
  return null;
}

// WaterLandChecker Klasse (unverändert)
class WaterLandChecker {
  constructor() {
    this.cache = new Map();
    this.overpassEndpoint = 'https://overpass-api.de/api/interpreter';
  }

  async checkPosition(lat, lon) {
    const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    console.log(`Prüfe Position: ${lat}, ${lon}`);

    const directResult = await this.checkDirectFeatures(lat, lon);
    if (directResult !== "Unbekannt") {
      this.cache.set(cacheKey, directResult);
      return directResult;
    }

    const coastlineResult = await this.checkWithCoastline(lat, lon);
    if (coastlineResult !== "Unbekannt") {
      this.cache.set(cacheKey, coastlineResult);
      return coastlineResult;
    }

    const fallbackResult = this.finalFallback(lat, lon);
    this.cache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  async checkDirectFeatures(lat, lon) {
    const query = `
      [out:json][timeout:25];
      (
        way["natural"="water"]["water"~"lake|pond|basin|reservoir"](around:500,${lat},${lon});
        way["waterway"~"river|canal|stream"](around:300,${lat},${lon});
        node["natural"="water"](around:200,${lat},${lon});
        
        way["building"](around:150,${lat},${lon});
        node["building"](around:100,${lat},${lon});
        way["highway"~"motorway|trunk|primary|secondary"](around:200,${lat},${lon});
        way["landuse"~"residential|commercial|industrial"](around:300,${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
    
    try {
      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query)
      });
      
      const data = await response.json();
      const elements = data.elements || [];
      
      const waterFeatures = elements.filter(el => 
        el.tags?.natural === 'water' || 
        el.tags?.waterway
      );

      const landFeatures = elements.filter(el => 
        el.tags?.building || 
        el.tags?.highway ||
        el.tags?.landuse
      );

      if (landFeatures.length > 0 && waterFeatures.length === 0) {
        return "Land";
      }
      
      if (waterFeatures.length > 0 && landFeatures.length === 0) {
        return "Wasser";
      }

      return "Unbekannt";
      
    } catch (error) {
      console.error('Direkte Features Fehler:', error);
      return "Unbekannt";
    }
  }

  async checkWithCoastline(lat, lon) {
    const coastlineQuery = `
      [out:json][timeout:30];
      (
        way["natural"="coastline"](around:50000,${lat},${lon});
        relation["natural"="water"](around:100000,${lat},${lon});
        relation["place"="sea"](around:100000,${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
    
    try {
      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(coastlineQuery)
      });
      
      const data = await response.json();
      const elements = data.elements || [];
      
      const coastlines = elements.filter(el => el.tags?.natural === 'coastline');
      const waterRelations = elements.filter(el => 
        el.type === 'relation' && (
          el.tags?.natural === 'water' || 
          el.tags?.place === 'sea'
        )
      );

      if (coastlines.length > 0) {
        const distanceToLand = this.estimateDistanceToLand(lat, lon);
        if (distanceToLand > 10) {
          return "Wasser (Meer)";
        }
        return "Wasser (Küstengewässer)";
      }

      if (waterRelations.length > 0) {
        return "Wasser (Großes Gewässer)";
      }

      return "Unbekannt";
      
    } catch (error) {
      console.error('Coastline Check Fehler:', error);
      return "Unbekannt";
    }
  }

  estimateDistanceToLand(lat, lon) {
    const knownCoasts = [
      { lat: 54.1833, lon: 7.8833 },
      { lat: 53.6333, lon: 9.9833 },
      { lat: 54.4667, lon: 10.2000 },
    ];
    
    let minDistance = Number.MAX_VALUE;
    knownCoasts.forEach(coast => {
      const distance = this.calculateDistance(lat, lon, coast.lat, coast.lon);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });
    
    return minDistance;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  finalFallback(lat, lon) {
    const knownWaterAreas = [
      { minLat: 53.0, maxLat: 57.0, minLon: 3.0, maxLon: 9.0, name: "Nordsee" },
      { minLat: 57.0, maxLat: 62.0, minLon: 1.0, maxLon: 8.0, name: "Nördliche Nordsee" },
      { minLat: 53.5, maxLat: 55.0, minLon: 10.0, maxLon: 14.0, name: "Westliche Ostsee" },
      { minLat: 55.0, maxLat: 56.5, minLon: 12.0, maxLon: 16.0, name: "Zentrale Ostsee" },
      { minLat: 56.5, maxLat: 59.0, minLon: 15.0, maxLon: 20.0, name: "Nördliche Ostsee" },
      { minLat: 54.0, maxLat: 56.0, minLon: 14.0, maxLon: 19.0, name: "Östliche Ostsee" },
      { minLat: 40.0, maxLat: 50.0, minLon: -30.0, maxLon: -10.0, name: "Atlantik" },
      { minLat: 50.0, maxLat: 60.0, minLon: -25.0, maxLon: -5.0, name: "Nördlicher Atlantik" },
      { minLat: 35.0, maxLat: 40.0, minLon: 10.0, maxLon: 20.0, name: "Mittelmeer" },
      { minLat: 40.0, maxLat: 45.0, minLon: 5.0, maxLon: 15.0, name: "Nördliches Mittelmeer" },
      { minLat: 50.7, maxLat: 51.0, minLon: 6.7, maxLon: 7.0, name: "Rhein (Niederlande)" },
      { minLat: 51.0, maxLat: 51.5, minLon: 6.5, maxLon: 7.2, name: "Rhein (NRW)" },
      { minLat: 51.5, maxLat: 52.0, minLon: 6.8, maxLon: 7.8, name: "Rhein (Mittelrhein)" },
      { minLat: 49.5, maxLat: 50.5, minLon: 7.5, maxLon: 8.5, name: "Rhein (Oberrhein)" },
    ];

    const knownLandAreas = [
      { minLat: 47.0, maxLat: 55.0, minLon: 5.0, maxLon: 15.0, name: "Deutschland" },
      { minLat: 52.30, maxLat: 52.70, minLon: 13.00, maxLon: 13.80, name: "Berlin" },
      { minLat: 52.40, maxLat: 52.55, minLon: 13.25, maxLon: 13.55, name: "Berlin Zentrum" },
      { minLat: 53.0, maxLat: 54.0, minLon: 9.0, maxLon: 11.0, name: "Hamburg Region" },
      { minLat: 50.8, maxLat: 51.2, minLon: 6.8, maxLon: 7.2, name: "Köln Region" },
      { minLat: 48.0, maxLat: 48.3, minLon: 11.3, maxLon: 11.8, name: "München Region" },
      { minLat: 55.0, maxLat: 70.0, minLon: 10.0, maxLon: 30.0, name: "Skandinavien" },
      { minLat: 42.0, maxLat: 51.0, minLon: -5.0, maxLon: 8.0, name: "Frankreich" },
      { minLat: 50.0, maxLat: 59.0, minLon: -8.0, maxLon: 2.0, name: "Großbritannien" },
    ];

    for (const water of knownWaterAreas) {
      if (lat >= water.minLat && lat <= water.maxLat && 
          lon >= water.minLon && lon <= water.maxLon) {
        return `Wasser (${water.name})`;
      }
    }

    for (const land of knownLandAreas) {
      if (lat >= land.minLat && lat <= land.maxLat && 
          lon >= land.minLon && lon <= land.maxLon) {
        return `Land (${land.name})`;
      }
    }

    if ((lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) ||
        (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -60) ||
        (lat >= -35 && lat <= 35 && lon >= 110 && lon <= 155)) {
      return "Land (Kontinent)";
    }

    return "Wasser (Ozean)";
  }
}

// Custom Icons für die Karte
const createCustomIcon = (type) => {
  const color = type.includes('Wasser') ? '#3182ce' : 
                type.includes('Land') ? '#38a169' : 
                '#e53e3e';
  
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

// React Komponente
function App() {
  const [position, setPosition] = useState(null);
  const [locationType, setLocationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualCoords, setManualCoords] = useState({ lat: '', lon: '' });
  const [mapCenter, setMapCenter] = useState([51.1657, 10.4515]); // Deutschland Zentrum
  const [mapZoom, setMapZoom] = useState(6);

  const checker = new WaterLandChecker();

  const testPositions = [
    { name: "Nordsee (offen)", lat: 54.8000, lon: 5.5000, zoom: 8 },
    { name: "Ostsee (westlich)", lat: 54.5000, lon: 11.5000, zoom: 8 },
    { name: "Ostsee (zentral)", lat: 55.8000, lon: 14.5000, zoom: 8 },
    { name: "Ostsee (nördlich)", lat: 57.8000, lon: 17.5000, zoom: 7 },
    { name: "Rhein (Köln)", lat: 50.9355, lon: 6.9611, zoom: 12 },
    { name: "Berlin Mitte", lat: 52.5200, lon: 13.4050, zoom: 12 },
    { name: "Berlin Brandenburger Tor", lat: 52.5163, lon: 13.3777, zoom: 15 },
    { name: "Atlantik (offen)", lat: 47.0000, lon: -20.0000, zoom: 5 },
    { name: "Bodensee Mitte", lat: 47.6000, lon: 9.4000, zoom: 10 },
    { name: "Mittelmeer", lat: 39.0000, lon: 15.0000, zoom: 6 },
    { name: "Mittelmeer (Nizza / Cap-Ferrat)", lat: 43.6784503207141, lon: 7.31008081353319, zoom: 13 }
  ];

  // Bestimme optimalen Zoom-Level basierend auf Positionstyp
  const getOptimalZoom = (lat, lon, locationType, positionName = '') => {
    // Für Städte und spezifische Orte: hoher Zoom
    if (positionName.includes('Berlin') || positionName.includes('Brandenburger')) {
      return 15;
    }
    if (positionName.includes('Rhein') || positionName.includes('Köln')) {
      return 12;
    }
    
    // Für Seen: mittlerer Zoom
    if (positionName.includes('Bodensee')) {
      return 10;
    }
    
    // Für Meere in der Nähe: niedriger Zoom
    if (positionName.includes('Nordsee') || positionName.includes('Ostsee')) {
      return 8;
    }
    
    // Für Ozeane: sehr niedriger Zoom
    if (positionName.includes('Atlantik') || positionName.includes('Mittelmeer')) {
      return 5;
    }
    
    // Fallback basierend auf Location Type
    if (locationType.includes('Land') && !locationType.includes('Kontinent')) {
      return 12;
    }
    if (locationType.includes('Wasser') && locationType.includes('Meer')) {
      return 7;
    }
    if (locationType.includes('Wasser') && locationType.includes('Ozean')) {
      return 4;
    }
    
    // Standard für unbekannte Positionen
    return 8;
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation wird von diesem Browser nicht unterstützt.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setPosition({ lat, lon });
        const result = await checkLocationType(lat, lon);
        
        // Nachdem wir den Location Type haben, Zoom anpassen
        const optimalZoom = getOptimalZoom(lat, lon, result, 'Aktuelle Position');
        setMapCenter([lat, lon]);
        setMapZoom(optimalZoom);
      },
      (error) => {
        setError(`Fehler bei der Standortermittlung: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const checkManualLocation = async () => {
    const lat = parseFloat(manualCoords.lat);
    const lon = parseFloat(manualCoords.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      setError('Bitte gültige Koordinaten eingeben.');
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Ungültige Koordinaten: Lat (-90 bis 90), Lon (-180 bis 180)');
      return;
    }
    
    setPosition({ lat, lon });
    const result = await checkLocationType(lat, lon);
    
    const optimalZoom = getOptimalZoom(lat, lon, result, 'Manuelle Position');
    setMapCenter([lat, lon]);
    setMapZoom(optimalZoom);
  };

  const checkLocationType = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await checker.checkPosition(lat, lon);
      setLocationType(result);
      return result;
    } catch (err) {
      setError(`Fehler bei der Überprüfung: ${err.message}`);
      return "Unbekannt";
    } finally {
      setLoading(false);
    }
  };

  const testLocation = async (pos) => {
    setManualCoords({ lat: pos.lat.toString(), lon: pos.lon.toString() });
    setPosition({ lat: pos.lat, lon: pos.lon });
    setMapCenter([pos.lat, pos.lon]);
    setMapZoom(pos.zoom);
    await checkLocationType(pos.lat, pos.lon);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌊 Land/Wasser Erkennung 🗺️</h1>
        <p>Ermittle ob sich eine Position auf Land oder Wasser befindet</p>
      </header>

      <div className="container">
        <div className="content-wrapper">
          {/* Steuerungsbereich */}
          <div className="control-panel">
            <section className="section">
              <h2>Aktuelle Position</h2>
              <button 
                onClick={getCurrentLocation}
                disabled={loading}
                className="btn primary"
              >
                {loading ? 'Prüfe...' : '📍 Aktuelle Position prüfen'}
              </button>
            </section>

            <section className="section">
              <h2>Manuelle Koordinaten</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Breitengrad (Lat)"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords(prev => ({
                    ...prev,
                    lat: e.target.value
                  }))}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Längengrad (Lon)"
                  value={manualCoords.lon}
                  onChange={(e) => setManualCoords(prev => ({
                    ...prev,
                    lon: e.target.value
                  }))}
                  className="input"
                />
                <button 
                  onClick={checkManualLocation}
                  disabled={loading}
                  className="btn secondary"
                >
                  Prüfen
                </button>
              </div>
            </section>

            <section className="section">
              <h2>Test-Positionen</h2>
              <div className="test-buttons">
                {testPositions.map((pos, index) => (
                  <button
                    key={index}
                    onClick={() => testLocation(pos)}
                    disabled={loading}
                    className="btn test"
                    title={`Zoom: ${pos.zoom}`}
                  >
                    {pos.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Ergebnis</h2>
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Prüfe Position...</p>
                </div>
              )}
              
              {error && (
                <div className="error">
                  <p>{error}</p>
                </div>
              )}
              
              {position && !loading && (
                <div className="result">
                  <div className="coordinates">
                    <strong>Position:</strong> {position.lat.toFixed(6)}, {position.lon.toFixed(6)}
                  </div>
                  <div className="map-info">
                    <strong>Kartenzoom:</strong> {mapZoom}
                  </div>
                  <div className={`location-type ${locationType.toLowerCase().includes('wasser') ? 'wasser' : 
                                 locationType.toLowerCase().includes('land') ? 'land' : 'unbekannt'}`}>
                    <strong>Befindet sich:</strong> {locationType}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Kartenbereich */}
          <div className="map-panel">
            <section className="section">
              <h2>Kartenansicht</h2>
              <div className="map-container">
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ height: '500px', width: '100%' }}
                  zoomControl={true}
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
                  {position && (
                    <Circle
                      center={[position.lat, position.lon]}
                      radius={1000} // 1km Radius
                      color={locationType.includes('Wasser') ? '#3182ce' : '#38a169'}
                      fillColor={locationType.includes('Wasser') ? '#3182ce' : '#38a169'}
                      fillOpacity={0.1}
                    />
                  )}
                </MapContainer>
              </div>
              
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-color wasser"></div>
                  <span>Wasser</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color land"></div>
                  <span>Land</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color unbekannt"></div>
                  <span>Unbekannt</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="section info">
          <h3>Info</h3>
          <p>Die Karte zoomt automatisch auf die optimale Zoom-Stufe für jede Position:</p>
          <ul>
            <li><strong>Städte:</strong> Zoom 12-15 (detaillierte Ansicht)</li>
            <li><strong>Seen/Flüsse:</strong> Zoom 8-12 (regionale Ansicht)</li>
            <li><strong>Meere:</strong> Zoom 6-8 (weite Sicht)</li>
            <li><strong>Ozeane:</strong> Zoom 4-6 (globale Sicht)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;
