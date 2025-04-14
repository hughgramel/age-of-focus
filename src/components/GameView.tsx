'use client';

import { ReactNode } from 'react';
import MapView from './MapView';
import Terminal from './Terminal';
import BackButton from './BackButton';
import { Game } from '@/types/game';

interface GameViewProps {
  game?: Game;
  isDemo?: boolean;
  onBack: () => void;
}

export default function GameView({ game, isDemo = false, onBack }: GameViewProps) {
  return (
    <div className="w-full h-screen bg-gray-900">
      <BackButton onClick={onBack} />
      {isDemo ? (
        // Demo view with current map implementation
        <MapView />
      ) : game ? (
        <div className="w-full h-full">
          {/* Game details overlay */}
          <div className="absolute top-16 right-4 z-40 bg-[#1F1F1F] p-4 rounded-lg border border-[#FFD78C20] text-[#FFD78C]">
            <h2 className="text-xl font-semibold mb-3">{game.gameName}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date:</span> {game.date}</p>
              <p><span className="text-gray-400">Player Nation:</span> {game.playerNationTag}</p>
              <p><span className="text-gray-400">Map:</span> {game.mapName}</p>
              <p><span className="text-gray-400">Nations:</span> {game.nations.length}</p>
            </div>
          </div>
          
          {/* Placeholder for actual game implementation */}
          <div className="w-full h-full flex items-center justify-center text-white">
            <h1 className="text-2xl">Game View - Coming Soon</h1>
          </div>
        </div>
      ) : (
        // Error state when no game is provided
        <div className="w-full h-full flex items-center justify-center text-red-400">
          <h1 className="text-2xl">Error: No game data provided</h1>
        </div>
      )}
    </div>
  );
} 