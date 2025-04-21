'use client';

import React, { useState, useEffect } from 'react';
import FocusNowModal from './FocusNowModal';
import { SessionService } from '@/services/sessionService';

interface FocusNowButtonProps {
  fadeIn: boolean;
  isModalOpen: boolean;
  hasActiveSession: boolean;
  onClick: () => void;
}

export default function FocusNowButton({ 
  fadeIn, 
  isModalOpen, 
  hasActiveSession, 
  onClick 
}: FocusNowButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] px-2 py-3 sm:py-4 w-full sm:w-[275px] rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${isModalOpen ? 'hidden' : ''}`}
      style={{ 
        backgroundColor: '#6ec53e',
        fontSize: '22px',
        fontWeight: '600',
        boxShadow: '0 4px 0 rgba(89,167,0,255)',
        transform: 'translateY(-2px)'
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-2xl sm:text-3xl">⏱️</span>
        <span className="text-xl sm:text-2xl whitespace-nowrap">
          {hasActiveSession ? 'Resume Session' : 'Focus Now'}
        </span>
      </div>
    </button>
  );
} 