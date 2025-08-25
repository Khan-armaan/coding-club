'use client';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import CelebrationPopup from './CelebrationPopup';


const PublicCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
  const [_,setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Effect to track visit only once
  useEffect(() => {
    if (!hasTrackedVisit) {
      console.log('PublicCounter - Tracking visit...');
      
      const trackVisit = async () => {
        try {
          await fetch('/api/track-visit', { method: 'POST' });
          console.log('PublicCounter - Visit tracked successfully');
          setHasTrackedVisit(true);
        } catch (error) {
          console.error('PublicCounter - Failed to track visit:', error);
        }
      };
      
      trackVisit();
    }
  }, [hasTrackedVisit]);

  // Effect to set up WebSocket connection
  useEffect(() => {
    console.log('PublicCounter - Setting up WebSocket connection...');
    
    // Initialize Socket.IO client
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });
    
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
      if (data.count >= 25 && !hasShownPopup) {
        setShowPopup(true);
        setHasShownPopup(true);
      }
    });
    
    setSocket(socketInstance);
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome to Our Site!
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-lg text-gray-600 mb-4">
            You are visitor number:
          </p>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {visitorCount.toLocaleString()}
          </div>
          <p className="text-gray-500">Thank you for visiting!</p>
          
          {/* Connection Status Indicator */}
          <div className={`mt-4 text-sm px-3 py-1 rounded-full inline-block ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isConnected ? '🟢 Live Updates' : '🟡 Connecting...'}
          </div>
        </div>
      </div>
      
      {/* Celebration Popup */}
      <CelebrationPopup 
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        count={visitorCount}
      />
    </div>
  );
};

export default PublicCounter;
