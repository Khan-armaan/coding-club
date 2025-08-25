'use client';
import { useEffect, useState } from 'react';

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

const CelebrationPopup = ({ isOpen, onClose, count }: CelebrationPopupProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-500 ${
          animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <div className="text-center">
          {/* Celebration icon */}
          <div className="text-6xl mb-4">🎉</div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Congratulations!
          </h2>
          
          <p className="text-lg text-gray-600 mb-4">
            We&apos;ve reached <span className="font-bold text-blue-600">{count}</span> visitors!
          </p>
          
          <p className="text-gray-500 mb-6">
            Thank you for being part of this milestone! 🚀
          </p>
          
          {/* Confetti animation */}
          <div className="relative overflow-hidden">
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 animate-bounce`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPopup;
