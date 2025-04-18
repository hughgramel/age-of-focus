'use client';

import React from 'react';
import TimerDisplay from '@/components/TimerDisplay';

export default function TimerPage() {
  // This is just a dummy function since we're not implementing functionality yet
  const handleStart = () => {
    console.log('Start button clicked');
  };

  return (
    <div className="container mx-auto mt-10 max-w-xl">
      <h1 className="text-3xl font-bold text-center mb-8">Focus Timer</h1>
      
      <div className="bg-[#162033] rounded-xl shadow-lg overflow-hidden">
        {/* Timer Display */}
        <div className="p-8 flex justify-center">
          <TimerDisplay onStart={handleStart} />
        </div>
        
        {/* Session Info */}
        <div className="bg-[#0B1423]/50 p-6 border-t border-[#FFD700]/10">
          <h2 className="text-xl font-bold text-[#FFD700] mb-2">Session Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Focus Time</p>
              <p className="text-white">25 minutes</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Break Time</p>
              <p className="text-white">5 minutes</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Action Points</p>
              <p className="text-white">+2 per session</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sessions Today</p>
              <p className="text-white">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 