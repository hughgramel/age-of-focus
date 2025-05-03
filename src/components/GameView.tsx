'use client';

import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import MapView from './MapView';
import BackButton from './BackButton';
import { Game, Nation, Province } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import FocusNowModal from './FocusNowModal';
import { GameService } from '@/services/gameService';
import MapCanvas, { StateData } from './MapCanvas';
import { SessionService } from '@/services/sessionService';
import { ActionService } from '@/services/actionService';
import type { ActionUpdate } from '@/services/actionService';
import ResourceBar from './ResourceBar';
import ButtonGroup from './ButtonGroup';
import TaskModal from './TaskModal';
import NationalPathModal from './NationalPathModal';
import { countries_1836 } from '@/data/countries_1836';
import HabitsModal from './HabitsModal';
import { getNationFlag } from '@/utils/nationFlags';

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

// Helper function for number formatting (similar to ResourceBar)
const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
  } else {
    return num.toLocaleString(); // Use localeString for smaller numbers/consistency
  }
};

export default function GameView({ game, isDemo = false, onBack }: GameViewProps) {
  const { user } = useAuth();
  const selectedProvinceRef = useRef<string | null>(null);
  const provincePopupRef = useRef<HTMLDivElement | null>(null);
  const nationPopupRef = useRef<HTMLDivElement | null>(null);
  const conquestPopupRef = useRef<HTMLDivElement | null>(null);
  const selfConquestErrorPopupRef = useRef<HTMLDivElement | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [playerGold, setPlayerGold] = useState<number | undefined>(undefined);
  const mapCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isNationalPathModalOpen, setIsNationalPathModalOpen] = useState(false);
  const [isInConqueringMode, setIsInConqueringMode] = useState(false);
  const isInConqueringModeRef = useRef(isInConqueringMode);
  const [localGame, setLocalGame] = useState<Game | null>(game || null);
  const [playerNationResourceTotals, setPlayerNationResourceTotals] = useState<playerNationResourceTotals>({
    playerGold: 0,
    playerIndustry: 0,
    playerPopulation: 0,
    playerArmy: 0
  });
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(0);

  useEffect(() => {
    setLocalGame(game || null);
  }, [game]);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (localGame) {
      const playerNation = localGame.nations.find(
        (nation: Nation) => nation.nationTag === localGame.playerNationTag
      );

      const playerProvinces = localGame.provinces.filter(
        (province: Province) => province.ownerTag === localGame.playerNationTag
      );

      if (playerNation) {
        const totalPop = playerProvinces.reduce((sum, province) => sum + province.population, 0);
        const totalIndustry = playerProvinces.reduce((sum, province) => sum + province.industry, 0);
        const totalArmy = playerProvinces.reduce((sum, province) => sum + province.army, 0);

        setPlayerGold(playerNation.gold);

        setPlayerNationResourceTotals({
          playerGold: playerNation.gold,
          playerIndustry: totalIndustry,
          playerPopulation: totalPop,
          playerArmy: totalArmy
        });
      } else {
        setPlayerNationResourceTotals({ playerGold: 0, playerIndustry: 0, playerPopulation: 0, playerArmy: 0 });
        setPlayerGold(undefined);
      }
    } else {
      setPlayerNationResourceTotals({ playerGold: 0, playerIndustry: 0, playerPopulation: 0, playerArmy: 0 });
      setPlayerGold(undefined);
    }
  }, [localGame]);

  useEffect(() => {
    if (playerGold !== undefined) {
      setPlayerNationResourceTotals(prevTotals => ({
        ...prevTotals,
        playerGold: playerGold
      }));
    }
  }, [playerGold]);

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    document.addEventListener('wheel', preventScroll, { passive: false });
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('wheel', preventScroll);
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    isInConqueringModeRef.current = isInConqueringMode;
  }, [isInConqueringMode]);

  const handleProvinceSelect = useCallback((provinceId: string | null) => {
    selectedProvinceRef.current = provinceId;
    console.log('Selected Province:', provinceId);

    provincePopupRef.current?.remove();
    provincePopupRef.current = null;
    nationPopupRef.current?.remove();
    nationPopupRef.current = null;
    conquestPopupRef.current?.remove();
    conquestPopupRef.current = null;
    selfConquestErrorPopupRef.current?.remove();
    selfConquestErrorPopupRef.current = null;

    const popup = document.createElement('div');

    console.log("isInConqueringMode (state)", isInConqueringMode);
    console.log("isInConqueringMode (ref)", isInConqueringModeRef.current);

    if (isInConqueringModeRef.current) {
      console.log('In conquering mode');
      if (provinceId && localGame) {
        const selectedProvince = localGame.provinces.find(p => p.id === provinceId);
  
        if (selectedProvince) {
          // --- Check for conquering own province --- 
          if (selectedProvince.ownerTag === localGame.playerNationTag) {
            console.log("Attempted to conquer own province.");
            const feedback = document.createElement('div');
            feedback.textContent = 'You cannot conquer your own territory.';
            feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md [font-family:var(--font-mplus-rounded)]';
            document.body.appendChild(feedback);
            selfConquestErrorPopupRef.current = feedback;
            setTimeout(() => {
              feedback.remove();
              if (selfConquestErrorPopupRef.current === feedback) {
                 selfConquestErrorPopupRef.current = null;
              }
            }, 3000); 
            return; // Stop further processing
          }
          // --- End check ---

          const owningNation = localGame.nations.find(n => n.nationTag === selectedProvince.ownerTag);
          const playerNation = localGame.nations.find(n => n.nationTag === localGame.playerNationTag);
  
          if (!owningNation || !playerNation) {
            console.error("Could not find owning or player nation details.");
            return; // Exit if essential data is missing
          }

          // Calculate owning nation's total resources
          const owningNationProvinces = localGame.provinces.filter(p => p.ownerTag === owningNation.nationTag);
          const owningNationTotalPopulation = owningNationProvinces.reduce((sum, p) => sum + p.population, 0);
          const owningNationTotalIndustry = owningNationProvinces.reduce((sum, p) => sum + p.industry, 0);
          const owningNationTotalArmy = owningNationProvinces.reduce((sum, p) => sum + p.army, 0);
          const owningNationGold = owningNation.gold;

          // Player resource totals are already available in playerNationResourceTotals state
          const { playerGold, playerPopulation, playerIndustry, playerArmy } = playerNationResourceTotals;

          const popup = document.createElement('div');
          // Keep existing popup styles
          popup.className = '[font-family:var(--font-mplus-rounded)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-lg p-6 w-full max-w-3xl border border-gray-200';
          popup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
          
          // Emoji style from ResourceBar
          const emojiStyle = `text-shadow: -1px -1px 0 rgba(0,0,0,0.1), 1px -1px 0 rgba(0,0,0,0.1), -1px 1px 0 rgba(0,0,0,0.1), 1px 1px 0 rgba(0,0,0,0.1); display: inline-block;`;
          const flagStyle = `display: inline-block; width: 1.5em; height: 1.5em; vertical-align: middle; margin-right: 0.5em; line-height: 1; font-size: 1.5em;`;

          popup.innerHTML = `
            <div class="relative flex justify-center items-center mb-4 pb-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span style="${emojiStyle} font-size: 1.5em;">⚔️</span>
                Conquest Target: ${selectedProvince.name}
              </h2>
              <button id="closeConquestPopupButton" class="absolute top-0 right-0 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-6 min-h-[150px]">
              
              <!-- Attacker Column (Player) -->
              <div class="border-r border-gray-200 pr-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <span style="${flagStyle}">${getNationFlag(playerNation.nationTag)}</span>
                  Attacker: ${playerNation.name}
                </h3>
                <div class="space-y-3 text-base">
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">💰</span> Gold: <span class="ml-auto font-bold text-gray-900">${formatNumber(playerGold)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">👥</span> Population: <span class="ml-auto font-bold text-gray-900">${formatNumber(playerPopulation)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">🏭</span> Industry: <span class="ml-auto font-bold text-gray-900">${formatNumber(playerIndustry)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">⚔️</span> Army: <span class="ml-auto font-bold text-gray-900">${formatNumber(playerArmy)}</span></div>
                </div>
              </div>

              <!-- Defender Column (Owner) -->
              <div class="pl-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <span style="${flagStyle}">${getNationFlag(owningNation.nationTag)}</span>
                  Defender: ${owningNation.name}
                </h3>
                 <div class="space-y-3 text-base">
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">💰</span> Gold: <span class="ml-auto font-bold text-gray-900">${formatNumber(owningNationGold)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">👥</span> Population: <span class="ml-auto font-bold text-gray-900">${formatNumber(owningNationTotalPopulation)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">🏭</span> Industry: <span class="ml-auto font-bold text-gray-900">${formatNumber(owningNationTotalIndustry)}</span></div>
                  <div class="flex items-center gap-2 text-gray-900"><span style="${emojiStyle} font-size: 1.5em;">⚔️</span> Army: <span class="ml-auto font-bold text-gray-900">${formatNumber(owningNationTotalArmy)}</span></div>
                </div>
              </div>

            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200 flex justify-center gap-3">
                <button id="launchAttackButton" class="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors text-sm">Launch Attack (Cost: X)</button> 
            </div>
          `;
  
          document.body.appendChild(popup);
          conquestPopupRef.current = popup;

          // Add event listeners for the new buttons
          const closeButton = popup.querySelector('#closeConquestPopupButton');
          const cancelButton = popup.querySelector('#cancelConquestActionButton');
          const launchButton = popup.querySelector('#launchAttackButton');

          const closePopup = () => {
            popup.remove();
            conquestPopupRef.current = null;
            // Optionally clear province selection when popup closes
            // handleProvinceSelect(null); 
          };

          closeButton?.addEventListener('click', closePopup);
          cancelButton?.addEventListener('click', closePopup);
          launchButton?.addEventListener('click', () => {
             console.log('Launch Attack clicked for province:', provinceId);
             // TODO: Implement attack logic (cost deduction, battle simulation, potential province capture)
             alert('Attack logic not yet implemented!');
             closePopup(); // Close popup after action
          });
        }
      }

    } else {
      if (provinceId && localGame) {
        const selectedProvince = localGame.provinces.find(p => p.id === provinceId);
  
        if (selectedProvince) {
          const owningNation = localGame.nations.find(n => n.nationTag === selectedProvince.ownerTag);
          const nationName = owningNation ? owningNation.name : 'Unknown';
  
          const popup = document.createElement('div');
          popup.className = '[font-family:var(--font-mplus-rounded)] fixed bottom-4 left-4 z-50 bg-white p-6 rounded-lg';
          popup.style.border = '1px solid rgb(229,229,229)';
          popup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
          popup.style.transform = 'translateY(-2px)';
          popup.style.width = '350px';
  
          const capitalizeFirstLetter = (string: string): string => {
            return string.charAt(0).toUpperCase() + string.slice(1);
          };
  
          popup.innerHTML = `
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-bold text-black">${selectedProvince.name}</h3>
              <span class="text-base text-black/70">${nationName}</span>
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-base mb-4">
              <div>👥 Population:</div> <p class="text-right font-bold text-black">${selectedProvince.population.toLocaleString()}</p>
              <div>💰 Gold Income:</div> <p class="text-right font-bold text-black">${selectedProvince.goldIncome}</p>
              <div>🏭 Industry:</div> <p class="text-right font-bold text-black">${selectedProvince.industry}</p>
              <div>🌟 Resource:</div> <p class="text-right font-bold text-black">${capitalizeFirstLetter(selectedProvince.resourceType)}</p>
              <div>⚔️ Army:</div> <p class="text-right font-bold text-black">${selectedProvince.army.toLocaleString()}</p>
            </div>
            ${owningNation ? `<button 
              class="w-full px-4 py-2 bg-[#67b9e7] text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
              style="box-shadow: 0 4px 0 #4792ba; transform: translateY(-2px);"
              id="showNationButton"
            >
              <span class="text-2xl">🎯</span>
              View Nation Details
            </button>` : ''}
          `;
  
          provincePopupRef.current = popup;
          document.body.appendChild(popup);
  
          const showNationButton = popup.querySelector('#showNationButton');
          if (showNationButton && owningNation) {
            showNationButton.addEventListener('click', () => {
              nationPopupRef.current?.remove();
  
              const nationPopup = document.createElement('div');
              nationPopup.className = '[font-family:var(--font-mplus-rounded)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg';
              nationPopup.style.border = '1px solid rgb(229,229,229)';
              nationPopup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
              nationPopup.style.transform = 'translateY(-2px)';
              nationPopup.style.width = '450px';
  
              const nationProvinces = localGame.provinces.filter(p => p.ownerTag === owningNation.nationTag);
              const totalPopulation = nationProvinces.reduce((sum, p) => sum + p.population, 0);
              const totalGoldIncome = nationProvinces.reduce((sum, p) => sum + p.goldIncome, 0);
              const totalIndustry = nationProvinces.reduce((sum, p) => sum + p.industry, 0);
              const totalArmy = nationProvinces.reduce((sum, p) => sum + p.army, 0);
  
              nationPopup.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-2xl font-bold text-black">${owningNation.name}</h3>
                  <button id="closeNationButton" class="text-black/70 hover:text-black transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full border border-black/30 hover:border-black/60">✕</button>
                </div>
                <div class="space-y-3 text-base">
                  <div>🏷️ Nation Tag: <span class="font-bold float-right">${owningNation.nationTag}</span></div>
                  <div>👥 Total Population: <span class="font-bold float-right">${totalPopulation.toLocaleString()}</span></div>
                  <div>💰 Total Gold Income: <span class="font-bold float-right">${totalGoldIncome}</span></div>
                  <div>🏭 Total Industry: <span class="font-bold float-right">${totalIndustry}</span></div>
                  <div>⚔️ Total Army: <span class="font-bold float-right">${totalArmy.toLocaleString()}</span></div>
                  <div>💎 Gold Reserves: <span class="font-bold float-right">${owningNation.gold}</span></div>
                  <div>🔬 Research Points: <span class="font-bold float-right">${owningNation.researchPoints}</span></div>
                  <div>📚 Current Research: <span class="font-bold float-right">${owningNation.currentResearchId || 'None'}</span></div>
                  <div>📊 Research Progress: <span class="font-bold float-right">${owningNation.currentResearchProgress}%</span></div>
                  <div>🗺️ Number of Provinces: <span class="font-bold float-right">${nationProvinces.length}</span></div>
                </div>
              `;
  
              document.body.appendChild(nationPopup);
              nationPopupRef.current = nationPopup;
  
              nationPopup.querySelector('#closeNationButton')?.addEventListener('click', () => {
                nationPopup.remove();
                nationPopupRef.current = null;
              });
            });
          }
        }
      }
    }

  }, [localGame]);

  const handleMapReady = useCallback((stateMap: Map<string, StateData>) => {
    if (!localGame) return;

    localGame.provinces.forEach(province => {
      const stateData = stateMap.get(province.id);
      if (stateData) {
        const nation = localGame.nations.find(n => n.nationTag === province.ownerTag);
        if (nation) {
          stateData.path.style.fill = nation.color;
          stateData.path.style.transition = 'fill 0.2s ease';
          stateData.nationId = nation.nationTag;
        }
      }
    });
  }, [localGame]);

  const addGold = async () => {
    if (!user || !localGame) return;

    try {
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === localGame.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      if (slotNumber === null) throw new Error('Could not find save slot');

      const updatedGame = JSON.parse(JSON.stringify(localGame));
      const playerNationIndex = updatedGame.nations.findIndex(
        (n: Nation) => n.nationTag === updatedGame.playerNationTag
      );

      if (playerNationIndex !== -1) {
        updatedGame.nations[playerNationIndex].gold += 100;

        setLocalGame(updatedGame);
        setPlayerGold(updatedGame.nations[playerNationIndex].gold);

        await GameService.saveGame(user.uid, slotNumber, updatedGame, 'debug-update');

        console.log('Added 100 gold to player nation!');
        const feedback = document.createElement('div');
        feedback.textContent = '+100 Gold Added!';
        feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
      }
    } catch (error) {
      console.error('Error adding gold:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    setIsLoadingSession(true);
    SessionService.getActiveUserSessions(user.uid)
      .then(activeSessions => {
        if (activeSessions && activeSessions.length > 0) {
          setHasActiveSession(true);
          setActiveSessionId(activeSessions[0].id);
        } else {
          setHasActiveSession(false);
          setActiveSessionId(null);
        }
      })
      .catch(error => console.error("Error checking active session:", error))
      .finally(() => setIsLoadingSession(false));
  }, [user]);

  const getRandomPlayerProvinceId = (currentGame: Game): string | null => {
    const playerProvinces = currentGame.provinces.filter(
      p => p.ownerTag === currentGame.playerNationTag
    );
    if (playerProvinces.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * playerProvinces.length);
    return playerProvinces[randomIndex].id;
  };

  const testAction = async () => {
    if (!localGame || !user) return;

    const randomProvinceId = getRandomPlayerProvinceId(localGame);
    if (!randomProvinceId) {
      console.error('Player has no provinces to target');
      return;
    }
    const randomProvinceName = localGame.provinces.find(p=>p.id === randomProvinceId)?.name || 'Unknown';

    console.log(`Selected province ${randomProvinceName} (${randomProvinceId}) for population increase`);

    try {
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === localGame.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      if (slotNumber === null) throw new Error('Could not find save slot');

      const action: ActionUpdate = {
        type: 'resources',
        target: { type: 'province', id: randomProvinceId },
        updates: [{ resource: 'population', amount: 10000 }]
      };

      const updatedGame = JSON.parse(JSON.stringify(localGame));
      const provinceIndex = updatedGame.provinces.findIndex((p: Province) => p.id === randomProvinceId);

      if (provinceIndex !== -1) {
        updatedGame.provinces[provinceIndex].population += 10000;

        setLocalGame(updatedGame);

        console.log(`Locally updated population for ${randomProvinceName} to ${updatedGame.provinces[provinceIndex].population}`);
      }

      await ActionService.processActions(user.uid, slotNumber, updatedGame, [action]);

      const feedback = document.createElement('div');
      feedback.textContent = `+10,000 Population in ${randomProvinceName}!`;
      feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 2000);

      console.log('Test action completed');
    } catch (error) {
      console.error('Error in test action:', error);
    }
  };

  const executeActionUpdate = async (action: Omit<ActionUpdate, 'target'>) => {
    if (!localGame || !user) return;
    console.log('Executing action:', action);

    if (action.type !== 'resources' || !action.updates) {
      console.warn('executeActionUpdate currently only handles resource updates.');
      return;
    }

    const targetProvinceId = getRandomPlayerProvinceId(localGame);
    if (!targetProvinceId) {
        console.error('Player has no provinces to target for action');
        return;
    }
    const targetProvinceName = localGame.provinces.find(p=>p.id === targetProvinceId)?.name || 'Unknown';

    const actionWithTarget: ActionUpdate = {
        ...action,
        target: { type: 'province', id: targetProvinceId }
    };
    console.log(`Selected province ${targetProvinceName} (${targetProvinceId}) for action:`, actionWithTarget);

    try {
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      for (const [slot, save] of Object.entries(allSaves)) {
          if (save && save.game.id === localGame.id) {
              slotNumber = parseInt(slot);
              break;
          }
      }
      if (slotNumber === null) throw new Error('Could not find save slot');

      // --- Local State Update --- Create a deep copy for calculation/saving
      const updatedGame = JSON.parse(JSON.stringify(localGame));
      const provinceIndex = updatedGame.provinces.findIndex((p: Province) => p.id === targetProvinceId);
      const nationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === updatedGame.playerNationTag);
      let needsResourceRecalc = false;
      let nationGoldChanged = false; // Track if nation gold specifically changed

      if (provinceIndex !== -1) {
        action.updates.forEach(update => {
          const { resource, amount } = update;
          switch (resource) {
            case 'population':
              updatedGame.provinces[provinceIndex].population += amount;
              needsResourceRecalc = true;
              break;
            case 'gold': // Apply gold updates to the NATION in the copied state
              if (nationIndex !== -1) {
                updatedGame.nations[nationIndex].gold += amount;
                needsResourceRecalc = true; // Gold affects totals
                nationGoldChanged = true;   // Mark that nation gold changed
              }
              break;
            case 'industry':
              updatedGame.provinces[provinceIndex].industry += amount;
              needsResourceRecalc = true;
              break;
            case 'army':
              updatedGame.provinces[provinceIndex].army += amount;
              needsResourceRecalc = true;
              break;
            // Handle other resource types if necessary
            // case 'goldIncome': // NOTE: goldIncome update logic might be different
            //   updatedGame.provinces[provinceIndex].goldIncome += amount;
            //   needsResourceRecalc = true;
            //   break;
          }
        });

        // --- Update Display State ONLY --- Calculate new totals based on updatedGame
        if (needsResourceRecalc && nationIndex !== -1) {
            const playerProvinces = updatedGame.provinces.filter(
                (p: Province) => p.ownerTag === updatedGame.playerNationTag
            );
            const newTotals = {
                playerGold: updatedGame.nations[nationIndex].gold,
                playerIndustry: playerProvinces.reduce((sum: number, p: { industry: number }) => sum + p.industry, 0),
                playerPopulation: playerProvinces.reduce((sum: number, p: { population: number }) => sum + p.population, 0),
                playerArmy: playerProvinces.reduce((sum: number, p: { army: number }) => sum + p.army, 0)
            };
            setPlayerNationResourceTotals(newTotals);
            console.log('Updated playerNationResourceTotals state:', newTotals);
        }

        // If nation gold specifically changed, update the playerGold state
        if (nationGoldChanged && nationIndex !== -1) {
            setPlayerGold(updatedGame.nations[nationIndex].gold);
            console.log('Updated playerGold state:', updatedGame.nations[nationIndex].gold);
        }
        // --- End Display State Update ---

        // REMOVED: setLocalGame(updatedGame); // Do NOT update the main localGame state here

        console.log(`Calculated update for province ${targetProvinceName}:`, updatedGame.provinces[provinceIndex]);
        if (nationIndex !== -1) console.log(`Calculated update for nation ${updatedGame.nations[nationIndex].nationTag}:`, updatedGame.nations[nationIndex]);

      } else {
          console.error(`Target province ${targetProvinceId} not found in local game state copy.`);
          return; // Don't proceed if province not found
      }

      // Process action and save the UPDATED game state to Firebase in the background
      await ActionService.processActions(user.uid, slotNumber, updatedGame, [actionWithTarget]);

      // Show feedback for each update
      action.updates.forEach(update => {
          const feedback = document.createElement('div');
          feedback.textContent = `+${update.amount} ${update.resource} in ${targetProvinceName}!`;
          feedback.className = 'fixed bottom-24 left-4 z-50 bg-[#0B1423] p-3 rounded-lg border border-[#FFD700] text-[#FFD700] historical-game-title';
          document.body.appendChild(feedback);
          setTimeout(() => feedback.remove(), 2000);
      });

      console.log('Action executed successfully');
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  // Function to change province ownership to the player
  const executeTakeProvince = async (provinceId: string) => {
    if (!localGame || !user) {
      console.error('Cannot take province: Game or user not loaded.');
      return;
    }
    if (!provinceId) {
      console.error('Cannot take province: No province ID provided.');
      return;
    }

    console.log(`Attempting to take province: ${provinceId}`);

    try {
      // Find save slot
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      for (const [slot, save] of Object.entries(allSaves)) {
          if (save && save.game.id === localGame.id) {
              slotNumber = parseInt(slot);
              break;
          }
      }
      if (slotNumber === null) throw new Error('Could not find save slot for executeTakeProvince');

      // Create a deep copy for update and saving
      const updatedGame = JSON.parse(JSON.stringify(localGame));

      // Find the province index
      const provinceIndex = updatedGame.provinces.findIndex((p: Province) => p.id === provinceId);

      if (provinceIndex !== -1) {
        const originalOwner = updatedGame.provinces[provinceIndex].ownerTag;
        const targetOwner = updatedGame.playerNationTag;

        if (originalOwner === targetOwner) {
          console.log(`Province ${provinceId} is already owned by the player (${targetOwner}).`);
          return; // No change needed
        }

        // Change the ownerTag
        updatedGame.provinces[provinceIndex].ownerTag = targetOwner;
        console.log(`Province ${provinceId} owner changed from ${originalOwner} to ${targetOwner} in updatedGame state.`);

        // Update local game state to trigger map re-color
        setLocalGame(updatedGame);

        // Save the updated game state to Firebase in the background
        // Use a specific scenario ID if needed, or a generic one like 'take-province'
        await GameService.saveGame(user.uid, slotNumber, updatedGame, 'take-province');

        console.log(`Province ${provinceId} successfully taken by player ${targetOwner}. Saved to slot ${slotNumber}.`);

        // Optional: Add feedback to the user
        const provinceName = updatedGame.provinces[provinceIndex].name || provinceId;
        const feedback = document.createElement('div');
        feedback.textContent = `Province ${provinceName} now belongs to you!`;
        feedback.className = 'fixed bottom-24 left-4 z-50 bg-green-600 p-3 rounded-lg border border-green-800 text-white historical-game-title';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);

      } else {
        console.error(`Province ${provinceId} not found in game state.`);
      }
    } catch (error) {
      console.error(`Error taking province ${provinceId}:`, error);
    }
  };

  // Effect to handle Escape key press for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close modals in a specific order if multiple could be true
        if (isModalOpen) {
          setIsModalOpen(false);
        } else if (isTaskModalOpen) {
          setIsTaskModalOpen(false);
        } else if (isHabitsModalOpen) {
          setIsHabitsModalOpen(false);
        } else if (isNationalPathModalOpen) {
          setIsNationalPathModalOpen(false);
        }
        // Also clear province selection popup if escape is pressed
        handleProvinceSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Depend on the modal states so the listener always knows the current state
  }, [isModalOpen, isTaskModalOpen, isHabitsModalOpen, isNationalPathModalOpen, handleProvinceSelect]);

  if (!localGame && !isDemo) {
    return <div>Loading game data...</div>;
  }
  if (!isDemo && !localGame?.nations.find(nation => nation.nationTag === localGame?.playerNationTag)) {
    return <div>Error: Player nation not found in game data</div>;
  }

  const playerNation = localGame?.nations.find(nation => nation.nationTag === localGame?.playerNationTag);

  const staticCountryData = localGame ? countries_1836.find(c => c.nationTag === localGame.playerNationTag) : null;
  const initialCapitalId = staticCountryData?.capitalProvinceId;

  console.log('[GameView] Player Nation Tag:', localGame?.playerNationTag);
  console.log('[GameView] Initial Capital ID being passed:', initialCapitalId);

  const { playerGold: currentGold, playerPopulation: totalPopulation, playerIndustry: totalIndustry, playerArmy: totalArmy } = playerNationResourceTotals;

  return (
    <div className={`fixed inset-0 overflow-hidden bg-[#0B1423] transition-opacity ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {!isInConqueringMode && (
        <div className="absolute top-0 left-0 right-0 z-40 flex flex-col md:flex-row items-center p-4">
          <div className="absolute left-4">
            <BackButton onClick={onBack} />
          </div>
          <div className="flex-1 flex justify-center">
            {localGame && (
              <ResourceBar
                playerGold={currentGold}
                totalPopulation={totalPopulation}
                totalIndustry={totalIndustry}
                totalArmy={totalArmy}
                playerNationTag={localGame.playerNationTag}
                gameDate={localGame.date}
                fadeIn={fadeIn}
              />
            )}
          </div>
        </div>
      )}

      {/* Conquest Mode Text Prompt */}
      {isInConqueringMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-white/90 rounded-lg shadow-md border border-gray-200 [font-family:var(--font-mplus-rounded)]">
          <p className="text-xl font-semibold text-gray-800">⚔️ Select a province to conquer ⚔️</p>
        </div>
      )}

      <div
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        ref={mapCanvasContainerRef}
      >
        <MapView
          mapName={localGame?.mapName || 'world_states'}
          isDemo={isDemo}
          selectedProvinceRef={selectedProvinceRef}
          onProvinceSelect={handleProvinceSelect}
          onMapReady={handleMapReady}
          disableKeyboardControls={isModalOpen || isTaskModalOpen || isHabitsModalOpen || isNationalPathModalOpen}
          initialFocusProvinceId={initialCapitalId}
        />
      </div>

      {!isInConqueringMode && (
        <ButtonGroup
          fadeIn={fadeIn}
          hasActiveSession={hasActiveSession}
          onTaskListClick={() => { if (user) { handleProvinceSelect(null); setIsTaskModalOpen(true); } }}
          onFocusClick={() => {
            if (user && localGame) {
              handleProvinceSelect(null);
              console.log('Opening Focus Modal. Current Game State:', localGame);
              console.log('Current Resource Totals:', playerNationResourceTotals);
              setIsModalOpen(true);
            }
          }}
          onHabitsClick={() => { handleProvinceSelect(null); setIsHabitsModalOpen(true); }}
          onConquestClick={() => { 
            console.log('Entering Conquest Mode');
            // Clear selection and close modals BEFORE setting mode
            handleProvinceSelect(null);
            setIsModalOpen(false);
            setIsTaskModalOpen(false);
            setIsHabitsModalOpen(false);
            setIsNationalPathModalOpen(false);
            // Set mode AFTER clearing selection and closing modals
            setIsInConqueringMode(true);
          }}
          focusTimeRemaining={focusTimeRemaining}
        />
      )}

      {isNationalPathModalOpen && (
        <NationalPathModal onClose={() => setIsNationalPathModalOpen(false)} />
      )}

      {/* Focus Now Modal - always render but control visibility with style */}
      <div id="focus-now-modal" style={{ display: isModalOpen ? 'block' : 'none' }}>
        {user && localGame && (
            <FocusNowModal
              userId={user.uid}
              executeActionUpdate={executeActionUpdate}
              playerNationResourceTotals={playerNationResourceTotals}
              onClose={async () => {
                setIsModalOpen(false);
                try {
                  const activeSessions = await SessionService.getActiveUserSessions(user.uid);
                  const isActive = activeSessions && activeSessions.length > 0;
                  setHasActiveSession(isActive);
                  setActiveSessionId(isActive ? activeSessions[0].id : null);
                } catch (error) {
                  console.error("Error checking active sessions after modal close:", error);
                }
              }}
              setFocusTimeRemaining={setFocusTimeRemaining}
              hasActiveSession={hasActiveSession}
            />
        )}
      </div>

      {/* Task Modal - always render but control visibility with style */}
      <div id="task-modal" style={{ display: isTaskModalOpen ? 'block' : 'none' }}>
        {user && localGame && (
          <TaskModal
            userId={user.uid}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskComplete={(task) => console.log('Task completed:', task)}
            executeActionUpdate={executeActionUpdate}
            playerNationResourceTotals={playerNationResourceTotals}
          />
        )}
      </div>
      {/* Habits Modal - always render but control visibility with style */}
      <div id="habits-modal" style={{ display: isHabitsModalOpen ? 'block' : 'none' }}>
        {user && localGame && (
          <HabitsModal
            userId={user.uid}
            onClose={() => setIsHabitsModalOpen(false)}
            executeActionUpdate={executeActionUpdate}
            playerNationResourceTotals={playerNationResourceTotals}
          />
        )}
      </div>

      {/* Conditionally render Cancel button for Conquest Mode */}
      {isInConqueringMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => {
              console.log('Exiting Conquest Mode');
              // Set mode first
              setIsInConqueringMode(false);
              // Ensure modals are closed (redundant but safe)
              setIsModalOpen(false);
              setIsTaskModalOpen(false);
              setIsHabitsModalOpen(false);
              setIsNationalPathModalOpen(false);
              // Clear selection AFTER exiting mode
              handleProvinceSelect(null);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md [font-family:var(--font-mplus-rounded)] text-lg"
            style={{ 
              boxShadow: '0 4px 0 #b91c1c', // Darker red shadow
              transform: 'translateY(-2px)'
            }}
          >
            Cancel Conquest
          </button>
        </div>
      )}

    </div>
  );
} 