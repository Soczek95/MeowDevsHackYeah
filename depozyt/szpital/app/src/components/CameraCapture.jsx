import React, { useRef, useEffect, useState } from 'react';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        // Wymuszamy tylną kamerę smartfona
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Błąd kamery:", err);
        setError("Brak dostępu do kamery. Upewnij się, że używasz połączenia HTTPS (wymagane na urządzeniach mobilnych).");
      }
    };

    startCamera();

    // Wyłączenie kamery przy odmontowaniu komponentu
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Konwersja na Base64 (jakość 80%)
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(base64Image); 
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '16px', maxWidth: '400px', border: '1px solid #ddd' }}>
      {error ? (
        <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>
      ) : (
        // playsInline jest niezbędne dla iOS, inaczej Safari wymusi pełny ekran
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', borderRadius: '8px', background: '#000', marginBottom: '12px' }} 
        />
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={takePhoto}
          disabled={!!error}
          style={{ flex: 1, background: '#111', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📸 Zrób zdjęcie
        </button>
        <button 
          onClick={onCancel}
          style={{ background: '#e4e2dd', color: '#333', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}