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
let h_MM = ("00" + (parseInt(heute.getMonth()) + 1)).slice(-2);  // führende Null erzwingen
let h_DD = ("00" + heute.getDate()).slice(-2); 
let h_WT = ("00" + heute.getDay()).slice(-2);
let h_hh = ("00" + (heute.getHours() - timeOffset)).slice(-2);
let h_mm = ("00" + heute.getMinutes()).slice(-2);
let h_ss = ("00" + heute.getSeconds()).slice(-2);

let zulu = h_YYYY + "-" + h_MM + "-" + h_DD + "T" + h_hh + ":" + h_mm + ":" + h_ss + "Z";  

console.log("Aktuelles Datum und Zeit als Zulu-Datum (UTC +0) ist: " + zulu + "\n");

// Aktuelles Datum und Uhrzeit in Zulu-Darstellung
function GetActualZulu() {
	const heute = new Date(); // aktuelles Datum und aktuelle Zeit
	const h_YYYY = heute.getFullYear();
	const h_MM = ("00" + (parseInt(heute.getMonth()) + 1)).slice(-2);
	const h_DD = ("00" + heute.getDate()).slice(-2); // führende Null erzwingen
	const h_WT = ("00" + heute.getDay()).slice(-2);
	const h_hh = ("00" + (heute.getHours() - timeOffset)).slice(-2);
	const h_mm = ("00" + heute.getMinutes()).slice(-2);
	const h_ss = ("00" + heute.getSeconds()).slice(-2);
	return h_YYYY + "-" + h_MM + "-" + h_DD + "T" + h_hh + ":" + h_mm + ":" + h_ss + "Z";  
}

// Zulu-Zeit-String in Locale-Zeit-Darstellung
// Beispiel: dat = "2020-02-03T09:05:08Z" 
function ZuluToLocal(dat){
	const YYYY = dat.substring(0, 4);
	const MM = dat.substring(5, 7);
	const DD = dat.substring(8, 10);
	const hh = dat.substring(11, 13);
	const mm = dat.substring(14, 16);
	const ss = dat.substring(17, 19);
	const datUTC = new Date(Date.UTC(YYYY, MM, DD, hh, mm, ss));
	const timeOffset = datUTC.getTimezoneOffset() / -60;
	const hhLocal = (parseInt(hh) + parseInt(timeOffset)).toString();
	return YYYY + "-" + MM + "-" + DD + "T" + hhLocal + ":" + mm + ":" + ss + "Z";
}

console.log("*** Test der Functions:");

const zuluTime = GetActualZulu();
console.log("Aktuelles Datum und Uhrzeit -> " + zuluTime);

const zuluLocal = ZuluToLocal("2020-02-03T09:05:08Z");  // Achtung Winterzeit!
console.log("Zulu zu Local 2020-02-03T09:05:08Z -> " + zuluLocal);
