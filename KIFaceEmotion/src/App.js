import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [modellGeladen, setModellGeladen] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [emotionKonfidenz, setEmotionKonfidenz] = useState(0);
  const [ladeFortschritt, setLadeFortschritt] = useState(0);
  const [emotionHistorie, setEmotionHistorie] = useState([]);
  const [dominanteEmotion, setDominanteEmotion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [modellFehler, setModellFehler] = useState(null);

  // Prüfen ob Mobilgerät
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Emotionen definieren mit useMemo
  const EMOTIONEN = useMemo(() => ({
    'neutral': { label: 'Neutral', color: '#4A90E2', icon: '😐' },
    'happy': { label: 'Glücklich', color: '#F5A623', icon: '😊' },
    'sad': { label: 'Traurig', color: '#50E3C2', icon: '😢' },
    'angry': { label: 'Wütend', color: '#D0021B', icon: '😠' },
    'fearful': { label: 'Ängstlich', color: '#BD10E0', icon: '😨' },
    'disgusted': { label: 'Angeekelt', color: '#7ED321', icon: '🤢' },
    'surprised': { label: 'Überrascht', color: '#9013FE', icon: '😲' }
  }), []);

  // Dynamischen Modell-Pfad ermitteln
  const getModelPath = useCallback(() => {
    // Debug-Info
    console.log('window.location:', {
      href: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      origin: window.location.origin
    });
    
    // Für localhost Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/models';
    }
    
    // Für Production auf Apache mit Unterverzeichnis
    const path = window.location.pathname;
    
    // Wenn die App in einem Unterverzeichnis liegt (z.B. /KI-FaceEmotion/)
    if (path.includes('/KI-FaceEmotion')) {
      // Extrahiere den Basis-Pfad
      const pathParts = path.split('/');
      const appIndex = pathParts.indexOf('KI-FaceEmotion');
      const basePath = pathParts.slice(0, appIndex + 1).join('/');
      
      console.log('Base path detected:', basePath);
      return `${basePath}/models`;
    }
    
    // Fallback: Relativer Pfad
    console.log('Using relative path /models');
    return '/models';
  }, []);

  // Modelle laden mit mehreren Versuchen
  const loadModels = useCallback(async () => {
    try {
      setLadeFortschritt(10);
      setModellFehler(null);
      
      const MODEL_PATH = getModelPath();
      console.log('Versuche Modelle zu laden von:', MODEL_PATH);
      
      // Mehrere Versuche mit verschiedenen Pfaden
      const loadAttempts = [
        MODEL_PATH,
        '/KI-FaceEmotion/models',
        '/models',
        './models'
      ];
      
      let loadedSuccessfully = false;
      
      for (let i = 0; i < loadAttempts.length; i++) {
        const attemptPath = loadAttempts[i];
        try {
          console.log(`Versuch ${i + 1}: Lade von ${attemptPath}`);
          
          setLadeFortschritt(20 + i * 20);
          
          // Alle Modelle laden
          await Promise.all([
            faceapi.nets.tinyFaceDetector.load(attemptPath),
            faceapi.nets.faceLandmark68Net.load(attemptPath),
            faceapi.nets.faceRecognitionNet.load(attemptPath),
            faceapi.nets.faceExpressionNet.load(attemptPath)
          ]);
          
          console.log(`✅ Erfolg mit Pfad: ${attemptPath}`);
          loadedSuccessfully = true;
          break;
          
        } catch (attemptError) {
          console.log(`❌ Versuch ${i + 1} fehlgeschlagen:`, attemptError.message);
          // Weiter zum nächsten Versuch
        }
      }
      
      if (!loadedSuccessfully) {
        throw new Error('Alle Ladeversuche fehlgeschlagen');
      }
      
      setLadeFortschritt(100);
      
      // Kurze Pause für UI-Update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setModellGeladen(true);
      console.log('✅ Alle Modelle erfolgreich geladen und bereit');
      
    } catch (error) {
      console.error('❌ Kritischer Fehler beim Laden der Modelle:', error);
      
      // Detaillierte Fehlermeldung
      let errorMessage = 'Modelle konnten nicht geladen werden. ';
      errorMessage += 'Bitte überprüfen Sie: ';
      errorMessage += '1. Modelle sind im /models Ordner vorhanden ';
      errorMessage += '2. Apache konfiguriert für .json/.weights Dateien';
      
      setModellFehler(errorMessage);
      setLadeFortschritt(0);
      
      // Debug-Info in Konsole
      console.error('Modell-Lade-Fehler Details:', {
        error: error.message,
        currentPath: window.location.pathname,
        modelPathAttempted: getModelPath()
      });
    }
  }, [getModelPath]);

  // Canvas auf Video-Größe anpassen
  const resizeCanvas = useCallback(() => {
    if (webcamRef.current && canvasRef.current && containerRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (video && container) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width - 20;
        const containerHeight = containerRect.height - 20;
        
        const scale = isMobile ? 0.9 : 0.95;
        const maxWidth = containerWidth * scale;
        const maxHeight = containerHeight * scale;
        
        const aspectRatio = 4/3;
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        // Sicherstellen, dass Größen positiv sind
        width = Math.max(100, Math.floor(width));
        height = Math.max(75, Math.floor(height));
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        video.style.width = `${width}px`;
        video.style.height = `${height}px`;
        
        console.log(`Canvas resized to: ${width}x${height}`);
      }
    }
  }, [isMobile]);

  // Erkennung durchführen
  const detectFace = useCallback(async () => {
    if (
      !modellGeladen ||
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4 ||
      !canvasRef.current
    ) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Sicherstellen, dass Canvas gültige Größe hat
      if (canvas.width <= 0 || canvas.height <= 0) {
        resizeCanvas();
        return;
      }
      
      // Gesichter und Emotionen erkennen
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: isMobile ? 160 : 320,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceExpressions();
      
      // Canvas leeren
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Wenn Gesichter erkannt wurden
      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: canvas.width,
          height: canvas.height
        });
        
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections, 0.5);
        
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
          setEmotion(highestEmotion);
          setEmotionKonfidenz(konfidenzProzent);
          
          setEmotionHistorie(prev => {
            const neueHistorie = [...prev, {
              emotion: highestEmotion,
              zeit: Date.now(),
              konfidenz: highestScore
            }];
            
            return neueHistorie.length > 50 
              ? neueHistorie.slice(-50) 
              : neueHistorie;
          });
        }
      } else {
        setEmotion(null);
        setEmotionKonfidenz(0);
      }
    } catch (error) {
      console.error('Fehler bei der Gesichtserkennung:', error);
    }
  }, [modellGeladen, isMobile, resizeCanvas]);

  // Dominante Emotion aus Historie berechnen
  useEffect(() => {
    if (emotionHistorie.length > 0) {
      const jetzt = Date.now();
      const letzte5Sekunden = emotionHistorie.filter(
        e => jetzt - e.zeit < 5000
      );
      
      if (letzte5Sekunden.length > 0) {
        const emotionCount = {};
        letzte5Sekunden.forEach(e => {
          emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
        });
        
        const haeufigsteEmotion = Object.keys(emotionCount).reduce((a, b) => 
          emotionCount[a] > emotionCount[b] ? a : b
        );
        
        setDominanteEmotion(haeufigsteEmotion);
      }
    }
  }, [emotionHistorie]);

  // Emotion-Display Komponente
  const EmotionDisplay = useCallback(() => {
    if (!emotion) return null;
    
    const emotionData = EMOTIONEN[emotion] || EMOTIONEN['neutral'];
    
    return (
      <div className="emotion-display-overlay">
        <div className="emotion-header">
          <span className="emotion-icon">{emotionData.icon}</span>
          <div className="emotion-info">
            <h3 style={{ color: emotionData.color }}>
              {emotionData.label}
            </h3>
            <p className="konfidenz-text">
              {emotionKonfidenz}% sicher
            </p>
          </div>
        </div>
        <div className="konfidenz-balken">
          <div 
            className="konfidenz-fortschritt"
            style={{
              width: `${emotionKonfidenz}%`,
              backgroundColor: emotionData.color
            }}
          />
        </div>
      </div>
    );
  }, [emotion, emotionKonfidenz, EMOTIONEN]);

  // Emotion-Historie Komponente (nur auf Desktop)
  const EmotionHistorieDisplay = useCallback(() => {
    if (emotionHistorie.length === 0 || isMobile) return null;
    
    const emotionCounts = {};
    emotionHistorie.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    return (
      <div className="emotion-statistik">
        <h4>📊 Emotionsstatistik</h4>
        <div className="emotion-verteilung">
          {Object.entries(EMOTIONEN).map(([key, data]) => {
            const count = emotionCounts[key] || 0;
            const prozent = emotionHistorie.length > 0 
              ? Math.round((count / emotionHistorie.length) * 100) 
              : 0;
            
            return (
              <div key={key} className="emotion-item">
                <div className="emotion-item-header">
                  <span className="emotion-item-icon">{data.icon}</span>
                  <span className="emotion-item-label">{data.label}</span>
                </div>
                <div className="verteilung-balken">
                  <div 
                    className="verteilung-fortschritt"
                    style={{
                      width: `${prozent}%`,
                      backgroundColor: data.color
                    }}
                  />
                </div>
                <span className="emotion-prozent">{prozent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [emotionHistorie, EMOTIONEN, isMobile]);

  // Modelle beim Start laden
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Starte Modell-Ladung...');
      loadModels();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [loadModels]);

  // Erkennung starten
  useEffect(() => {
    let intervalId;
    
    if (modellGeladen) {
      console.log('Starte Gesichtserkennung...');
      intervalId = setInterval(() => {
        detectFace();
      }, isMobile ? 200 : 150);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [modellGeladen, detectFace, isMobile]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // Video geladen
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (video) {
      const handleLoadedMetadata = () => {
        setTimeout(resizeCanvas, 300);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [resizeCanvas]);

  const handleResetHistorie = useCallback(() => {
    setEmotionHistorie([]);
    setDominanteEmotion(null);
  }, []);

  // Fehleranzeige für Modelle
  const renderModelError = () => {
    if (!modellFehler) return null;
    
    return (
      <div className="modell-fehler">
        <h3>⚠️ Modelle konnten nicht geladen werden</h3>
        <p>{modellFehler}</p>
        <div className="fehler-details">
          <p><strong>Debug-Info:</strong></p>
          <p>Aktuelle URL: {window.location.href}</p>
          <p>Pfad: {window.location.pathname}</p>
        </div>
        <button 
          className="neu-laden-button"
          onClick={() => {
            setModellFehler(null);
            setLadeFortschritt(0);
            setTimeout(() => loadModels(), 500);
          }}
        >
          🔄 Erneut versuchen
        </button>
        <p className="fehler-loesungstipps">
          <strong>Lösungsvorschläge:</strong><br />
          1. Browser Console öffnen (F12) für mehr Details<br />
          2. Prüfen ob /models Ordner existiert<br />
          3. Apache-Konfiguration prüfen
        </p>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>🧠 Gesichts- & Emotionserkennung</h1>
            <p className="app-beschreibung">
              Echtzeit-Erkennung von Gesichtslandmarken und Emotionen
            </p>
          </div>
          
          {modellFehler ? (
            renderModelError()
          ) : !modellGeladen ? (
            <div className="lade-anzeige">
              <div className="lade-inhalt">
                <div className="lade-spinner"></div>
                <p className="lade-text">Lade KI-Modelle...</p>
                <div className="lade-balken">
                  <div 
                    className="lade-fortschritt"
                    style={{ width: `${ladeFortschritt}%` }}
                  />
                </div>
                <p className="lade-prozent">{ladeFortschritt}%</p>
                {ladeFortschritt < 100 && (
                  <p className="lade-hinweis">
                    Beim ersten Mal kann dies etwas dauern
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="status-bereich">
              <div className="status-badge status-bereit">
                <span className="status-icon">✓</span>
                <span>Modell bereit</span>
              </div>
              {dominanteEmotion && !isMobile && (
                <div className="status-badge status-emotion">
                  <span className="status-icon">
                    {EMOTIONEN[dominanteEmotion]?.icon || '🎭'}
                  </span>
                  <span>Dominant: {EMOTIONEN[dominanteEmotion]?.label}</span>
                </div>
              )}
            </div>
          )}
        </header>
        
        <main className="app-main">
          <div className="erkennungs-container">
            <div 
              ref={containerRef}
              className="video-container"
            >
              <Webcam
                ref={webcamRef}
                className="webcam-video"
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: isMobile ? 480 : 640,
                  height: isMobile ? 360 : 480,
                  facingMode: "user"
                }}
                onUserMedia={() => setTimeout(resizeCanvas, 300)}
                mirrored={true}
              />
              
              <canvas
                ref={canvasRef}
                className="gesichts-canvas"
              />
              
              {emotion && (
                <div className="emotion-overlay">
                  <EmotionDisplay />
                </div>
              )}
            </div>
            
            <div className="kontrollen">
              <button 
                className="kontroll-button"
                onClick={handleResetHistorie}
                disabled={!modellGeladen}
              >
                <span className="button-icon">📊</span>
                <span className="button-text">Historie zurücksetzen</span>
              </button>
              
              <div className="webcam-indicator">
                <span className="indicator-icon">
                  {webcamRef.current?.video?.readyState === 4 ? '📹' : '⏳'}
                </span>
                <span className="indicator-text">
                  {webcamRef.current?.video?.readyState === 4 ? 'Kamera aktiv' : 'Kamera lädt'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="info-container">
            <div className="info-card">
              <h3 className="info-title">🔬 Funktionsweise</h3>
              <ul className="info-list">
                <li><strong>68 Gesichtslandmarken</strong> werden erkannt</li>
                <li><strong>7 Grundemotionen</strong> nach Paul Ekman</li>
                <li><strong>Echtzeit-Emotionserkennung</strong></li>
                <li><strong>Lokale Verarbeitung</strong> - keine Server</li>
              </ul>
            </div>
            
            <div className="info-card">
              <h3 className="info-title">💡 Tipps</h3>
              <ul className="info-list">
                <li>Gute Beleuchtung verwenden</li>
                <li>Direkt in die Kamera schauen</li>
                <li>Klar erkennbare Gesichtsausdrücke</li>
                {isMobile && <li>Gerät ruhig halten</li>}
              </ul>
            </div>
          </div>
          
          {!isMobile && emotionHistorie.length > 10 && (
            <div className="statistik-container">
              <EmotionHistorieDisplay />
            </div>
          )}
          
          {isMobile && emotionHistorie.length > 5 && (
            <div className="mobile-statistik">
              <h4>Letzte Emotionen:</h4>
              <div className="mobile-emotionen">
                {emotionHistorie.slice(-6).map((e, idx) => (
                  <div 
                    key={idx}
                    className="mobile-emotion"
                    style={{ color: EMOTIONEN[e.emotion]?.color }}
                  >
                    {EMOTIONEN[e.emotion]?.icon}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        
        <footer className="app-footer">
          <p className="footer-text">
            Verwendet face-api.js. Läuft komplett im Browser.
          </p>
          <p className="debug-info">
            Path: {window.location.pathname} | Host: {window.location.hostname}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
