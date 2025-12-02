// DOM-Element-Referenzen
const videoEl = document.getElementById('webcam-video');
const canvasEl = document.getElementById('gesichts-canvas');
const videoContainerEl = document.getElementById('video-container');
const statusContainerEl = document.getElementById('status-container');
const resetHistorieButton = document.getElementById('reset-historie-button');
const webcamIndicatorEl = document.getElementById('webcam-indicator');
const emotionOverlayEl = document.getElementById('emotion-overlay');

// Globale Zustandsvariablen
let modellGeladen = false;
let emotion = null;
let emotionKonfidenz = 0;
let ladeFortschritt = 0;
let emotionHistorie = [];
let dominanteEmotion = null;
let isMobile = window.innerWidth <= 768;
let modellFehler = null;
let detectionInterval = null;

// NEU: Konfiguration für Historie
const HISTORIE_CONFIG = {
    maxSize: 300,           // Maximale Anzahl gespeicherter Erkennungen
    statistikSize: 150,     // Anzahl für Statistik-Berechnung
    dominantWindow: 10000,  // Zeitfenster für dominante Emotion (10 Sekunden)
    mobileMaxSize: 150      // Maximale Größe für mobile Geräte
};

// Emotionen definieren
const EMOTIONEN = {
    'neutral': { label: 'Neutral', color: '#4A90E2', icon: '😐' },
    'happy': { label: 'Glücklich', color: '#F5A623', icon: '😊' },
    'sad': { label: 'Traurig', color: '#50E3C2', icon: '😢' },
    'angry': { label: 'Wütend', color: '#D0021B', icon: '😠' },
    'fearful': { label: 'Ängstlich', color: '#BD10E0', icon: '😨' },
    'disgusted': { label: 'Angeekelt', color: '#7ED321', icon: '🤢' },
    'surprised': { label: 'Überrascht', color: '#9013FE', icon: '😲' }
};

// Hilfsfunktion zur UI-Aktualisierung
function updateLadeUI() {
    const fortschrittBalken = document.getElementById('lade-fortschritt');
    const prozentText = document.getElementById('lade-prozent');
    
    if (fortschrittBalken) fortschrittBalken.style.width = `${ladeFortschritt}%`;
    if (prozentText) prozentText.textContent = `${ladeFortschritt}%`;
}

function updateWebcamIndicator(isReady) {
    const icon = webcamIndicatorEl.querySelector('.indicator-icon');
    const text = webcamIndicatorEl.querySelector('.indicator-text');
    
    if (isReady) {
        icon.textContent = '📹';
        text.textContent = 'Kamera aktiv';
        webcamIndicatorEl.style.backgroundColor = 'rgba(0, 255, 0, 0.08)';
    } else {
        icon.textContent = '⏳';
        text.textContent = 'Kamera lädt';
        webcamIndicatorEl.style.backgroundColor = 'rgba(255, 165, 0, 0.08)';
    }
}

function updateStatusArea() {
    if (modellFehler) {
        statusContainerEl.innerHTML = renderModelError();
    } else if (!modellGeladen) {
        updateLadeUI();
    } else {
        let dominantHtml = '';
        if (dominanteEmotion && !isMobile) {
            const data = EMOTIONEN[dominanteEmotion] || EMOTIONEN['neutral'];
            dominantHtml = `
                <div class="status-badge status-emotion">
                    <span class="status-icon">${data.icon}</span>
                    <span>Dominant: ${data.label}</span>
                </div>
            `;
        }

        statusContainerEl.innerHTML = `
            <div class="status-bereich">
                <div class="status-badge status-bereit">
                    <span class="status-icon">✓</span>
                    <span>Modell bereit</span>
                </div>
                ${dominantHtml}
            </div>
        `;
        resetHistorieButton.disabled = false;
    }
}

// --- Model Lade-Logik ---

function getModelPath() {
    return 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
}

