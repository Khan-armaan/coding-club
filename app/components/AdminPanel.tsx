'use client';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [visitorCount, setVisitorCount] = useState(0);

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
  }, []);

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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Main admin container */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-light text-gray-300 tracking-[0.3em] mb-3">
              BIAS CODING CLUB
            </h1>
            <p className="text-sm text-gray-400 font-mono tracking-wider">
              ADMIN DASHBOARD
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent mx-auto mt-3"></div>
          </div>
          
          {/* Counter Display */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="text-7xl font-mono font-bold text-white mb-2 tracking-tight">
                {visitorCount.toString().padStart(3, '0')}<span className="text-gray-500 text-4xl">/100</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg blur opacity-20 animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-xs font-mono tracking-widest mt-2">
              TOTAL MEMBERS
            </p>
          </div>
          
          {/* Status and Controls */}
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-mono tracking-widest">
                CLUB SYSTEMS ONLINE
              </span>
            </div>
            
            {/* Reset Button */}
            <button
              onClick={resetCounter}
              className="group relative inline-flex items-center justify-center px-4 py-2 text-xs font-mono tracking-widest text-red-400 border border-red-400/30 rounded-lg backdrop-blur-sm bg-red-900/10 hover:bg-red-900/20 transition-all duration-200"
            >
              <span className="relative z-10">RESET</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-500/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
            </button>
          </div>
          
          {/* System info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center space-x-8 text-xs text-gray-500 font-mono">
              <div>POLLING: 1s</div>
              <div>UPTIME: 24/7</div>
              <div>STATUS: OPERATIONAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
