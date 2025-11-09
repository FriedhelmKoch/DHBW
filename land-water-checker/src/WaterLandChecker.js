/**
 * WaterLandChecker - Service-Klasse zur Erkennung von Land- und Wasserpositionen
 * 
 * Diese Klasse verwendet die Overpass API von OpenStreetMap, um zu bestimmen,
 * ob sich eine gegebene Koordinate auf Land oder Wasser befindet.
 * 
 * Links für weitere Informationen:
 * OpenStreetMap: https://www.openstreetmap.org
 * Overpass API Dokumentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 * OSM Map Features: https://wiki.openstreetmap.org/wiki/Map_Features
 * OSM Tags für Gewässer: https://wiki.openstreetmap.org/wiki/Waterways
 * Haversine Formel: https://en.wikipedia.org/wiki/Haversine_formula
 * 
 * @class
 * @version 1.0
 * @description Ermittelt anhand von OSM-Daten den Typ einer Position (Land/Wasser)
 */
class WaterLandChecker {
  /**
   * Konstruktor für den WaterLandChecker
   * Initialisiert den Cache und setzt den Overpass API Endpoint
   */
  constructor() {
    /**
     * @private
     * @type {Map<string, string>}
     * Cache für bereits geprüfte Positionen zur Performance-Optimierung
     * Schlüssel: "lat,lon" als String
     * Wert: "Land" oder "Wasser"
     */
    this.cache = new Map();
    
    /**
     * @private
     * @type {string}
     * Overpass API Endpoint URL
     * Overpass ist eine read-only API für OpenStreetMap-Daten
     */
    this.overpassEndpoint = 'https://overpass-api.de/api/interpreter';
  }

