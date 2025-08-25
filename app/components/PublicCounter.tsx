'use client';
import { useState, useEffect } from 'react';
import CelebrationPopup from './CelebrationPopup';

const PublicCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    console.log('PublicCounter - Setting up counter polling and tracking visit...');
    
    // Track this visit first
    const trackVisit = async () => {
      try {
        console.log('PublicCounter - Tracking visit...');
        await fetch('/api/track-visit', { method: 'POST' });
        console.log('PublicCounter - Visit tracked successfully');
      } catch (error) {
        console.error('PublicCounter - Failed to track visit:', error);
      }
    };
    
    // Function to fetch current counter value
    const fetchCurrentCount = async () => {
      try {
        const response = await fetch('/api/visitor-count');
        const data = await response.json();
        console.log('PublicCounter - Count update:', data.count);
        
        // Check if we've reached 25 and haven't shown popup yet
        if (data.count >= 25 && !hasShownPopup) {
          setShowPopup(true);
          setHasShownPopup(true);
        }
        
        setVisitorCount(data.count);
      } catch (error) {
        console.error('PublicCounter - Failed to fetch current count:', error);
      }
    };
    
    // Track the visit first, then start polling
    trackVisit().then(() => {
      // Fetch initial count after tracking visit
      fetchCurrentCount();
      
      // Set up polling every 1 second
      const counterInterval = setInterval(fetchCurrentCount, 1000);
      
      return () => {
        console.log('PublicCounter - Cleaning up polling');
        clearInterval(counterInterval);
      };
    });
    
    // Cleanup function for the outer useEffect
    return () => {
      console.log('PublicCounter - Component unmounting');
    };
  }, []);

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
