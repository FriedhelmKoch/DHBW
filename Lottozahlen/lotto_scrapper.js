// Lottozahlen Scraper für die Jahre 1992-2026
// Dieses Skript lädt die Lottozahlen von der Website "lottozahlenonline.de" für die Jahre 1992 bis 2026, extrahiert die relevanten Informationen und speichert sie in einer JSON-Datei.
// Benötigte Pakete: axios (für HTTP-Anfragen), cheerio (für HTML-Parsing), fs (für Dateisystemzugriff) 
// Ausführung:
// $ npm install axios cheerio; // wenn nicht schon installiert
// $ node lotto_scrapper.js
//
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchLottoData() {
    const lottoDaten = [];
    const aktuellesJahr = new Date().getFullYear();
    
    for (let jahr = 1992; jahr <= aktuellesJahr; jahr++) {
        const url = `https://www.lottozahlenonline.de/statistik/beide-spieltage/lottozahlen-archiv.php?j=${jahr}#lottozahlen-archiv`;
        
        try {
            console.log(`Lade Daten für ${jahr}...`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            const ziehungen = $('#gewinnzahlen .zahlensuche_rahmen');
            
            ziehungen.each((index, element) => {
                const $ziehung = $(element);
                
                const nummer = parseInt($ziehung.find('.zahlensuche_nr').text().trim());
                
                // Datum extrahieren
                let datum = $ziehung.find('time').attr('datetime');
                if (!datum) {
                    datum = $ziehung.find('.zahlensuche_datum').text().trim();
                }
                
                // Zahlen extrahieren
                const zahlenElements = $ziehung.find('.zahlensuche_zahl');
                const gewinnzahlen = [];
                zahlenElements.each((i, zahlElement) => {
                    if (i < 6) {
                        const zahl = parseInt($(zahlElement).text().trim());
                        if (!isNaN(zahl)) gewinnzahlen.push(zahl);
                    }
                });
                
                // Superzahl extrahieren
                const superzahlText = $ziehung.find('.zahlensuche_zz').text().trim();
                const superzahl = parseInt(superzahlText) || 0;
                
                // Datum formatieren
                let deutschesDatum = '';
                if (datum && datum.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [jahrISO, monat, tag] = datum.split('-');
                    deutschesDatum = `${tag}.${monat}.${jahrISO}`;
                } else if (datum && datum.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                    deutschesDatum = datum;
                } else {
                    deutschesDatum = $ziehung.find('.zahlensuche_datum').text().trim();
                }
                
                if (gewinnzahlen.length === 6 && deutschesDatum) {
                    lottoDaten.push({
                        id: nummer,
                        datum: deutschesDatum,
                        gewinnzahlen: gewinnzahlen,
                        superzahl: superzahl,
                        jahr: jahr
                    });
                }
            });
            
            console.log(`✓ ${jahr}: ${ziehungen.length} Ziehungen`);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (error) {
            console.error(`Fehler bei ${jahr}:`, error.message);
        }
    }
    
    // Sortieren
    lottoDaten.sort((a, b) => {
        if (a.jahr !== b.jahr) return a.jahr - b.jahr;
        return a.id - b.id;
    });
    
    // OPTION 1: Kompaktes JSON (eine Zeile pro Objekt)
    //const jsonKompakt = JSON.stringify(lottoDaten);
    //fs.writeFileSync('lottozahlen_1992-2026_kompakt.json', jsonKompakt, 'utf8');
    
    // OPTION 2: Schön formatiert mit einer Zeile pro Objekt
    const jsonLines = lottoDaten.map(obj => JSON.stringify(obj)).join(',\n');
    const jsonFormatted = '[\n' + jsonLines + '\n]';
    fs.writeFileSync('lottozahlen_1992-2026.json', jsonFormatted, 'utf8');
    
    // OPTION 3: NDJSON/JSON Lines Format (eine Zeile pro Objekt, kein Array)
    //const jsonLinesFormat = lottoDaten.map(obj => JSON.stringify(obj)).join('\n');
    //fs.writeFileSync('lottozahlen_1992-2026.ndjson', jsonLinesFormat, 'utf8');
    
    console.log(`\n✅ Fertig! ${lottoDaten.length} Lottoziehungen gespeichert.`);
    console.log('📁 Drei Dateien erstellt:');
    //console.log('  1. lottozahlen_1992-2026_kompakt.json - Kompaktes JSON');
    console.log('  2. lottozahlen_1992-2026.json - Normal formatiert, eine Zeile pro Ziehung');
    //console.log('  3. lottozahlen_1992-2026.ndjson - NDJSON Format (eine Zeile pro Objekt)');
    
    // Statistik
    const jahreStatistik = {};
    lottoDaten.forEach(eintrag => {
        jahreStatistik[eintrag.jahr] = (jahreStatistik[eintrag.jahr] || 0) + 1;
    });
    
    console.log('\n📊 Statistik pro Jahr:');
    Object.keys(jahreStatistik).sort().forEach(jahr => {
        console.log(`  ${jahr}: ${jahreStatistik[jahr]} Ziehungen`);
    });

}

// Skript ausführen
fetchLottoData();
