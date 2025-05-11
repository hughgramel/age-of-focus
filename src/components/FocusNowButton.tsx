'use client';

import React from 'react';

interface FocusNowButtonProps {
  fadeIn: boolean;
  hasActiveSession: boolean;
  onClick: () => void;
  focusTimeRemaining: number;
  size?: 'default' | 'large';
}

const convertSecondsToTimeFormat = (seconds: number): string => {
  const numHours = Math.floor((seconds / 60) / 60);
  const numMinutes = Math.floor((seconds / 60) % 60);
  const numSeconds = Math.floor(seconds % 60);
  const hoursStr = numHours > 0 ? `${numHours}:` : '';
  const minutesStr = numHours > 0 && numMinutes < 10 ? `0${numMinutes}` : numMinutes;
  const secondsStr = numSeconds < 10 ? `0${numSeconds}` : numSeconds;
  return `${hoursStr}${minutesStr}:${secondsStr}`;
};

export default function FocusNowButton({ 
  fadeIn, 
  hasActiveSession, 
  onClick,
  focusTimeRemaining,
  size = 'default'
}: FocusNowButtonProps) {
  const bgColor = '#6ec53e';
  const darkColor = '#59a700';

  const paddingClasses = size === 'large' ? 'py-4.5 px-9' : 'py-3.5 px-7';
  const iconSizeClasses = size === 'large' ? 'text-4xl' : 'text-3xl';
  const textSizeClasses = size === 'large' ? 'text-3xl' : 'text-2xl';

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        [font-family:var(--font-mplus-rounded)] 
        rounded-xl text-white font-semibold border-2
        flex items-center justify-center 
        transition-all duration-150 ease-in-out
        ${paddingClasses}
        hover:translate-y-[-1px] active:translate-y-[0.5px]
        ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} 
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: darkColor,
        boxShadow: `0 3px 0px ${darkColor}`,
        minWidth: 'auto'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 0px ${darkColor}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
      }}
      onMouseLeave={(e) => { 
        if (e.buttons === 1) {
            e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
        }
      }}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <span className={`${iconSizeClasses}`}>⏱️</span>
        <span className={`${textSizeClasses} whitespace-nowrap`}>
          {hasActiveSession ? `${convertSecondsToTimeFormat(Math.max(0, focusTimeRemaining))}` : 'Focus'}
        </span>
      </div>
    </button>
  );
}