'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CelebrationPopup from './CelebrationPopup';

interface PublicCounterProps {
  audioEnabled?: boolean;
}

const PublicCounter = ({ audioEnabled = false }: PublicCounterProps) => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Function to clear device tracking (for testing purposes)
  const clearDeviceTracking = () => {
    localStorage.removeItem('biasClubVisited');
    localStorage.removeItem('biasClubVisitedAt');
    console.log('Device tracking cleared');
  };

  // Add keyboard shortcut for clearing tracking (Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        clearDeviceTracking();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Effect to track visit only once per device
  useEffect(() => {
    // Check localStorage to see if this device has already been counted
    const hasVisitedBefore = localStorage.getItem('biasClubVisited');
    
    if (!hasTrackedVisit && !hasVisitedBefore) {
      console.log('PublicCounter - New device detected, tracking visit...');
      
      const trackVisit = async () => {
        try {
          await fetch('/api/track-visit', { method: 'POST' });
          console.log('PublicCounter - Visit tracked successfully');
          
          // Mark this device as counted in localStorage
          localStorage.setItem('biasClubVisited', 'true');
          localStorage.setItem('biasClubVisitedAt', new Date().toISOString());
          
          setHasTrackedVisit(true);
        } catch (error) {
          console.error('PublicCounter - Failed to track visit:', error);
        }
      };
      
      trackVisit();
    } else if (hasVisitedBefore) {
      console.log('PublicCounter - Device already counted, skipping tracking');
      setHasTrackedVisit(true);
    }
  }, [hasTrackedVisit]);

  // Effect to set up WebSocket connection
  useEffect(() => {
    console.log('PublicCounter - Setting up WebSocket connection...');
    
   // Initialize Socket.IO client
    const socketInstance = io('https://codingclub.birlainstitute.co.in', {
      transports: ['websocket', 'polling']
    });
    // const socketInstance = io('http://localhost:3007', {
    //   transports: ['websocket', 'polling']
    // });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });
    
    socketInstance.on('count-update', (data: { count: number }) => {
      console.log('Received count update:', data.count);
      setVisitorCount(data.count);
      
      // Check if we've reached 25 and haven't shown popup yet
      if (data.count >= 5 && !hasShownPopup) {

        setTimeout(() => {
          setShowPopup(true);
          setHasShownPopup(true);
        }, 10000);
      }
    });
    
    // Cleanup function
    return () => {
      console.log('PublicCounter - Cleaning up WebSocket connection');
      socketInstance.disconnect();
    };
  }, [hasShownPopup]);

  // Fallback: Fetch initial count if WebSocket isn't connected
  useEffect(() => {
    if (!isConnected && !visitorCount) {
      const fetchInitialCount = async () => {
        try {
          const response = await fetch('/api/visitor-count');
          const data = await response.json();
          setVisitorCount(data.count);
        } catch (error) {
          console.error('Failed to fetch initial count:', error);
        }
      };
      
      fetchInitialCount();
    }
  }, [isConnected, visitorCount]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        </div>
      </div>
      
      <div className="text-center z-10 relative">
        {/* Main container with glass morphism effect */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mb-2 tracking-[0.2em]">
              BIAS CODING CLUB
            </h1>
            <p className="text-lg text-gray-300 mb-4 font-light tracking-wider">
              WELCOME NEW MEMBERS
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
          </div>
          
          {/* Counter Display */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-8xl font-mono font-bold text-white mb-4 tracking-tight">
                {visitorCount.toLocaleString().padStart(6, '0')}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-20 animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-sm font-mono tracking-wider">
              NEW MEMBERS JOINED
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
            }`}></div>
            <span className={`text-xs font-mono tracking-widest ${
              isConnected ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {isConnected ? 'LIVE MEMBER COUNTER' : 'CONNECTING TO CLUB'}
            </span>
          </div>
          
          {/* Tech indicators */}
          <div className="mt-8 flex justify-center space-x-6">
            <div className="text-xs text-gray-500 font-mono">CODING</div>
            <div className="text-xs text-gray-500 font-mono">LEARNING</div>
            <div className="text-xs text-gray-500 font-mono">GROWING</div>
          </div>
        </div>
      </div>
      
      {/* Celebration Popup */}
      <CelebrationPopup 
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        count={visitorCount}
        audioEnabled={audioEnabled}
      />
    </div>
  );
};

export default PublicCounter;
