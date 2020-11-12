import React from 'react';
import { GetActualZulu, ZuluToLocal } from './dateUTC';
import './App.css';

/* JSX Variablen und Destructuring */

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
console.log(getTitle());

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
console.log(`${adresse.plz}    ${adresse.ort}`);

const {vorName: name} = person;     //umbennen
console.log(`Vorname=${name}`);

function combineName(name) {
  return name.vorName + ' ' + name.nachName;
}
const gruss = 'Ich heiße: ' + combineName(contact.person);
console.log(gruss);

function schreibe({email: mailAdresse}) {;
  console.log(`Email-Contact=${mailAdresse}`);
}
schreibe(contact);

const {person: {adresse: {plz, ort: origin}}} = contact;  // extrahieren und umbennen
console.log(`Type of Adresse=${typeof adresse}`);

console.log(`plz=${plz}`); 
console.log(`ort=${origin}`);

const [firstName, lastName] = ['Max', 'Mustermann'];
console.log(`Vorname=${firstName}`);  // Vorname=Max
console.log(`Nachname=${lastName}`);  // Nachname=Mustermann

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

export default App;
