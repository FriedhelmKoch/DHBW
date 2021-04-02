//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Diese Funktion berechnet die Distanz zwischen zwei Geo-Koordinaten (gegeben als  
// Breitengrad/Latitude und Längengrad/Longitude). 
//
// Definition: 
//		Südliche Breitengrade/Latitudes müssen negativ und 
//		östliche Längengrade/Longitudes positiv angegeben werden 
// 
//  Parameter:
//    lat1, lon1 = Latitude und Longitude des 1. Punktes (in Dezimal-Grad)
//    lat2, lon2 = Latitude und Longitude des 2. Punktes (in Dezomal-Grad)
//    unit = die Einheit der Ausgabe:  
//           für: 'N' in Nautische Meile  //(default)
//                'K' in Kilometer   
// Bsp.:
//				let dist = geoDistance(48.490545479685416, 11.338329464399012, 48.479460, 11.317115, "K");
//				alert("Distanz: " + dist);  // knapp 2 Kilometer

import { min } from "lodash";

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function geoDistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		let radlat1 = Math.PI * lat1/180;
		let radlat2 = Math.PI * lat2/180;
		let theta = lon1-lon2;
		let radtheta = Math.PI * theta/180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 10800/Math.PI;								// Nautische Meilen als default
		if (unit=="K") { dist = dist * 1.851852 }		// Kilometer
		return dist;
	}
}

/******************************************************************************
*		Speichert die geoDaten als JSON-String promise-bsiert in den SessionStorage
*		Bsp.:
*			getGeolocation("geoJSON");
*					let geoStr = sessionStorage.getItem("geoJSON");
*					let geoObj = JSON.parse(geoStr);
*					console.log("GeoObj: " + JSON.stringify(geoObj));
*		Die Geodaten liegen dann in dem Objekt "geoObj" vor.
*
*		SessionStorage-String:
*			// geoJSON:'{"latitude":48.4905369264108,"longitude":11.338338855454992,"altitude":469.6743469238281,"precision":65,"altprecision":10}'
*
*		React:
*			this.state = {   
*				geoLocString: JSON.parse(sessionStorage.getItem("geoJSON"))
*			}
*
*******************************************************************************/
export function getGeolocation(sessionKey) {
	sessionKey = !sessionKey ? "geoJSON" : sessionKey; 
	const geoOptions = {
		enableHighAccuracy: true,     // Super-Präzisions-Modus
		timeout: 1000,                // Maximum Wartezeit
		maximumAge: 0                 // Maximum Cache-Alter
	}
	function geoSuccess(pos) {
		const crd = pos.coords;
		const geoValue = {
			latitude: crd.latitude,			// Breitengrad
			longitude: crd.longitude,		// Längengrad
			altitude: crd.altitude,			// Höhe ü. Meeresspiegel in Meter
			precision: crd.accuracy, 		// Genauigkeit der Koordinaten im Meter
			altprecision: crd.altitudeAccuracy,	// Genauigkeit der Höhenangabe
			geotime: crd.timestamp			// Zeitstempel der Positionsangabe
		}
		StorePos(JSON.stringify(geoValue));		// Objekt in String konvertieren
	}
	function geoError(err) {
		switch (err.code) {
			case err.PERMISSION_DENIED:
				alert("ACHTUNG: Ohne Deine Geolocation-Daten ist die Funktionalität von viaLinked nur eingeschränkt möglich! Um die Geolocation-Funktionalität von viaLinked besser einschätzen zu können, klicke auf das 'viaLinked-Logo' oben links und lese bitte unser Datenschutz- und Nutzungsrichtlinien nach.")
				console.log("DEBUG - User denied the request for Geolocation.")
				StorePos('{"latitude":52.520007, "longitude":13.404954}');	// workaround if geoPos via localhost not supported, location Berlin
				break;
			case err.POSITION_UNAVAILABLE:
				console.log("DEBUG - Location information is unavailable.")
				StorePos('{"latitude":52.520007, "longitude":13.404954}');	// workaround if geoPos via localhost not supported, location Berlin
				break;
			case err.TIMEOUT:
				console.log("DEBUG - The request to get user location timed out.")
				StorePos('{"latitude":52.520007, "longitude":13.404954}');	// workaround if geoPos via localhost not supported, location Berlin
				break;
			default:
				console.log("DEBUG - An unknown error occurred.")
				break;
		}
	}
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
	} else {
		alert("ACHTUNG: Geolocation wird von diesem System/Device nicht unterstützt! Die Funktionalität von viaLinked ist daher nur eingeschränkt möglich!");
	}
	function StorePos(value) {
		sessionStorage.setItem(sessionKey, value);
	}
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Geo-Koordinaten werden umgewandelt in Location mit Straße, Nr, PLZ und Ort.
// Speichert die reverseGeolocation-Daten als JSON-String in den SessionStorage
// Bsp.:
//			const lat = "48.5279031";
//			const lon = "11.507305306134157";
//			reverseGeocoding(lat, lon, "revgeoJSON");
//				let revgeoStr = sessionStorage.getItem("revgeoJSON");
//				let revgeoObj = JSON.parse(revgeoStr);
//				console.log(JSON.stringify(revgeoObj));
//				// {"str":"Schulstraße","strNo":"9","zip":"85276","city":"Pfaffenhofen an der Ilm","state":"Bayern","country":"Germany"}
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function reverseGeocoding(lon, lat, sessionKey) {
	sessionKey = !sessionKey ? "revgeoJSON" : sessionKey; 
	fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat)
	.then(function(response) {
			return response.json();
	})
	.then(function(json) {
		const add = json.display_name.split(', ');
		const value = { str: add[1], strNo: add[0], zip: add[6], city: add[3], state: add[5], country: add[7] };
		sessionStorage.setItem(sessionKey, JSON.stringify(value));
	})
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Location mit Straße, Nr, PLZ und Ort in Geo-Koordinaten umgewandeln.
// Bsp.:
//				let str = 'Lenbachstraße';
//				let strNo = '22';
//				let zip = '86529';
//				let city = 'Schrobenhausen';
//				location2Geo(str, strNo, zip, city, "locationJSON");
//					let locationStr = sessionStorage.getItem("locationJSON");
//					let locationObj = JSON.parse(locationStr);
//					console.log(JSON.stringify(locationObj));
//					// {"lat":"48.5620576","lon":"11.264430424966125"}
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function location2Geo(str, strNo, zip, city, sessionKey) {
	sessionKey = !sessionKey ? "locationJSON" : sessionKey; 
	fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + str + ' ' + strNo + ', ' + zip + ' ' + city)
		.then(function(response) {
				return response.json();
		})
		.then(function(json) {
			const value = { lat: json[0].lat, lon: json[0].lon }; 
			sessionStorage.setItem(sessionKey, JSON.stringify(value));
		})
}


