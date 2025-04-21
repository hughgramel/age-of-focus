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
import TaskListButton from './TaskListButton';
import NationalPathButton from './NationalPathButton';
import FocusNowButton from './FocusNowButton';
import ButtonGroup from './ButtonGroup';
import TaskModal from './TaskModal';

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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
        popup.className = '[font-family:var(--font-mplus-rounded)] fixed bottom-4 left-4 z-50 bg-white p-6 rounded-lg';
        popup.style.border = '1px solid rgb(229,229,229)';
        popup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
        popup.style.transform = 'translateY(-2px)';
        popup.style.width = '350px';

        // Function to capitalize first letter
        const capitalizeFirstLetter = (string: string): string => {
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        // Add province details
        popup.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-2xl font-bold text-black">${selectedProvince.name}</h3>
            <span class="text-base text-black/70">${selectedProvince.nationName}</span>
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-base mb-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl">👥</span>
              <span class="text-black/70">Population:</span> 
            </div>
            <p class="text-right font-bold text-black">${selectedProvince.population.toLocaleString()}</p>
            
            <div class="flex items-center gap-3">
              <span class="text-3xl">💰</span>
              <span class="text-black/70">Gold:</span> 
            </div>
            <p class="text-right font-bold text-black">${selectedProvince.goldIncome}</p>
            
            <div class="flex items-center gap-3">
              <span class="text-3xl">🏭</span>
              <span class="text-black/70">Industry:</span> 
            </div>
            <p class="text-right font-bold text-black">${selectedProvince.industry}</p>
            
            <div class="flex items-center gap-3">
              <span class="text-3xl">🌟</span>
              <span class="text-black/70">Resource:</span> 
            </div>
            <p class="text-right font-bold text-black">${capitalizeFirstLetter(selectedProvince.resourceType)}</p>
            
            <div class="flex items-center gap-3">
              <span class="text-3xl">⚔️</span>
              <span class="text-black/70">Army:</span> 
            </div>
            <p class="text-right font-bold text-black">${selectedProvince.army.toLocaleString()}</p>
          </div>
          <button 
            class="w-full px-4 py-2 bg-[#67b9e7] text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
            style="box-shadow: 0 4px 0 #4792ba; transform: translateY(-2px);"
            id="showNationButton"
          >
            <span class="text-2xl">🎯</span>
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
            nationPopup.className = '[font-family:var(--font-mplus-rounded)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg';
            nationPopup.style.border = '1px solid rgb(229,229,229)';
            nationPopup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
            nationPopup.style.transform = 'translateY(-2px)';
            nationPopup.style.width = '450px';

            // Calculate total province stats
            const totalPopulation = owningNation.provinces.reduce((sum, p) => sum + p.population, 0);
            const totalGoldIncome = owningNation.provinces.reduce((sum, p) => sum + p.goldIncome, 0);
            const totalIndustry = owningNation.provinces.reduce((sum, p) => sum + p.industry, 0);
            const totalArmy = owningNation.provinces.reduce((sum, p) => sum + p.army, 0);

            // Add nation details
            nationPopup.innerHTML = `
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-2xl font-bold text-black">${owningNation.name}</h3>
                <button 
                  class="text-black/70 hover:text-black transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full border border-black/30 hover:border-black/60"
                  id="closeNationButton"
                >
                  ✕
                </button>
              </div>
              <div class="space-y-3 text-base">
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">🏷️</span>
                    <span class="text-black/70">Nation Tag:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.nationTag}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">👥</span>
                    <span class="text-black/70">Total Population:</span>
                  </div>
                  <span class="font-bold text-black">${totalPopulation.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">💰</span>
                    <span class="text-black/70">Total Gold Income:</span>
                  </div>
                  <span class="font-bold text-black">${totalGoldIncome}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">🏭</span>
                    <span class="text-black/70">Total Industry:</span>
                  </div>
                  <span class="font-bold text-black">${totalIndustry}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">⚔️</span>
                    <span class="text-black/70">Total Army:</span>
                  </div>
                  <span class="font-bold text-black">${totalArmy.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">💎</span>
                    <span class="text-black/70">Gold Reserves:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.gold}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">🔬</span>
                    <span class="text-black/70">Research Points:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.researchPoints}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">📚</span>
                    <span class="text-black/70">Current Research:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.currentResearchId || 'None'}</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">📊</span>
                    <span class="text-black/70">Research Progress:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.currentResearchProgress}%</span>
                </div>
                <div class="flex justify-between items-center border-b border-black/10 pb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">🗺️</span>
                    <span class="text-black/70">Number of Provinces:</span>
                  </div>
                  <span class="font-bold text-black">${owningNation.provinces.length}</span>
                </div>
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

    console.log('Executing action:', action);

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

        console.log(`Selected province ${randomProvince.name} for action:`, actionWithTarget);

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
        
        if (updatedPlayerNation && action.type === 'resources' && action.updates) {
            // Find and update the province in the local state
            const provinceToUpdate = updatedPlayerNation.provinces.find(
                (p: { id: string }) => p.id === randomProvince.id
            );
            
            if (provinceToUpdate) {
                // Track if we need to update any totals
                let updatePopulation = false;
                let updateIndustry = false;
                let updateArmy = false;

                // Apply each update
                action.updates.forEach(update => {
                    const { resource, amount } = update;
                    
                    // Update the appropriate resource
                    switch (resource) {
                        case 'population':
                            provinceToUpdate.population += amount;
                            updatePopulation = true;
                            break;
                        case 'gold':
                            // Update player gold at nation level
                            updatedPlayerNation.gold += amount;
                            setPlayerGold(prev => (prev !== undefined ? prev + amount : updatedPlayerNation.gold));
                            break;
                        case 'industry':
                            provinceToUpdate.industry += amount;
                            updateIndustry = true;
                            break;
                        case 'army':
                            provinceToUpdate.army += amount;
                            updateArmy = true;
                            break;
                    }
                });

                // Calculate new totals if needed
                if (updatePopulation || updateIndustry || updateArmy) {
                    const newTotals = {
                        playerGold: updatedPlayerNation.gold,
                        playerIndustry: updateIndustry ? 
                            updatedPlayerNation.provinces.reduce((sum: number, p: { industry: number }) => sum + p.industry, 0) : 
                            playerNationResourceTotals.playerIndustry,
                        playerPopulation: updatePopulation ? 
                            updatedPlayerNation.provinces.reduce((sum: number, p: { population: number }) => sum + p.population, 0) : 
                            playerNationResourceTotals.playerPopulation,
                        playerArmy: updateArmy ? 
                            updatedPlayerNation.provinces.reduce((sum: number, p: { army: number }) => sum + p.army, 0) : 
                            playerNationResourceTotals.playerArmy
                    };

                    // Update all relevant states
                    setPlayerNationResourceTotals(newTotals);
                    if (updatePopulation) {
                        setLocalTotalPopulation(newTotals.playerPopulation);
                    }
                }

                // Update the game state to reflect the changes
                game.nations = updatedGame.nations;
                
                console.log(`Updated province ${randomProvince.name}:`, provinceToUpdate);
                console.log('New resource totals:', playerNationResourceTotals);
            }
        }

        // Process the action and update Firebase in the background
        console.log('Processing action with target:', actionWithTarget);
        await ActionService.processActions(user.uid, slotNumber, game, [actionWithTarget]);
        
        // Show feedback for each update
        if (action.type === 'resources' && action.updates) {
            action.updates.forEach(update => {
                const feedback = document.createElement('div');
                feedback.textContent = `+${update.amount} ${update.resource} in ${randomProvince.name}!`;
                feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
                document.body.appendChild(feedback);
                
                setTimeout(() => {
                    feedback.remove();
                }, 2000);
            });
        }

        console.log('Action executed successfully');
    } catch (error) {
        console.error('Error executing action:', error);
    }
  };

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
      {/* Top Bar with Resource Bar and Buttons */}
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center p-4">
        <div className="absolute left-4">
      <BackButton onClick={onBack} />
        </div>
        <div className="flex-1 flex justify-center">
          <ResourceBar
            playerGold={playerGold !== undefined ? playerGold : playerNation.gold}
            totalPopulation={totalPopulation}
            totalIndustry={totalIndustry}
            totalArmy={totalArmy}
            playerNationTag={game.playerNationTag}
            gameDate={game.date}
            fadeIn={fadeIn}
          />
        </div>
      </div>

      {/* Debug Button */}
      

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
            disableKeyboardControls={isModalOpen || isTaskModalOpen}
          />
        ) : (
          // Real game with actual map and nations
          <MapView 
            mapName={game.mapName} 
            nations={game.nations}
            selectedProvinceRef={selectedProvinceRef}
            onProvinceSelect={handleProvinceSelect}
            onMapReady={handleMapReady}
            disableKeyboardControls={isModalOpen || isTaskModalOpen}
          />
        )}
        </div>

      {/* Replace individual buttons with ButtonGroup */}
      <ButtonGroup
        fadeIn={fadeIn}
        isModalOpen={isModalOpen}
        hasActiveSession={hasActiveSession}
        onTaskListClick={() => {
          if (user) {
            handleProvinceSelect(null);
            setIsTaskModalOpen(true);
          }
        }}
        onFocusClick={() => {
          if (user && document.getElementById('focus-now-modal')) {
            // Log the current game state
            handleProvinceSelect(null);
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
        onNationalPathClick={() => {
          // TODO: Implement national path functionality
        }}
      />

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

      {/* Task Modal */}
      {isTaskModalOpen && user && (
        <TaskModal
          userId={user.uid}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskComplete={(task) => {
            console.log('Task completed:', task);
            // You can add additional logic here if needed
          }}
          executeActionUpdate={executeActionUpdate}
          playerNationResourceTotals={playerNationResourceTotals}
        />
      )}

      {/* Test Action Button */}
  
    </div>
  );
} 