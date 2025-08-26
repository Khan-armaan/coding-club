
'use client';

import { useEffect, useState } from 'react';
import PublicCounter from './components/PublicCounter';
// import PublicCounterSSE from './components/PublicCounterSSE';

export default function Home() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showPermissionButton, setShowPermissionButton] = useState(true);

  const enableAudio = async () => {
    try {
      // Create audio context
      //const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a very short silent audio to trigger permission
      const audio = new Audio();
      audio.volume = 0.01; // Very low volume instead of muted
      
      // Create a data URL for a short silent audio
      const silentAudio = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhGpvS4jC/LQoVYLfr662VFAlJo+P0fNqbz2J3nmdxnD8BO1igxe7LgQgUZb3j0I0+AD+Y1+rAfMKJZQ==';
      audio.src = silentAudio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        audio.pause();
        console.log('Audio permission granted');
        setAudioEnabled(true);
        setShowPermissionButton(false);
      }
    } catch (error) {
      console.log('Audio permission failed:', error);
      // Still hide the button even if it fails
      setShowPermissionButton(false);
    }
  };

  useEffect(() => {
    // Check if audio context is already allowed
    const checkAudioContext = () => {
      try {
        const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        if (audioContext.state === 'running') {
          setAudioEnabled(true);
          setShowPermissionButton(false);
        }
      } catch (error) {
        console.log('Audio context check failed:', error);
      }
    };

    checkAudioContext();
  }, []);

  return (
    <div>
      {showPermissionButton && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🔊
            </div>
            <h2 style={{
              color: '#333',
              marginBottom: '15px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Enable Audio Experience
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '25px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Allow audio to enhance your experience with sound effects and notifications when milestones are reached.
            </p>
            <button
              onClick={enableAudio}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              Enable Audio
            </button>
            <button
              onClick={() => setShowPermissionButton(false)}
              style={{
                backgroundColor: 'transparent',
                color: '#666',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px',
                width: '100%'
              }}
            >
              Continue without audio
            </button>
          </div>
        </div>
      )}
      <PublicCounter audioEnabled={audioEnabled} />
    </div>
  );
}