# 🌐 IP Information Tool

Eine moderne REST API und Webanwendung zur Ermittlung von IP-Adressinformationen, Providern und Geodaten.

## ✨ Features

### 📊 Umfassende IP-Informationen
- **IP-Adresse** (IPv4/IPv6) mit Typ-Erkennung
- **Provider-Erkennung** mit lokaler Datenbank (Deutschland/Europa/Global)
- **Geolocation** (Land, Region, Stadt, Koordinaten)
- **Netzwerk-Informationen** (Protokoll, User Agent, Proxy-Erkennung)
- **Zeitstempel** in verschiedenen Formaten

### 🔧 Technische Features
- **REST API** mit JSON Response
- **Moderne Web-Oberfläche** mit Dark/Light Mode
- **Responsive Design** für alle Geräte
- **Lokale Provider-Datenbank** (keine externe API nötig)
- **CORS Unterstützung** für Cross-Origin Anfragen
- **Rate Limiting** für API-Stabilität

### 🎨 Benutzerfreundlichkeit
- **Echtzeit-Updates** mit Auto-Refresh
- **Copy-to-Clipboard** für IP und JSON
- **Export-Funktion** als JSON Datei
- **Teilen-Funktion** über Web Share API
- **Tastenkürzel** für schnelle Bedienung
- **Benachrichtigungen** für Aktionen

## 📁 Dateistruktur
ip-information/
├── index.html # Web-Oberfläche (Frontend)
├── api.php # REST API Endpoint
├── config.php # Konfigurationseinstellungen
├── providers/ # Provider-Datenbanken
│ ├── german.php # Deutsche Provider (AS3320, AS3209, ...)
│ ├── europe.php # Europäische Provider
│ └── global.php # Globale Cloud/Provider
├── assets/ # Statische Assets (optional)
│ ├── css/
│ └── js/
└── README.md # Diese Dokumentation
