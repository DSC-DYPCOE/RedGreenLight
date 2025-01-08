import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react'; // Import the Type icon

const DemoSection = ({ demoText, onDemoChange }) => {
  const [isHoveringDemo, setIsHoveringDemo] = useState(false);
  const [demoLight, setDemoLight] = useState('green');

  useEffect(() => {
    if (isHoveringDemo) {
      const interval = setInterval(() => {
        setDemoLight(prev => prev === 'green' ? 'red' : 'green');
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHoveringDemo]);

  const handleDemoType = (e) => {
    if (demoLight === 'green') {
      onDemoChange(e.target.value);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl mb-16"
      onMouseEnter={() => setIsHoveringDemo(true)}
      onMouseLeave={() => {
        setIsHoveringDemo(false);
        setDemoLight('green');
      }}
    >
      <div className="flex items-center justify-center mb-6">
        <div className={`w-24 h-24 rounded-full ${demoLight === 'green' ? 'bg-green-500' : 'bg-red-500'} transition-colors duration-500 flex items-center justify-center shadow-lg`}>
          <Type className="w-12 h-12" />
        </div>
      </div>
      <div className="text-center mb-4">
        <p className="text-xl font-semibold">
          {demoLight === 'green' ? 'Type Now!' : 'Stop Typing!'}
        </p>
        <p className="text-gray-400">Hover to see the demo in action</p>
      </div>
      <input
        type="text"
        value={demoText}
        onChange={handleDemoType}
        placeholder="Quick brown fox..."
        className={`w-full bg-gray-700/80 p-4 rounded-lg text-center text-lg ${demoLight === 'red' ? 'cursor-not-allowed' : ''}`}
        disabled={demoLight === 'red'}
      />
    </div>
  );
};

export default DemoSection;
