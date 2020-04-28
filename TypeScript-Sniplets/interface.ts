interface Contact {
  vorname : string;
  nachname : string;
  alter ?: number | string
}
let people : Contact = {
  vorname : 'Max',
  nachname : 'Mustermann',
}
console.log(people.nachname);	//BMW
