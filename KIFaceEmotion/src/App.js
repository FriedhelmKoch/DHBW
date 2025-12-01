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
  const [containerWidth, setContainerWidth] = useState(800);

  // Emotionen definieren mit useMemo um konstante Referenz zu behalten
  const EMOTIONEN = useMemo(() => ({
    'neutral': { label: 'Neutral', color: '#4A90E2', icon: '😐' },
    'happy': { label: 'Glücklich', color: '#F5A623', icon: '😊' },
    'sad': { label: 'Traurig', color: '#50E3C2', icon: '😢' },
    'angry': { label: 'Wütend', color: '#D0021B', icon: '😠' },
    'fearful': { label: 'Ängstlich', color: '#BD10E0', icon: '😨' },
    'disgusted': { label: 'Angeekelt', color: '#7ED321', icon: '🤢' },
    'surprised': { label: 'Überrascht', color: '#9013FE', icon: '😲' }
  }), []);

  // Container-Größe anpassen
  useEffect(() => {
    const updateContainerWidth = () => {
      if (window.innerWidth >= 992) {
        // Desktop: 800px Breite
        setContainerWidth(800);
      } else if (window.innerWidth >= 768) {
        // Tablet: 90% Breite
        setContainerWidth(window.innerWidth * 0.9);
      } else {
        // Mobile: 95% Breite
        setContainerWidth(window.innerWidth * 0.95);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Modelle laden
  const loadModels = useCallback(async () => {
    try {
      setLadeFortschritt(20);
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      
      console.log('Lade Modelle von:', MODEL_URL);
      
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLadeFortschritt(40);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setLadeFortschritt(60);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setLadeFortschritt(80);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setLadeFortschritt(100);
        setModellGeladen(true);
        console.log('Alle Modelle erfolgreich geladen');
      } catch (err) {
        console.warn('Erster Laderversuch fehlgeschlagen, versuche Fallback:', err);
        // Fallback: Versuche direkte Pfade
        try {
          await faceapi.nets.tinyFaceDetector.load('/models');
          await faceapi.nets.faceLandmark68Net.load('/models');
          await faceapi.nets.faceRecognitionNet.load('/models');
          await faceapi.nets.faceExpressionNet.load('/models');
          setLadeFortschritt(100);
          setModellGeladen(true);
          console.log('Modelle über Fallback geladen');
        } catch (fallbackErr) {
          throw new Error('Modelle konnten nicht geladen werden');
        }
      }
    } catch (error) {
      console.error('Kritischer Fehler beim Laden der Modelle:', error);
    }
  }, []);

  // Canvas auf Video-Größe anpassen
  const resizeCanvas = useCallback(() => {
    if (webcamRef.current && canvasRef.current && containerRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (video && video.videoWidth && video.videoHeight) {
        // Berechne das Seitenverhältnis
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const containerWidth = container.offsetWidth;
        const containerHeight = containerWidth / videoAspectRatio;
        
        // Setze Container-Größe
        container.style.width = `${containerWidth}px`;
        container.style.height = `${containerHeight}px`;
        
        // Setze Video- und Canvas-Größen
        video.style.width = '100%';
        video.style.height = '100%';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        // Setze interne Canvas-Dimensionen für face-api.js
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }
  }, []);

  // Erkennung durchführen
  const detectFace = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      modellGeladen &&
      canvasRef.current
    ) {
      try {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        // Canvas-Größe anpassen
        resizeCanvas();
        
        // Gesichter und Emotionen erkennen
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceExpressions();
        
        // Canvas leeren
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Wenn Gesichter erkannt wurden
        if (detections.length > 0) {
          // Ergebnisse zeichnen
          const resizedDetections = faceapi.resizeResults(detections, {
            width: canvas.width,
            height: canvas.height
          });
          
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections, 0.5);
          
          // Emotionen auswerten
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
            
            // Emotion zur Historie hinzufügen
            setEmotionHistorie(prev => {
              const neueHistorie = [...prev, {
                emotion: highestEmotion,
                zeit: Date.now(),
                konfidenz: highestScore
              }];
              
              // Nur die letzten 50 Einträge behalten
              return neueHistorie.length > 50 
                ? neueHistorie.slice(-50) 
                : neueHistorie;
            });
          }
        } else {
          // Kein Gesicht erkannt
          setEmotion(null);
          setEmotionKonfidenz(0);
        }
      } catch (error) {
        console.error('Fehler bei der Gesichtserkennung:', error);
      }
    }
  }, [modellGeladen, resizeCanvas]);

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
      <div className="emotion-display-overlay" style={{ backgroundColor: `${emotionData.color}20` }}>
        <div className="emotion-header">
          <span style={{ fontSize: '2em' }}>{emotionData.icon}</span>
          <div className="emotion-text">
            <h3 style={{ color: emotionData.color, margin: 0 }}>{emotionData.label}</h3>
            <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.8 }}>
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

  // Emotion-Historie Komponente
  const EmotionHistorieDisplay = useCallback(() => {
    if (emotionHistorie.length === 0) return null;
    
    // Zähle jede Emotion
    const emotionCounts = {};
    emotionHistorie.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    return (
      <div className="emotion-statistik">
        <h4>Emotionsstatistik</h4>
        <div className="emotion-verteilung">
          {Object.entries(EMOTIONEN).map(([key, data]) => {
            const count = emotionCounts[key] || 0;
            const prozent = emotionHistorie.length > 0 
              ? Math.round((count / emotionHistorie.length) * 100) 
              : 0;
            
            return (
              <div key={key} className="emotion-item">
                <div className="emotion-item-header">
                  <span style={{ fontSize: '1.2em' }}>{data.icon}</span>
                  <span className="emotion-label">{data.label}</span>
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
  }, [emotionHistorie, EMOTIONEN]);

  // Modelle beim Start laden
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Erkennung starten
  useEffect(() => {
    let intervalId;
    
    if (modellGeladen) {
      intervalId = setInterval(() => {
        detectFace();
      }, 150);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [modellGeladen, detectFace]);

  // Canvas bei Videoladung anpassen
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (video) {
      const handleLoadedMetadata = () => {
        setTimeout(resizeCanvas, 100);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [resizeCanvas]);

  const handleResetHistorie = useCallback(() => {
    setEmotionHistorie([]);
    setDominanteEmotion(null);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🧠 Gesichts- & Emotionserkennung</h1>
          <p className="app-beschreibung">
            Echtzeit-Erkennung von Gesichtslandmarken und Emotionen
          </p>
        </div>
        
        {!modellGeladen ? (
          <div className="lade-anzeige">
            <p>Lade KI-Modelle... Bitte warten.</p>
            <div className="lade-balken">
              <div 
                className="lade-fortschritt"
                style={{ width: `${ladeFortschritt}%` }}
              />
            </div>
            <p className="lade-prozent">{ladeFortschritt}%</p>
            <p className="lade-details">
              {ladeFortschritt < 100 
                ? 'Modelle werden heruntergeladen...' 
                : 'Modelle geladen! Starte Erkennung...'}
            </p>
          </div>
        ) : (
          <div className="status-bereich">
            <div className="status-badge bereit">
              ✓ Modelle bereit
            </div>
            {dominanteEmotion && (
              <div className="status-badge emotion">
                <span className="emotion-icon">
                  {EMOTIONEN[dominanteEmotion]?.icon || '🎭'}
                </span>
                <span className="emotion-text">
                  Dominant: {EMOTIONEN[dominanteEmotion]?.label || 'Analyse...'}
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="erkennungs-container">
          <div 
            ref={containerRef}
            className="video-wrapper"
            style={{ maxWidth: `${containerWidth}px` }}
          >
            <Webcam
              ref={webcamRef}
              className="webcam-video"
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: { ideal: 640 },
                height: { ideal: 480 },
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
            >
              📊 Historie zurücksetzen
            </button>
            <div className="webcam-status">
              {webcamRef.current?.video?.readyState === 4 ? '📹 Webcam aktiv' : '⏳ Webcam wird geladen...'}
            </div>
          </div>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <h3>🔬 Funktionsweise</h3>
            <ul>
              <li><strong>68 Gesichtslandmarken</strong> in Echtzeit</li>
              <li><strong>7 Grundemotionen</strong> nach Paul Ekman</li>
              <li><strong>Echtzeit-Emotionserkennung</strong></li>
              <li><strong>100% lokal</strong> im Browser</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>💡 Optimale Nutzung</h3>
            <ul>
              <li>Gute, gleichmäßige Beleuchtung</li>
              <li>Direkt in die Kamera schauen</li>
              <li>Klare Gesichtsausdrücke</li>
              <li>Stabile Internetverbindung</li>
            </ul>
          </div>
        </div>
        
        {emotionHistorie.length > 10 && <EmotionHistorieDisplay />}
        
        <div className="footer">
          <p>
            <small>
              Verwendet face-api.js • Modelle werden lokal geladen • Keine Daten werden übertragen
            </small>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