async function loadModels() {
    try {
        ladeFortschritt = 10;
        modellFehler = null;
        updateStatusArea();
        
        const MODEL_PATH = getModelPath();
        console.log('Lade KI-Modelle von:', MODEL_PATH);
        
        // Modelle nacheinander laden für besseren Fortschritt
        ladeFortschritt = 25;
        updateLadeUI();
        await faceapi.nets.tinyFaceDetector.load(MODEL_PATH);
        
        ladeFortschritt = 40;
        updateLadeUI();
        await faceapi.nets.faceLandmark68Net.load(MODEL_PATH);
        
        ladeFortschritt = 60;
        updateLadeUI();
        await faceapi.nets.faceRecognitionNet.load(MODEL_PATH);
        
        ladeFortschritt = 80;
        updateLadeUI();
        await faceapi.nets.faceExpressionNet.load(MODEL_PATH);
        
        ladeFortschritt = 100;
        updateLadeUI();
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        modellGeladen = true;
        updateStatusArea();
        console.log('✅ Alle Modelle erfolgreich geladen und bereit');
        
    } catch (error) {
        console.error('❌ Kritischer Fehler beim Laden der Modelle:', error);
        
        let errorMessage = 'Modelle konnten nicht geladen werden. Bitte prüfen Sie Ihre Netzwerkverbindung und die Browser-Konsolenfehler (F12). Es wurde versucht, von einem CDN zu laden.';
        
        modellFehler = errorMessage;
        ladeFortschritt = 0;
        updateStatusArea();
    }
}

function renderModelError() {
    return `
        <div class="modell-fehler">
            <h3>⚠️ Modelle konnten nicht geladen werden</h3>
            <p>${modellFehler}</p>
            <div class="fehler-details">
                <p><strong>Debug-Info:</strong></p>
                <p>Ladeversuch von: ${getModelPath()}</p>
                <p>Aktuelle URL: ${window.location.href}</p>
            </div>
            <button 
                class="neu-laden-button"
                onclick="handleReloadModels()"
            >
                🔄 Erneut versuchen
            </button>
            <p class="fehler-loesungstipps">
                <strong>Lösungsvorschläge:</strong><br />
                1. Browser Console öffnen (F12) für mehr Details<br />
                2. Netzwerkverbindung prüfen<br />
                3. Gegebenenfalls Browser neu starten
            </p>
        </div>
    `;
}

function handleReloadModels() {
    modellFehler = null;
    ladeFortschritt = 0;
    modellGeladen = false;
    updateStatusArea();
    setTimeout(loadModels, 500);
}

// --- Webcam & Canvas Logik ---

function resizeCanvas() {
    if (videoEl.readyState === 4 && canvasEl && videoContainerEl) {
        const containerRect = videoContainerEl.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.width * (3/4);
        
        const maxWidth = containerWidth;
        const maxHeight = containerHeight;
        
        const aspectRatio = 4/3;
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        width = Math.max(100, Math.floor(width));
        height = Math.max(75, Math.floor(height));
        
        canvasEl.width = width;
        canvasEl.height = height;
        canvasEl.style.width = `${width}px`;
        canvasEl.style.height = `${height}px`;
        
        videoEl.style.width = `${width}px`;
        videoEl.style.height = `${height}px`;

        videoContainerEl.style.height = `${height}px`;
        
        videoEl.videoWidth = width;
        videoEl.videoHeight = height;

        console.log(`Canvas resized to: ${width}x${height}`);
    }
}

async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: isMobile ? 480 : 640,
                height: isMobile ? 360 : 480,
                facingMode: "user"
            }, 
            audio: false 
        });
        videoEl.srcObject = stream;
        updateWebcamIndicator(false);
        
        videoEl.addEventListener('loadedmetadata', () => {
            resizeCanvas();
            updateWebcamIndicator(true);
            if (modellGeladen) {
                startDetection();
            }
        });
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Webcam:", err);
        const errorMessage = "Webcam-Zugriff fehlgeschlagen. Bitte überprüfen Sie die Berechtigungen.";
        modellFehler = errorMessage;
        updateStatusArea();
    }
}

// --- Emotions-Logik ---

function berechneDominanteEmotion() {
    if (emotionHistorie.length === 0) {
        dominanteEmotion = null;
        return;
    }
    
    const jetzt = Date.now();
    const letzteZeitfenster = emotionHistorie.filter(
        e => jetzt - e.zeit < HISTORIE_CONFIG.dominantWindow
    );
    
    if (letzteZeitfenster.length > 0) {
        const emotionCount = {};
        letzteZeitfenster.forEach(e => {
            emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
        });
        
        const haeufigsteEmotion = Object.keys(emotionCount).reduce((a, b) => 
            emotionCount[a] > emotionCount[b] ? a : b
        );
        
        dominanteEmotion = haeufigsteEmotion;
    } else {
        dominanteEmotion = null;
    }
    updateStatusArea();
}

