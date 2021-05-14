import React from 'react';
import './App.css';

// Datum und Zeit

const iso = new Date().toISOString(); 
let dat = new Date(iso);
dat.toISOString(); 

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
console.log("Obj: " + JSON.stringify(adresse.plz));

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

function App() {
  return (
    <div className="App">
      <header>
        {combination}
        <h2>Weitere Beispiele... Ausgabe unter console.log()</h2>
      </header>
    </div>
  );
}


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
  const url=`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=Albert Einstein`;
  fetch (url)
    .then (response => response.json())
    .then (json => console.log("== 3. Albert Einstein - 1. Wiki Abfrage: /n" + JSON.stringify(json).substring(0, 200) + "..."))
    .catch (response => response.json());
} 

// Wikipedia Abfrage -> JSON Objekt
async function searchWikipedia(searchQuery) {
  const url=`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
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


export default App;
