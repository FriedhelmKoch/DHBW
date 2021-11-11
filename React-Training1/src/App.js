import React from 'react';
import './App.css';
// IndexedDB
import { set, get, del, keys, createStore } from 'idb-keyval';

// Datum und Zeit

const iso = new Date().toISOString(); 
let dat = new Date(iso);
dat.toISOString(); 
const locDat = `Zulu-Datum: (${iso}) in lokales Datum: ${dat}`;

// JSX Variablen und Destructuring

console.log("Aktuelle Zeit in Zulu-Datum: " + iso);     // ISO Format: 2020-11-05T11:34:12.000Z
console.log(`Zulu-Datum: (${iso}) in lokales Datum: ${dat}`);

const tit1 = "Hello";          // string
const tit2 = "DHBW";
const combination = <h1>Hello {tit2}!</h1>;

const title1 = `01: <h1>${tit1} ${tit2}!</h1>`;
console.log(title1);

const title2 = "02: <h1>" + tit1 + " " + tit2 + "!</h1>";
console.log(title2);

function getTitle() { 
  const tit1 = "Hello";          // string
  const tit2 = "DHBW";
  return "03: <h1>" + tit1 + " " + tit2 + "!</h1>";
}
console.log("Überschrift: " + getTitle());

function App() {
  return (
    <div className="App">
      <header>
        (UTC: {iso})
        {combination}
        <h2>Weitere Beispiele... Ausgabe unter console.log()</h2>
      </header>
    </div>
  );
}

const contact = {
  person: {
    vorName: 'Max',
    nachName: 'Mustermann',
    adresse: {
      plz: '22888',
      ort: 'Hamburg',
    }
  },
  email: 'max@domain.ext',
  geoLoc: [48.4641081, 11.3950058]  // lat, lon
};


const {person} = contact;
const {adresse} = person;
console.log(`PLZ: ${adresse.plz}, Ort: ${adresse.ort}`);

const {vorName: name} = person;     //umbennen
console.log(`Vorname = ${name}`);

function combineName(item) {
  return item.vorName + ' ' + item.nachName;
}
const gruss = 'Ich heiße: ' + combineName(contact.person);
console.log(gruss);

function schreibe({email: mailAdresse}) {;
  console.log(`Email-Contact = ${mailAdresse}`);
}
schreibe(contact);

const {person: {adresse: {plz, ort: origin}}} = contact;  // extrahieren und umbennen
console.log(`Type of Adresse = ${typeof adresse}`);
console.log("Obj: " + adresse);
console.log("Obj: " + JSON.stringify(adresse));
console.log("Obj: " + adresse.plz);

console.log(`plz=${plz}`); 
console.log(`ort=${origin}`);

const [firstName, lastName] = ['Max', 'Mustermann'];
console.log(`Vorname = ${firstName}`);  // Vorname=Max
console.log(`Nachname = ${lastName}`);  // Nachname=Mustermann

const arr = [0,1,2,3];
console.log("Arr: " + arr[2]);

console.log(`${firstName} kann ${759 * 0.30} EUR Fahrtkosten 
  steuerlich absetzen!`);

const {person: pers, ...rest} = contact;
console.log(pers); 
console.log(rest);


// Map/Reduce Beispiel
//
console.log("------- map / reduce -------");
const objArr = [
	{dat: iso, text: "Prod-1", preis: "11.50", anzahl: 20}, 
	{dat: iso, text: "Prod-2", preis: "12.00", anzahl: 30}, 
	{dat: iso, text: "Prod-3", preis: "13.50", anzahl: 10}
];

let umsatzProd = [0.00, 0.00, 0.00];
objArr.map((item, index) => {
	umsatzProd[index] = parseFloat(item.preis) * parseInt(item.anzahl);
  return (
    console.log(`Anlage-Datum (${index}) - Prod-${index + 1}: ${item.dat}`)
  );
})
console.log("Umsatz-Array: " + JSON.stringify(umsatzProd));

