// Zeichnet die Gesichtsmesh auf den Canvas
export const drawMesh = (vorhersagen, ctx) => {
  if (!vorhersagen || vorhersagen.length === 0) return;
  
  vorhersagen.forEach((vorhersage) => {
    if (!vorhersage.keypoints) return;
    
    const keypoints = vorhersage.keypoints;
    
    // Zeichne alle Punkte
    keypoints.forEach((punkt) => {
      const [x, y] = [punkt.x, punkt.y];
      
      // Punkt zeichnen
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#32CD32';
      ctx.fill();
      
      // Optional: Punktumrandung
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Verbindungslinien zeichnen (vereinfacht)
    if (keypoints.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(keypoints[0].x, keypoints[0].y);
      
      // Beispiel: Erste 10 Punkte verbinden
      for (let i = 1; i < Math.min(keypoints.length, 10); i++) {
        ctx.lineTo(keypoints[i].x, keypoints[i].y);
      }
      
      ctx.strokeStyle = '#FF6347';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
};
