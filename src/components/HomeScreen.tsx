'use client';

import { useState } from 'react';
import GameView from './GameView';
import { Game } from '@/types/game';
import { dummyGame } from '@/data/dummyGame';

export default function HomeScreen() {
  const [view, setView] = useState<'home' | 'game' | 'demo'>('home');

  const handleBack = () => {
    setView('home');
  };

  if (view === 'game') {
    return <GameView game={dummyGame} onBack={handleBack} />;
  }

  if (view === 'demo') {
    return <GameView isDemo onBack={handleBack} />;
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-[#FFD78C] mb-4 font-serif">Age of Focus</h1>
        <p className="text-gray-400 text-lg">Shape your nation's destiny</p>
      </div>
      
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => setView('game')}
          className="w-full px-8 py-3 bg-[#2A2A2A] text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#3A3A3A] transition-colors duration-200"
        >
          Start Game
        </button>
        
        <button
          onClick={() => setView('demo')}
          className="w-full px-8 py-3 bg-transparent text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#2A2A2A] transition-colors duration-200"
        >
          View Demo
        </button>
      </div>
    </div>
  );
} 