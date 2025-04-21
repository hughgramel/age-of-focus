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
      className={`px-10 py-6 rounded-xl text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${isModalOpen ? 'hidden' : ''}`}
      style={{ 
        backgroundColor: hasActiveSession ? 'rgba(15, 60, 35, 1)' : 'rgba(11, 20, 35, 0.95)',
        border: hasActiveSession ? '2px solid rgba(255, 215, 0, 0.6)' : '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: hasActiveSession ? 
          '0 4px 12px rgba(0,0,0,0.5), 0 0 0px rgba(255, 215, 0, 0.15)' : 
          '0 4px 12px rgba(0,0,0,0.5)',
        minWidth: '300px'
      }}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">⏱️</span>
        <span className={`text-2xl font-semibold historical-game-title ${hasActiveSession ? 'text-[#FFD700]' : 'text-[#FFD700]'}`}>
          {hasActiveSession ? 'Active focus session' : 'Focus Now'}
        </span>
      </div>
    </button>
  );
} 