  /**
   * Hauptmethode zur Überprüfung einer Position
   * Führt eine mehrstufige Prüfung durch und verwendet Cache für Performance
   * 
   * @param {number} lat - Breitengrad der Position (-90 bis 90)
   * @param {number} lon - Längengrad der Position (-180 bis 180)
   * @returns {Promise<string>} Promise das zu "Land", "Wasser" oder "Unbekannt" aufgelöst wird
   * 
   * @example
   * const checker = new WaterLandChecker();
   * const result = await checker.checkPosition(52.5200, 13.4050);
   * console.log(result); // "Land (Berlin)"
   */
  async checkPosition(lat, lon) {
    // Cache-Schlüssel aus Koordinaten erstellen
    const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    
    // Cache-Check: Wenn Position bereits geprüft wurde, Ergebnis zurückgeben
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    console.log(`Prüfe Position: ${lat}, ${lon}`);

    // SCHRITT 1: Prüfe auf bekannte Land-Positionen (hat Priorität)
    const knownLandCheck = this.checkKnownLandPositions(lat, lon);
    if (knownLandCheck) {
      this.cache.set(cacheKey, knownLandCheck);
      return knownLandCheck;
    }

    // SCHRITT 2: Prüfe direkte OSM-Features in der Nähe
    const directResult = await this.checkDirectFeatures(lat, lon);
    if (directResult !== "Unbekannt") {
      this.cache.set(cacheKey, directResult);
      return directResult;
    }

    // SCHRITT 3: Prüfe auf Küstenlinien und große Gewässer
    const coastlineResult = await this.checkWithCoastline(lat, lon);
    if (coastlineResult !== "Unbekannt") {
      this.cache.set(cacheKey, coastlineResult);
      return coastlineResult;
    }

    // SCHRITT 4: Finaler Fallback mit geografischer Heuristik
    const fallbackResult = this.finalFallback(lat, lon);
    this.cache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Prüft auf spezifische bekannte Land-Positionen
   * Diese haben Priorität vor API-Abfragen für Performance
   * 
   * @private
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @returns {string|null} "Land (PositionName)" oder null wenn nicht gefunden
   */
  checkKnownLandPositions(lat, lon) {
    /**
     * @private
     * @type {Array<Object>}
     * Liste von bekannten Land-Positionen mit exakten Koordinatenbereichen
     * Struktur: { minLat, maxLat, minLon, maxLon, name }
     */
    const specificLandPositions = [
      // Berlin Mitte - sehr genau definiert
      { 
        minLat: 52.5100, maxLat: 52.5300, 
        minLon: 13.3700, maxLon: 13.4200, 
        name: "Berlin Mitte" 
      },
      // Brandenburger Tor - noch genauer
      { 
        minLat: 52.5150, maxLat: 52.5175, 
        minLon: 13.3750, maxLon: 13.3800, 
        name: "Brandenburger Tor" 
      },
      // Berlin allgemein
      { 
        minLat: 52.3000, maxLat: 52.7000, 
        minLon: 13.0000, maxLon: 13.8000, 
        name: "Berlin" 
      },
      // Köln Dom
      { 
        minLat: 50.9400, maxLat: 50.9420, 
        minLon: 6.9570, maxLon: 6.9590, 
        name: "Köln Dom" 
      },
      // München Zentrum
      { 
        minLat: 48.1350, maxLat: 48.1400, 
        minLon: 11.5700, maxLon: 11.5800, 
        name: "München Zentrum" 
      },
      // Hamburg Rathaus
      { 
        minLat: 53.5500, maxLat: 53.5520, 
        minLon: 9.9900, maxLon: 10.0000, 
        name: "Hamburg Rathaus" 
      }
    ];

    // Durchsuche alle bekannten Land-Positionen
    for (const land of specificLandPositions) {
      if (lat >= land.minLat && lat <= land.maxLat && 
          lon >= land.minLon && lon <= land.maxLon) {
        return `Land (${land.name})`;
      }
    }

    return null;
  }

  /**
   * Prüft direkte OSM-Features in der Umgebung der Position
   * Verwendet Overpass API um nahegelegene Land- und Wasser-Features zu finden
   * 
   * @private
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @returns {Promise<string>} "Land", "Wasser" oder "Unbekannt"
   * 
   * @see https://wiki.openstreetmap.org/wiki/Overpass_API
   * @see https://wiki.openstreetmap.org/wiki/Map_Features
   */
  async checkDirectFeatures(lat, lon) {
    /**
     * Overpass QL (Query Language) Abfrage
     * Syntax: [out:json] - Ausgabeformat JSON
     * [timeout:25] - Timeout in Sekunden
     * 
     * Die Abfrage sucht nach:
     * - Wasser-Features: natural=water, waterway=*
     * - Land-Features: buildings, highways, landuse
     * 
     * around:radius,lat,lon - Suchradius in Metern
     * out body; >; out skel qt; - Ausgabeformatierung
     */
    const query = `
      [out:json][timeout:25];
      (
        // WASSER-FEATURES:
        // Stehende Gewässer (Seen, Teiche, etc.)
        way["natural"="water"]["water"~"lake|pond|basin|reservoir"](around:500,${lat},${lon});
        // Fließgewässer (Flüsse, Kanäle, Bäche)
        way["waterway"~"river|canal|stream"](around:300,${lat},${lon});
        // Wasser-Punkte (Quellen, etc.)
        node["natural"="water"](around:200,${lat},${lon});
        
        // LAND-FEATURES:
        // Gebäude (starker Hinweis auf Land)
        way["building"](around:150,${lat},${lon});
        node["building"](around:100,${lat},${lon});
        // Hauptverkehrsstraßen
        way["highway"~"motorway|trunk|primary|secondary"](around:200,${lat},${lon});
        // Landnutzung (Wohngebiete, Gewerbe, etc.)
        way["landuse"~"residential|commercial|industrial"](around:300,${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
    
    try {
      // Overpass API Request
      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'data=' + encodeURIComponent(query)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const elements = data.elements || [];
      
      // Filtere Wasser-Features aus den Ergebnissen
      const waterFeatures = elements.filter(el => 
        el.tags?.natural === 'water' || 
        el.tags?.waterway
      );

      // Filtere Land-Features aus den Ergebnissen
      const landFeatures = elements.filter(el => 
        el.tags?.building || 
        el.tags?.highway ||
        el.tags?.landuse
      );

      console.log(`Direkte Features - Wasser: ${waterFeatures.length}, Land: ${landFeatures.length}`);

      // Entscheidungslogik basierend auf gefundenen Features
      if (landFeatures.length > 0 && waterFeatures.length === 0) {
        return "Land";
      }
      
      if (waterFeatures.length > 0 && landFeatures.length === 0) {
        return "Wasser";
      }

      return "Unbekannt";
      
    } catch (error) {
      console.error('Overpass API Fehler bei direkten Features:', error);
      return "Unbekannt";
    }
  }

  /**
   * Prüft auf Küstenlinien und große Gewässer in weiterem Radius
   * Für Positionen auf offenem Meer oder in Küstennähe
   * 
   * @private
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @returns {Promise<string>} "Wasser (Meer)", "Wasser (Küstengewässer)" oder "Unbekannt"
   */
  async checkWithCoastline(lat, lon) {
    /**
     * Overpass QL Abfrage für große Gewässer und Küsten
     * Größere Radien (50km, 100km) für Meere und Ozeane
     */
    const coastlineQuery = `
      [out:json][timeout:30];
      (
        // Küstenlinien - definieren die Grenze zwischen Land und Meer
        way["natural"="coastline"](around:50000,${lat},${lon});
        
        // Große Wasser-Relationen (Seen, Meere)
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'data=' + encodeURIComponent(coastlineQuery)
      });
      
      const data = await response.json();
      const elements = data.elements || [];
      
      // Küstenlinien finden
      const coastlines = elements.filter(el => el.tags?.natural === 'coastline');
      
      // Große Wasser-Relationen finden
      const waterRelations = elements.filter(el => 
        el.type === 'relation' && (
          el.tags?.natural === 'water' || 
          el.tags?.place === 'sea'
        )
      );

      console.log(`Coastline Check - Küsten: ${coastlines.length}, Wasser-Relationen: ${waterRelations.length}`);

      // Wenn Küstenlinien gefunden wurden
      if (coastlines.length > 0) {
        const distanceToLand = this.estimateDistanceToLand(lat, lon);
        // Wenn weit von Küste entfernt, wahrscheinlich offenes Meer
        if (distanceToLand > 10) {
          return "Wasser (Meer)";
        }
        return "Wasser (Küstengewässer)";
      }

      // Wenn große Wasser-Relationen gefunden wurden
      if (waterRelations.length > 0) {
        return "Wasser (Großes Gewässer)";
      }

      return "Unbekannt";
      
    } catch (error) {
      console.error('Overpass API Fehler bei Coastline Check:', error);
      return "Unbekannt";
    }
  }

  /**
   * Schätzt die Entfernung zur nächsten bekannten Küste
   * Vereinfachte Berechnung für europäische Gewässer
   * 
   * @private
   * @param {number} lat - Breitengrad der aktuellen Position
   * @param {number} lon - Längengrad der aktuellen Position
   * @returns {number} Entfernung in Kilometern
   */
  estimateDistanceToLand(lat, lon) {
    // Bekannte Küsten-Punkte in Nord- und Ostsee
    const knownCoasts = [
      { lat: 54.1833, lon: 7.8833 }, // Helgoland
      { lat: 53.6333, lon: 9.9833 }, // Cuxhaven
      { lat: 54.4667, lon: 10.2000 }, // Kiel
    ];
    
    let minDistance = Number.MAX_VALUE;
    
    // Berechne Distanz zu jeder bekannten Küste
    knownCoasts.forEach(coast => {
      const distance = this.calculateDistance(lat, lon, coast.lat, coast.lon);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });
    
    return minDistance;
  }

  /**
   * Berechnet die Entfernung zwischen zwei Koordinaten mit der Haversine-Formel
   * 
   * @private
   * @param {number} lat1 - Breitengrad Punkt 1
   * @param {number} lon1 - Längengrad Punkt 1
   * @param {number} lat2 - Breitengrad Punkt 2
   * @param {number} lon2 - Längengrad Punkt 2
   * @returns {number} Entfernung in Kilometern
   * 
   * @see https://en.wikipedia.org/wiki/Haversine_formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Erdradius in Kilometern
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Finale Fallback-Methode mit geografischer Heuristik
   * Wird verwendet wenn keine OSM-Daten verfügbar sind
   * 
   * @private
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @returns {string} "Land (Region)", "Wasser (Gewässer)" oder "Wasser (Ozean)"
   */
  finalFallback(lat, lon) {
    /**
     * @private
     * @type {Array<Object>}
     * Bekannte Meeresgebiete mit präzisen Koordinatenbereichen
     */
    const knownWaterAreas = [
      // Nordsee
      { minLat: 53.0, maxLat: 57.0, minLon: 3.0, maxLon: 9.0, name: "Nordsee" },
      { minLat: 57.0, maxLat: 62.0, minLon: 1.0, maxLon: 8.0, name: "Nördliche Nordsee" },
      
      // Ostsee
      { minLat: 53.5, maxLat: 55.0, minLon: 10.0, maxLon: 14.0, name: "Westliche Ostsee" },
      { minLat: 55.0, maxLat: 56.5, minLon: 12.0, maxLon: 16.0, name: "Zentrale Ostsee" },
      { minLat: 56.5, maxLat: 59.0, minLon: 15.0, maxLon: 20.0, name: "Nördliche Ostsee" },
      { minLat: 54.0, maxLat: 56.0, minLon: 14.0, maxLon: 19.0, name: "Östliche Ostsee" },
      
      // Atlantik
      { minLat: 40.0, maxLat: 50.0, minLon: -30.0, maxLon: -10.0, name: "Atlantik" },
      { minLat: 50.0, maxLat: 60.0, minLon: -25.0, maxLon: -5.0, name: "Nördlicher Atlantik" },
      
      // Mittelmeer
      { minLat: 35.0, maxLat: 40.0, minLon: 10.0, maxLon: 20.0, name: "Mittelmeer" },
      { minLat: 40.0, maxLat: 45.0, minLon: 5.0, maxLon: 15.0, name: "Nördliches Mittelmeer" },
      
      // Rhein - verschiedene Abschnitte
      { minLat: 50.7, maxLat: 51.0, minLon: 6.7, maxLon: 7.0, name: "Rhein (Niederlande)" },
      { minLat: 51.0, maxLat: 51.5, minLon: 6.5, maxLon: 7.2, name: "Rhein (NRW)" },
      { minLat: 51.5, maxLat: 50.5, minLon: 7.4, maxLon: 8.3, name: "Rhein (Mittelrhein)" },
      { minLat: 49.5, maxLat: 50.0, minLon: 7.5, maxLon: 8.5, name: "Rhein (Oberrhein)" },
    ];

    /**
     * @private
     * @type {Array<Object>}
     * Bekannte Landgebiete mit Koordinatenbereichen
     */
    const knownLandAreas = [
      // Deutschland
      { minLat: 47.0, maxLat: 55.0, minLon: 5.0, maxLon: 15.0, name: "Deutschland" },
      
      // Spezifische Regionen
      { minLat: 52.30, maxLat: 52.70, minLon: 13.00, maxLon: 13.80, name: "Berlin" },
      { minLat: 53.0, maxLat: 54.0, minLon: 9.0, maxLon: 11.0, name: "Hamburg Region" },
      { minLat: 50.8, maxLat: 51.2, minLon: 6.8, maxLon: 7.2, name: "Köln Region" },
      { minLat: 48.0, maxLat: 48.3, minLon: 11.3, maxLon: 11.8, name: "München Region" },
      
      // Weitere europäische Länder
      { minLat: 55.0, maxLat: 70.0, minLon: 10.0, maxLon: 30.0, name: "Skandinavien" },
      { minLat: 42.0, maxLat: 51.0, minLon: -5.0, maxLon: 8.0, name: "Frankreich" },
      { minLat: 50.0, maxLat: 59.0, minLon: -8.0, maxLon: 2.0, name: "Großbritannien" },
    ];

    // Prüfe zuerst auf bekannte Wassergebiete
    for (const water of knownWaterAreas) {
      if (lat >= water.minLat && lat <= water.maxLat && 
          lon >= water.minLon && lon <= water.maxLon) {
        return `Wasser (${water.name})`;
      }
    }

    // Dann auf bekannte Landgebiete
    for (const land of knownLandAreas) {
      if (lat >= land.minLat && lat <= land.maxLat && 
          lon >= land.minLon && lon <= land.maxLon) {
        return `Land (${land.name})`;
      }
    }

    // Finale grobe geografische Heuristik
    if ((lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) || // Europa
        (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -60) || // Nordamerika
        (lat >= -35 && lat <= 35 && lon >= 110 && lon <= 155)) { // Australien/Asien
      return "Land (Kontinent)";
    }

    // Alles andere wird als Ozean klassifiziert
    return "Wasser (Ozean)";
  }
}

export default WaterLandChecker;
