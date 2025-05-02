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
  const [isNationalPathModalOpen, setIsNationalPathModalOpen] = useState(false);
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

  const handleProvinceSelect = useCallback((provinceId: string | null) => {
    selectedProvinceRef.current = provinceId;
    console.log('Selected Province:', provinceId);

    provincePopupRef.current?.remove();
    provincePopupRef.current = null;
    nationPopupRef.current?.remove();
    nationPopupRef.current = null;

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

        document.body.appendChild(popup);
        provincePopupRef.current = popup;

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
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center p-4">
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
          disableKeyboardControls={isModalOpen || isTaskModalOpen || isNationalPathModalOpen}
          initialFocusProvinceId={initialCapitalId}
        />
      </div>

      <ButtonGroup
        fadeIn={fadeIn}
        isModalOpen={isModalOpen || isTaskModalOpen || isNationalPathModalOpen}
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
        onNationalPathClick={() => { handleProvinceSelect(null); setIsNationalPathModalOpen(true); }}
        focusTimeRemaining={focusTimeRemaining}
      />

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

      {isTaskModalOpen && user && localGame && (
        <TaskModal
          userId={user.uid}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskComplete={(task) => console.log('Task completed:', task)}
          executeActionUpdate={executeActionUpdate}
          playerNationResourceTotals={playerNationResourceTotals}
        />
      )}

    </div>
  );
} 