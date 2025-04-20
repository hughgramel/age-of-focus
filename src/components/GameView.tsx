'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import MapView from './MapView';
import Terminal from './Terminal';
import BackButton from './BackButton';
import { Game } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import FocusNowModal from './FocusNowModal';

interface GameViewProps {
  game?: Game;
  isDemo?: boolean;
  onBack: () => void;
}

export default function GameView({ game, isDemo = false, onBack }: GameViewProps) {
  const { user } = useAuth();
  const selectedProvinceRef = useRef<string | null>(null);
  const provincePopupRef = useRef<HTMLDivElement | null>(null);
  const nationPopupRef = useRef<HTMLDivElement | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Add fade-in effect on mount
  useEffect(() => {
    // Short delay to ensure the fade effect is visible
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent standard scrolling
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Prevent browser zoom on Ctrl+Wheel
        e.preventDefault();
      }
    };

    // Add event listener with passive: false to allow preventDefault
    document.addEventListener('wheel', preventScroll, { passive: false });
    
    // Disable document body scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('wheel', preventScroll);
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
  
  // Format number with appropriate suffix (k for thousands, M for millions)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
    } else {
      return num.toString();
    }
  };
  
  // Format date from YYYY-MM-DD to "Month Day, Year"
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
    const date = new Date(year, month - 1, day);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Get flag emoji based on nation tag
  const getNationFlag = (tag: string): string => {
    switch(tag) {
      case 'FRA': return '🇫🇷';
      case 'PRU': return '🇩🇪';
      case 'USA': return '🇺🇸';
      case 'GBR': return '🇬🇧';
      case 'RUS': return '🇷🇺';
      case 'AUS': return '🇦🇹';
      case 'ESP': return '🇪🇸';
      case 'POR': return '🇵🇹';
      case 'SWE': return '🇸🇪';
      case 'DEN': return '🇩🇰';
      case 'TUR': return '🇹🇷';
      case 'SAR': return '🇮🇹';
      case 'PAP': return '🇻🇦';
      case 'SIC': return '🇮🇹';
      case 'GRE': return '🇬🇷';
      case 'NET': return '🇳🇱';
      case 'BEL': return '🇧🇪';
      default: return '🏳️';
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden bg-[#0B1423] transition-opacity ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <BackButton onClick={onBack} />
      
      {/* Player Nation Resource Bar */}
      <div className={`fixed top-4 left-20 z-50 flex items-center gap-5 px-6 py-4 rounded-lg transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} 
           style={{ 
             backgroundColor: 'rgba(11, 20, 35, 0.95)',
             border: '2px solid rgba(255, 215, 0, 0.4)',
             boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
           }}>
        <div className="flex items-center gap-4 pr-4 border-r border-[#FFD700]/30">
          <div className="flex items-center border-r border-[#FFD700]/30 pr-4">
            <div className="relative" style={{ width: '40px', height: '40px' }}>
              <span className="absolute left-1/2  top-1/2 transform -translate-x-7/12 -translate-y-1/2 text-6xl" style={{ 
                textShadow: `
                  -1.5px -1.5px 0px rgba(255, 255, 255, 1),
                  1.5px -1.5px 0px rgba(255, 255, 255, 1),
                  -1.5px  1.5px 0px rgba(255, 255, 255, 1),
                  1.5px  1.5px 0px rgba(255, 255, 255, 1),
                  1.5px  1.5px 0px rgba(255, 255, 255, 1)
                `
              }}>
                {getNationFlag(playerNation.nationTag)}
              </span>
            </div>
          </div>
          <span className="text-[#FFD700] font-semibold text-xl historical-game-title">
            {formatDate(game.date)}
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          {/* Gold */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">💰</span>
            <span className="text-[#FFD700] text-xl historical-game-title">
              {formatNumber(playerNation.gold)}
            </span>
          </div>
          
          {/* Population */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">👥</span>
            <span className="text-[#FFD700] text-xl historical-game-title">
              {formatNumber(totalPopulation)}
            </span>
          </div>
          
          {/* Industry */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏭</span>
            <span className="text-[#FFD700] text-xl historical-game-title">
              {formatNumber(totalIndustry)}
            </span>
          </div>
          
          {/* Army */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚔️</span>
            <span className="text-[#FFD700] text-xl historical-game-title">
              {formatNumber(totalArmy)}
            </span>
          </div>
        </div>
      </div>

      {/* Focus Now Floating Button */}
      <button
        onClick={() => {
          if (user && document.getElementById('focus-now-modal')) {
            document.getElementById('focus-now-modal')!.style.display = 'block';
          }
        }}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-8 py-6 rounded-lg text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ 
          backgroundColor: 'rgba(11, 20, 35, 0.95)',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex items-center gap-5">
          <span className="text-5xl">⏱️</span>
          <span className="text-2xl font-semibold historical-game-title">Focus Now</span>
        </div>
      </button>

      {/* Focus Now Modal - always render but hide with CSS */}
      <div id="focus-now-modal" style={{ display: 'none' }}>
        {user && (
          <FocusNowModal
            userId={user.uid}
            onClose={() => {
              if (document.getElementById('focus-now-modal')) {
                document.getElementById('focus-now-modal')!.style.display = 'none';
              }
            }}
            hasActiveSession={false}
          />
        )}
      </div>

      {isDemo ? (
        // Demo view with current map implementation
        <div className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          <MapView isDemo selectedProvinceRef={selectedProvinceRef} />
        </div>
      ) : (
        <div className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
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