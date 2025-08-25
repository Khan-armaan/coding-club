'use client';
import { useState, useEffect } from 'react';

const PublicCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    console.log('PublicCounter - Setting up connections...');
    
    // Fetch initial count
    const fetchInitialCount = () => {
      fetch('/api/visitor-count')
        .then(res => res.json())
        .then(data => {
          console.log('PublicCounter - Initial count received:', data.count);
          setVisitorCount(data.count);
        })
        .catch(error => console.error('Failed to fetch initial count:', error));
    };
    
    fetchInitialCount();

    // Set up real-time updates with reconnection
    let eventSource: EventSource;
    let reconnectInterval: NodeJS.Timeout | undefined;
    
    const connectSSE = () => {
      eventSource = new EventSource('/api/visitor-stream');
      
      eventSource.onopen = () => {
        console.log('PublicCounter - SSE connection opened');
        // Clear reconnection interval if connection is successful
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = undefined;
        }
      };
      
      eventSource.onmessage = (event) => {
        try {
          console.log('PublicCounter - SSE message received:', event.data);
          const data = JSON.parse(event.data);
          console.log('PublicCounter - Parsed data:', data);
          
          if (data.type === 'INITIAL_COUNT' || data.type === 'NEW_VISITOR' || data.type === 'COUNTER_RESET') {
            console.log('PublicCounter - Updating count to:', data.count);
            setVisitorCount(data.count);
          }
          // Ignore KEEPALIVE messages
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        
        // Attempt to reconnect every 3 seconds
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('PublicCounter - Attempting to reconnect...');
            connectSSE();
          }, 3000);
        }
      };
    };
    
    connectSSE();
    
    return () => {
      console.log('PublicCounter - Cleaning up connections');
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
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
    </div>
  );
};

export default PublicCounter;
