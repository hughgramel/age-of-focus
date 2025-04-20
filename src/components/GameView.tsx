'use client';

import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import MapView from './MapView';
import Terminal from './Terminal';
import BackButton from './BackButton';
import { Game, Nation } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import FocusNowModal from './FocusNowModal';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameService } from '@/services/gameService';
import MapCanvas, { StateData } from './MapCanvas';
import { SessionService } from '@/services/sessionService';
import { ActionService } from '@/services/actionService';
import type { ActionUpdate } from '@/services/actionService';
import ResourceBar from './ResourceBar';

// Create a globals object to store persistent map state
const globalMapState = {
  mapCanvas: null as HTMLDivElement | null,
  initialized: false,
};

interface GameViewProps {
  game?: Game;
  isDemo?: boolean;
  onBack: () => void;
}

export interface playerNationResourceTotals {
  playerGold: number;
  playerIndustry: number;
  playerPopulation: number;
  playerArmy: number;
}

export default function GameView({ game, isDemo = false, onBack }: GameViewProps) {
  const { user } = useAuth();
  const selectedProvinceRef = useRef<string | null>(null);
  const selectedOriginalColorRef = useRef<string | null>(null);
  const provincePopupRef = useRef<HTMLDivElement | null>(null);
  const nationPopupRef = useRef<HTMLDivElement | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [playerGold, setPlayerGold] = useState<number | undefined>(undefined);
  const mapCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTotalPopulation, setLocalTotalPopulation] = useState<number | null>(null);
  const [playerNationResourceTotals, setPlayerNationResourceTotals] = useState<playerNationResourceTotals>({
    playerGold: 0,
    playerIndustry: 0,
    playerPopulation: 0,
    playerArmy: 0
  });

  // Add fade-in effect on mount
  useEffect(() => {
    // Short delay to ensure the fade effect is visible
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Initialize playerGold and resource totals when game changes
  useEffect(() => {
    if (game) {
      const playerNation = game.nations.find(
        (nation: Nation) => nation.nationTag === game.playerNationTag
      );
      if (playerNation) {
        setPlayerGold(playerNation.gold);
        
        // Initialize total population
        const totalPop = playerNation.provinces.reduce((sum, province) => sum + province.population, 0);
        setLocalTotalPopulation(totalPop);

        // Update resource totals
        const totalIndustry = playerNation.provinces.reduce((sum, province) => sum + province.industry, 0);
        const totalArmy = playerNation.provinces.reduce((sum, province) => sum + province.army, 0);
        
        setPlayerNationResourceTotals({
          playerGold: playerNation.gold,
          playerIndustry: totalIndustry,
          playerPopulation: totalPop,
          playerArmy: totalArmy
        });
      }
    }
  }, [game]);

  // Update resource totals when relevant values change
  useEffect(() => {
    if (game) {
      const playerNation = game.nations.find(
        (nation: Nation) => nation.nationTag === game.playerNationTag
      );
      if (playerNation) {
        const totalIndustry = playerNation.provinces.reduce((sum, province) => sum + province.industry, 0);
        const totalArmy = playerNation.provinces.reduce((sum, province) => sum + province.army, 0);
        const population = localTotalPopulation !== null ? localTotalPopulation : 
          playerNation.provinces.reduce((sum, province) => sum + province.population, 0);
        const gold = playerGold !== undefined ? playerGold : playerNation.gold;

        setPlayerNationResourceTotals({
          playerGold: gold,
          playerIndustry: totalIndustry,
          playerPopulation: population,
          playerArmy: totalArmy
        });
      }
    }
  }, [game, playerGold, localTotalPopulation]);

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

  // Handle province selection
  const handleProvinceSelect = useCallback((provinceId: string | null) => {
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
        popup.className = 'fixed bottom-4 left-4 z-50 bg-[#0B1423] p-6 rounded-lg border border-[#FFD700]/40 text-[#FFD700] historical-game-title';
        popup.style.width = '350px';
        popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';

        // Function to capitalize first letter
        const capitalizeFirstLetter = (string: string): string => {
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        // Add province details
        popup.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-2xl font-semibold">${selectedProvince.name}</h3>
            <span class="text-base text-[#FFD700]/70">${selectedProvince.nationName}</span>
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-base mb-4">
            <p class="flex items-center">
              <span class="text-[#FFD700]/70 mr-2">Population:</span> 
            </p>
            <p class="text-right font-semibold">${selectedProvince.population.toLocaleString()}</p>
            
            <p class="flex items-center">
              <span class="text-[#FFD700]/70 mr-2">Gold:</span> 
            </p>
            <p class="text-right font-semibold">${selectedProvince.goldIncome}</p>
            
            <p class="flex items-center">
              <span class="text-[#FFD700]/70 mr-2">Industry:</span> 
            </p>
            <p class="text-right font-semibold">${selectedProvince.industry}</p>
            
            <p class="flex items-center">
              <span class="text-[#FFD700]/70 mr-2">Resource:</span> 
            </p>
            <p class="text-right font-semibold">${capitalizeFirstLetter(selectedProvince.resourceType)}</p>
            
            <p class="flex items-center">
              <span class="text-[#FFD700]/70 mr-2">Army:</span> 
            </p>
            <p class="text-right font-semibold">${selectedProvince.army.toLocaleString()}</p>
          </div>
          <button 
            class="w-full px-4 py-3 bg-[#15223A] text-[#FFD700] rounded-lg border border-[#FFD700]/40 hover:bg-[#1D2C4A] hover:border-[#FFD700]/60 transition-colors duration-200 text-base"
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
            nationPopup.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#0B1423] p-6 rounded-lg border border-[#FFD700]/40 text-[#FFD700] historical-game-title';
            nationPopup.style.width = '450px';
            nationPopup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';

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
                  class="text-[#FFD700]/70 hover:text-[#FFD700] transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full border border-[#FFD700]/30 hover:border-[#FFD700]/60"
                  id="closeNationButton"
                >
                  ✕
                </button>
              </div>
              <div class="space-y-2 text-base">
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Nation Tag:</span>
                  <span class="font-semibold">${owningNation.nationTag}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Total Population:</span>
                  <span class="font-semibold">${totalPopulation.toLocaleString()}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Total Gold Income:</span>
                  <span class="font-semibold">${totalGoldIncome}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Total Industry:</span>
                  <span class="font-semibold">${totalIndustry}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Total Army:</span>
                  <span class="font-semibold">${totalArmy.toLocaleString()}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Gold Reserves:</span>
                  <span class="font-semibold">${owningNation.gold}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Research Points:</span>
                  <span class="font-semibold">${owningNation.researchPoints}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Current Research:</span>
                  <span class="font-semibold">${owningNation.currentResearchId || 'None'}</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Research Progress:</span>
                  <span class="font-semibold">${owningNation.currentResearchProgress}%</span>
                </p>
                <p class="flex justify-between border-b border-[#FFD700]/20 pb-2">
                  <span class="text-[#FFD700]/70">Number of Provinces:</span>
                  <span class="font-semibold">${owningNation.provinces.length}</span>
                </p>
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
  }, [game]);

  // Color provinces when map is ready
  const handleMapReady = useCallback((stateMap: Map<string, StateData>) => {
    if (!game || !game.nations) return;
    
    game.nations.forEach(nation => {
      nation.provinces.forEach(province => {
        const provinceId = province.id;
        const stateData = stateMap.get(provinceId);
        
        if (stateData) {
          // Apply nation color
          stateData.path.style.fill = nation.color;
          stateData.path.style.transition = 'fill 0.2s ease';
          
          // Store nation association
          stateData.nationId = nation.nationTag;
        }
      });
    });
  }, [game]);

  // Function to add gold to player nation
  const addGold = async () => {
    if (!user || !game) return;
    
    try {
      // Find the save slot containing this game
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === game.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      
      if (slotNumber === null) {
        console.error('Could not find save slot for this game');
        return;
      }
      
      // Create a deep copy of the game
      const updatedGame = JSON.parse(JSON.stringify(game));
      
      // Update the gold in the player nation
      const playerNationIndex = updatedGame.nations.findIndex(
        (nation: Nation) => nation.nationTag === updatedGame.playerNationTag
      );
      
      if (playerNationIndex !== -1) {
        // Update the gold value
        updatedGame.nations[playerNationIndex].gold += 100;
        
        // Update the local gold state without refreshing the map
        setPlayerGold(prev => (prev !== undefined ? prev + 100 : updatedGame.nations[playerNationIndex].gold));
        
        // Update Firebase in the background
        await GameService.saveGame(
          user.uid, 
          slotNumber, 
          updatedGame,
          'debug-update' // Scenario ID (required but not important for debug)
        );
        
        console.log('Added 100 gold to player nation!');
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.textContent = '+100 Gold Added!';
        feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
        document.body.appendChild(feedback);
        
        // Remove feedback after 2 seconds
        setTimeout(() => {
          feedback.remove();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding gold:', error);
    }
  };

  // Check for active sessions when component mounts
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user) return;
      
      try {
        setIsLoadingSession(true);
        const activeSessions = await SessionService.getActiveUserSessions(user.uid);
        
        if (activeSessions && activeSessions.length > 0) {
          setHasActiveSession(true);
          setActiveSessionId(activeSessions[0].id);
        } else {
          setHasActiveSession(false);
          setActiveSessionId(null);
        }
      } catch (error) {
        console.error("Error checking active session:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    checkActiveSession();
  }, [user]);

  // Add test action function
  const testAction = async () => {
    if (!game || !user) return;

    try {
      // Find the player nation
      const playerNation = game.nations.find(nation => nation.nationTag === game.playerNationTag);
      if (!playerNation || playerNation.provinces.length === 0) {
        console.error('Player nation or provinces not found');
        return;
      }

      // Select a random province
      const randomIndex = Math.floor(Math.random() * playerNation.provinces.length);
      const randomProvince = playerNation.provinces[randomIndex];

      console.log(`Selected province ${randomProvince.name} for population increase`);

      // Find the save slot containing this game
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === game.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      
      if (slotNumber === null) {
        console.error('Could not find save slot for this game');
        return;
      }

      const action: ActionUpdate = {
        type: 'resources',
        target: {
          type: 'province',
          id: randomProvince.id
        },
        updates: [
          { resource: 'population', amount: 10000 }
        ]
      };

      // Create a deep copy of the game for local state update
      const updatedGame = JSON.parse(JSON.stringify(game));
      const updatedPlayerNation = updatedGame.nations.find(
        (nation: Nation) => nation.nationTag === updatedGame.playerNationTag
      );
      
      if (updatedPlayerNation) {
        // Find and update the province in the local state
        const provinceToUpdate = updatedPlayerNation.provinces.find((p: { id: string }) => p.id === randomProvince.id);
        if (provinceToUpdate) {
          // Update the province population
          provinceToUpdate.population += 10000;
          
          // Calculate the new total population
          const newTotalPopulation = updatedPlayerNation.provinces.reduce(
            (sum: number, province: { population: number }) => sum + province.population, 
            0
          );
          
          // Update the local total population state
          setLocalTotalPopulation(newTotalPopulation);
          
          // Update the game state to reflect the changes
          game.nations = updatedGame.nations;
          
          // Force a re-render of the ResourceBar
          setPlayerGold(prev => prev); // Trigger re-render without changing value
          
          console.log(`Updated population for ${randomProvince.name} to ${provinceToUpdate.population}`);
          console.log(`New total population: ${newTotalPopulation}`);
        }
      }

      // Process the action and update Firebase in the background
      await ActionService.processActions(user.uid, slotNumber, game, [action]);
      
      // Show feedback
      const feedback = document.createElement('div');
      feedback.textContent = `+10,000 Population in ${randomProvince.name}!`;
      feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
      document.body.appendChild(feedback);
      
      // Remove feedback after 2 seconds
      setTimeout(() => {
        feedback.remove();
      }, 2000);

      console.log('Test action completed');
    } catch (error) {
      console.error('Error in test action:', error);
    }
  };

  const executeActionUpdate = async (action: Omit<ActionUpdate, 'target'>) => {
    if (!game || !user) return;

    try {
      // Find the player nation
      const playerNation = game.nations.find(nation => nation.nationTag === game.playerNationTag);
      if (!playerNation || playerNation.provinces.length === 0) {
        console.error('Player nation or provinces not found');
        return;
      }

      // Select a random province
      const randomIndex = Math.floor(Math.random() * playerNation.provinces.length);
      const randomProvince = playerNation.provinces[randomIndex];

      
      let actionWithTarget: ActionUpdate = {
        ...action,
        target: {
          type: 'province',
          id: randomProvince.id
        }
      };





      console.log(`Selected province ${randomProvince.name} for population increase`);

      // Find the save slot containing this game
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === game.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      
      if (slotNumber === null) {
        console.error('Could not find save slot for this game');
        return;
      }

      // Create a deep copy of the game for local state update
      const updatedGame = JSON.parse(JSON.stringify(game));
      const updatedPlayerNation = updatedGame.nations.find(
        (nation: Nation) => nation.nationTag === updatedGame.playerNationTag
      );
      
      if (updatedPlayerNation) {
        // Find and update the province in the local state
        const provinceToUpdate = updatedPlayerNation.provinces.find((p: { id: string }) => p.id === randomProvince.id);
        if (provinceToUpdate) {
          // Update the province population
          provinceToUpdate.population += 10000;
          
          // Calculate the new total population
          const newTotalPopulation = updatedPlayerNation.provinces.reduce(
            (sum: number, province: { population: number }) => sum + province.population, 
            0
          );
          
          // Update the local total population state
          setLocalTotalPopulation(newTotalPopulation);
          
          // Update the game state to reflect the changes
          game.nations = updatedGame.nations;
          
          // Force a re-render of the ResourceBar
          setPlayerGold(prev => prev); // Trigger re-render without changing value
          
          console.log(`Updated population for ${randomProvince.name} to ${provinceToUpdate.population}`);
          console.log(`New total population: ${newTotalPopulation}`);
        }
      }

      // Process the action and update Firebase in the background
      await ActionService.processActions(user.uid, slotNumber, game, [actionWithTarget]);
      
      // Show feedback
      const feedback = document.createElement('div');
      feedback.textContent = `+10,000 Population in ${randomProvince.name}!`;
      feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
      document.body.appendChild(feedback);
      
      // Remove feedback after 2 seconds
      setTimeout(() => {
        feedback.remove();
      }, 2000);

      console.log('Test action completed');
    } catch (error) {
      console.error('Error in test action:', error);
    }
  }
  
  if (!game) {
    return <div>Error: No game data provided</div>;
  }

  // Find the player nation
  const playerNation = game.nations.find(nation => nation.nationTag === game.playerNationTag);
  if (!playerNation) {
    return <div>Error: Player nation not found</div>;
  }

  // Calculate total stats for the player nation
  const totalPopulation = localTotalPopulation !== null ? localTotalPopulation : playerNation.provinces.reduce((sum, province) => sum + province.population, 0);
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
      
      {/* Resource Bar */}
      <ResourceBar
        playerGold={playerGold !== undefined ? playerGold : playerNation.gold}
        totalPopulation={totalPopulation}
        totalIndustry={totalIndustry}
        totalArmy={totalArmy}
        playerNationTag={game.playerNationTag}
        gameDate={game.date}
        fadeIn={fadeIn}
      />

      {/* Debug Button */}
      {!isDemo && (
        <button
          onClick={addGold}
          className={`fixed bottom-50 left-8 z-50 px-4 py-3 rounded-lg text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-500 ease-in-out ${fadeIn ? 'opacity-70 hover:opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundColor: 'rgba(11, 20, 35, 0.95)',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">��</span>
            <span className="text-lg font-semibold historical-game-title">+100 Gold</span>
          </div>
        </button>
      )}

      {/* Task List Button - Top Left */}
      <button
        onClick={() => {
          // TODO: Implement task list functionality
        }}
        className={`fixed top-4 left-305 top-4.5 z-50 px-8 py-4 rounded-xl text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{ 
          backgroundColor: 'rgba(11, 20, 35, 0.95)',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          minWidth: '220px'
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">📋</span>
          <span className="text-xl font-semibold historical-game-title">Task List</span>
        </div>
      </button>

      {/* National Path Button - Top Left */}
      <button
        onClick={() => {
          // TODO: Implement national path functionality
        }}
        className={`fixed top-4 left-240 top-4.5 z-50 px-8 py-4 rounded-xl text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{ 
          backgroundColor: 'rgba(11, 20, 35, 0.95)',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          minWidth: '220px'
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">🗺️</span>
          <span className="text-xl font-semibold historical-game-title">National Path</span>
        </div>
      </button>

      {/* Focus Now Floating Button - Center Bottom */}
      <button
        onClick={() => {
          if (user && document.getElementById('focus-now-modal')) {
            // Log the current game state
            console.log('Current Game State:', {
              gameId: game?.id,
              date: game?.date,
              playerNation: game?.nations.find(n => n.nationTag === game?.playerNationTag),
              totalPopulation,
              totalIndustry,
              totalGoldIncome,
              totalArmy,
              playerGold,
              hasActiveSession,
              activeSessionId
            });
            
            // Show the modal
            document.getElementById('focus-now-modal')!.style.display = 'block';
            setIsModalOpen(true);
          }
        }}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-10 py-6 rounded-xl text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${isModalOpen ? 'hidden' : ''}`}
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

      {/* Focus Now Modal - always render but hide with CSS */}
      <div id="focus-now-modal" style={{ display: 'none' }}>
        {user && (
          <FocusNowModal
            userId={user.uid}
            executeActionUpdate={executeActionUpdate}
            playerNationResourceTotals={playerNationResourceTotals}
            onClose={async () => {
              // Check for active sessions when modal is closed
              try {
                const activeSessions = await SessionService.getActiveUserSessions(user.uid);
                setHasActiveSession(activeSessions && activeSessions.length > 0);
              } catch (error) {
                console.error("Error checking active sessions:", error);
              }
              
              if (document.getElementById('focus-now-modal')) {
                document.getElementById('focus-now-modal')!.style.display = 'none';
              }
              
              // Set modal as closed
              setIsModalOpen(false);
            }}
            hasActiveSession={hasActiveSession}
          />
        )}
      </div>

      {/* Test Action Button */}
      <button
        onClick={testAction}
        className="fixed bottom-8 left-8 z-50 px-6 py-3 rounded-lg text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out"
        style={{ 
          backgroundColor: 'rgba(11, 20, 35, 0.95)',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
      >
        Test Action (+10,000 Population)
      </button>

      {/* Map container */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        ref={mapCanvasContainerRef}
      >
        {isDemo ? (
          // Demo view with demo map
          <MapView 
            isDemo 
            selectedProvinceRef={selectedProvinceRef} 
            onProvinceSelect={handleProvinceSelect}
            onMapReady={handleMapReady}
          />
        ) : (
          // Real game with actual map and nations
          <MapView 
            mapName={game.mapName} 
            nations={game.nations}
            selectedProvinceRef={selectedProvinceRef}
            onProvinceSelect={handleProvinceSelect}
            onMapReady={handleMapReady}
          />
        )}
      </div>
    </div>
  );
} 