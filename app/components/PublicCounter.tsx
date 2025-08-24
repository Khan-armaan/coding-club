'use client';
import { useState, useEffect } from 'react';

const PublicCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // Fetch initial count
    fetch('/api/visitor-count')
      .then(res => res.json())
      .then(data => setVisitorCount(data.count));

    // Set up real-time updates
    const eventSource = new EventSource('/api/visitor-stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'INITIAL_COUNT' || data.type === 'NEW_VISITOR') {
        setVisitorCount(data.count);
      }
    };
    
    return () => eventSource.close();
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
    </div>
  );
};

export default PublicCounter;