//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Browserparameter abfragen und in SessionStore speichern
// Bsp.:
// 				getBrowserInfo("browserJSON");
//					let browserStr = sessionStorage.getItem("browserJSON");
//					let browserObj = JSON.parse(browserStr);
//					alert(JSON.stringify(browserObj));
//
// Die Browserdaten liegen dann in dem Objekt "browserObj" vor.
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function getBrowserInfo(sessionKey) {
	sessionKey = !sessionKey ? "browserJSON" : sessionKey; 
	const browserInfo = {
		Codename: navigator.appCodeName,
		Language: navigator.language,
		Platform: navigator.platform,
		UserAgent: navigator.userAgent,
		Cookies: navigator.cookieEnabled
	}
	sessionStorage.setItem(sessionKey, JSON.stringify(browserInfo));	// Objekt in String konvertieren
}
function getBrowserInf() {
	const browserInfo = {
		Codename: navigator.appCodeName,
		Language: navigator.language,
		Platform: navigator.platform,
		UserAgent: navigator.userAgent,
		Cookies: navigator.cookieEnabled
	}
	return JSON.stringify(browserInfo);	// Objekt in String konvertieren
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// IP-Adresse abfragen und in SessionStore speichern
// Bsp.:
//				getIP("IPaddress");
//					let IPaddress = sessionStorage.getItem("IPaddress");
//					alert("IP-Adress: " + IPaddress);
//
// Die IP-Adresse ist dann im SessionStore unter dem Key "IPaddress" abrufbar
// WICHTIG: Die PHP-Datei "getIP.php" muss sich im selben Verzeichnis befinden, wie diese Funktion
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function getIPAddress(sessionKey) {
	sessionKey = !sessionKey ? "IPaddress" : sessionKey; 
	const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) { 
				sessionStorage.setItem(sessionKey, this.responseText);
			} 
    };
    xhttp.open("GET", "getIP.php", true);
    xhttp.send();
}
function getIP() {
	const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) { 
				return this.responseText
			} 
    };
    xhttp.open("GET", "getIP.php", true);
    xhttp.send();
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Holt aktuelles Datum und Uhrzeit und konvertiert in Zulu-Darstellung (ISO-Format: 8601)
// Bsp.: 
//				Wenn aktuelles Datum Fri Dec 18 2020 13:18:52 GMT+0100 (Mitteleuropäische Normalzeit) ist
//				const dat = getActual2ZuluDat():
//					console.log(dat); 				// 2020-12-18T12:18:52.739Z
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function getActual2ZuluDat() {
	const heute = new Date(); 					// lokales aktuelles Datum und aktuelle Zeit
	const iso = heute.toISOString(); 
	return iso;
}


