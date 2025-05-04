'use client';

import React, { useState, useEffect } from 'react';
import FocusNowModal from './FocusNowModal';
import { SessionService } from '@/services/sessionService';

interface FocusNowButtonProps {
  fadeIn: boolean;
  hasActiveSession: boolean;
  onClick: () => void;
  focusTimeRemaining: number;
}


const convertSecondsToTimeFormat = (seconds: number): string => {
  const numHours = Math.floor((seconds / 60) / 60);
  const numMinutes = Math.floor((seconds / 60) % 60);
  const numSeconds = Math.floor(seconds % 60);

  // Only include hours if > 0
  const hoursStr = numHours > 0 ? `${numHours}:` : '';
  
  // Add leading zero to minutes only if there are hours
  const minutesStr = numHours > 0 && numMinutes < 10 ? `0${numMinutes}` : numMinutes;
  
  // Always add leading zero to seconds if < 10
  const secondsStr = numSeconds < 10 ? `0${numSeconds}` : numSeconds;

  return `${hoursStr}${minutesStr}:${secondsStr}`;
};


export default function FocusNowButton({ 
  fadeIn, 
  hasActiveSession, 
  onClick,
  focusTimeRemaining
}: FocusNowButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] p-2 sm:py-4 sm:px-6 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out flex items-center justify-center ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ 
        backgroundColor: '#6ec53e',
        fontWeight: '600',
        boxShadow: '0 4px 0 rgba(89,167,0,255)',
        transform: 'translateY(-2px)',
        minWidth: '56px'
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-2xl sm:text-3xl">⏱️</span>
        <span className="text-base sm:text-xl whitespace-nowrap">
          {hasActiveSession ? `${convertSecondsToTimeFormat(focusTimeRemaining)}` : 'Focus Now'}
        </span>
      </div>
    </button>
  );
} 