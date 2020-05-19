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
//				let geoStr = sessionStorage.getItem("geoJSON");
//				let geoObj = JSON.parse(geoStr);
//				alert(JSON.stringify(geoObj));
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
// Browserparameter abfragen und in SessionStore speichern
// Bsp.:
// 				getBrowserInfo("browserJSON");
//				let browserStr = sessionStorage.getItem("browserJSON");
//				let browserObj = JSON.parse(browserStr);
//				alert(JSON.stringify(browserObj));
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
//				let IPaddress = sessionStorage.getItem("IPaddress");
//				alert("IP-Adress: " + IPaddress);
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
//				console.log(dat); // 2020-01-01T20:15:10Z
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
//				console.log(dat); // 2020-05-03T11:05:08
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

export {geoDistance, getGeolocation, getBrowserInfo, getIPAddress, getActual2Zulu, zulu2Local};
