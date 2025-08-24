'use client';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [isConnected, setIsConnected] = useState(false);
  type Visitor = { country: string; timestamp: string };
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/visitor-stream');
    
    eventSource.onopen = () => {
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'INITIAL_COUNT') {
        setVisitorCount(data.count);
      } else if (data.type === 'NEW_VISITOR') {
        setVisitorCount(data.count);
        setRecentVisitors(prev => [data.visitor, ...prev.slice(0, 9)]);
        
        // Play sound if threshold reached
        if (data.count % threshold === 0) {
          playWelcomeSound();
        }
      }
    };
    
    eventSource.onerror = () => {
      setIsConnected(false);
    };
    
    return () => eventSource.close();
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
    try {
      await fetch('/api/reset-counter', { method: 'POST' });
      setVisitorCount(0);
      setRecentVisitors([]);
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
