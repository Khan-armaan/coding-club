'use client';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [isConnected, setIsConnected] = useState(false);
  type Visitor = { country: string; timestamp: string };
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    console.log('AdminPanel - Setting up connections...');
    
    let eventSource: EventSource;
    let reconnectInterval: NodeJS.Timeout | undefined;
    
    // Function to fetch current counter value
    const fetchCurrentCount = async () => {
      try {
        const response = await fetch('/api/visitor-count');
        const data = await response.json();
        console.log('AdminPanel - Periodic count update:', data.count);
        setVisitorCount(data.count);
      } catch (error) {
        console.error('AdminPanel - Failed to fetch current count:', error);
      }
    };
    
    // Set up periodic counter updates every 1 second
    const counterUpdateInterval = setInterval(fetchCurrentCount, 1000);
    
    // Also fetch initial count immediately
    fetchCurrentCount();
    
    const connectSSE = () => {
      eventSource = new EventSource('/api/visitor-stream');
      
      eventSource.onopen = () => {
        console.log('AdminPanel - SSE connection opened');
        setIsConnected(true);
        // Clear reconnection interval if connection is successful
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = undefined;
        }
      };
      
      eventSource.onmessage = (event) => {
        try {
          console.log('AdminPanel - SSE message received:', event.data);
          const data = JSON.parse(event.data);
          console.log('AdminPanel - Parsed data:', data);
          
          if (data.type === 'INITIAL_COUNT') {
            console.log('AdminPanel - Setting initial count:', data.count);
            setVisitorCount(data.count);
          } else if (data.type === 'NEW_VISITOR') {
            console.log('AdminPanel - New visitor, count:', data.count, 'visitor:', data.visitor);
            setVisitorCount(data.count);
            setRecentVisitors(prev => [data.visitor, ...prev.slice(0, 9)]);
            
            // Play sound if threshold reached
            if (data.count % threshold === 0) {
              console.log('AdminPanel - Threshold reached, playing sound');
              playWelcomeSound();
            }
          } else if (data.type === 'COUNTER_RESET') {
            console.log('AdminPanel - Counter reset');
            setVisitorCount(0);
            setRecentVisitors([]);
          }
          // Ignore KEEPALIVE and other message types
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.log('AdminPanel - SSE connection error:', error);
        setIsConnected(false);
        eventSource.close();
        
        // Attempt to reconnect every 3 seconds
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('AdminPanel - Attempting to reconnect...');
            connectSSE();
          }, 3000);
        }
      };
    };
    
    connectSSE();
    
    return () => {
      console.log('AdminPanel - Cleaning up connections');
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
      if (counterUpdateInterval) {
        clearInterval(counterUpdateInterval);
      }
    };
  }, [threshold]);

  const playWelcomeSound = () => {
    // Create welcome message audio
    //const audio = new Audio();
    const utterance = new SpeechSynthesisUtterance('Welcome! New milestone reached!');
    utterance.rate = 1.2;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
    
    // Also play a beep
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 1000);
  };

  const resetCounter = async () => {
    console.log('AdminPanel - Resetting counter...');
    try {
      const response = await fetch('/api/reset-counter', { method: 'POST' });
      const result = await response.json();
      console.log('AdminPanel - Reset response:', result);
      
      if (result.success) {
        setVisitorCount(0);
        setRecentVisitors([]);
        console.log('AdminPanel - Counter reset successfully');
      }
    } catch (error) {
      console.error('Reset failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Live Visitor Count</h2>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {visitorCount.toLocaleString()}
              </div>
              <p className="text-gray-600">Total unique visitors today</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>
                <button
                  onClick={resetCounter}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Reset Counter
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Visitors</h3>
            <div className="space-y-2">
              {recentVisitors.map((visitor, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Visitor from {visitor.country}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(visitor.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
