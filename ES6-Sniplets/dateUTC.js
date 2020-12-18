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

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Holt aktuelles Datum und Uhrzeit und konvertiert in Zulu-Darstellung (ISO-Format: 8601)
// Bsp.: 
//				Wenn aktuelles Datum Fri Dec 18 2020 13:18:52 GMT+0100 (Mitteleuropäische Normalzeit) ist
//				let dat = getActual2ZuluDat():
//					console.log(dat); 			// 2020-12-18T12:18:52.739Z
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function getActual2ZuluDat() {
	const heute = new Date(); 				// lokales aktuelles Datum und aktuelle Zeit
	const iso = heute.toISOString(); 
	return iso;
}

/**********************************************************************
 * Konvertiert einen Zulu-Zeit-String in Lokale-Zeit-Darstellung
 * Bsp.: 
 * 				Wenn aktuelle Abfrage-Device in MESZ (UTC+2) liegt => Sommerzeit
 *				let dat = "2020-05-03T23:05:08.375Z"
 * 				zulu2LocalDat(dat); 
 *					console.log(zulu2LocalDat(dat)); 		// 2020-05-04T01:05:08.375
 **********************************************************************/
function zulu2LocalDat(isoString) {
	let dateParts = isoString.split( /\D+/ );					// Split the string into an array based on the digit groups.
	let returnDate = new Date();											// Set up a date object with the current time.
	
	// Manually parse the parts of the string and set each part for the date. 
	// Note: Using the UTC versions of these functions is necessary because we're manually adjusting for time zones stored in the string.
	returnDate.setUTCFullYear( parseInt( dateParts[0] ) );

	// The month numbers are one "off" from what normal humans would expect because January == 0.
	returnDate.setUTCMonth( parseInt( dateParts[1] - 1 ) );
	returnDate.setUTCDate( parseInt( dateParts[2] ) );
	
	// Set the time parts of the date object.
	returnDate.setUTCHours( parseInt( dateParts[3] ) );
	returnDate.setUTCMinutes( parseInt( dateParts[4] ) );
	returnDate.setUTCSeconds( parseInt( dateParts[5] ) );
	returnDate.setUTCMilliseconds( parseInt( dateParts[6] ) );
	
	// Track the number of hours we need to adjust the date by base on the timezone.
	var timezoneOffsetHours = 0;								// If there's a value for either the hours or minutes offset.
	if ( dateParts[7] || dateParts[8] ) {				// Track the number of minutes we need to adjust the date by based on the timezone.
		var timezoneOffsetMinutes = 0;
		if ( dateParts[8] ) {											// If there's a value for the minutes offset.
			timezoneOffsetMinutes = parseInt( dateParts[8] ) / 60;	// Convert the minutes value into an hours value.
		}
		timezoneOffsetHours = parseInt( dateParts[7] ) + timezoneOffsetMinutes;		// Add the hours and minutes values to get the total offset in hours.
		if ( isoString.substr( -6, 1 ) == "+" ) {	// If the sign for the timezone is a plus to indicate the timezone is ahead of UTC time.
			timezoneOffsetHours *= -1;							// Make the offset negative since the hours will need to be subtracted from the date.
		}
	}
	returnDate.setHours( returnDate.getHours()) + timezoneOffsetHours;					// Get the current hours for the date and add the offset to get the correct time adjusted for timezone.

	// convert returnDate form: Sun May 03 2020 11:05:08 GMT+0200 (Mitteleuropäische Sommerzeit) into iso-format 
	const options = { year: 'numeric', month:"2-digit", day:"2-digit", hour: '2-digit', minute: '2-digit', second: '2-digit' };
	const data = returnDate.toLocaleString('fr-ca', options).split(' ');				// yyyy-mm-dd hh h mm min ss s
	const full = returnDate.toLocaleString('utc', options).split(' ');					// dd.mm.yyyy, hh:mm:ss

	// Return the Date object calculated from the string.
	return `${data[0]}T${full[1]}.${dateParts[6]}`;
}

console.log("*** Test der Functions:");

const zulu = getActual2Zulu();
console.log("Aktuelles Datum und Uhrzeit -> " + zulu);

const local = zulu2Local("2020-02-03T09:05:08Z");  // Achtung Winterzeit!
console.log("Zulu zu Local 2020-02-03T09:05:08 -> " + local);
