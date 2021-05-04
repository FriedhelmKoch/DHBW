import React from 'react';
import { GetActualZulu, ZuluToLocal } from './dateUTC';
import './App.css';

// JSX Variablen und Destructuring

const datum = "2020-11-05T11:34:00Z";
console.log("Aktuelle Zeit in Zulu-Datum: " + GetActualZulu());
console.log("Zulu-Datum (2020-11-05T11:34:00Z) in lokales Datum: " + ZuluToLocal(datum));

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
      plz: '22357',
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

function combineName(name) {
  return name.vorName + ' ' + name.nachName;
}
const gruss = 'Ich heiße: ' + combineName(contact.person);
console.log(gruss);

function schreibe({email: mailAdresse}) {;
  console.log(`Email-Contact = ${mailAdresse}`);
}
schreibe(contact);

const {person: {adresse: {plz, ort: origin}}} = contact;  // extrahieren und umbennen
console.log(`Type of Adresse = ${typeof adresse}`);

console.log(`plz=${plz}`); 
console.log(`ort=${origin}`);

const [firstName, lastName] = ['Max', 'Mustermann'];
console.log(`Vorname = ${firstName}`);  // Vorname=Max
console.log(`Nachname = ${lastName}`);  // Nachname=Mustermann

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
const objArr = [
	{text: "Prod-1", preis: "11.50", anzahl: 20}, 
	{text: "Prod-2", preis: "12.00", anzahl: 30}, 
	{text: "Prod-3", preis: "13.50", anzahl: 10}
];

let umsatzProd = [0.00, 0.00, 0.00];
objArr.map((item, index) => {
	umsatzProd[index] = parseFloat(item.preis) * parseInt(item.anzahl);
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
async function hello() {
  await Promise.resolve("Hello") //resolved - ist erfüllt!
  .then (res => console.log("Ich sage " + res))
};
hello();

function albert() {
  const url=`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=Albert Einstein`;
  fetch (url)
    .then (response => response.json())
    .then (json => console.log("======= Albert Einstein - 1. Wiki Abfrage: /n" + JSON.stringify(json).substring(0, 200) + "..."))
    .catch (response => response.json());
} 

// Wikipedia Abfrage -> JSON Objekt
async function searchWikipedia(searchQuery) {
  const url=`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
  await fetch (url)
    .then (response => response.json())
    .then (json => console.log("======= Isaac Newton: /n" + JSON.stringify(json).substring(0, 200) + "..."))
    .catch (response => response.json())
}

async function should_sequentiell() {
  console.log("======= START Async/Await Beispiel");

  albert();                                               // erst die Wiki-Abfrage
  console.log("Ausgabe synchron nach Albert Einstein");   // dann die console.log Ausgabe

  await searchWikipedia('Isaac Newton');                  // erst die Wiki-Abfrage
  console.log("======= Ausgabe synchron nach Isaac Newton");      // dann die console.log Ausgabe

  console.log("======= ENDE");
}
should_sequentiell();




export default App;
