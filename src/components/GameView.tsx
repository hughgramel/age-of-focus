'use client';

import { ReactNode, useEffect, useRef } from 'react';
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
  const selectedProvinceRef = useRef<string | null>(null);
  const provincePopupRef = useRef<HTMLDivElement | null>(null);

  const handleProvinceSelect = (provinceId: string | null) => {
    selectedProvinceRef.current = provinceId;
    console.log('Selected Province:', provinceId);

    // Remove existing popup if any
    if (provincePopupRef.current) {
      provincePopupRef.current.remove();
      provincePopupRef.current = null;
    }

    if (provinceId && game) {
      // Find the selected province in the game's nations
      let selectedProvince = null;
      for (const nation of game.nations) {
        const province = nation.provinces.find(p => p.id === provinceId);
        if (province) {
          selectedProvince = { ...province, nationName: nation.name };
          break;
        }
      }

      if (selectedProvince) {
        // Create and style the popup
        const popup = document.createElement('div');
        popup.className = 'fixed bottom-4 left-4 z-50 bg-[#1F1F1F] p-4 rounded-lg border border-[#FFD78C20] text-[#FFD78C]';
        popup.style.width = '300px';
        popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';

        // Add province details
        popup.innerHTML = `
          <h3 class="text-xl font-semibold mb-2">${selectedProvince.name}</h3>
          <p class="text-sm text-gray-400 mb-1">${selectedProvince.nationName}</p>
          <div class="space-y-1 text-sm">
            <p><span class="text-gray-400">Population:</span> ${selectedProvince.population.toLocaleString()}</p>
            <p><span class="text-gray-400">Gold Income:</span> ${selectedProvince.goldIncome}</p>
            <p><span class="text-gray-400">Industry:</span> ${selectedProvince.industry}</p>
            <p><span class="text-gray-400">Resource:</span> ${selectedProvince.resourceType}</p>
            <p><span class="text-gray-400">Army:</span> ${selectedProvince.army.toLocaleString()}</p>
          </div>
        `;

        // Add to DOM and store reference
        document.body.appendChild(popup);
        provincePopupRef.current = popup;
      }
    }
  };

  useEffect(() => {
    console.log('Initial Selected Province:', selectedProvinceRef.current);
  }, []);

  useEffect(() => {
    const loadGame = () => {
      console.log('Loading game:', game);
      // Initialize game state here
    };

    loadGame();
  }, [game]);

  if (!game) {
    return <div>Error: No game data provided</div>;
  }

  return (
    <div className="w-full h-screen bg-gray-900">
      <BackButton onClick={onBack} />
      {isDemo ? (
        // Demo view with current map implementation
        <MapView isDemo selectedProvinceRef={selectedProvinceRef} />
      ) : (
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
          
          {/* Render the map using game.mapName and pass nations */}
          <MapView 
            mapName={game.mapName} 
            nations={game.nations}
            selectedProvinceRef={selectedProvinceRef}
            onProvinceSelect={handleProvinceSelect}
          />
        </div>
      )}
    </div>
  );
} 