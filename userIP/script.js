// script.js - JavaScript für IP Information App

class IPInformationApp {
    constructor() {
        this.apiUrl = 'api.php?details=true';
        this.data = null;
        this.isLoading = false;
        
        // DOM Elements Cache
        this.elements = {
            ipAddress: document.getElementById('ipAddress'),
            ipBadges: document.getElementById('ipBadges'),
            
            // Provider
            providerName: document.getElementById('providerName'),
            providerASN: document.getElementById('providerASN'),
            providerType: document.getElementById('providerType'),
            providerCountry: document.getElementById('providerCountry'),
            providerSource: document.getElementById('providerSource'),
            
            // Geolocation
            geoCountry: document.getElementById('geoCountry'),
            geoRegion: document.getElementById('geoRegion'),
            geoCity: document.getElementById('geoCity'),
            geoISP: document.getElementById('geoISP'),
            geoOrg: document.getElementById('geoOrg'),
            
            // Network
            ipType: document.getElementById('ipType'),
            protocol: document.getElementById('protocol'),
            isPrivate: document.getElementById('isPrivate'),
            proxyDetected: document.getElementById('proxyDetected'),
            timezone: document.getElementById('timezone'),
            
            // API Info
            apiVersion: document.getElementById('apiVersion'),
            timestamp: document.getElementById('timestamp'),
            method: document.getElementById('method'),
            host: document.getElementById('host'),
            
            // Buttons
            refreshBtn: document.getElementById('refreshBtn'),
            copyIpBtn: document.getElementById('copyIpBtn'),
            exportBtn: document.getElementById('exportBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Notification
            notification: document.getElementById('notification')
        };
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.bindEvents();
        this.loadData();
        
        // Auto-refresh alle 60 Sekunden
        setInterval(() => {
            if (!this.isLoading) {
                this.loadData();
            }
        }, 60000);
        
        console.log('IP Information App initialisiert');
    }
    
    setupTheme() {
        // Theme aus localStorage oder Systemeinstellung
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
        
        // Theme Toggle Event
        this.elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    bindEvents() {
        // Refresh Button
        this.elements.refreshBtn.addEventListener('click', () => this.loadData());
        
        // Copy IP Button
        this.elements.copyIpBtn.addEventListener('click', () => this.copyIP());
        
        // Export Button
        this.elements.exportBtn.addEventListener('click', () => this.exportData());
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R = Refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.loadData();
            }
            // Ctrl/Cmd + C = Copy IP (wenn keine Eingabe fokussiert)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
                document.activeElement === document.body) {
                this.copyIP();
            }
        });
    }
    
    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Cache-Busting Parameter
            const timestamp = Date.now();
            const response = await fetch(`${this.apiUrl}&_=${timestamp}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data = await response.json();
            
            if (this.data.success) {
                this.updateUI();
                this.showNotification('Daten erfolgreich geladen', 'success');
                console.log('API Response:', this.data);
            } else {
                throw new Error(this.data.error || 'Unbekannter API Fehler');
            }
            
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            this.showNotification(`Fehler: ${error.message}`, 'error');
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    updateUI() {
        if (!this.data) return;
        
        // IP Address
        this.elements.ipAddress.textContent = this.data.ip?.address || 'Unbekannt';
        this.updateIPBadges();
        
        // Provider Information
        this.updateProviderInfo();
        
        // Geolocation
        this.updateGeolocation();
        
        // Network Information
        this.updateNetworkInfo();
        
        // API Information
        this.updateAPIInfo();
    }
    
    updateIPBadges() {
    const badges = [];
    const ip = this.data.ip;
    
    if (!ip) return;
    
    // Private/Public Badge
    if (ip.is_private) {
        badges.push('<span class="badge warning">🔒 Private IP</span>');
    } else {
        badges.push('<span class="badge primary">🌐 Öffentliche IP</span>');
    }
    
    // IP Version Badge
    if (ip.type === 'IPv6') {
        badges.push('<span class="badge info">IPv6</span>');
    } else {
        badges.push('<span class="badge info">IPv4</span>');
    }
    
    // Länderspezifische Badges mit Flaggen
    const countryCode = this.data.provider?.country || this.data.geolocation?.country_code;
    if (countryCode) {
        const flag = this.getFlagEmoji(countryCode);
        const countryName = this.getCountryName(countryCode);
        badges.push(`<span class="badge success">${flag} ${countryName}</span>`);
    }
    
    // Provider Type Badge
    if (this.data.provider?.type) {
        const type = this.data.provider.type;
        let icon = '🏢';
        if (type.includes('ISP')) icon = '📡';
        if (type.includes('Hosting')) icon = '🖥️';
        if (type.includes('Cloud')) icon = '☁️';
        if (type.includes('Mobile')) icon = '📱';
        if (type.includes('Cable')) icon = '📺';
        if (type.includes('Fiber')) icon = '🔆';
        if (type.includes('CDN')) icon = '🚀';
        
        badges.push(`<span class="badge">${icon} ${type}</span>`);
    }
    
    // Proxy Badge
    if (this.data.proxy?.detected) {
        badges.push('<span class="badge warning">🛡️ Proxy</span>');
    }
    
    // Mobile Badge
    if (this.data.geolocation?.mobile) {
        badges.push('<span class="badge">📱 Mobile</span>');
    }
    
    // Hosting Badge
    if (this.data.geolocation?.hosting) {
        badges.push('<span class="badge">🖥️ Hosting</span>');
    }
    
    this.elements.ipBadges.innerHTML = badges.join(' ');
}

    // Neue Hilfsfunktion: Ländername basierend auf Code
    getCountryName(countryCode) {
        const countries = {
            'DE': 'Deutschland',
            'FR': 'Frankreich',
            'AT': 'Österreich',
            'CH': 'Schweiz',
            'IT': 'Italien',
            'ES': 'Spanien',
            'NL': 'Niederlande',
            'GB': 'Großbritannien',
            'US': 'USA',
            'CA': 'Kanada',
            'AU': 'Australien',
            'JP': 'Japan',
            'CN': 'China',
            'RU': 'Russland',
            'PL': 'Polen',
            'SE': 'Schweden',
            'NO': 'Norwegen',
            'DK': 'Dänemark',
            'FI': 'Finnland',
            'BE': 'Belgien',
            'LU': 'Luxemburg',
            'IE': 'Irland',
            'PT': 'Portugal',
            'GR': 'Griechenland',
            'HU': 'Ungarn',
            'CZ': 'Tschechien',
            'SK': 'Slowakei',
            'SI': 'Slowenien',
            'HR': 'Kroatien',
            'RO': 'Rumänien',
            'BG': 'Bulgarien',
            'EE': 'Estland',
            'LV': 'Lettland',
            'LT': 'Litauen',
            'MT': 'Malta',
            'CY': 'Zypern',
            'IS': 'Island',
            'TR': 'Türkei',
            'UA': 'Ukraine',
            'BY': 'Weißrussland',
            'MD': 'Moldawien',
            'AL': 'Albanien',
            'MK': 'Nordmazedonien',
            'RS': 'Serbien',
            'ME': 'Montenegro',
            'BA': 'Bosnien',
            'XK': 'Kosovo'
        };
        
        return countries[countryCode] || countryCode;
    }
    
    updateProviderInfo() {
        const provider = this.data.provider;
        
        if (provider) {
            this.elements.providerName.textContent = provider.name || '-';
            this.elements.providerASN.textContent = provider.asn || '-';
            this.elements.providerType.textContent = provider.type || '-';
            this.elements.providerCountry.textContent = provider.country || '-';
            this.elements.providerSource.textContent = provider.source || '-';
        } else {
            this.elements.providerName.textContent = 'Keine Provider-Information verfügbar';
            this.elements.providerASN.textContent = '-';
            this.elements.providerType.textContent = '-';
            this.elements.providerCountry.textContent = '-';
            this.elements.providerSource.textContent = '-';
        }
    }
    
    updateGeolocation() {
        const geo = this.data.geolocation;
        
        if (geo) {
            this.elements.geoCountry.textContent = geo.country || '-';
            this.elements.geoRegion.textContent = geo.region || '-';
            this.elements.geoCity.textContent = geo.city || '-';
            this.elements.geoISP.textContent = geo.isp || '-';
            this.elements.geoOrg.textContent = geo.organization || '-';
            
            // Falls Stadt leer, aber Koordinaten vorhanden, zeige Koordinaten an
            if (!geo.city && geo.latitude && geo.longitude) {
                this.elements.geoCity.textContent = `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`;
            }
        } else {
            this.elements.geoCountry.textContent = '-';
            this.elements.geoRegion.textContent = '-';
            this.elements.geoCity.textContent = '-';
            this.elements.geoISP.textContent = '-';
            this.elements.geoOrg.textContent = '-';
        }
    }
    
    updateNetworkInfo() {
        const ip = this.data.ip;
        const network = this.data.network;
        
        this.elements.ipType.textContent = ip?.type || '-';
        this.elements.protocol.textContent = network?.protocol?.toUpperCase() || '-';
        this.elements.isPrivate.textContent = ip?.is_private ? 'Ja' : 'Nein';
        this.elements.proxyDetected.textContent = this.data.proxy?.detected ? 'Ja' : 'Nein';
        this.elements.timezone.textContent = this.data.geolocation?.timezone || '-';
    }
    
    updateAPIInfo() {
        const api = this.data.api;
        
        this.elements.apiVersion.textContent = api?.version || '1.0';
        
        // Format timestamp
        if (this.data.request?.timestamp) {
            try {
                const date = new Date(this.data.request.timestamp);
                this.elements.timestamp.textContent = date.toLocaleString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } catch (e) {
                this.elements.timestamp.textContent = this.data.request.timestamp;
            }
        } else {
            this.elements.timestamp.textContent = '-';
        }
        
        this.elements.method.textContent = this.data.request?.method || '-';
        this.elements.host.textContent = this.data.network?.host || '-';
    }
    
    showLoading() {
        this.elements.ipAddress.innerHTML = '<span class="loading"></span> Wird geladen...';
        this.elements.refreshBtn.innerHTML = '<span class="loading"></span> Lädt...';
        this.elements.refreshBtn.disabled = true;
    }
    
    hideLoading() {
        this.elements.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Aktualisieren';
        this.elements.refreshBtn.disabled = false;
    }
    
    showErrorState() {
        this.elements.ipAddress.textContent = 'Fehler beim Laden';
        this.elements.ipAddress.style.color = 'var(--danger)';
    }
    
    async copyIP() {
        const ip = this.data?.ip?.address;
        if (!ip || ip === 'Wird geladen...') {
            this.showNotification('Keine IP-Adresse zum Kopieren verfügbar', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(ip);
            this.showNotification('IP-Adresse kopiert', 'success');
        } catch (err) {
            console.error('Fehler beim Kopieren:', err);
            
            // Fallback für ältere Browser
            try {
                const textArea = document.createElement('textarea');
                textArea.value = ip;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('IP-Adresse kopiert', 'success');
            } catch (fallbackErr) {
                this.showNotification('Fehler beim Kopieren', 'error');
            }
        }
    }
    
    exportData() {
        if (!this.data) {
            this.showNotification('Keine Daten zum Exportieren', 'error');
            return;
        }
        
        try {
            const dataStr = JSON.stringify(this.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const dataUrl = URL.createObjectURL(dataBlob);
            const exportFileName = `ip-info-${this.data.ip?.address || 'unknown'}-${Date.now()}.json`;
            
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = exportFileName;
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
            
            this.showNotification('Daten exportiert', 'success');
        } catch (error) {
            console.error('Fehler beim Exportieren:', error);
            this.showNotification('Fehler beim Exportieren', 'error');
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = this.elements.notification;
        
        // Icon basierend auf Typ setzen
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        // Klassen zurücksetzen und neue setzen
        notification.className = 'notification';
        if (type === 'error') {
            notification.classList.add('error');
        }
        notification.classList.add('show');
        
        // Nach 3 Sekunden ausblenden
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Hilfsfunktion: Ländercode zu Flaggen-Emoji
    getFlagEmoji(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '🌐';
        
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        
        return String.fromCodePoint(...codePoints);
    }
}

// App initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.ipApp = new IPInformationApp();
    } catch (error) {
        console.error('Fehler beim Initialisieren der App:', error);
        
        // Fallback: Einfache Fehlermeldung anzeigen
        document.getElementById('ipAddress').textContent = 'App konnte nicht gestartet werden';
        document.getElementById('ipAddress').style.color = 'var(--danger)';
    }
});

// Test-API-Funktion für Debugging
async function testAPI() {
    try {
        const response = await fetch('api.php');
        const data = await response.json();
        console.log('API-Test erfolgreich:', {
            status: response.status,
            ip: data.ip?.address,
            provider: data.provider?.name
        });
        return true;
    } catch (error) {
        console.error('API-Test fehlgeschlagen:', error);
        return false;
    }
}

// API beim Start testen
setTimeout(testAPI, 500);
