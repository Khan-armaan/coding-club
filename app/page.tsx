
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
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }} onClick={enableAudio}>
          🔊 Enable Audio
        </div>
      )}
      <PublicCounter audioEnabled={audioEnabled} />
    </div>
  );
}