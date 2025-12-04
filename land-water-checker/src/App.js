import React, { Component } from 'react';
import MapComponent from './MapComponent';
import WaterLandChecker from './WaterLandChecker';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      position: null,
      locationType: '',
      loading: false,
      error: '',
      manualCoords: { lat: '', lon: '' },
      mapCenter: [51.1657, 10.4515],
      mapZoom: 6
    };
    
    this.checker = new WaterLandChecker();
    
    this.testPositions = [
      { name: "Nordsee (offen)", lat: 54.8000, lon: 5.5000, zoom: 8 },
      { name: "Ostsee (westlich)", lat: 54.5000, lon: 11.5000, zoom: 8 },
      { name: "Ostsee (zentral)", lat: 55.8000, lon: 14.5000, zoom: 8 },
      { name: "Ostsee (nördlich)", lat: 57.8000, lon: 17.5000, zoom: 7 },
      { name: "Rhein (Köln)", lat: 50.93552, lon: 6.96620, zoom: 12 },
      { name: "Berlin Mitte", lat: 52.5200, lon: 13.4050, zoom: 12 },
      { name: "Berlin Brandenburger Tor", lat: 52.5163, lon: 13.3777, zoom: 15 },
      { name: "Atlantik (offen)", lat: 47.0000, lon: -20.0000, zoom: 5 },
      { name: "Bodensee Mitte", lat: 47.6000, lon: 9.4000, zoom: 10 },
      { name: "Mittelmeer", lat: 39.0000, lon: 15.0000, zoom: 6 },
      { name: "Mittelmeer (Nizza / Cap-Ferrat)", lat: 43.6784503207141, lon: 7.31008081353319, zoom: 13 }
    ];
  }

  getOptimalZoom = (lat, lon, locationType, positionName = '') => {
    if (positionName.includes('Berlin') || positionName.includes('Brandenburger')) {
      return 15;
    }
    if (positionName.includes('Rhein') || positionName.includes('Köln')) {
      return 12;
    }
    if (positionName.includes('Bodensee')) {
      return 10;
    }
    if (positionName.includes('Nordsee') || positionName.includes('Ostsee')) {
      return 8;
    }
    if (positionName.includes('Atlantik') || positionName.includes('Mittelmeer')) {
      return 5;
    }
    if (locationType.includes('Land') && !locationType.includes('Kontinent')) {
      return 12;
    }
    if (locationType.includes('Wasser') && locationType.includes('Meer')) {
      return 7;
    }
    if (locationType.includes('Wasser') && locationType.includes('Ozean')) {
      return 4;
    }
    return 8;
  };

  // In der getCurrentLocation Methode:
  getCurrentLocation = () => {
    this.setState({ loading: true, error: '' });
    
    if (!navigator.geolocation) {
      this.setState({ 
        error: 'Geolocation wird von diesem Browser nicht unterstützt.',
        loading: false 
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // ZUERST Center und Zoom setzen, DANN Position und Type
        const optimalZoom = this.getOptimalZoom(lat, lon, '', 'Aktuelle Position');
        this.setState({ 
          mapCenter: [lat, lon],
          mapZoom: optimalZoom,
          position: { lat, lon }
        });
        
        // Dann den Location Type prüfen
        await this.checkLocationType(lat, lon);
      },
      (error) => {
        this.setState({ 
          error: `Fehler bei der Standortermittlung: ${error.message}`,
          loading: false 
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // In der checkManualLocation Methode:
  checkManualLocation = async () => {
    const { manualCoords } = this.state;
    const lat = parseFloat(manualCoords.lat);
    const lon = parseFloat(manualCoords.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      this.setState({ error: 'Bitte gültige Koordinaten eingeben.' });
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      this.setState({ error: 'Ungültige Koordinaten: Lat (-90 bis 90), Lon (-180 bis 180)' });
      return;
    }
    
    // ZUERST Center und Zoom setzen, DANN Position und Type
    const optimalZoom = this.getOptimalZoom(lat, lon, '', 'Manuelle Position');
    this.setState({ 
      mapCenter: [lat, lon],
      mapZoom: optimalZoom,
      position: { lat, lon }
    });
    
    // Dann den Location Type prüfen
    await this.checkLocationType(lat, lon);
  };

  checkLocationType = async (lat, lon) => {
    this.setState({ loading: true, error: '' });
    
    try {
      const result = await this.checker.checkPosition(lat, lon);
      this.setState({ locationType: result });
      return result;
    } catch (err) {
      this.setState({ error: `Fehler bei der Überprüfung: ${err.message}` });
      return "Unbekannt";
    } finally {
      this.setState({ loading: false });
    }
  };

  // In der testLocation Methode:
  testLocation = async (pos) => {
    this.setState({ 
      manualCoords: { lat: pos.lat.toString(), lon: pos.lon.toString() },
      position: { lat: pos.lat, lon: pos.lon },
      mapCenter: [pos.lat, pos.lon],
      mapZoom: pos.zoom
    });
    await this.checkLocationType(pos.lat, pos.lon);
  };

  handleInputChange = (field, value) => {
    this.setState(prevState => ({
      manualCoords: {
        ...prevState.manualCoords,
        [field]: value
      }
    }));
  };

  render() {
    const { 
      position, 
      locationType, 
      loading, 
      error, 
      manualCoords, 
      mapCenter, 
      mapZoom 
    } = this.state;

    // Das aktuelle Jahr abrufen
    const currentYear = new Date().getFullYear();

    return (
      <div className="App">
        <header className="App-header">
          <h1>Land/Wasser Erkennung</h1>
          <p>Ermittle ob sich eine Geo-Position auf Land oder Wasser befindet</p>
        </header>

        <div className="container">
          <div className="content-wrapper">
            {/* Steuerungsbereich */}
            <div className="control-panel">
              <section className="section">
                <h2>Aktuelle Position</h2>
                <button 
                  onClick={this.getCurrentLocation}
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
                    onChange={(e) => this.handleInputChange('lat', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Längengrad (Lon)"
                    value={manualCoords.lon}
                    onChange={(e) => this.handleInputChange('lon', e.target.value)}
                    className="input"
                  />
                  <button 
                    onClick={this.checkManualLocation}
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
                  {this.testPositions.map((pos, index) => (
                    <button
                      key={index}
                      onClick={() => this.testLocation(pos)}
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
                <MapComponent
                  position={position}
                  locationType={locationType}
                  mapCenter={mapCenter}
                  mapZoom={mapZoom}
                  showRadius={true}
                  height="500px"
                />
              </section>
            </div>
          </div>

          <section className="section info">
            <h3>Info</h3>
            <p>Die Karte zoomt automatisch auf die optimale Zoom-Stufe für jede Position:</p>
            <div className="info-list-container">
              <ul className="centered-list">
                <li><strong>Städte:</strong> Zoom 12-15 (detaillierte Ansicht)</li>
                <li><strong>Seen/Flüsse:</strong> Zoom 8-12 (regionale Ansicht)</li>
                <li><strong>Meere:</strong> Zoom 6-8 (weite Sicht)</li>
                <li><strong>Ozeane:</strong> Zoom 4-6 (globale Sicht)</li>
              </ul>
            </div>
          </section>

          <footer style={{padding: '15px', textalign: 'center', fontsize: '0.85em', color: 'rgba(189, 222, 255, 1)'}}>
            <p class="footer-text">
                <span style={{verticalalign: 'middle'}}>
                    Land oder Wasser Erkennung | Unter Verwendung von OpenStreetMap & Leaflet<br /> 
                    Copyright © {currentYear} Friedhelm Koch | Lizenz:&nbsp; 
                    <a 
                      href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                      target="_blank"
                      rel="noopener noreferrer" // WICHTIG: Sollte bei target="_blank" verwendet werden!
                      style={{ color: 'rgba(233, 242, 250, 1)' }}
                    >
                      CC BY-NC-SA 4.0
                    </a>
                </span>
            </p>
          </footer>

        </div>
      </div>
    );
  }
}

export default App;
