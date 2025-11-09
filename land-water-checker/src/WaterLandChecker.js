// WaterLandChecker Service Klasse
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

    // ZUERST: Prüfe auf bekannte Land-Positionen (hat Priorität)
    const knownLandCheck = this.checkKnownLandPositions(lat, lon);
    if (knownLandCheck) {
      this.cache.set(cacheKey, knownLandCheck);
      return knownLandCheck;
    }

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

  // Neue Methode: Prüfe spezifische bekannte Land-Positionen
  checkKnownLandPositions(lat, lon) {
    // Sehr spezifische bekannte Land-Positionen (hohe Priorität)
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

    for (const land of specificLandPositions) {
      if (lat >= land.minLat && lat <= land.maxLat && 
          lon >= land.minLon && lon <= land.maxLon) {
        return `Land (${land.name})`;
      }
    }

    return null;
  }

  async checkDirectFeatures(lat, lon) {
    const query = `
      [out:json][timeout:25];
      (
        // Sehr spezifische Wasser-Features
        way["natural"="water"]["water"~"lake|pond|basin|reservoir"](around:500,${lat},${lon});
        way["waterway"~"river|canal|stream"](around:300,${lat},${lon});
        node["natural"="water"](around:200,${lat},${lon});
        
        // Sehr spezifische Land-Features
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
    // Bekannte Meeresgebiete mit präzisen Koordinaten
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
      
      // Rhein - KORRIGIERT: Keine Überlappung mit Berlin!
      { minLat: 50.7, maxLat: 51.0, minLon: 6.7, maxLon: 7.0, name: "Rhein (Niederlande)" },
      { minLat: 51.0, maxLat: 51.5, minLon: 6.5, maxLon: 7.2, name: "Rhein (NRW)" },
      { minLat: 51.5, maxLat: 50.5, minLon: 7.4, maxLon: 8.3, name: "Rhein (Mittelrhein)" }, // Korrigierte Koordinaten
      { minLat: 49.5, maxLat: 50.0, minLon: 7.5, maxLon: 8.5, name: "Rhein (Oberrhein)" },
      
      // Weitere Flüsse - präzise definiert
      { minLat: 53.5, maxLat: 54.0, minLon: 9.5, maxLon: 10.2, name: "Elbe (Hamburg)" },
      { minLat: 48.7, maxLat: 49.0, minLon: 8.2, maxLon: 8.6, name: "Main" },
      { minLat: 49.0, maxLat: 49.5, minLon: 8.3, maxLon: 8.8, name: "Neckar" },
    ];

    // Bekannte Landgebiete - überarbeitet
    const knownLandAreas = [
      // Deutschland - Hauptgebiet
      { minLat: 47.0, maxLat: 55.0, minLon: 5.0, maxLon: 15.0, name: "Deutschland" },
      
      // Spezifische Städte und Regionen
      { minLat: 52.30, maxLat: 52.70, minLon: 13.00, maxLon: 13.80, name: "Berlin" },
      { minLat: 53.0, maxLat: 54.0, minLon: 9.0, maxLon: 11.0, name: "Hamburg Region" },
      { minLat: 50.8, maxLat: 51.2, minLon: 6.8, maxLon: 7.2, name: "Köln Region" },
      { minLat: 48.0, maxLat: 48.3, minLon: 11.3, maxLon: 11.8, name: "München Region" },
      { minLat: 50.9, maxLat: 51.1, minLon: 13.6, maxLon: 13.9, name: "Dresden Region" },
      
      // Weitere europäische Länder
      { minLat: 55.0, maxLat: 70.0, minLon: 10.0, maxLon: 30.0, name: "Skandinavien" },
      { minLat: 42.0, maxLat: 51.0, minLon: -5.0, maxLon: 8.0, name: "Frankreich" },
      { minLat: 50.0, maxLat: 59.0, minLon: -8.0, maxLon: 2.0, name: "Großbritannien" },
      { minLat: 46.0, maxLat: 48.0, minLon: 8.0, maxLon: 10.0, name: "Schweiz" },
      { minLat: 47.0, maxLat: 49.0, minLon: 9.0, maxLon: 17.0, name: "Österreich" },
    ];

    // Prüfe zuerst auf Wasser
    for (const water of knownWaterAreas) {
      if (lat >= water.minLat && lat <= water.maxLat && 
          lon >= water.minLon && lon <= water.maxLon) {
        return `Wasser (${water.name})`;
      }
    }

    // Dann auf Land
    for (const land of knownLandAreas) {
      if (lat >= land.minLat && lat <= land.maxLat && 
          lon >= land.minLon && lon <= land.maxLon) {
        return `Land (${land.name})`;
      }
    }

    // Finale grobe Heuristik
    if ((lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) || // Europa
        (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -60) || // Nordamerika
        (lat >= -35 && lat <= 35 && lon >= 110 && lon <= 155)) { // Australien/Asien
      return "Land (Kontinent)";
    }

    return "Wasser (Ozean)";
  }
}

export default WaterLandChecker;
