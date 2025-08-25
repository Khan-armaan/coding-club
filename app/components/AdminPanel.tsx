'use client';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    console.log('AdminPanel - Setting up counter polling...');
    
    // Function to fetch current counter value
    const fetchCurrentCount = async () => {
      try {
        const response = await fetch('/api/visitor-count');
        const data = await response.json();
        console.log('AdminPanel - Count update:', data.count);
        setVisitorCount(data.count);
      } catch (error) {
        console.error('AdminPanel - Failed to fetch current count:', error);
      }
    };
    
    // Fetch initial count immediately
    fetchCurrentCount();
    
    // Set up polling every 1 second
    const counterInterval = setInterval(fetchCurrentCount, 1000);
    
    return () => {
      console.log('AdminPanel - Cleaning up polling');
      clearInterval(counterInterval);
    };
  }, [threshold]);

  const resetCounter = async () => {
    try {
      const response = await fetch('/api/reset-counter', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('Counter reset successful');
        setVisitorCount(0);
      } else {
        console.error('Failed to reset counter:', response.statusText);
      }
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Polling Active
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
