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
  const nationPopupRef = useRef<HTMLDivElement | null>(null);

  const handleProvinceSelect = (provinceId: string | null) => {
    selectedProvinceRef.current = provinceId;
    console.log('Selected Province:', provinceId);

    // Remove existing popups if any
    if (provincePopupRef.current) {
      provincePopupRef.current.remove();
      provincePopupRef.current = null;
    }
    if (nationPopupRef.current) {
      nationPopupRef.current.remove();
      nationPopupRef.current = null;
    }

    if (provinceId && game) {
      // Find the selected province in the game's nations
      let selectedProvince = null;
      let owningNation = null;
      for (const nation of game.nations) {
        const province = nation.provinces.find(p => p.id === provinceId);
        if (province) {
          selectedProvince = { ...province, nationName: nation.name };
          owningNation = nation;
          break;
        }
      }

      if (selectedProvince) {
        // Create and style the province popup
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
          <button 
            class="mt-4 w-full px-4 py-2 bg-[#2A2A2A] text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#3A3A3A] transition-colors duration-200"
            id="showNationButton"
          >
            View Nation Details
          </button>
        `;

        // Add to DOM and store reference
        document.body.appendChild(popup);
        provincePopupRef.current = popup;

        // Add click handler for the nation button
        const showNationButton = popup.querySelector('#showNationButton');
        if (showNationButton && owningNation) {
          showNationButton.addEventListener('click', () => {
            // Remove existing nation popup if any
            if (nationPopupRef.current) {
              nationPopupRef.current.remove();
            }

            // Create and style the nation popup
            const nationPopup = document.createElement('div');
            nationPopup.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1F1F1F] p-6 rounded-lg border border-[#FFD78C20] text-[#FFD78C]';
            nationPopup.style.width = '400px';
            nationPopup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';

            // Calculate total province stats
            const totalPopulation = owningNation.provinces.reduce((sum, p) => sum + p.population, 0);
            const totalGoldIncome = owningNation.provinces.reduce((sum, p) => sum + p.goldIncome, 0);
            const totalIndustry = owningNation.provinces.reduce((sum, p) => sum + p.industry, 0);
            const totalArmy = owningNation.provinces.reduce((sum, p) => sum + p.army, 0);

            // Add nation details
            nationPopup.innerHTML = `
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-2xl font-semibold">${owningNation.name}</h3>
                <button 
                  class="text-gray-400 hover:text-[#FFD78C] transition-colors duration-200"
                  id="closeNationButton"
                >
                  ✕
                </button>
              </div>
              <div class="space-y-3 text-sm">
                <p><span class="text-gray-400">Nation Tag:</span> ${owningNation.nationTag}</p>
                <p><span class="text-gray-400">Total Population:</span> ${totalPopulation.toLocaleString()}</p>
                <p><span class="text-gray-400">Total Gold Income:</span> ${totalGoldIncome}</p>
                <p><span class="text-gray-400">Total Industry:</span> ${totalIndustry}</p>
                <p><span class="text-gray-400">Total Army:</span> ${totalArmy.toLocaleString()}</p>
                <p><span class="text-gray-400">Gold Reserves:</span> ${owningNation.gold}</p>
                <p><span class="text-gray-400">Research Points:</span> ${owningNation.researchPoints}</p>
                <p><span class="text-gray-400">Current Research:</span> ${owningNation.currentResearchId || 'None'}</p>
                <p><span class="text-gray-400">Research Progress:</span> ${owningNation.currentResearchProgress}%</p>
                <p><span class="text-gray-400">Number of Provinces:</span> ${owningNation.provinces.length}</p>
              </div>
            `;

            // Add to DOM and store reference
            document.body.appendChild(nationPopup);
            nationPopupRef.current = nationPopup;

            // Add click handler for the close button
            const closeButton = nationPopup.querySelector('#closeNationButton');
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                nationPopup.remove();
                nationPopupRef.current = null;
              });
            }
          });
        }
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

  // Find the player nation
  const playerNation = game.nations.find(nation => nation.nationTag === game.playerNationTag);
  if (!playerNation) {
    return <div>Error: Player nation not found</div>;
  }

  // Calculate total stats for the player nation
  const totalPopulation = playerNation.provinces.reduce((sum, province) => sum + province.population, 0);
  const totalIndustry = playerNation.provinces.reduce((sum, province) => sum + province.industry, 0);
  const totalGoldIncome = playerNation.provinces.reduce((sum, province) => sum + province.goldIncome, 0);
  const totalArmy = playerNation.provinces.reduce((sum, province) => sum + province.army, 0);

  // Calculate monthly population growth (using 0.5% monthly growth rate for 19th century)
  const monthlyPopulationGrowth = Math.floor(totalPopulation * 0.005);

  return (
    <div className="flex flex-col h-full">
      <BackButton onClick={onBack} />
      
      {/* Player Nation Resource Bar */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-6 px-6 py-3 rounded-lg" 
           style={{ 
             backgroundColor: 'rgba(20, 20, 20, 0.95)',
             border: '1px solid rgba(255, 215, 140, 0.3)',
             boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
             fontFamily: '"Playfair Display", serif',
             minWidth: '600px'
           }}>
        <div className="flex items-center gap-4 pr-4">
          <span className="text-[#FFD78C] font-semibold text-lg">{playerNation.nationTag}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl">💰</span>
          <span className="text-[#FFD78C] text-lg">{playerNation.gold.toLocaleString()} Gold</span>
          <span className="text-green-400 text-lg">+{totalGoldIncome.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl">👥</span>
          <span className="text-[#FFD78C] text-lg">{totalPopulation.toLocaleString()} Population</span>
          <span className="text-green-400 text-lg">+{monthlyPopulationGrowth.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl">🏭</span>
          <span className="text-[#FFD78C] text-lg">{totalIndustry.toLocaleString()} Industry</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl">⚔️</span>
          <span className="text-[#FFD78C] text-lg">{totalArmy.toLocaleString()} Army</span>
        </div>
      </div>

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