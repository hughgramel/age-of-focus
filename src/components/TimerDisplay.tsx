'use client';

import React from 'react';

interface TimerDisplayProps {
  minutes?: number;
  seconds?: number;
  isActive?: boolean;
  onStart?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function TimerDisplay({
  minutes = 25,
  seconds = 0,
  isActive = false,
  onStart,
  size = 'lg'
}: TimerDisplayProps) {
  // Format time display
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'h-32 w-32',
      text: 'text-2xl'
    },
    md: {
      container: 'h-48 w-48',
      text: 'text-4xl'
    },
    lg: {
      container: 'h-64 w-64',
      text: 'text-5xl'
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Timer Circle */}
      <div 
        className={`bg-[#0B1423] rounded-full flex items-center justify-center border-4 ${isActive ? 'border-[#FFD700]' : 'border-[#FFD700]/30'} transition-colors ${sizeClasses[size].container}`}
      >
        <div className={`font-bold text-white ${sizeClasses[size].text}`}>
          {displayMinutes}:{displaySeconds}
        </div>
      </div>

      {/* Button */}
      {onStart && (
        <div className="mt-6">
          <button 
            onClick={onStart}
            className="px-6 py-3 bg-[#FFD700] text-[#0B1423] font-bold rounded-lg transition-all hover:bg-[#FFD700]/80 shadow-md"
          >
            Focus Now
          </button>
        </div>
      )}
    </div>
  );
} 