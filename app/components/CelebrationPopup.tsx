'use client';
import { useEffect, useState } from 'react';

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  audioEnabled?: boolean;
}

const CelebrationPopup = ({ isOpen, onClose, count, audioEnabled = false }: CelebrationPopupProps) => {
  const [animate, setAnimate] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      
      // Play celebration audio automatically if audio is enabled
      const playAudio = () => {
        if (!audioEnabled) {
          console.log('Audio not enabled, skipping audio playback');
          return;
        }
        
        const audio = new Audio('/WhatsApp Ptt 2025-08-26 at 10.35.48 AM.ogg');
        audio.volume = 0.9; // Set volume to 90%
        
        audio.addEventListener('play', () => {
          setAudioPlaying(true);
          console.log('Celebration audio started playing');
        });
        
        audio.addEventListener('ended', () => {
          setAudioPlaying(false);
          console.log('Celebration audio finished');
        });
        
        audio.addEventListener('error', () => {
          setAudioPlaying(false);
          console.log('Audio playback failed');
        });
        
        // Attempt to play audio automatically
        audio.play().catch((error) => {
          console.log('Audio playback failed:', error);
          setAudioPlaying(false);
        });
      };
      
      // Small delay before playing audio for better UX
      const audioTimer = setTimeout(playAudio, 300);
      
      // Auto close after 5 seconds
      const closeTimer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => {
        clearTimeout(audioTimer);
        clearTimeout(closeTimer);
        setAudioPlaying(false);
      };
    }
  }, [isOpen, onClose, audioEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-500 ${
          animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <div className="text-center">
          {/* Celebration icon with audio indicator */}
          <div className="relative mb-6">
            <div className="text-6xl animate-bounce">🎓</div>
            {audioPlaying && (
              <div className="absolute -top-2 -right-2 text-xl animate-pulse">
                🔊
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-light text-white mb-2 tracking-widest">
            MILESTONE
          </h2>
          
          <h3 className="text-lg text-cyan-400 mb-6 font-mono tracking-wider">
            BIAS CODING CLUB
          </h3>
          
          <div className="mb-6">
            <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
              {count.toLocaleString()}
            </div>
            <p className="text-gray-300 text-sm font-mono tracking-wider">
              NEW MEMBERS JOINED
            </p>
          </div>
          
          <p className="text-gray-400 text-sm mb-8 font-light">
            Welcome to our growing community of passionate developers! Let&apos;s code, learn, and build amazing things together.
          </p>
          
          {/* Animated indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-mono tracking-widest text-white border border-white/30 rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <span className="relative z-10">JOIN THE CLUB</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-blue-500/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPopup;
