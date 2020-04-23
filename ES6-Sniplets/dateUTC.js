const weekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const month = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];

const date = "2020-04-10T09:30:00Z";  // 10. April 2020
const heute = new Date(); // aktuelles Datum und aktuelle Zeit

let YYYY = date.substring(0, 4);
let MM = date.substring(5, 7)  - 1;  // Achtung: JavaScript startet Monat bei 0!
let DD = date.substring(8, 10);
let hh = date.substring(11, 13);
let mm = date.substring(14, 16);
let ss = date.substring(17, 19);

let datUTC = new Date(Date.UTC(YYYY, MM, DD, hh, mm, ss));
let WT = datUTC.getDay();

console.log("*** Universal Time Coordinated nach ISO 8601 ***\n");
console.log("*** ACHTUNG: Die Zeitumstellung von Normal- zu Sommerzeit \nerfolgt jeweils am letzten Wochenende im März und September\n")
console.log("Datum in UTC +0  (Zulu Format): " + date);
console.log("Jahr: " + YYYY + ", Monat: " + month[MM] + ", Tag: " + DD + ", Std.: " + hh + ", Min.: " + mm + ", Sek.: " + ss + "\n")
//console.log("Datum und Zeit in dieser Zeitzone: " + datUTC);
console.log("Wochentag: " + weekday[WT]);

let timeOffset = datUTC.getTimezoneOffset() / -60;
let offsetString = timeOffset >0 ? "+" + timeOffset : timeOffset; 
console.log("Unsere Zeitzone zu UTC Zulu: " + offsetString);


let hhLocal = (parseInt(hh) + parseInt(timeOffset)).toString();
console.log("Lokale Uhrzeit in unsere Zeitzone ist Std.: " + hhLocal + ", Min.: " + mm + ", Sek.: " + ss + "\n");

console.log("Aktuelles Datum und Uhrzeit: " + heute);

let h_YYYY = heute.getFullYear();
let h_MM = ("00" + heute.getMonth()).slice(-2);  // führende Nullen erzwingen
let h_DD = ("00" + heute.getDate()).slice(-2); 
let h_WT = ("00" + heute.getDay()).slice(-2);
let h_hh = ("00" + (heute.getHours() - timeOffset)).slice(-2);
let h_mm = ("00" + heute.getMinutes()).slice(-2);
let h_ss = ("00" + heute.getSeconds()).slice(-2);


let zulu = h_YYYY + "-" + h_MM + "-" + h_DD + "T" + h_hh + ":" + h_mm + ":" + h_ss + "Z";  

console.log("Aktuelles Datum und Zeit als Zulu Datum (UTC +0) ist: " + zulu);
