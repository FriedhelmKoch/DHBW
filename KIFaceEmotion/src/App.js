import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modellGeladen, setModellGeladen] = useState(false);
  const [erkenner, setErkenner] = useState(null);
  
  // Gesichtserkennung durchführen
  const erkenneGesicht = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      erkenner
    ) {
      const video = webcamRef.current.video;
      const videoBreite = video.videoWidth;
      const videoHoehe = video.videoHeight;
      
      // Setze Video- und Canvas-Größen
      webcamRef.current.video.width = videoBreite;
      webcamRef.current.video.height = videoHoehe;
      canvasRef.current.width = videoBreite;
      canvasRef.current.height = videoHoehe;
      
      // Gesichter erkennen
      const gesichter = await erkenner.estimateFaces(video);
      
      // Canvas zeichnen
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, videoBreite, videoHoehe); // Canvas leeren
      drawMesh(gesichter, ctx);
    }
  };
  
  // Gesichtserkennung initialisieren
  const starteGesichtserkennung = async () => {
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Modell laden mit neuer API
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: 'tfjs', // oder 'mediapipe'
      maxFaces: 1, // Anzahl der zu erkennenden Gesichter
      refineLandmarks: true, // Verbesserte Landmarken
    };
    
    try {
      const detector = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig
      );
      setErkenner(detector);
      setModellGeladen(true);
    } catch (error) {
      console.error('Fehler beim Laden des Modells:', error);
    }
  };
  
  // Erkennung in Intervallen durchführen
  useEffect(() => {
    if (modellGeladen && erkenner) {
      const interval = setInterval(() => {
        erkenneGesicht();
      }, 100); // Alle 100ms
      
      return () => clearInterval(interval);
    }
  }, [modellGeladen, erkenner]);
  
  // Modell beim Start laden
  useEffect(() => {
    starteGesichtserkennung();
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>KI-Gesichtserkennung mit React</h1>
        
        {!modellGeladen ? (
          <div className="lade-anzeige">
            <p>Lade KI-Modell... Bitte warten.</p>
            <div className="lade-balken">
              <div className="lade-fortschritt"></div>
            </div>
          </div>
        ) : (
          <p className="modell-bereit">✓ Modell bereit!</p>
        )}
        
        <div className="erkennungs-container">
          <Webcam
            ref={webcamRef}
            className="webcam-video"
            style={{
              width: '800px',
              height: '600px',
              objectFit: 'cover',
              borderRadius: '10px',
              transform: 'scaleX(-1)'
            }}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 800,
              height: 600,
              facingMode: "user"
            }}
          />
          
          <canvas
            ref={canvasRef}
            className="gesichts-canvas"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '800px',
              height: '600px',
              transform: 'scaleX(-1)'
            }}
          />
        </div>
        
        <div className="erklaerung">
          <h3>Funktionsweise:</h3>
          <ul>
            <li>🔵 468 Gesichtslandmarken werden erkannt</li>
            <li>📐 Gesichtsgeometrie in Echtzeit</li>
            <li>⚡ Läuft direkt im Browser</li>
            <li>📷 Benötigt Webcam-Zugriff</li>
          </ul>
          
          <div className="hinweise">
            <p><strong>Hinweise:</strong></p>
            <p>• Erlauben Sie den Webcam-Zugriff</p>
            <p>• Sorgen Sie für gute Beleuchtung</p>
            <p>• Das Modell lädt beim ersten Start etwas länger</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