function renderEmotionDisplay() {
    if (!emotion) {
        emotionOverlayEl.style.display = 'none';
        return;
    }
    
    const emotionData = EMOTIONEN[emotion] || EMOTIONEN['neutral'];
    
    emotionOverlayEl.style.display = 'block';
    emotionOverlayEl.innerHTML = `
        <div class="emotion-display-overlay">
            <div class="emotion-header">
                <span class="emotion-icon">${emotionData.icon}</span>
                <div class="emotion-info">
                    <h3 style="color: ${emotionData.color}">${emotionData.label}</h3>
                    <p class="konfidenz-text">${emotionKonfidenz}% sicher</p>
                </div>
            </div>
            <div class="konfidenz-balken">
                <div 
                    class="konfidenz-fortschritt"
                    style="width: ${emotionKonfidenz}%; background-color: ${emotionData.color}"
                />
            </div>
        </div>
    `;
}

function renderEmotionHistorieDisplay() {
    const desktopStatContainer = document.getElementById('statistik-container');
    const mobileStatContainer = document.getElementById('mobile-statistik-container');
    
    // Desktop-Statistik anzeigen (Karten-Design)
    if (!isMobile && emotionHistorie.length >= 10) {
        const statistikSize = Math.min(HISTORIE_CONFIG.statistikSize, emotionHistorie.length);
        const recentHistorie = emotionHistorie.slice(-statistikSize);
        const emotionCounts = {};
        
        recentHistorie.forEach(e => {
            emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
        });
        
        const total = recentHistorie.length;
        
        let cardsHtml = '';
        Object.entries(EMOTIONEN).forEach(([key, data]) => {
            const count = emotionCounts[key] || 0;
            const prozent = total > 0 ? Math.round((count / total) * 100) : 0;
            
            cardsHtml += `
                <div class="emotion-karte" style="border-left-color: ${data.color}">
                    <div class="emotion-karte-header">
                        <span class="emotion-karte-icon">${data.icon}</span>
                        <span class="emotion-karte-name">${data.label}</span>
                        <span class="emotion-karte-prozent">${prozent}%</span>
                    </div>
                    <div class="emotion-karte-balken-container">
                        <div class="emotion-karte-balken">
                            <div 
                                class="emotion-karte-fortschritt"
                                style="width: ${prozent}%; background-color: ${data.color}"
                            ></div>
                        </div>
                        <span class="emotion-karte-count">${count}×</span>
                    </div>
                </div>
            `;
        });
        
        desktopStatContainer.innerHTML = `
            <div class="statistik-container">
                <div class="emotion-statistik">
                    <h4>📊 Emotionsstatistik</h4>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 20px; text-align: center;">
                        Verteilung der letzten ${total} Erkennungen
                        <br><small style="opacity: 0.6;">(Gesamt: ${emotionHistorie.length})</small>
                    </p>
                    <div class="emotion-verteilung">${cardsHtml}</div>
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 20px; text-align: center;">
                        Jede Karte zeigt eine Emotion mit Häufigkeit und Prozentwert
                        <br>Historie: ${emotionHistorie.length}/${HISTORIE_CONFIG.maxSize} gespeichert
                    </p>
                </div>
            </div>
        `;
    } else if (!isMobile) {
        // Placeholder für Desktop
        desktopStatContainer.innerHTML = `
            <div class="statistik-container">
                <div class="emotion-statistik">
                    <h4>📊 Emotionsstatistik</h4>
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;">📈</div>
                        <p style="opacity: 0.7; margin-bottom: 10px;">
                            Sammle Daten für die Statistik...
                        </p>
                        <div style="display: inline-block; background: rgba(0, 210, 255, 0.1); 
                             padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;">
                            ${emotionHistorie.length}/10 Erkennungen benötigt
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        desktopStatContainer.innerHTML = '';
    }
    
    // Mobile Statistik anzeigen (mit Prozentwerten - Safari optimiert)
    if (isMobile && emotionHistorie.length >= 5) {
        // Berechne Häufigkeit der Emotionen
        const statistikSize = Math.min(50, emotionHistorie.length);
        const recentHistorie = emotionHistorie.slice(-statistikSize);
        
        const emotionCounts = {};
        recentHistorie.forEach(e => {
            emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
        });
        
        const total = recentHistorie.length;
        
        // Sortiere nach Häufigkeit (absteigend)
        const sortedEmotions = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3); // Zeige nur die 3 häufigsten auf Mobile
        
        let mobileStatsHtml = '';
        
        if (sortedEmotions.length > 0) {
            sortedEmotions.forEach(([emotionKey, count]) => {
                const data = EMOTIONEN[emotionKey] || EMOTIONEN['neutral'];
                const percentage = Math.round((count / total) * 100);
                
                mobileStatsHtml += `
                    <div class="mobile-emotion-item" style="border-left-color: ${data.color}">
                        <div class="mobile-emotion-content">
                            <div class="mobile-emotion-header">
                                <span class="mobile-emotion-icon">${data.icon}</span>
                                <span class="mobile-emotion-label">${data.label}</span>
                                <span class="mobile-emotion-percent" style="color: ${data.color}">${percentage}%</span>
                            </div>
                            <div class="mobile-emotion-bar">
                                <div class="mobile-emotion-progress" style="width: ${percentage}%; background-color: ${data.color}"></div>
                            </div>
                            <div class="mobile-emotion-count">${count} Erkennungen</div>
                        </div>
                    </div>
                `;
            });
        } else {
            mobileStatsHtml = `
                <div class="mobile-no-data">
                    <p>Noch nicht genug Daten für Statistik</p>
                </div>
            `;
        }
        
        // Zeige auch die letzten Erkennungen als Quick-View
        const recentEmotions = emotionHistorie.slice(-3);
        let recentHtml = '';
        if (recentEmotions.length > 0) {
            recentHtml = `
                <div class="mobile-recent-container">
                    <p class="mobile-recent-title">Aktuelle Erkennungen:</p>
                    <div class="mobile-recent-emotions">
            `;
            
            recentEmotions.forEach(e => {
                const data = EMOTIONEN[e.emotion] || EMOTIONEN['neutral'];
                recentHtml += `
                    <div class="mobile-recent-item" title="${data.label} (${Math.round(e.konfidenz * 100)}%)">
                        ${data.icon}
                    </div>
                `;
            });
            
            recentHtml += `
                    </div>
                </div>
            `;
        }
        
        mobileStatContainer.innerHTML = `
            <div class="mobile-statistik">
                <h4>📱 Emotionsstatistik</h4>
                <div class="mobile-stats-info">
                    <span>Aus ${total} Erkennungen</span>
                    <br>
                    <small style="opacity: 0.6;">(Gesamt: ${emotionHistorie.length})</small>
                </div>
                <div class="mobile-emotions-list">
                    ${mobileStatsHtml}
                </div>
                ${recentHtml}
                <div class="mobile-reset-container">
                    <button 
                        class="mobile-reset-button"
                        onclick="handleResetHistorie()"
                    >
                        🔄 Zurücksetzen (${emotionHistorie.length} Einträge)
                    </button>
                </div>
            </div>
        `;
    } else if (isMobile) {
        // Placeholder für Mobile, wenn keine Daten
        mobileStatContainer.innerHTML = `
            <div class="mobile-statistik">
                <h4>📱 Emotionsstatistik</h4>
                <div class="mobile-placeholder">
                    <div class="mobile-placeholder-icon">📊</div>
                    <p class="mobile-placeholder-text">Sammle Daten...</p>
                    <div class="mobile-placeholder-count">
                        ${emotionHistorie.length}/5 Erkennungen benötigt
                    </div>
                </div>
            </div>
        `;
    } else {
        mobileStatContainer.innerHTML = '';
    }
}

function handleResetHistorie() {
    if (emotionHistorie.length > 50) {
        const confirmReset = confirm(`Möchten Sie wirklich ${emotionHistorie.length} gesammelte Daten zurücksetzen?`);
        if (!confirmReset) {
            return;
        }
    }
    
    emotionHistorie = [];
    dominanteEmotion = null;
    
    document.getElementById('statistik-container').innerHTML = '';
    document.getElementById('mobile-statistik-container').innerHTML = '';
    
    updateStatusArea();
    console.log(`Historie zurückgesetzt (${emotionHistorie.length} Einträge gelöscht).`);
    
    // Erfolgsmeldung anzeigen
    setTimeout(() => {
        if (!isMobile) {
            const statContainer = document.getElementById('statistik-container');
            statContainer.innerHTML = `
                <div class="statistik-container">
                    <div class="emotion-statistik">
                        <h4>📊 Emotionsstatistik</h4>
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 3rem; color: #00d2ff; margin-bottom: 15px;">✅</div>
                            <p style="opacity: 0.8; margin-bottom: 10px;">
                                Statistik zurückgesetzt
                            </p>
                            <p style="font-size: 0.9rem; opacity: 0.6;">
                                Starten Sie die Gesichtserkennung neu
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 100);
}