/**********************************************************************
 * Konvertiert lokales UTC-Datum in Zulu-Zeit (GMT)
 * Bsp.:
 * 		console.log(utc2Zulu('2020-12-18T09:05:08.375');
 * 		// 2020-12-18T07:05:08.375Z
 **********************************************************************/
export function utc2Zulu(utc) {
	const dat = new Date(utc);
	return dat.toISOString(); 
}

/**********************************************************************
 * Konvertiert einen Zulu-Zeit-String in Lokale-Zeit-Darstellung
 * Bsp.: 
 * 				Wenn aktuelle Abfrage-Device in MESZ (UTC+2) liegt => Sommerzeit
 *				const dat = "2020-05-03T23:05:08.375Z";
 * 				zulu2LocalDat(dat); 
 *					console.log(zulu2LocalDat(dat)); 		// 2020-05-04T01:05:08.375
 **********************************************************************/
export function zulu2LocalDat(isoString) {
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


/**********************************************************************
 * Konvertiert eine Zahl oder String in einen String mit führenden Nullen
 * @param {Number|String} num
 * @param {Number} digit
 * @returns {String}
 * Bsp.: 
 * 		const num = 22;
 * 		const digit = 3;
 * 		console.log("ZeroFill: " + zeroFill(num, digit));
 * 		// "ZeroFill: 022"
 * 		console.log("ZeroFill: " + zeroFill('Test', 6));
 * 		// "ZeroFill: 00Test"
 **********************************************************************/
export function zeroFill(number, digits) {
	number = typeof number === 'undefined' ? "" : number + "";	// always a string
  digits -= number.length;
  if (digits > 0) {
    return new Array(digits + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number;
}

/**********************************************************************
 * Konvertiert aus einen UTC-String entsprechend Datum und/oder Uhrzeit.
 * Wenn Monat, Tag, Stunde, Minute, Sekunde nur einstellig übergeben werden, 
 * dann werden führende Nullen ergänzt. 
 * Bsp.: 
 * 			Wenn aktuelle Abfrage-Device in MESZ (UTC+2)
 *				const dat = "2020-12-18T9:5:8.375";
 *				const form = "veryShortDat"; 
 *				utc2date(dat, form); 
 *					console.log(dat); // 18. DEZ 2020
 *
 *						form:
 *							'array'						// ["Fr", "Freitag", "18", "DEZ", "DEZEMBER", "12", "2020", "09", "05", "08", "375"]
 *							'simpleDat'				// 18.12.2020  (default)
 *							'shortDat'				// Fr, 18. DEZ 2020 
 *							'longDat'					// Freitag, den 18. DEZEMBER 2020
 *							'fullTime'				// 09:05:08.375Z
 *							'veryShortTime'		// 09:05
 *							'shortTime'				// 09:05:08
 *							'longTime'				// 9 Uhr, 5 Min., 8 Sek.
 *							'datTime'					// 18. DEZ 2020, 09:05
 *							'IT'							// 2020-12-18
 *							'iCal'						// 20201218T090508Z
 *							'UTCZ'						// 2020-12-18T09:03:08.375Z
 **********************************************************************/
export function utc2date(utc, form) {
	form = typeof form === 'undefined' ? 'simpleDat' : form;
	
	const dat = utc.split('T');

	const date = dat[0].split('-');
	dat[0] = `${date[0]}-${zeroFill(date[1], 2)}-${zeroFill(date[2], 2)}`;

	const t = dat[1].split('.');
	const	hms = t[0].split(':');
	const time = `${zeroFill(hms[0], 2)}:${zeroFill(hms[1], 2)}:${zeroFill(hms[2], 2)}`;
	const dS = t[1].substr(0, t[1].length - 1);			// delete last char: Z
	const decSec = zeroFill(dS, 3);
	dat[1] = `${time}.${decSec}`;

	const YYYY = dat[0].substring(0, 4);
	const MM = parseInt(dat[0].substring(5, 7)) - 1;
	let partDat = dat[0].split('-');
	
	const utcForm = `${dat[0]}T${dat[1]}Z`;
	const datum = new Date(utcForm);
	const WD = datum.getDay();

	const weekday_long = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
	const weekday_short = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
	const month_long = ['JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI', 'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'];
	const month_short = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
	
	const dayShort = weekday_short[parseInt(WD)];
	const dayLong = weekday_long[parseInt(WD)];
	const monShort = month_short[parseInt(MM)];
	const monLong = month_long[parseInt(MM)];
	
	let ret = "";
	switch (form) {
		case "simpleDat":								
			ret = `${partDat[2]}.${zeroFill(String(MM +1), 2)}.${YYYY}`;
			break;
		case "veryShortDat":								
			ret = `${partDat[2]}. ${monShort} ${YYYY}`;
			break;
		case "shortDat":
			ret = `${dayShort}, ${partDat[2]}. ${monShort} ${YYYY}`;
			break;	
		case "longDat":					
			ret = `${dayLong}, den ${partDat[2]}. ${monLong} ${YYYY}`;
			break;	
		case "fullTime":
			ret = `${dat[1]}`;
			break;
		case "veryShortTime":
			ret = `${dat[1].substring(0, 5)}`;
			break;	
		case "shortTime":
			ret = `${dat[1].substring(0, 8)}`;
			break;
		case "longTime":
			let partTime = dat[1].split(':');
			ret = `${parseInt(partTime[0])} Uhr, ${parseInt(partTime[1])} Min., ${parseInt(partTime[2])} Sek.`;
			break;	
		case "datTime":
				ret = `${partDat[2]}. ${monShort} ${YYYY}, ${dat[1].substring(0, 5)}`;
				break;
		case "IT":
				ret = `${dat[0]}`;
				break;	
		case "array":
			ret = [dayShort, dayLong, partDat[2], monShort, monLong, zeroFill(String(MM +1), 2), YYYY, dat[1].substring(0, 2), dat[1].substring(3, 5), dat[1].substring(6, 8), dat[1].substring(9, 12)];
			break;
		case "iCal":
			const iCalDate = dat[0].replaceAll('-', '');
			const t = dat[1].replaceAll(':', '');
			const iCalTime = t.substring(0, t.length -5);
			ret = `${iCalDate}T${iCalTime}Z`;
			break;		
		case "UTCZ":
			const utc = `${dat[0]}T${dat[1]}`;
			ret = `${utc2Zulu(utc)}`;
			break;
		default:at
			ret = `${partDat[2]}. ${monShort} ${YYYY}`;
	}
	return ret;
}

/**********************************************************************
 * Extrahiert aus einen UTC-String die Zeit
 * Bsp.: 
 * 				Wenn aktuelle Abfrage-Device in MESZ (UTC+2) liegt
 *				const dat = "2020-05-03T09:05:08:375Z";
 *				utc2date(dat); 
 *					console.log(dat); // 09:05:08
 **********************************************************************/
export function utc2time(utc) {
	const dat = utc.split('T');
	return dat[1].substring(0, 8);
}

/**********************************************************************
 * Addiert Anzahl Tage zu einem bestimmten Datum in UTC
 * Bsp.: 
 *			1) const dat = "2020-02-15T09:05:08.375Z";
 *			2) const dat = "2020-02-15";
 *			const days = parseInt("21");
 *				console.log(addDays(dat, days)); 	
 *						1) // 2020-03-07T09:05:08.375Z
 *						2) // 2020-03-07T00:00:00.000
 *
 * 			const form = "short";
 *				console.log(addDays(dat, days, form)); 	
 *						1) // 2020-03-07
 *						2) // 2020-03-07
 *			form:
 *				"full"		// YYYY-MM-DDThh:mm:ss.ms		(default)
 *				"short"		// YYYY-MM-DD
 **********************************************************************/
export function addDays(utc, days, form) {
	const dat = utc.split('T');
	dat[1] = typeof dat[1] === 'undefined' ? '00:00:00.000' : dat[1];
	dat[0] = new Date(utc);
	dat[0].setDate(dat[0].getDate() + days);
	form = typeof form === 'undefined' ? 'full' : form;
	let ret = "";
	switch (form) {
		case "short":								
			ret = `${dat[0].toLocaleDateString('fr-CA')}`;
			break;
		default:
			ret = `${dat[0].toLocaleDateString('fr-CA')}T${dat[1]}`;
	}
	return ret;
}

/**********************************************************************
 * Rundet eine Zahl 'num' auf x Nachkommastellen: Bsp: round(4.234567, 3);  // 4.235
 *
 **********************************************************************/
export function round(num, X) {
	X = (!X ? 2 : X);										// Default 2 Nachkommastellen
	if (X < 1 || X > 14) return false;		// Nachkomastellen auf 14 Stellen begrenzen
	let e = Math.pow(10, X);
	let k = (Math.round(num * e) / e).toString();
	if (k.indexOf('.') == -1) k += '.';
	k += e.toString().substring(1);
	return k.substring(0, k.indexOf('.') + X+1);
}

/**********************************************************************
 * Rundet eine Zahl 'x' mit vier Nachkommastellen in Exponenten-Schreibweise: zahl*e^exp, Bsp: "1.2345e4"
 *
 **********************************************************************/
export function roundExp(x) {
	return x.toExponential(4);
}

/**********************************************************************
 * Rundet eine Zahl 'x' mit vier Nachkommastellen in Eng-Schreibweise: "zahl*10^exp", Bsp: "1.2345 * 10^6"
 *
 **********************************************************************/
export function roundEng(x) {
	let str = roundExp(x).replace('e+0', '').replace('e+', 'e');
	if (str.replace('e', '').length !== str.length) {
		// exponent existing
		str = str.replace('e', ' * 10^');
	}
	return str;
}

/**********************************************************************
 * Der reguläre Ausdruck entspricht einer einzelnen Ziffer \d, gefolgt von einer dreistelligen 
 * Menge (? = (\D {3}) + (?!\D)). Die übereinstimmende Ziffer wird dann durch $1 ersetzt. 
 * $1 ist ein spezielles Ersetzungsmuster, das einen Wert der ersten in Klammern gesetzten Unter/
 * übereinstimmungszeichenfolge enthält (in unserem Fall ist es die übereinstimmende Ziffer). 
 * Das Komma ist das Trennzeichen. 
 * Um eine Zahl in dem folgenden Format zu erhalten, z.B. XXX.XXX.XXX. 
 * Es gilt zu beachten, dass einige Länder (USA etc.) den (Punkt) als Tausendertrennzeichen benutzen.
 **********************************************************************/
export function formCurrency(num, form) {
	form = typeof form === 'undefined' ? 'EUR' : form;
	let ret = "";
	switch (form) {
		case "DE-Sym":								
			ret = num
			.toFixed(2) // always two decimal digits
			.replace('.', ',') // replace decimal point character with ,
			.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' EUR'
			break;
		case "DE":								
			ret = num
			.toFixed(2)
			.replace('.', ',')
			.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
			break;
		case "US-Sym":								
			ret = '$' + num
			.toFixed(2)
			.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
			break;
		default:
			ret = num
			.toFixed(2)
			.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' ' + form
			break;
	}
  return ret;
}

/**********************************************************************
 * Koordinaten Konvertierung - GradDezimal in Grad Minute
 * Bsp: dd2dms(40.567534, 'long');	// 40° 34.224' E
 **********************************************************************/
export function dd2dm(degree, lat_long, dez) {
	let factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	let deg = Math.abs(parseInt(degree));
	let min = round((Math.abs(degree) - deg) * 60, 5);
	let sign = (degree < 0) ? -1 : 1;
	let dir = (lat_long == 'lat') ? ((sign > 0) ? 'N' : 'S') : ((sign > 0) ? 'E' : 'W');
	if(!dir)
		return (deg * sign) + '\u00b0' + min + "'";
	else
		return deg + '\u00b0' + min + "'" + dir;
}

/**********************************************************************
 * Koordinaten Konvertierung - GradDezimal in Grad Minute Sekunde
 * Bsp: dd2dms(40.567534, 'long');	// 40° 34' 3.1224" E
 **********************************************************************/
export function dd2dms(degree, lat_long, dez) {
	let factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	let deg = Math.abs(parseInt(degree));
	let min = (Math.abs(degree) - deg) * 60;
	let sec = min;
	min = Math.abs(parseInt(min));
	sec = round((sec - min) * 60, 5);
	let sign = (degree < 0) ? -1 : 1;
	let dir = (lat_long == 'lat') ? ((sign > 0) ? 'N' : 'S') : ((sign > 0) ? 'E' : 'W');
	if(!dir)
		return (deg * sign) + '\u00b0' + min + "'" + sec + '"';
	else
		return deg + '\u00b0' + min + "'" + sec + '"' + dir;
}

/**********************************************************************
 * Koordinaten Konvertierung - Grad Minute Sekunde in GradDezimal
 * Bsp: dms2dd(40, 34, 3.1224, 'E');	// 40,567534° E
 **********************************************************************/
export function dms2dd(deg, min, sec, dir, dez) {
	let factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	let sign;
	if(dir) {
		sign = (dir.toLowerCase() == 'w' || dir.toLowercase() == 's') ? -1 : 1;
		dir = (dir.toLowerCase() == 'w' || dir.toLowercase() == 's' || dir.toLowercase() == 'n' || dir.toLowercase() == 'e') ? dir.toUpperCase() : '';
	} else {
		sign = (deg < 0) ? -1 : 1;
		dir = '';
	}
	var dec = round((Matg.abs(deg) + ((min * 60) + sec) / 3600), 5);
	if(!dir || dir == '')
		return (dec * sign) + '\u00b0';
	else
		return dec + '\u00b0' + dir;
}

/**********************************************************************
 * Umrechnung Kilometer in Nautische Meilen
 **********************************************************************/
export function km2nm(km, dez) {
	return round(km / 1.851852, dez);
}

/**********************************************************************
 * Umrechnung Nautische Meilen in Kilometer
 **********************************************************************/
export function nm2km(nm, dez) {
	return round(nm * 1.851852, dez);
}

/**********************************************************************
 * Trigonometrische Funktionen in Grad statt im Radiant
 * converts degree to radians
 * @param degree
 * @returns {number}
 **********************************************************************/
let toRadians = function toRadians(degree) {
	return degree * (Math.PI / 180);
};

/**********************************************************************
 * Trigonometrische Funktionen in Grad statt im Radiant 
 * Converts radian to degree
 * @param radians
 * @returns {number}
 **********************************************************************/
let toDegree = function (radians) {
	return radians * (180 / Math.PI);
}

/**********************************************************************
 *  Geodesy representation conversion functions (c) Chris Veness 2002-2012 
 *   - www.movable-type.co.uk/scripts/latlong.html
 *  
 *  Usage: 
 *    var lat = Geo.parseDMS('51° 28′ 40.12″ N'); 
 *    var lon = Geo.parseDMS('000° 00′ 05.31″ W'); 
 *    var p1 = new LatLon(lat, lon);
 **********************************************************************/
let Geo = {};  // Geo namespace, representing static class
/**
 * Parses string representing degrees/minutes/seconds into numeric degrees
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3º 37' 09"W) 
 * or fixed-width format without separators (eg 0033709W). Seconds and minutes may be omitted. 
 * (Note minimal validation is done).
 *
 * @param   {String|Number} dmsStr: Degrees or deg/min/sec in variety of formats
 * @returns {Number} Degrees as decimal number
 * @throws  {TypeError} dmsStr is an object, perhaps DOM object without .value?
 **/
Geo.parseDMS = function(dmsStr) {
  if (typeof deg == 'object') throw new TypeError('Geo.parseDMS - dmsStr is [DOM?] object');
  
  // check for signed decimal degrees without NSEW, if so return it directly
  if (typeof dmsStr === 'number' && isFinite(dmsStr)) return Number(dmsStr);
  
  // strip off any sign or compass dir'n & split out separate d/m/s
  var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
  if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol
  
  if (dms == '') return NaN;
  
  // and convert to decimal degrees...
  switch (dms.length) {
    case 3:  // interpret 3-part result as d/m/s
      var deg = dms[0]/1 + dms[1]/60 + dms[2]/3600; 
      break;
    case 2:  // interpret 2-part result as d/m
      var deg = dms[0]/1 + dms[1]/60; 
      break;
    case 1:  // just d (possibly decimal) or non-separated dddmmss
      var deg = dms[0];
      // check for fixed-width unseparated format eg 0033709W
      //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
      //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600; 
      break;
    default:
      return NaN;
  }
  if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve
  return Number(deg);
}

/**
 * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 **/
Geo.toLat = function(deg, format, dp) {
  var lat = Geo.toDMS(deg, format, dp);
  return lat==null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
}

/**
 * Convert numeric degrees to deg/min/sec longitude (suffixed with E/W)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 **/
Geo.toLon = function(deg, format, dp) {
  var lon = Geo.toDMS(deg, format, dp);
  return lon==null ? '–' : lon + (deg<0 ? 'W' : 'E');
}

/**
 * Convert numeric degrees to deg/min/sec as a bearing (0º..360º)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 **/
Geo.toBrng = function(deg, format, dp) {
  deg = (Number(deg)+360) % 360;  // normalise -ve values to 180º..360º
  var brng =  Geo.toDMS(deg, format, dp);
  return brng==null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360º!
}

/**********************************************************************
 * Cookies
 * 
 * Usage:
 * 	if (cookiesEnabled()) {			// if true
 * 
 * 		let name = "cookie_name";	// name of cookie
 * 		let value = "test";				// value of cookie
 * 		let days = 7;							// expires in 7 days
 * 
 * 		setCookie(name, value, days);
 * 
 * 		let cookie = getCookie(name);	// return string or null
 * 
 * 		delCookie(name);
 * 
 * 		} else {									// if false
 * 			... error message ...
 * 		}
 **********************************************************************/
export function cookiesEnabled() {
	let cookieEnabled = (navigator.cookieEnabled) ? true : false;

	if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) { 
		document.cookie="testcookie";
		cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
	}
	return (cookieEnabled);
}
export function setCookie(name, value, days) {
	let expires = "";
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();													// expires is fix in days
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";		// path is fix in "/"
}
export function getCookie(name) {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		let c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
export function delCookie(name) {   
	document.cookie = name + '=; Max-Age=0;';  
}

/**********************************************************************
 * Crypt
 * 
 * Funktionen für die selbsterstellten Algorithmen nach Cipher-Feedback-Modus (CFB) - Blockchiffre
 * http://www.nord-com.net/h-g.mekelburg/krypto/glossar.htm#modus
 * 
 * Usage:
 * 		const text = "Das ist ein zu verschlüssender Text";
 * 		const key = "salt";		// wenn key nicht definiert, dann wird default key genutzt
 * 		const ver = encrypt(text, key);
 * 		const ent = decrypt(ver, key);
 * 		console.log("Verschlüsselt: " + ver);
 * 		console.log("Entschlüsselt: " + ent);
 * 		console.log("Ver-/Entschlüsselt: " + encrypt(text) + ', ' + decrypt(encrypt(text)));
 **********************************************************************/
let Modulus = 65536;
const salt = '${ThisIsTheSaltInMySoup}';
function nextRandom(X, modulus) {
/* Methode: Lineare Kongruenz =>  X[i] = (a * X[i-1] + b) mod m    */
/* Mit den gewählten Parametern ergibt sich eine maximale Periode, */
/* welches unabhängig von gewählten Startwert ist(?).              */
   const y = (17*X + 1) % modulus;
   return y;
}
function getBlockLength(m) {
	let i = 0;
	while(m > 0) {
		i++;
		m = m>>8;
	}
	return i-1;
}
function getKey(key) {
	if (isNaN(key)) {
		key = key + key;
		key = (key.charCodeAt(0)<<8) + key.charCodeAt(1);
	} else {
		key = parseInt(key);
		if (isNaN(key))
			key = 3333;
		else if (key < 0)
			key = key * -1;
	}
	key = key + 1;
	while (key < Math.floor(Modulus/3))
		key = key * 3;
	return (key%Modulus);
}
function crypt_HGC(EinText, key, encrypt) {
	let out = "";
	let Sign, i, X = 255;
	Modulus = 65536;
	for (i=0; i < key.length; i++)
		X = (X * key.charCodeAt(i)) % Modulus;
	i = 0;
	while (i < EinText.length) {
		X = nextRandom(X, Modulus);
		Sign = EinText.charCodeAt(i) ^ ((X>>8)&255);
		Sign = Sign ^ key.charCodeAt(i%key.length);
		if (encrypt) X = X ^ Sign;
		else X = X ^ EinText.charCodeAt(i);
		out = out + String.fromCharCode(Sign);
		i++;
	}
	return out;
}
export function encrypt(text, key) {
	key = typeof key === 'undefined' ? salt : key;
  return escape(crypt_HGC(text, key, 1));
}
export function decrypt(chiffre, key) {
	key = typeof key === 'undefined' ? salt : key;
  return crypt_HGC(unescape(chiffre), key, 0);
}

/**********************************************************************
 * Promise based image base64 encoder
 * 
 * Usage:
 * 	getBase64("./static/img/avatar/FotoCool.jpg")
 *		.then(res => {
 *			console.log('base64 String: ' + res)
 *		})
 *		.catch(err => console.log('base64 Error: ' + err))
 *
 * 	console.log("base64 String: data:image/jpeg;base64,/9j/4QAYRX...")
 **********************************************************************/
const getBase64 = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = (error) => reject('Error: ', error)
	}))

