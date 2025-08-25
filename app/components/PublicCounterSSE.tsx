// app/components/PublicCounterSSE.ts
'use client';
import { useState, useEffect } from 'react';
import CelebrationPopup from './CelebrationPopup';

const PublicCounterSSE = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Effect to track visit only once
  useEffect(() => {
    if (!hasTrackedVisit) {
      console.log('PublicCounterSSE - Tracking visit...');
      
      const trackVisit = async () => {
        try {
          await fetch('/api/track-visit', { method: 'POST' });
          console.log('PublicCounterSSE - Visit tracked successfully');
          setHasTrackedVisit(true);
        } catch (error) {
          console.error('PublicCounterSSE - Failed to track visit:', error);
        }
      };
      
      trackVisit();
    }
  }, [hasTrackedVisit]);

  // Effect to set up Server-Sent Events connection
  useEffect(() => {
    console.log('PublicCounterSSE - Setting up SSE connection...');
    
    const eventSource = new EventSource('/api/visitor-stream');
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'heartbeat') {
          console.log('SSE heartbeat received');
          return;
        }
        
        console.log('Received count update via SSE:', data.count);
        setVisitorCount(data.count);
        
        // Check if we've reached 25 and haven't shown popup yet
        if (data.count >= 25 && !hasShownPopup) {
          setShowPopup(true);
          setHasShownPopup(true);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };
    
    // Cleanup function
    return () => {
      console.log('PublicCounterSSE - Cleaning up SSE connection');
      eventSource.close();
    };
  }, [hasShownPopup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome to Our Site! (SSE Version)
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
            {isConnected ? '🟢 Live Updates (SSE)' : '🟡 Connecting...'}
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

export default PublicCounterSSE;
