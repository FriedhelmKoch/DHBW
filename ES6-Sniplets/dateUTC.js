const weekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const month = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];

const date = "2020-03-10T15:30:00Z";  // 10. April 2020 - Achtung: Monat startet bei 0!

let YYYY = parseInt(date.substring(0, 4));
let MM = parseInt(date.substring(5, 7));
let DD = parseInt(date.substring(8, 10));
let hh = parseInt(date.substring(11, 13));
let mm = parseInt(date.substring(14, 16));
let ss = parseInt(date.substring(17, 19));

let datUTC = new Date(Date.UTC(YYYY, MM, DD, hh, mm, ss));
let WT = datUTC.getDay();

console.log("*** Universal Time Coordinated nach ISO 8601 ***");
console.log("ACHTUNG: Die Zeitumstellung von Normal- zu Sommerzet");
console.log("erfolgt jeweils am letzten Wochenende im März und September")
console.log("Datum in UTC +0  (Zulu Format): " + date);
console.log("Wochentag: " + weekday[WT]);
console.log("Jahr: " + YYYY + ", Monat: " + month[MM] + ", Tag: " + DD + ", Std.: " + hh + ", Min.: " + mm + ", Sek.: " + ss)
console.log("Datum und Zeit in dieser Zeitzone: " + datUTC);

let timeOffset = datUTC.getTimezoneOffset() / -60;
let offsetString = timeOffset >0 ? "+" + timeOffset : "-" + timeOffset; 
console.log("Unsere Zeitzone zu UTC Zulu: " + offsetString);

let hhLocal = (parseInt(hh) + parseInt(timeOffset)).toString();
console.log("Lokale Uhrzeit in Std.: " + hhLocal + ", Min.: " + mm + ", Sek.: " + ss);
