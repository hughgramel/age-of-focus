'use client';

import React, { useState } from 'react';
import { getNationFlag } from '@/utils/nationFlags';

interface MissionsModalProps {
  onClose: () => void;
  playerNationName: string;
  playerNationTag: string;
}

export default function MissionsModal({ onClose, playerNationName, playerNationTag }: MissionsModalProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */} 
      <div 
        className="absolute inset-0 z-0"
        onClick={onClose}
      ></div>

      {/* Modal Content Container - Match HabitsModal/TaskModal dimensions */} 
      <div 
        className="relative z-10 bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-4xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100 mx-6 sm:mx-auto"
        style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}
      >
        {/* Header */} 
        <div className="flex justify-between items-center mb-1 sm:mb-2"> {/* Reduced margin slightly */} 
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📜</span> {/* Icon */} 
            Missions & Achievements
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Tabs */} 
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="-mb-px flex gap-4 sm:gap-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('missions')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors duration-200
                ${activeTab === 'missions' 
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {/* Add flag emoji */}
              <span className="mr-2">{getNationFlag(playerNationTag)}</span> 
              {playerNationName} Missions
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors duration-200
                ${activeTab === 'achievements' 
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Achievements
            </button>
          </nav>
        </div>

        {/* Conditional Content */} 
        <div className="max-h-[40vh] overflow-y-auto flex items-center justify-center">
          {activeTab === 'missions' && (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">
                {playerNationName} Missions coming soon!
              </p>
            </div>
          )}
          {activeTab === 'achievements' && (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">
                Achievements content coming soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 