// --- Gesichtserkennung ---

async function detectFace() {
    if (
        !modellGeladen ||
        !videoEl ||
        videoEl.readyState !== 4 ||
        !canvasEl
    ) {
        return;
    }

    try {
        if (canvasEl.width <= 0 || canvasEl.height <= 0) {
            resizeCanvas();
            return;
        }
        
        const detections = await faceapi
            .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions({
                inputSize: isMobile ? 160 : 320,
                scoreThreshold: 0.5
            }))
            .withFaceLandmarks()
            .withFaceExpressions();
        
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        
        if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, {
                width: canvasEl.width,
                height: canvasEl.height
            });
            
            faceapi.draw.drawDetections(canvasEl, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasEl, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasEl, resizedDetections, 0.5);
            
            const expressions = detections[0].expressions;
            let highestEmotion = null;
            let highestScore = 0;
            
            Object.entries(expressions).forEach(([emotionName, score]) => {
                if (score > highestScore) {
                    highestScore = score;
                    highestEmotion = emotionName;
                }
            });
            
            if (highestEmotion && highestScore > 0.1) {
                const konfidenzProzent = Math.round(highestScore * 100);
                emotion = highestEmotion;
                emotionKonfidenz = konfidenzProzent;
                
                emotionHistorie.push({
                    emotion: highestEmotion,
                    zeit: Date.now(),
                    konfidenz: highestScore
                });
                
                // Historie begrenzen (mehrere Optionen)
                const maxHistorySize = isMobile ? HISTORIE_CONFIG.mobileMaxSize : HISTORIE_CONFIG.maxSize;
                
                if (emotionHistorie.length > maxHistorySize) {
                    emotionHistorie = emotionHistorie.slice(-maxHistorySize);
                }
            }
        } else {
            emotion = null;
            emotionKonfidenz = 0;
        }
        
        renderEmotionDisplay();
        berechneDominanteEmotion();
        renderEmotionHistorieDisplay();

    } catch (error) {
        console.error('Fehler bei der Gesichtserkennung:', error);
        clearInterval(detectionInterval);
    }
}

function startDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
    
    const intervalTime = isMobile ? 200 : 150;
    detectionInterval = setInterval(detectFace, intervalTime);
    console.log('Starte Gesichtserkennung mit Intervall:', intervalTime);
}

// --- Initialisierung und Event-Handler ---
function initApp() {
    isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        document.getElementById('mobile-tip').style.display = 'list-item';
    }

    // Debug Info mit Fehlerbehandlung (optional behalten oder entfernen)
    const debugPath = document.getElementById('debug-path');
    const debugHost = document.getElementById('debug-host');
    if (debugPath && debugHost) {
        debugPath.textContent = window.location.pathname;
        debugHost.textContent = window.location.hostname;
    }

    // Event Listener
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        setTimeout(resizeCanvas, 100);
    });
    
    resetHistorieButton.addEventListener('click', handleResetHistorie);

    // Modelle laden und Webcam starten
    loadModels().then(() => {
        if (modellGeladen) {
            setupWebcam();
        }
    });
}

// Startpunkt
window.onload = initApp;
