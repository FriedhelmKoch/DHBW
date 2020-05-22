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
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function geoDistance(lat1, lon1, lat2, lon2, unit) {
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

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Speichert die geoDaten als JSON-String in den SessionStorage
// Bsp.:
// 				getGeolocation("geoJSON");
//					let geoStr = sessionStorage.getItem("geoJSON");
//					let geoObj = JSON.parse(geoStr);
//					alert(JSON.stringify(geoObj));
//
// Die Geodaten liegen dann in dem Objekt "geoObj" vor.
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function getGeolocation(sessionKey) {
	sessionKey = !sessionKey ? "geoJSON" : sessionKey; 
	const geoOptions = {
		enableHighAccuracy: true,     // Super-Präzisions-Modus
		timeout: 1000,                // Maximum Wartezeit
		maximumAge: 0                 // Maximum Cache-Alter
	}
	function geoSuccess(pos) {
		const crd = pos.coords;
		const geoValue = {
			latitude: crd.latitude,		// Breitengrad
			longitude: crd.longitude,	// Längengrad
			altitude: crd.altitude,		// Höhe ü. Meeresspiegel in Meter
			precision: crd.accuracy, 	// Genauigkeit der Koordinaten im Meter
			altprecision: crd.altitudeAccuracy,	// Genauigkeit der Höhenangabe
			geotime: crd.timestamp		// Zeitstempel der Positionsangabe
		}
		StorePos(JSON.stringify(geoValue));	// Objekt in String konvertieren
	}
	function geoError(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
		alert("ACHTUNG: Ohne Deine Geolocation-Daten ist die Funktionalität von viaLinked nur eingeschränkt möglich! Um die Geolocation-Funktionalität von viaLinked besser einschätzen zu können, klicke auf das 'viaLinked-Logo' oben links und lese bitte unser Datenschutz- und Nutzungsrichtlinien nach.");
	}
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
	} else {
		alert("ACHTUNG: Geolocation wird von diesem System/Device nicht unterstützt! Die Funktionalität von viaLinked ist daher nur eingeschränkt möglich!");
	}
	function StorePos(value) {
		sessionStorage.setItem(sessionKey, value);
		// Ggf. Location als Ort abfragen
		// https://nominatim.openstreetmap.org/reverse.php?format=html&lat=48.490545479685416&lon=11.338329464399012&zoom=18
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
function reverseGeocoding(lon, lat, sessionKey) {
	sessionKey = !sessionKey ? "revgeoJSON" : sessionKey; 
	fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat)
	.then(function(response) {
			return response.json();
	})
	.then(function(json) {
		const add = json.display_name.split(', ');
		const value = { str: add[1], strNo: add[0], zip: add[6], city: add[3], state: add[5], country: add[7] };
		//console.log(JSON.stringify(value));
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
function location2Geo(str, strNo, zip, city, sessionKey) {
	sessionKey = !sessionKey ? "locationJSON" : sessionKey; 
	fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + str + ' ' + strNo + ', ' + zip + ' ' + city)
		.then(function(response) {
				return response.json();
		})
		.then(function(json) {
			//console.log("OBJECT: " + JSON.stringify(json));
			//console.log('LAT: ' + json[0].lat);
			//console.log('LON: ' + json[0].lon);
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
function getBrowserInfo(sessionKey) {
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
function getIPAddress(sessionKey) {
	sessionKey = !sessionKey ? "IPaddress" : sessionKey; 
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) { 
				//console.log('ÌP-Address: ' + this.responseText); 
				sessionStorage.setItem(sessionKey, this.responseText);
			} 
    };
    xhttp.open("GET", "getIP.php", true);
    xhttp.send();
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Holt aktuelles Datum und Uhrzeit und konvertiert in Zulu-Darstellung
// Bsp.: 
//				Wenn aktuelles Datum (MEZ, UTC+1) der 1. Jan 2020 um 21:15:10 Uhr ist
//				let dat = getActualZulu():
//					console.log(dat); // 2020-01-01T20:15:10Z
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function getActual2Zulu() {
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

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Konvertiert einen Zulu-Zeit-String in Lokale-Zeit-Darstellung
// Bsp.: 
// 				Wenn aktuelle Abfrage-Device in MESZ (UTC+2) liegt
//				let dat = "2020-05-03T09:05:08Z"
//				zulu2Local(dat) 
//					console.log(dat); // 2020-05-03T11:05:08
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function zulu2Local(dat){
	const YYYY = dat.substring(0, 4);
	const MM = dat.substring(5, 7);
	const DD = dat.substring(8, 10);
	const hh = dat.substring(11, 13);
	const mm = dat.substring(14, 16);
	const ss = dat.substring(17, 19);
	const datUTC = new Date(Date.UTC(YYYY, MM, DD, hh, mm, ss));
	const timeOffset = datUTC.getTimezoneOffset() / -60;
	const hhLocal = (parseInt(hh) + parseInt(timeOffset)).toString();
	return YYYY + "-" + MM + "-" + DD + "T" + hhLocal + ":" + mm + ":" + ss;
}

/**
 * Rundet eine Zahl 'num' auf x Nachkommastellen: Bsp: round(4.234567, 3);  // 4.235
 *
 */
function round(num, X) {
	X = (!X ? 2 : X);										// Default 2 Nachkommastellen
	if (X < 1 || X > 14) return false;		// Nachkomastellen auf 14 Stellen begrenzen
	var e = Math.pow(10, X);
	var k = (Math.round(num * e) / e).toString();
	if (k.indexOf('.') == -1) k += '.';
	k += e.toString().substring(1);
	return k.substring(0, k.indexOf('.') + X+1);
}

/**
 * Rundet eine Zahl 'x' mit vier Nachkommastellen in Exponenten-Schreibweise: zahl*e^exp, Bsp: "1.2345e4"
 *
 */
function roundExp(x) {
	return x.toExponential(4);
}

/**
 * Rundet eine Zahl 'x' mit vier Nachkommastellen in Eng-Schreibweise: "zahl*10^exp", Bsp: "1.2345 * 10^6"
 *
 */
function roundEng(x) {
	var str = roundExp(x).replace('e+0', '').replace('e+', 'e');
	if (str.replace('e', '').length !== str.length) {
		// exponent existing
		str = str.replace('e', ' * 10^');
	}
	return str;
}

// Koordinaten Konvertierung - GradDezimal in Grad Minute
// Bsp: dd2dms(40.567534, 'long');	// 40° 34.224' E
function dd2dm(degree, lat_long, dez) {
	var factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	var deg = Math.abs(parseInt(degree));
	var min = round((Math.abs(degree) - deg) * 60, 5);
	var sign = (degree < 0) ? -1 : 1;
	var dir = (lat_long == 'lat') ? ((sign > 0) ? 'N' : 'S') : ((sign > 0) ? 'E' : 'W');
	if(!dir)
		return (deg * sign) + '\u00b0' + min + "'";
	else
		return deg + '\u00b0' + min + "'" + dir;
}

// Koordinaten Konvertierung - GradDezimal in Grad Minute Sekunde
// Bsp: dd2dms(40.567534, 'long');	// 40° 34' 3.1224" E
function dd2dms(degree, lat_long, dez) {
	var factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	var deg = Math.abs(parseInt(degree));
	var min = (Math.abs(degree) - deg) * 60;
	var sec = min;
	min = Math.abs(parseInt(min));
	sec = round((sec - min) * 60, 5);
	var sign = (degree < 0) ? -1 : 1;
	var dir = (lat_long == 'lat') ? ((sign > 0) ? 'N' : 'S') : ((sign > 0) ? 'E' : 'W');
	if(!dir)
		return (deg * sign) + '\u00b0' + min + "'" + sec + '"';
	else
		return deg + '\u00b0' + min + "'" + sec + '"' + dir;
}

// Koordinaten Konvertierung - Grad Minute Sekunde in GradDezimal
// Bsp: dms2dd(40, 34, 3.1224, 'E');	// 40,567534° E
function dms2dd(deg, min, sec, dir, dez) {
	var factor = (!dez) ? 1000 : Math.pow(10, parseInt(dez));
	var sign;
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

// Umrechnung Kilometer in Nautische Meilen
function km2nm(km, dez) {
	return round(km / 1.852, dez);
}

// Umrechnung Nautische Meilen in Kilometer
function nm2km(nm, dez) {
	return round(nm * 1.852, dez);
}

// Trigonometrische Funktionen in Grad statt im Radiant
/**
 * converts degree to radians
 * @param degree
 * @returns {number}
 */
var toRadians = function (degree) {
	return degree * (Math.PI / 180);
};

/**
 * Converts radian to degree
 * @param radians
 * @returns {number}
 */
var toDegree = function (radians) {
	return radians * (180 / Math.PI);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions (c) Chris Veness 2002-2012                        */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Geo = {};  // Geo namespace, representing static class

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
 */
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
 * Convert decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added
 *
 * @private
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} deg formatted as deg/min/secs according to specified format
 * @throws  {TypeError} deg is an object, perhaps DOM object without .value?
 */
Geo.toDMS = function(deg, format, dp) {
  if (typeof deg == 'object') throw new TypeError('Geo.toDMS - deg is [DOM?] object');
  if (isNaN(deg)) return null;  // give up here if we can't make a number from deg
  
    // default values
  if (typeof format == 'undefined') format = 'dms';
  if (typeof dp == 'undefined') {
    switch (format) {
      case 'd': dp = 4; break;
      case 'dm': dp = 2; break;
      case 'dms': dp = 0; break;
      default: format = 'dms'; dp = 0;  // be forgiving on invalid format
    }
  }
  
  deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)
  
  switch (format) {
    case 'd':
      d = deg.toFixed(dp);     // round degrees
      if (d<100) d = '0' + d;  // pad with leading zeros
      if (d<10) d = '0' + d;
      dms = d + '\u00B0';      // add º symbol
      break;
    case 'dm':
      var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
      var d = Math.floor(min / 60);    // get component deg/min
      var m = (min % 60).toFixed(dp);  // pad with trailing zeros
      if (d<100) d = '0' + d;          // pad with leading zeros
      if (d<10) d = '0' + d;
      if (m<10) m = '0' + m;
      dms = d + '\u00B0' + m + '\u2032';  // add º, ' symbols
      break;
    case 'dms':
      var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
      var d = Math.floor(sec / 3600);    // get component deg/min/sec
      var m = Math.floor(sec/60) % 60;
      var s = (sec % 60).toFixed(dp);    // pad with trailing zeros
      if (d<100) d = '0' + d;            // pad with leading zeros
      if (d<10) d = '0' + d;
      if (m<10) m = '0' + m;
      if (s<10) s = '0' + s;
      dms = d + '\u00B0' + m + '\u2032' + s + '\u2033';  // add º, ', " symbols
      break;
  }
  
  return dms;
}

/**
 * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
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
 */
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
 */
Geo.toBrng = function(deg, format, dp) {
  deg = (Number(deg)+360) % 360;  // normalise -ve values to 180º..360º
  var brng =  Geo.toDMS(deg, format, dp);
  return brng==null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360º!
}

export {geoDistance, getGeolocation, reverseGeocoding, location2Geo, getBrowserInfo, getIPAddress, getActual2Zulu, zulu2Local, round, roundExp, dd2dm, dd2dms, dms2dd, km2nm, nm2km, toRadians, toDegree};