// Aufaddieren aller Umsätze im Array
let totalUmsatz = umsatzProd.reduce((prev, current) => prev + current);
console.log("Umsatz über alle Produkte: " + totalUmsatz);

// Max-Wert über Array - Best Product
let maxArr = umsatzProd.reduce((prev, current) => prev > current ? prev : current);
console.log(`Max. Preis im Array: ${maxArr}`);

// Min-Wert über Array
let minArr = umsatzProd.reduce((prev, current) => prev < current ? prev : current);
console.log(`Min. Preis im Array: ${minArr}`);


// Async/Await Beispiele von Promises und deren Async-/Synchronitäten
//
console.log("------- async / await -------");
console.log("== 1. START Async/Await Beispiel");

async function hello() {
  await Promise.resolve("Hello") //resolved - ist erfüllt!
  .then (res => console.log("== 2. Ich starte vor Einstein und Newton"))
};
hello();

function albert() {
  const url=`https://de.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=Albert Einstein`;
  fetch (url)
    .then (response => response.json())
    .then (json => console.log("== 3. Albert Einstein - 1. Wiki Abfrage: /n" + JSON.stringify(json).substring(0, 200) + "..."))
    .catch (response => response.json());
} 

// Wikipedia Abfrage -> JSON Objekt
async function searchWikipedia(searchQuery) {
  const url=`https://de.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
  await fetch (url)
    .then (response => response.json())
    .then (json => console.log("== 5. Isaac Newton - 2. Wiki Abfrage: /n" + JSON.stringify(json).substring(0, 200) + "..."))
    .catch (response => response.json())
}

async function should_sequentiell() {
  console.time("timer");
  hello();

  albert();                                              // erst die Wiki-Abfrage
  console.log(`== 4. Ausgabe synchron nach Albert Einstein`);   // dann die console.log Ausgabe

  await searchWikipedia('Isaac Newton');                  // erst die Wiki-Abfrage
  console.log("== 6. Ausgabe synchron nach Isaac Newton");      // dann die console.log Ausgabe

  console.log("== 7. ENDE");
  console.timeEnd("timer");
}
should_sequentiell();


// IndexedDB
//
/*
console.log("------- indexedDB -------");
set('hello', 'DHBW');
get('hello').then((val) => console.log('value: ' + val));   // DHBW
keys().then((keys) => console.log('keys: ' + keys));        // logs: hello

// Benutzerspezifizierter Datenbank und Store name
const custom_db_name = 'Hochschule';
const custom_store_name = 'DHBW';
const customStore = createStore(custom_db_name, custom_store_name);
set('hello', 'DHBW', customStore);

// Löscht alle values im entsprechenden store
//del('hello');
//del('hello', customStore);
*/


export default App;


/*
 * JSON-Objecte am Beispiel von "Albert Einstein" und "Friedrichshafen" aus Wikipedia
 *
 * siehe auch JSON to JavaScript Konvertierung mittels: https://www.convertsimple.com/convert-json-to-javascript/
 * 
 
*** Albert Einstein:
* 
{
  batchcomplete: "",
  continue: {
    sroffset: 20,
    continue: "-||info"
  },
  query: {
    searchinfo: {
      totalhits: 3013,
      suggestion: "albert einsten",
      suggestionsnippet: "albert einsten"
    },
    search: [
      {
        ns: 0,
        title: "Albert Einstein",
        pageid: 1278360,
        size: 146393,
        wordcount: 15259,
        snippet: "<span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> (* 14. März 1879 in Ulm, Königreich Württemberg, Deutsches Reich; † 18. April 1955 in Princeton, New Jersey, Vereinigte Staaten) war ein,
        timestamp: "2021-11-09T13:22:36Z"
      },
      {
        ns: 0,
        title: "Hans Albert Einstein",
        pageid: 674202,
        size: 4430,
        wordcount: 446,
        snippet: "Hans <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> (* 14. Mai 1904 in Bern; † 26. Juli 1973 in Woods Hole, Massachusetts) war Professor für Hydraulik an der University of California,
        timestamp: "2021-09-03T07:51:35Z"
      },
      {
        ns: 0,
        title: "Mileva Marić",
        pageid: 81402,
        size: 19509,
        wordcount: 2196,
        snippet: "Frauen, die ein Mathematik- und Physikstudium absolvierte. Sie war <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einsteins</span> Kommilitonin am Eidgenössischen Polytechnikum in Zürich und seine erste,
        timestamp: "2021-11-02T17:57:30Z"
      },
      {
        ns: 0,
        title: "Elsa Einstein",
        pageid: 5029706,
        size: 11853,
        wordcount: 1478,
        snippet: "ein Cousin von <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einsteins</span> Vater Hermann <span class=\"searchmatch\">Einstein</span>. Elsa und <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> kannten sich bereits aus der Kinderzeit. <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>, in Ulm geboren,
        timestamp: "2021-11-05T18:45:39Z"
      },
      {
        ns: 0,
        title: "Bose-Einstein-Kondensat",
        pageid: 39608,
        size: 23178,
        wordcount: 2377,
        snippet: "Das Bose-<span class=\"searchmatch\">Einstein</span>-Kondensat (nach Satyendranath Bose und <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>; Abkürzung BEK, englisch BEC) ist ein extremer Aggregatzustand eines Systems,
        timestamp: "2021-05-12T20:45:11Z"
      },
      {
        ns: 0,
        title: "Albert Einstein (Begriffsklärung)",
        pageid: 11342915,
        size: 505,
        wordcount: 54,
        snippet: "<span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> ist der Name folgender Personen: <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> (1879–1955), deutsch-amerikanischer Physiker <span class=\"searchmatch\">Albert</span> Lawrence <span class=\"searchmatch\">Einstein</span> (* 1947), US-amerikanischer,
        timestamp: "2021-08-03T10:35:08Z"
      },
      {
        ns: 0,
        title: "Eduard Einstein",
        pageid: 674193,
        size: 5951,
        wordcount: 682,
        snippet: "Eduard <span class=\"searchmatch\">Einstein</span> (* 28. Juli 1910 in Zürich; † 25. Oktober 1965 ebenda) war der zweite Sohn <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einsteins</span> und dessen Frau Mileva Marić. Der vom Vater,
        timestamp: "2021-05-27T15:23:39Z"
      },
      {
        ns: 0,
        title: "Wurmloch",
        pageid: 42143,
        size: 16732,
        wordcount: 1821,
        snippet: "Flamm sowie erneut im Jahre 1935 von <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> und Nathan Rosen beschrieben. Sie werden daher auch <span class=\"searchmatch\">Einstein</span>-Rosen-Brücke genannt. Der englische Begriff,
        timestamp: "2021-11-07T17:42:03Z"
      },
      {
        ns: 0,
        title: "Schloss Einstein",
        pageid: 660480,
        size: 53975,
        wordcount: 4505,
        snippet: "Schloss <span class=\"searchmatch\">Einstein</span> (SE) ist eine deutsche Fernsehserie in Form einer Seifenoper für Kinder und Jugendliche, die das Leben von Jugendlichen auf dem fiktiven,
        timestamp: "2021-11-02T20:03:55Z"
      },
      {
        ns: 0,
        title: "Lieserl Marić",
        pageid: 5606623,
        size: 8266,
        wordcount: 1025,
        snippet: "Lieserl <span class=\"searchmatch\">Einstein</span>; * Januar 1902 in Novi Sad, Vojvodina, damals Österreich-Ungarn; † unbekannt) war das erste Kind von Mileva Marić und <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>. Die,
        timestamp: "2021-02-21T12:30:24Z"
      },
      {
        ns: 0,
        title: "Allgemeine Relativitätstheorie",
        pageid: 862680,
        size: 71675,
        wordcount: 8603,
        snippet: "vierdimensionalen Raumzeit. Die Grundlagen der Theorie wurden maßgeblich von <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> entwickelt, der den Kern der Theorie am 25. November 1915 der Preußischen,
        timestamp: "2021-09-14T21:00:32Z"
      },
      {
        ns: 0,
        title: "Einstein-Podolsky-Rosen-Paradoxon",
        pageid: 50600,
        size: 20231,
        wordcount: 2494,
        snippet: "intensiv diskutiertes quantenmechanisches Phänomen. Der Effekt wurde nach <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>, Boris Podolsky und Nathan Rosen benannt, die dieses Phänomen im Rahmen,
        timestamp: "2021-06-15T21:52:02Z"
      },
      {
        ns: 0,
        title: "Evelyn Einstein",
        pageid: 6642921,
        size: 5968,
        wordcount: 557,
        snippet: "Evelyn <span class=\"searchmatch\">Einstein</span> (* 28. März 1941 in Chicago; † 13. April 2011 in Albany (Kalifornien)) war <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einsteins</span> adoptierte Enkelin. Sie behauptete, sie sei,
        timestamp: "2021-03-14T11:42:36Z"
      },
      {
        ns: 0,
        title: "Albert-Einstein-Gymnasium (Berlin)",
        pageid: 2484061,
        size: 6581,
        wordcount: 577,
        snippet: "Das <span class=\"searchmatch\">Albert</span>-<span class=\"searchmatch\">Einstein</span>-Gymnasium (kurz AEO, da die Schule bis 2007 <span class=\"searchmatch\">Albert</span>-<span class=\"searchmatch\">Einstein</span>-Oberschule hieß) ist ein bilinguales Gymnasium im Berliner Ortsteil Britz,
        timestamp: "2021-08-09T11:34:37Z"
      },
      {
        ns: 0,
        title: "Maja Einstein",
        pageid: 6605210,
        size: 5251,
        wordcount: 549,
        snippet: "und die jüngere Schwester des Physikers <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>, dessen Vertraute sie seit der Kindheit war. Maja <span class=\"searchmatch\">Einstein</span> wuchs in einem jüdisch-emanzipierten Elternhaus,
        timestamp: "2021-02-21T12:32:24Z"
      },
      {
        ns: 0,
        title: "Einstein (Fernsehserie)",
        pageid: 9737148,
        size: 33029,
        wordcount: 1742,
        snippet: "von Felix Winterberg, der die Genialität von seinem Ururgroßvater <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> geerbt hat und nun die Bochumer Polizei als Berater unterstützt. Zuvor,
        timestamp: "2021-07-12T23:05:12Z"
      },
      {
        ns: 0,
        title: "Wissenschaftspark Albert Einstein",
        pageid: 1143181,
        size: 6740,
        wordcount: 611,
        snippet: "Wissenschaftspark <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span> befindet sich mit weiteren Forschungseinrichtungen auf dem Telegrafenberg in Potsdam. Benannt ist er nach dem Physiker <span class=\"searchmatch\">Albert</span> Einstein,
        timestamp: "2020-10-03T01:16:22Z"
      },
      {
        ns: 0,
        title: "Liste der Darsteller aus Schloss Einstein",
        pageid: 3386968,
        size: 163442,
        wordcount: 160,
        snippet: "Beginn jedes Serienschuljahres in der Kinder- und Jugendserie Schloss <span class=\"searchmatch\">Einstein</span> wird eine neue Schülergeneration in die Serie eingeführt. Eine Ausnahme,
        timestamp: "2021-11-01T10:59:20Z"
      },
      {
        ns: 0,
        title: "Pauline Einstein",
        pageid: 10927525,
        size: 5853,
        wordcount: 705,
        snippet: "<span class=\"searchmatch\">Einstein</span> (geboren 8. Februar 1858 in Cannstatt, Königreich Württemberg als Pauline Koch; gestorben 20. Februar 1920 in Berlin) war die Mutter <span class=\"searchmatch\">Albert</span> Einsteins,
        timestamp: "2021-10-16T19:30:51Z"
      },
      {
        ns: 0,
        title: "Hermann Einstein",
        pageid: 2944944,
        size: 3900,
        wordcount: 393,
        snippet: "entstammte einer jüdischen Familie und war der Vater von <span class=\"searchmatch\">Albert</span> <span class=\"searchmatch\">Einstein</span>. Um 1870 wurde Hermann <span class=\"searchmatch\">Einstein</span> in Ulm Teilhaber der Bettfedernfabrik „Israel &amp; Levi“,
        timestamp: "2021-10-16T18:55:08Z"
      }
    ]
  }
}

*** Friedrichshafen:
* 
{
  batchcomplete: "",
  continue: {
    sroffset: 20,
    continue: "-||info"
  },
  query: {
    searchinfo: {
      totalhits: 3939
    },
    search: [
      {
        ns: 0,
        title: "Friedrichshafen",
        pageid: 1600,
        size: 101662,
        wordcount: 10083,
        snippet: "Weingarten bildet <span class=\"searchmatch\">Friedrichshafen</span> eines von 14 Oberzentren (in Funktionsergänzung) in Baden-Württemberg. Seit April 1956 ist <span class=\"searchmatch\">Friedrichshafen</span> Große Kreisstadt,
        timestamp: "2021-10-23T02:15:21Z"
      },
      {
        ns: 0,
        title: "ZF Friedrichshafen",
        pageid: 275508,
        size: 38706,
        wordcount: 3564,
        snippet: "Die ZF <span class=\"searchmatch\">Friedrichshafen</span> AG (auch als ZF Group bekannt; ZF = „Zahnradfabrik [<span class=\"searchmatch\">Friedrichshafen</span>]“) mit Sitz in <span class=\"searchmatch\">Friedrichshafen</span> ist der weltweit viertgrößte,
        timestamp: "2021-10-26T12:04:33Z"
      },
      {
        ns: 0,
        title: "MTU Friedrichshafen",
        pageid: 345926,
        size: 11859,
        wordcount: 1117,
        snippet: "wurde die Anzahl der Lehrlinge der gesamten MTU <span class=\"searchmatch\">Friedrichshafen</span> GmbH (nicht nur Standort <span class=\"searchmatch\">Friedrichshafen</span>) auf 349 und im Jahr 2004 auf 388 beziffert. 2012,
        timestamp: "2020-09-17T20:34:39Z"
      },
      {
        ns: 0,
        title: "Flughafen Friedrichshafen",
        pageid: 597483,
        size: 27894,
        wordcount: 2071,
        snippet: "Flugplatz <span class=\"searchmatch\">Friedrichshafen</span> (IATA-Code: FDH, ICAO-Code: EDNY; auch Bodensee-Airport) ist ein regionaler Verkehrsflughafen in <span class=\"searchmatch\">Friedrichshafen</span> am Bodensee,
        timestamp: "2021-08-24T05:54:22Z"
      },
      {
        ns: 0,
        title: "VfB Friedrichshafen",
        pageid: 593316,
        size: 35042,
        wordcount: 3059,
        snippet: "Der Verein für Bewegungsspiele <span class=\"searchmatch\">Friedrichshafen</span>, kurz VfB <span class=\"searchmatch\">Friedrichshafen</span>, ist ein Sportverein aus <span class=\"searchmatch\">Friedrichshafen</span> mit knapp 3500 Mitgliedern. Die Volleyball-Männer,
        timestamp: "2021-10-11T11:16:26Z"
      },
      {
        ns: 0,
        title: "Flugzeugbau Friedrichshafen",
        pageid: 3629554,
        size: 6044,
        wordcount: 471,
        snippet: "Die Flugzeugbau <span class=\"searchmatch\">Friedrichshafen</span> GmbH, abgekürzt <span class=\"searchmatch\">Friedrichshafen</span> oder auch FF, war ein bedeutender Hersteller für deutsche Großbomber und Seeflugzeuge,
        timestamp: "2021-05-30T18:59:38Z"
      },
      {
        ns: 0,
        title: "Bahnstrecke Ulm–Friedrichshafen",
        pageid: 179329,
        size: 53276,
        wordcount: 4723,
        snippet: "Ulm bis nach <span class=\"searchmatch\">Friedrichshafen</span> am Bodensee. Unter verschiedenen Trassenalternativen gewann die gerade Verbindung von Ulm nach <span class=\"searchmatch\">Friedrichshafen</span>. Als erster,
        timestamp: "2021-11-02T06:12:56Z"
      },
      {
        ns: 0,
        title: "Maybach-Motorenbau",
        pageid: 189842,
        size: 19797,
        wordcount: 2087,
        snippet: "Unternehmen als „Motoren- und Turbinen-Union <span class=\"searchmatch\">Friedrichshafen</span> GmbH“ (MTU <span class=\"searchmatch\">Friedrichshafen</span> GmbH). Die MTU <span class=\"searchmatch\">Friedrichshafen</span> GmbH konzentriert sich seitdem auf die,
        timestamp: "2021-09-23T15:52:14Z"
      },
      {
        ns: 0,
        title: "Friedrichshafen (Begriffsklärung)",
        pageid: 4599705,
        size: 649,
        wordcount: 61,
        snippet: "<span class=\"searchmatch\">Friedrichshafen</span> steht für: <span class=\"searchmatch\">Friedrichshafen</span>, Kreisstadt am Bodensee Flugzeugbau <span class=\"searchmatch\">Friedrichshafen</span>, ein Flugzeughersteller <span class=\"searchmatch\">Friedrichshafen</span> ist der Name folgender,
        timestamp: "2016-05-15T18:35:47Z"
      },
      {
        ns: 0,
        title: "Fichtel & Sachs",
        pageid: 507070,
        size: 23519,
        wordcount: 2159,
        snippet: "ZF Sachs AG zu ZF <span class=\"searchmatch\">Friedrichshafen</span>. 2011 wurde ZF Sachs, wie andere Tochterunternehmen des Konzerns, rechtlich mit der ZF <span class=\"searchmatch\">Friedrichshafen</span> AG verschmolzen,
        timestamp: "2021-08-29T14:16:31Z"
      },
      {
        ns: 0,
        title: "Messe Friedrichshafen",
        pageid: 1410614,
        size: 3861,
        wordcount: 290,
        snippet: "Die Messe <span class=\"searchmatch\">Friedrichshafen</span> GmbH ist der Besitzer und Betreiber des Messegeländes Neue Messe <span class=\"searchmatch\">Friedrichshafen</span>, welches eines der modernsten und größten Messegelände,
        timestamp: "2020-05-26T14:38:57Z"
      },
      {
        ns: 0,
        title: "Bahnstrecke Stahringen–Friedrichshafen",
        pageid: 486221,
        size: 8545,
        wordcount: 488,
        snippet: "Bahnstrecke Stahringen–<span class=\"searchmatch\">Friedrichshafen</span> seit 2003 im Stundentakt von der als Seehänsele bezeichneten Linie Radolfzell–<span class=\"searchmatch\">Friedrichshafen</span> Stadt befahren, die,
        timestamp: "2021-07-13T11:40:51Z"
      },
      {
        ns: 0,
        title: "Luftangriffe auf Friedrichshafen",
        pageid: 8534492,
        size: 3883,
        wordcount: 370,
        snippet: "auf <span class=\"searchmatch\">Friedrichshafen</span> mit insgesamt eintausend Toten und Verwundeten und einer nahezu vollständigen Zerstörung der alten Bodenseestadt. <span class=\"searchmatch\">Friedrichshafen</span>, benannt,
        timestamp: "2021-07-16T11:16:35Z"
      },
      {
        ns: 0,
        title: "Schlosskirche Friedrichshafen",
        pageid: 10058592,
        size: 10099,
        wordcount: 748,
        snippet: "Schlosskirche auf YouTube Stadtarchiv <span class=\"searchmatch\">Friedrichshafen</span> (Hrsg.): Geschichtspfad <span class=\"searchmatch\">Friedrichshafen</span>. Stadt <span class=\"searchmatch\">Friedrichshafen</span>, <span class=\"searchmatch\">Friedrichshafen</span> 2001, ISBN 3-89549-301-5. Lutz,
        timestamp: "2021-01-13T16:29:17Z"
      },
      {
        ns: 0,
        title: "Katamaran Friedrichshafen–Konstanz",
        pageid: 2236063,
        size: 16558,
        wordcount: 1631,
        snippet: "Der Katamaran <span class=\"searchmatch\">Friedrichshafen</span>–Konstanz verbindet stündlich die beiden Bodensee-Städte <span class=\"searchmatch\">Friedrichshafen</span> und Konstanz. Betreiber ist die Katamaran-Reederei,
        timestamp: "2021-03-28T00:28:10Z"
      },
      {
        ns: 0,
        title: "Bahnhof Friedrichshafen Stadt",
        pageid: 6784245,
        size: 12603,
        wordcount: 911,
        snippet: "i16 Der Bahnhof <span class=\"searchmatch\">Friedrichshafen</span> Stadt (Stadtbahnhof) ist der größte Bahnhof der Stadt <span class=\"searchmatch\">Friedrichshafen</span> am Bodensee und ein Bahnknotenpunkt in Baden-Württemberg,
        timestamp: "2021-10-13T20:00:13Z"
      },
      {
        ns: 0,
        title: "Aussichtsturm Friedrichshafen",
        pageid: 3310395,
        size: 2888,
        wordcount: 282,
        snippet: "Aussichtsturm <span class=\"searchmatch\">Friedrichshafen</span>, auch Moleturm genannt, markiert die Hafeneinfahrt von <span class=\"searchmatch\">Friedrichshafen</span> am Bodensee. Der Turm wurde von der Stadt <span class=\"searchmatch\">Friedrichshafen</span> im,
        timestamp: "2021-09-27T17:14:15Z"
      },
      {
        ns: 0,
        title: "LZ 129",
        pageid: 71058,
        size: 46078,
        wordcount: 5141,
        snippet: "5. Gessler, <span class=\"searchmatch\">Friedrichshafen</span> 1987, ISBN 3-926162-55-4. Lutz Tittel: LZ 129 „Hindenburg“. Zeppelin-Museum <span class=\"searchmatch\">Friedrichshafen</span>, <span class=\"searchmatch\">Friedrichshafen</span> 1997, S. 19.,
        timestamp: "2021-11-08T06:29:33Z"
      },
      {
        ns: 0,
        title: "Bodenseekreis",
        pageid: 30293,
        size: 31485,
        wordcount: 2257,
        snippet: "hiervon wiederum zwei Große Kreisstädte (<span class=\"searchmatch\">Friedrichshafen</span> und Überlingen). Größte Stadt des Kreises ist <span class=\"searchmatch\">Friedrichshafen</span>, kleinste Gemeinde ist Stetten. Siehe,
        timestamp: "2021-09-26T10:58:27Z"
      },
      {
        ns: 0,
        title: "Filmtage Friedrichshafen",
        pageid: 10437288,
        size: 11020,
        wordcount: 958,
        snippet: "Die Filmtage <span class=\"searchmatch\">Friedrichshafen</span> sind ein mehrtägiges Filmfestival, das jährlich unter dem Titel „Jetzt oder nie“ vom Kulturbüro <span class=\"searchmatch\">Friedrichshafen</span> veranstaltet,
        timestamp: "2021-10-31T09:13:37Z"
      }
    ]
  }
}

*/