/**********************************************************************
 * use this to make a Base64 encoded string URL friendly, 
 * i.e. '+' and '/' are replaced with '-' and '_' also any trailing '=' 
 * characters are removed
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 **********************************************************************/
export function Base64EncodeUrl(str){
	str = typeof str === 'undefined' ? String(str) : str;
	return encodeURI(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

/**********************************************************************
 * Use this to recreate a Base64 encoded string that was made URL friendly 
 * using Base64EncodeurlFriendly.
 * '-' and '_' are replaced with '+' and '/' and also it is padded with '+'
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 **********************************************************************/
export function Base64DecodeUrl(str){
	str = typeof str === 'undefined' ? String(str) : str;
	//str = (str + '===').slice(0, str.length + (str.length % 4));
	str = str.slice(0, str.length + (str.length % 4));
	return decodeURI(str).replace(/-/g, '+').replace(/_/g, '/');
}

/**********************************************************************
 * The searchParams readonly property of the URL interface returns a 
 * URLSearchParams object allowing access to the GET decoded query 
 * arguments contained in the URL.
 * Bsp.:
 *		https://example.com/?name=Jonathan%20Smith&age=18
 *
 * @param {String} para unique url-parameter
 * @returns {String} the ? and/or & parameter of URL
 **********************************************************************/
export function getUrlPara(para) {
	para = typeof para === 'undefined' ? false : String(para);
	const params = (new URL(document.location)).searchParams;
	if (!para) {										// return of all url-parameters as whole string:
		return decodeURI(params).replace(/_/g, '/').replace(/\+/g, ' ');	// "name=Jonathan Smith&age=18"
	} else {												// question of unique parameter
		if (params.has(para)) {		// check if parameter exists
			return params.get(para);		// if para=name, returns "Jonathan Smith"
		} else {											// parameter does not exists
			return false	// error string
		}
	}
}

/********************************************************************** 
 * OBJEKT NACH EIGENSCHAFT GRUPPIEREN
 * Bsp.: 
 *	const people = [ 
 *		{ name: 'Alice', age: 21 }, 
 *		{ name: 'Max', age: 20 }, 
 *		{ name: 'Jane', age: 20 } 
 *	];
 *	let groupedPeople = groupBy(people, 'age');
 * 	{
 *   20: [
 *     { name: 'Max', age: 20 },
 *     { name: 'Jane', age: 20 }
 *   ],
 *   21: [{ name: 'Alice', age:21 }]
 * 	}
 **********************************************************************/
export function groupObjArr(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property];
    if(!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

/********************************************************************** 
 * In einem Objekt-Array ein Objekt-Property löschen  
 * Bsp.: 
 *	const people = [ 
 *		{ name: 'Alice', age: 21 }, 
 *		{ name: 'Max', age: 20 }, 
 *		{ name: 'Jane', age: 20 } 
 *	];
 *	const property = "name";
 *	const value = "Max";
 *	let obj = delObjArr(people, property, value);
 *	[
 *    { name: 'Alice', age: 21 },
 *    { name: 'Jane', age: 20 }
 *   ]
 **********************************************************************/
export function delObjArr(objArr, property, value) {
	// Delete array item from sorted object
	let index = objArr.map(item => item[property]).indexOf(value);
	if (index > -1) {
		objArr.splice(index, 1);
	}
	return objArr;		// returned the new reduced array object
}

/********************************************************************** 
 * In einem Objekt-Array ein Objekt-Property hinzufügen
 * Bsp.: 
 *	const people = [ 
 *		{ name: 'Alice', age: 21 }, 
 *		{ name: 'Max', age: 20 }, 
 *	];
 *	const newObj = { name: 'Jane', age: 20 };
 *	let obj = delObjArr(people, newObj);
 *	[ 
 *		{ name: 'Alice', age: 21 }, 
 *		{ name: 'Max', age: 20 }, 
 *		{ name: 'Jane', age: 20 } 
 *	]
 *********************************************************************/
export function addObjArr(objArr, newObj, pos) {
	pos = typeof pos === 'undefined' ? "last" : pos;
	if (pos == "last") {
		objArr.push(newObj);
	} else {
		objArr.unshift(newObj);
	}
	return objArr;	// returned the new added array object
}

/********************************************************************** 
 * In einem Objekt-Array ein Objekt-Property finden
 * Bsp.: 
 * Get first matching property:
 * 	const people = [{...}];
 * 	const property = "name";
 *	const value = "Max";
 *	const para = "first" or omitting
 * 	let obj = findObjArr(people, property, value, para);
 * 		{ name: 'Max', age: 20 }, 
 * 
 * Get multiple matching properties
 * 	const property = "ager";
 *	const value = "20";
 *	const para = "first" or omitting
 * 	let obj = findObjArr(people, property, value, para);
 * 		[ 
 *			{ name: 'Max', age: 20 }, 
 *			{ name: 'Jane', age: 20 } 
 *		]
 **********************************************************************/
export function findObjArr(objArr, property, value, para) {
	para = typeof para === 'undefined' ? "first" : para;
	if(para === "first") {
		return objArr.find(obj => obj[property] === value)
	} else {
		return objArr.filter(obj => obj[property] === value)
	}
}

/********************************************************************** 
 * Sortiert ein Objekt-Array nach einem Objekt-Property
 * Bsp.: 
 * 	const objArr = [{...}];
 * 	const sortProp = "age";
 * 	const oder = "asc";
 * 	let obj = sortObjArr(objArr, sortProp, order);
 *	[ 
 *		{ name: 'Max', age: 20 }, 
 *		{ name: 'Jane', age: 20 }, 
 *		{ name: 'Alice', age: 21 } 
 *	]
 **********************************************************************/ 
export function sortObjArr(objArr, sortProp, order) {
	oder = typeof order === 'undefined' ? "asc" : "des";		// -1: ascending; 1: descending
	if(order === "des") {
		return objArr.sort((c1, c2) => (c1[sortProp] < c2[sortProp]) ? -1 : (c1[sortProp] > c2[sortProp]) ? 1 : 0)
	} else {
		return objArr.sort((c1, c2) => (c1[sortProp] < c2[sortProp]) ? 1 : (c1[sortProp] > c2[sortProp]) ? -1 : 0)
	}	
}

export { toRadians, toDegree, getBase64 };
