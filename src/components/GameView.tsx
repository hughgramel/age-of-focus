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
import FocusNowButton from './FocusNowButton';
import TaskModal from './TaskModal';
import NationalPathModal from './NationalPathModal';
import { countries_1836 } from '@/data/countries_1836';
import HabitsModal from './HabitsModal';
import { getNationFlag } from '@/utils/nationFlags';
import MissionsModal from './MissionsModal';
import { getNationName } from '@/data/nationTags';
import panzoom from 'panzoom';
import { achievements as allAchievements } from '@/data/achievements/achievements_world_states';
import { UserService } from '@/services/userService';

interface GameViewProps {
  game?: Game;
  isDemo?: boolean;
  onBack: () => void;
  panzoomInstanceRef: React.RefObject<ReturnType<typeof panzoom> | null>;
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

// --- Conquest Constants ---
const CONQUEST_GOLD_COST = 1000; // Example cost, adjust as needed
const VICTORY_POWER_RATIO = 1.2; // Attacker needs 1.2x defender power to guarantee win
const MINIMUM_POWER_RATIO = 0.8; // Attacker needs at least 0.8x defender power to attempt
// --- End Conquest Constants ---

// --- Achievement Popup Component ---
function GameAchievementPopup({ achievementName, nationFlag, nationName, onClose, style }: { achievementName: string; nationFlag: string; nationName: string; onClose: () => void; style?: React.CSSProperties }) {
  return (
    <div
      className="fixed z-50 bg-white border-2 border-gray-800 rounded-lg px-6 py-4 flex items-center gap-4 [font-family:var(--font-mplus-rounded)] shadow-none"
      style={{
        ...style,
        boxShadow: '0 8px 0px 0px #1e293b', // dark bottom shadow
        minWidth: 320,
        maxWidth: 400,
      }}
    >
      <span className="text-2xl select-none">🏆</span>
      <div className="flex-1">
        <div className="font-bold text-lg text-gray-800 mb-1">Achievement Unlocked</div>
        <div className="text-base font-semibold text-gray-900 mb-0.5">{achievementName}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">{nationFlag} {nationName}</div>
      </div>
      <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
    </div>
  );
}

// Helper to convert seconds to mm:ss
const convertSecondsToTimeFormat = (seconds: number): string => {
  const numHours = Math.floor((seconds / 60) / 60);
  const numMinutes = Math.floor((seconds / 60) % 60);
  const numSeconds = Math.floor(seconds % 60);
  const hoursStr = numHours > 0 ? `${numHours}:` : '';
  const minutesStr = numHours > 0 && numMinutes < 10 ? `0${numMinutes}` : numMinutes;
  const secondsStr = numSeconds < 10 ? `0${numSeconds}` : numSeconds;
  return `${hoursStr}${minutesStr}:${secondsStr}`;
};

export default function GameView({ game, isDemo = false, onBack, panzoomInstanceRef }: GameViewProps) {
  const { user } = useAuth();
  const selectedProvinceRef = useRef<string | null>(null);
  const provincePopupRef = useRef<HTMLDivElement | null>(null);
  const nationPopupRef = useRef<HTMLDivElement | null>(null);
  const conquestPopupRef = useRef<HTMLDivElement | null>(null);
  const selfConquestErrorPopupRef = useRef<HTMLDivElement | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const mapCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isNationalPathModalOpen, setIsNationalPathModalOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
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
  const [achievementPopups, setAchievementPopups] = useState<{ name: string; nationFlag: string; nationName: string }[]>([]);

  // Effect to determine screen size for layout changes
  // This is a basic way; consider a more robust hook for production (e.g., from a UI library or use-hooks)
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // Tailwind's sm breakpoint is 640px
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

        setPlayerNationResourceTotals({
          playerGold: playerNation.gold,
          playerIndustry: totalIndustry,
          playerPopulation: totalPop,
          playerArmy: totalArmy
        });
      } else {
        setPlayerNationResourceTotals({ playerGold: 0, playerIndustry: 0, playerPopulation: 0, playerArmy: 0 });
      }
    } else {
      setPlayerNationResourceTotals({ playerGold: 0, playerIndustry: 0, playerPopulation: 0, playerArmy: 0 });
    }
  }, [localGame]);

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

          // --- Recalculate Player Totals Directly --- 
          const playerProvinces = localGame.provinces.filter(p => p.ownerTag === playerNation.nationTag);
          const currentPlayerPopulation = playerProvinces.reduce((sum, p) => sum + p.population, 0);
          const currentPlayerIndustry = playerProvinces.reduce((sum, p) => sum + p.industry, 0);
          const currentPlayerArmy = playerProvinces.reduce((sum, p) => sum + p.army, 0);
          const currentPlayerGold = playerNation.gold; // Get current gold directly from player nation object
          // --- End Recalculation ---

          // --- Battle Calculations --- 
          const calculateBattlePower = (army: number, industry: number, gold: number): number => {
            if (army <= 0) return 0;
            const industryBonus = (industry || 0) / 1000;
            const goldBonus = Math.log10(1 + (gold || 0));
            // Ensure bonus calculation doesn't result in NaN or negative multipliers if inputs are weird
            const totalMultiplier = Math.max(0, 1 + industryBonus + goldBonus);
            return army * totalMultiplier;
          };

          const attackerPower = calculateBattlePower(currentPlayerArmy, currentPlayerIndustry, currentPlayerGold);
          const defenderPower = calculateBattlePower(owningNationTotalArmy, owningNationTotalIndustry, owningNationGold);

          let attackerCasualtyPercent = 0;
          let defenderCasualtyPercent = 0;
          if (attackerPower > 0 && defenderPower > 0) {
              attackerCasualtyPercent = Math.min(100, (defenderPower / attackerPower) * 50);
              defenderCasualtyPercent = Math.min(100, (attackerPower / defenderPower) * 60);
          } else if (defenderPower <= 0 && attackerPower > 0) {
              // Attacker wins decisively if defender has no power
              attackerCasualtyPercent = 5; // Minimal casualties
              defenderCasualtyPercent = 100;
          } else if (attackerPower <= 0 && defenderPower > 0) {
              // Attacker loses decisively if attacker has no power
              attackerCasualtyPercent = 100;
              defenderCasualtyPercent = 5; // Minimal casualties
          } // If both are 0, percentages remain 0

          const attackerLosses = Math.round(currentPlayerArmy * (attackerCasualtyPercent / 100));
          const defenderLosses = Math.round(owningNationTotalArmy * (defenderCasualtyPercent / 100));

          const isProjectedVictory = attackerPower > defenderPower * VICTORY_POWER_RATIO;
          const meetsMinimumPower = attackerPower >= defenderPower * MINIMUM_POWER_RATIO;
          const hasSufficientArmy = currentPlayerArmy > 0;
          const canAfford = currentPlayerGold >= CONQUEST_GOLD_COST;

          const canLaunchAttack = meetsMinimumPower && hasSufficientArmy && canAfford;
          
          let disabledReason = "";
          if (!canAfford) disabledReason = `Insufficient Gold (Need ${CONQUEST_GOLD_COST})`;
          else if (!hasSufficientArmy) disabledReason = "No army available to attack";
          else if (!meetsMinimumPower) disabledReason = "Forces significantly outmatched";

          // --- End Battle Calculations ---

          const popup = document.createElement('div');
          popup.className = '[font-family:var(--font-mplus-rounded)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-xl p-7 w-full max-w-2xl border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]';
          
          const emojiStyle = `text-shadow: -0.5px -0.5px 0 rgba(0,0,0,0.1), 0.5px -0.5px 0 rgba(0,0,0,0.1), -0.5px 0.5px 0 rgba(0,0,0,0.1), 0.5px 0.5px 0 rgba(0,0,0,0.1); display: inline-block; font-size: 1.5em;`;
          const flagStyle = `display: inline-block; width: 1.6em; height: 1.6em; vertical-align: middle; margin-right: 0.3em; line-height: 1; font-size: 1.6em;`;
          const statLabelStyle = `text-[#0B1423]/70 text-base`;
          const statValueStyle = `font-semibold text-xl text-[#0B1423]`;
          const columnHeaderStyle = `text-xl font-bold text-[#0B1423] mb-4 flex items-center justify-center gap-2`;
          const buttonBaseStyle = `px-7 py-3.5 text-lg font-semibold rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_3px_0px] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px] w-full max-w-xs`;
          const enabledButtonStyle = `bg-[#dc2626] text-white border-[#991b1b] shadow-[#991b1b] hover:bg-[#c02020] active:bg-[#991b1b]`;
          const disabledButtonStyle = `bg-gray-200 text-gray-400 border-gray-300 shadow-gray-300 cursor-not-allowed`;
          const closeButtonStyle = `absolute top-2 right-2 p-1 text-2xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors leading-none w-8 h-8 flex items-center justify-center`;

          popup.innerHTML = `
            <div class="relative mb-5 pb-4">
              <h2 class="text-2xl font-bold text-[#0B1423] text-center">
                <span style="${emojiStyle}" class="mr-1">⚔️</span>
                Conquest of ${selectedProvince.name}
              </h2>
              <button id="closeConquestPopupButton" class="${closeButtonStyle}">
                ✕
              </button>
            </div>

            <div class="grid grid-cols-2 gap-7 mb-6"> 
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200/80">
                <h3 class="${columnHeaderStyle}">
                  <span style="${flagStyle}">${getNationFlag(playerNation.nationTag)}</span>
                  Attacker: ${playerNation.name}
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-baseline">
                    <span class="${statLabelStyle}">⚔️ Power:</span> 
                    <span class="${statValueStyle}">${formatNumber(attackerPower)}</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="${statLabelStyle}">Est. Casualties:</span> 
                    <span class="${statValueStyle} text-red-600">-${formatNumber(attackerLosses)}</span> 
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200/80">
                <h3 class="${columnHeaderStyle}">
                  <span style="${flagStyle}">${getNationFlag(owningNation.nationTag)}</span>
                  Defender: ${owningNation.name}
                </h3>
                 <div class="space-y-3">
                  <div class="flex justify-between items-baseline">
                    <span class="${statLabelStyle}">⚔️ Power:</span> 
                    <span class="${statValueStyle}">${formatNumber(defenderPower)}</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="${statLabelStyle}">Est. Casualties:</span> 
                    <span class="${statValueStyle} text-red-600">-${formatNumber(defenderLosses)}</span> 
                  </div>
                </div>
              </div>
            </div>
 
            <div class="mt-2 pt-2 flex flex-col items-center gap-3"> 
                <div class="text-center mb-2">
                    <div class="text-2xl font-bold ${isProjectedVictory ? 'text-green-600' : 'text-red-600'}">
                        ${isProjectedVictory ? '📈 Projected Victory' : '📉 Projected Defeat'}
                    </div>
                </div>
            
                <button 
                    id="launchAttackButton" 
                    class="${buttonBaseStyle} ${canLaunchAttack ? enabledButtonStyle : disabledButtonStyle} mb-5"
                    ${!canLaunchAttack ? 'disabled' : ''}
                    title="${disabledReason}"
                >
                  <span class="mr-1">⚔️</span> Launch Attack (${CONQUEST_GOLD_COST}💰)
                </button>
                ${disabledReason ? `<span class="text-sm text-red-600 text-center font-semibold">${disabledReason}</span>` : ''}
            </div>
          `;
  
          document.body.appendChild(popup);
          conquestPopupRef.current = popup;

          // Add event listeners for the new buttons
          const closeButton = popup.querySelector('#closeConquestPopupButton');
          const launchButton = popup.querySelector('#launchAttackButton');

          const closePopup = () => {
            popup.remove();
            conquestPopupRef.current = null;
            // Optionally clear province selection when popup closes
            // handleProvinceSelect(null); 
          };

          closeButton?.addEventListener('click', closePopup);
          // Only add listener if the button is not disabled
          if (canLaunchAttack) {
            launchButton?.addEventListener('click', () => {
                console.log('Launch Attack clicked for province:', provinceId);
                // Call the new conquest function
                executeProvinceConquest(provinceId, attackerLosses, CONQUEST_GOLD_COST);
                // alert('Attack logic not yet implemented!'); // Remove alert
                // closePopup(); // Conquest function handles closing
            });
          }
        }
      }

    } else {
    if (provinceId && localGame) {
      const selectedProvince = localGame.provinces.find(p => p.id === provinceId);

      if (selectedProvince) {
        const owningNation = localGame.nations.find(n => n.nationTag === selectedProvince.ownerTag);
        const nationName = owningNation ? owningNation.name : 'Unknown';

        const popup = document.createElement('div');
        // Center the popup and adjust styles
        popup.className = '[font-family:var(--font-mplus-rounded)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg';
        popup.style.border = '1px solid rgb(229,229,229)';
        popup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
        // Removed transform: translateY(-2px) as centering handles positioning
        popup.style.width = '350px'; 

        const capitalizeFirstLetter = (string: string): string => {
             if (!string) return '';
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        popup.innerHTML = `
          <div class="relative mb-4">
            <div class="flex justify-between items-start">
              <h3 class="text-2xl font-bold text-black pr-8">${selectedProvince.name}</h3> 
              <span class="text-base text-black/70 pt-1 mr-8">${nationName}</span> 
            </div>


            <button id="closeProvincePopup" class="absolute top-[-6px] right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <span class="text-xl font-bold">✕</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-base mb-4">
            <div class="text-black">👥 Population:</div> <p class="text-right font-bold text-black">${selectedProvince.population.toLocaleString()}</p>

            <div class="text-black">🏭 Industry:</div> <p class="text-right font-bold text-black">${selectedProvince.industry}</p>

            <div class="text-black">⚔️ Army:</div> <p class="text-right font-bold text-black">${selectedProvince.army.toLocaleString()}</p>
          </div>
          ${owningNation ? `<button 
            class="w-full px-4 py-2 bg-[#67b9e7] text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            style="box-shadow: 0 4px 0 #4792ba; transform: translateY(-2px);"
            id="showNationButton"
          >
            <span class="text-2xl">🎯</span>
            View Nation
          </button>` : ''}
        `;

        provincePopupRef.current = popup;
        document.body.appendChild(popup);

        // Event listener for the new close button
        const closeButton = popup.querySelector('#closeProvincePopup');
        closeButton?.addEventListener('click', () => {
          popup.remove();
          provincePopupRef.current = null;
        });

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
              <div class="relative mb-4">
                <h3 class="text-2xl font-bold text-black">${owningNation.name}</h3>
                <button id="closeNationButton" class="absolute top-[-6px] right-0 p-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <span class="text-xl font-bold">✕</span>
                </button>
              </div>
              <div class="space-y-3 text-base">
                <div><span class="text-black">👥 Total Population:</span> <span class="font-bold float-right text-black">${totalPopulation.toLocaleString()}</span></div>
                <div><span class="text-black">🏭 Total Industry:</span> <span class="font-bold float-right text-black">${totalIndustry}</span></div>
                <div><span class="text-black">⚔️ Total Army:</span> <span class="font-bold float-right text-black">${totalArmy.toLocaleString()}</span></div>
                <div><span class="text-black">💰 Gold:</span> <span class="font-bold float-right text-black">${owningNation.gold.toLocaleString()}</span></div>
                <div><span class="text-black">🗺️ Number of Provinces:</span> <span class="font-bold float-right text-black">${nationProvinces.length}</span></div>
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

  // --- Execute Conquest Action ---
  const executeProvinceConquest = async (
    provinceId: string,
    attackerCasualtyLosses: number,
    goldCost: number
  ) => {
    if (!user || !localGame || !provinceId) {
      console.error('Cannot execute conquest: Missing user, game, or provinceId.');
      // Show error feedback?
      return;
    }

    console.log(`Executing conquest for ${provinceId}. Cost: ${goldCost} Gold, Casualties: ${attackerCasualtyLosses}`);

    try {
      // 1. Find Save Slot
      const allSaves = await GameService.getSaveGames(user.uid);
      let slotNumber: number | null = null;
      for (const [slot, save] of Object.entries(allSaves)) {
        if (save && save.game.id === localGame.id) {
          slotNumber = parseInt(slot);
          break;
        }
      }
      if (slotNumber === null) throw new Error('Could not find save slot for conquest');

      // 2. Create Deep Copy & Find Indices
      const updatedGame = JSON.parse(JSON.stringify(localGame));
      const playerNationIndex = updatedGame.nations.findIndex(
        (n: Nation) => n.nationTag === updatedGame.playerNationTag
      );
      const targetProvinceIndex = updatedGame.provinces.findIndex(
        (p: Province) => p.id === provinceId
      );

      if (playerNationIndex === -1 || targetProvinceIndex === -1) {
        throw new Error('Player nation or target province not found in game state copy.');
      }

      const playerNationTag = updatedGame.playerNationTag;
      const playerNation = updatedGame.nations[playerNationIndex];

      // 3. Validation
      if (playerNation.gold < goldCost) {
        console.error(`Conquest failed: Insufficient gold. Have: ${playerNation.gold}, Need: ${goldCost}`);
        // Show feedback: Not enough gold
        const feedback = document.createElement('div');
        feedback.textContent = `Attack Failed: Insufficient Gold, Focus to earn more!`;
        feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md [font-family:var(--font-mplus-rounded)]';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
        return;
      }

      const playerProvincesBeforeConquest = updatedGame.provinces.filter(
          (p: Province) => p.ownerTag === playerNationTag
      );
      const totalPlayerArmy = playerProvincesBeforeConquest.reduce((sum: number, p: { army: number }) => sum + p.army, 0);

      if (totalPlayerArmy < attackerCasualtyLosses) {
          console.warn(`Casualties (${attackerCasualtyLosses}) exceed total army (${totalPlayerArmy}). Reducing army to 0.`);
          attackerCasualtyLosses = totalPlayerArmy; // Cannot lose more than available
      }


      // 4. Apply Changes to updatedGame
      // a) Deduct Gold
      updatedGame.nations[playerNationIndex].gold -= goldCost;

      // b) Distribute Casualties Proportionaally
      let remainingLosses = attackerCasualtyLosses;
      if (totalPlayerArmy > 0) { // Avoid division by zero
          playerProvincesBeforeConquest.forEach((prov: Province) => {
              const provinceIndex = updatedGame.provinces.findIndex((p: Province) => p.id === prov.id);
              if (provinceIndex !== -1) {
                  const proportion = prov.army / totalPlayerArmy;
                  const lossesToApply = Math.min(prov.army, Math.round(attackerCasualtyLosses * proportion));
                  updatedGame.provinces[provinceIndex].army -= lossesToApply;
                  remainingLosses -= lossesToApply; // Track remaining to handle rounding
              }
          });

          // Distribute any remaining losses due to rounding (e.g., start from first province)
          let provinceIdx = 0;
          while (remainingLosses > 0 && provinceIdx < playerProvincesBeforeConquest.length) {
              const currentProvId = playerProvincesBeforeConquest[provinceIdx].id;
              const currentProvIndex = updatedGame.provinces.findIndex((p: Province) => p.id === currentProvId);
               if (currentProvIndex !== -1 && updatedGame.provinces[currentProvIndex].army > 0) {
                  updatedGame.provinces[currentProvIndex].army -= 1;
                  remainingLosses -= 1;
              }
              provinceIdx++;
          }
      } else {
          console.warn("Player has no army to distribute losses.");
      }


      // c) Change Province Ownership
      const originalOwner = updatedGame.provinces[targetProvinceIndex].ownerTag;
      updatedGame.provinces[targetProvinceIndex].ownerTag = playerNationTag;

      console.log(`Province ${provinceId} owner changed from ${originalOwner} to ${playerNationTag}`);
      console.log(`Gold reduced by ${goldCost}. Casualties distributed: ${attackerCasualtyLosses}.`);


      // 5. Update Local React State
      setLocalGame(updatedGame); // Trigger map color change etc.

      // Recalculate totals for the ResourceBar
      const updatedPlayerProvinces = updatedGame.provinces.filter(
          (p: Province) => p.ownerTag === playerNationTag
      );
      const newTotals = {
          playerGold: updatedGame.nations[playerNationIndex].gold,
          playerIndustry: updatedPlayerProvinces.reduce((sum: number, p: { industry: number }) => sum + p.industry, 0),
          playerPopulation: updatedPlayerProvinces.reduce((sum: number, p: { population: number }) => sum + p.population, 0),
          playerArmy: updatedPlayerProvinces.reduce((sum: number, p: { army: number }) => sum + p.army, 0)
      };
      setPlayerNationResourceTotals(newTotals);
      console.log('Updated playerNationResourceTotals state after conquest:', newTotals);


      // 6. Save to Database (don't await, let it run in background)
      GameService.saveGame(user.uid, slotNumber, updatedGame, 'conquest-complete');


      // 7. Close Conquest Popup & Show Success
      conquestPopupRef.current?.remove();
      conquestPopupRef.current = null;

      const feedback = document.createElement('div');
      const provinceName = updatedGame.provinces[targetProvinceIndex].name || provinceId;
      feedback.textContent = `✅ Conquest Successful! ${provinceName} is now yours.`;
      feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-green-500 text-white px-6 py-4 rounded-xl border-2 [font-family:var(--font-mplus-rounded)] font-semibold';
      feedback.style.borderColor = '#2f855a'; // Darker green border
      feedback.style.boxShadow = '0 3px 0px #2f855a'; // Darker green shadow
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 4000);

    } catch (error) {
      console.error('Error during province conquest:', error);
      // Show generic error feedback?
       const feedback = document.createElement('div');
      feedback.textContent = `Error during conquest. Please check console.`;
      feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md [font-family:var(--font-mplus-rounded)]';
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 4000);
    }
  };
  // --- End Execute Conquest Action ---

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

        // Update playerNationResourceTotals directly as well
        setPlayerNationResourceTotals(prevTotals => ({
          ...prevTotals,
          playerGold: updatedGame.nations[playerNationIndex].gold
        }));

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
      .catch(error => console.error("Error checking active session:", error));
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
      // const updatedGame = JSON.parse(JSON.stringify(localGame)); 
      // --- Optimistic UI Update --- 
      const nationIndex = localGame.nations.findIndex((n: Nation) => n.nationTag === localGame.playerNationTag);
      let needsResourceRecalc = false;
      let nationGoldChanged = false; // Track if nation gold specifically changed
      let tempNationGold = playerNationResourceTotals.playerGold; // Start with current UI gold
      let tempPopulation = playerNationResourceTotals.playerPopulation;
      let tempIndustry = playerNationResourceTotals.playerIndustry;
      let tempArmy = playerNationResourceTotals.playerArmy;

      // Calculate the expected changes based on the action
        action.updates.forEach(update => {
          const { resource, amount } = update;
        needsResourceRecalc = true; // Assume any resource update requires recalc for simplicity
          switch (resource) {
            case 'population':
            tempPopulation += amount;
              break;
          case 'gold': // Apply gold updates to the NATION 
             if (nationIndex !== -1) { // Check if player nation exists
               tempNationGold += amount;
                nationGoldChanged = true;   // Mark that nation gold changed
              }
              break;
            case 'industry':
            tempIndustry += amount;
              break;
            case 'army':
            tempArmy += amount;
              break;
        }
        });

      // Update Display State ONLY with calculated optimistic values
      if (needsResourceRecalc) {
            const newTotals = {
              playerGold: tempNationGold,
              playerIndustry: tempIndustry, 
              playerPopulation: tempPopulation,
              playerArmy: tempArmy
            };
            setPlayerNationResourceTotals(newTotals);
          console.log('Optimistically updated playerNationResourceTotals state:', newTotals);
        }
      // If nation gold specifically changed, update the playerGold state for the resource bar
      if (nationGoldChanged) {
          console.log('Optimistically updated playerNationResourceTotals for gold specifically to:', tempNationGold);
      }
      // --- End Optimistic UI Update ---

      // Process action and save using the *original* localGame state. 
      // ActionService should handle applying the action to this state and saving.
      // await ActionService.processActions(user.uid, slotNumber, localGame, [actionWithTarget]); 
      
      // --- Apply changes and Save Directly --- 
      const updatedGame = JSON.parse(JSON.stringify(localGame));
      const playerNationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === updatedGame.playerNationTag);
      const targetProvinceForUpdateIndex = updatedGame.provinces.findIndex((p: Province) => p.id === targetProvinceId);

      if (playerNationIndex === -1) {
         console.error('Player nation not found in game state copy for saving.');
         return;
      }
      if (targetProvinceForUpdateIndex === -1) {
          console.warn(`Target province ${targetProvinceId} for resource update not found. Some non-gold resources may not be applied.`);
          // Allow continuing for gold updates, but other resource updates might fail. 
      }

      action.updates.forEach(update => {
          const { resource, amount } = update;
          switch (resource) {
              case 'population':
                  if (targetProvinceForUpdateIndex !== -1) {
                      updatedGame.provinces[targetProvinceForUpdateIndex].population = Math.max(0, updatedGame.provinces[targetProvinceForUpdateIndex].population + amount);
                  }
                  break;
              case 'gold':
                  updatedGame.nations[playerNationIndex].gold = Math.max(0, updatedGame.nations[playerNationIndex].gold + amount);
                  break;
              case 'industry':
                   if (targetProvinceForUpdateIndex !== -1) {
                      updatedGame.provinces[targetProvinceForUpdateIndex].industry = Math.max(0, updatedGame.provinces[targetProvinceForUpdateIndex].industry + amount);
                  }
                  break;
              case 'army':
                   if (targetProvinceForUpdateIndex !== -1) {
                      updatedGame.provinces[targetProvinceForUpdateIndex].army = Math.max(0, updatedGame.provinces[targetProvinceForUpdateIndex].army + amount);
                  }
                  break;
          }
      });

       console.log(`Saving updated game state after action. Gold: ${updatedGame.nations[playerNationIndex].gold}, Target Province (${targetProvinceId}) Pop: ${targetProvinceForUpdateIndex !== -1 ? updatedGame.provinces[targetProvinceForUpdateIndex].population: 'N/A'}`);

      // Save the explicitly updated game state
      await GameService.saveGame(user.uid, slotNumber, updatedGame, 'habit-toggle-update');
      // --- End Apply changes and Save Directly ---

      // Here we need 

      console.log('Check achievements now');
      checkAchievements();
      console.log('Check missions now');
      checkMissions();

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

        console.log('Check achievements now');
        checkAchievements();
        console.log('Check missions now');
        checkMissions();

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

  async function checkMissions() {
    console.log('Checking missions');
    // Here we need to check if the player has any missions that are now complete.
    // If we do, we complete them and award the rewards by executing the action or granting the rewards.
  }
  // --- Achievement Checking ---
  async function checkAndUnlockAchievements({
    userId,
    playerNationTag,
    playerNationName,
    gold,
    industry,
    army,
    population,
    ownedProvinceIds,
    unlockedAchievementIds,
    showPopup,
  }: {
    userId: string;
    playerNationTag: string;
    playerNationName: string;
    gold: number;
    industry: number;
    army: number;
    population: number;
    ownedProvinceIds: string[];
    unlockedAchievementIds: string[];
    showPopup: (achievement: { name: string; nationFlag: string; nationName: string }) => void;
  }) {
    for (const ach of allAchievements) {
      if (unlockedAchievementIds.includes(ach.id)) continue;
      const req = ach.requirements;
      let met = true;
      if (req.tag && req.tag !== playerNationTag) met = false;
      if (req.minGold && gold < req.minGold) met = false;
      if (req.minIndustry && industry < req.minIndustry) met = false;
      if (req.minArmy && army < req.minArmy) met = false;
      if (req.minPopulation && population < req.minPopulation) met = false;
      if (req.minProvinces && ownedProvinceIds.length < req.minProvinces) met = false;
      if (req.requiredProvinces && req.requiredProvinces.length > 0) {
        for (const prov of req.requiredProvinces) {
          if (!ownedProvinceIds.includes(prov)) met = false;
        }
      }
      if (met) {
        await UserService.unlockAchievement(userId, ach.id);
        showPopup({
          name: ach.name,
          nationFlag: getNationFlag(playerNationTag),
          nationName: playerNationName,
        });
      }
    }
  }

  async function checkAchievements() {
    try {
      // Determine scenario (default to 'world_states' if not found)
      const scenario = localGame?.mapName || 'world_states';
      let achievementsModule;
      if (scenario === 'world_states') {
        achievementsModule = await import('../data/achievements/achievements_world_states');
      } else {
        // Fallback or add more scenarios as needed
        achievementsModule = await import('../data/achievements/achievements_world_states');
      }
      const { achievements } = achievementsModule;
      const playerNation = localGame?.nations.find(n => n.nationTag === localGame.playerNationTag);
      if (!playerNation || !localGame) {
        console.warn('No player nation or game found for achievement check.');
        return;
      }
      // Get all provinces owned by the player
      const ownedProvinces = localGame.provinces.filter(p => p.ownerTag === playerNation.nationTag);
      const ownedProvinceIds = ownedProvinces.map(p => p.id);
      // Gather resources
      const gold = playerNation.gold;
      const industry = ownedProvinces.reduce((sum, p) => sum + (p.industry || 0), 0);
      const army = ownedProvinces.reduce((sum, p) => sum + (p.army || 0), 0);
      const population = ownedProvinces.reduce((sum, p) => sum + (p.population || 0), 0);
      // Get unlocked achievements from Firestore
      let unlockedAchievementIds: string[] = [];
      if (user) {
        unlockedAchievementIds = await UserService.getUserAchievements(user.uid);
        // Show popup handler
        const showPopup = (achievement: { name: string; nationFlag: string; nationName: string }) => {
          setAchievementPopups(prev => [achievement, ...prev]);
        };
        // Call the unlock logic
        await checkAndUnlockAchievements({
          userId: user.uid,
          playerNationTag: playerNation.nationTag,
          playerNationName: playerNation.name,
          gold,
          industry,
          army,
          population,
          ownedProvinceIds,
          unlockedAchievementIds,
          showPopup,
        });
      }
      // ... existing achievement check logic (for console logs, etc.)
      achievements.forEach(ach => {
        const req = ach.requirements;
        let met = true;
        if (req.tag && req.tag !== playerNation.nationTag) met = false;
        if (req.minGold && gold < req.minGold) met = false;
        if (req.minIndustry && industry < req.minIndustry) met = false;
        if (req.minArmy && army < req.minArmy) met = false;
        if (req.minPopulation && population < req.minPopulation) met = false;
        if (req.minProvinces && ownedProvinceIds.length < req.minProvinces) met = false;
        if (req.requiredProvinces && req.requiredProvinces.length > 0) {
          for (const prov of req.requiredProvinces) {
            if (!ownedProvinceIds.includes(prov)) met = false;
          }
        }
        console.log(`Achievement: ${ach.name} - ${met ? 'ACHIEVED' : 'Not achieved'}`);
        if (!met) {
          console.log('  Requirements:', ach.requirements);
          console.log('  Your stats:', { gold, industry, army, population, ownedProvinceIds });
        }
      });
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  }
  // --- End Achievement Checking ---

  // Auto-dismiss achievement popups after 3.5s
  useEffect(() => {
    if (achievementPopups.length === 0) return;
    const timer = setTimeout(() => {
      setAchievementPopups(prev => prev.slice(0, -1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [achievementPopups]);

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
        } else if (isMissionsModalOpen) {
          setIsMissionsModalOpen(false);
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
  }, [isModalOpen, isTaskModalOpen, isHabitsModalOpen, isNationalPathModalOpen, isMissionsModalOpen, handleProvinceSelect]);

  // Set tab title based on focus session
  useEffect(() => {
    if (hasActiveSession) {
      document.title = `${convertSecondsToTimeFormat(Math.max(0, focusTimeRemaining))}`;
    } else {
      document.title = 'Age of Focus';
    }
  }, [hasActiveSession, focusTimeRemaining]);

  if (!localGame && !isDemo) {
    return <div className="flex items-center justify-center h-screen text-white">Loading game data...</div>;
  }
  if (!isDemo && !localGame?.nations.find(nation => nation.nationTag === localGame?.playerNationTag)) {
    return <div className="flex items-center justify-center h-screen text-white">Error: Player nation not found.</div>;
  }

  const playerNation = localGame?.nations.find(nation => nation.nationTag === localGame?.playerNationTag);

  const staticCountryData = localGame ? countries_1836.find(c => c.nationTag === localGame.playerNationTag) : null;
  const initialCapitalId = staticCountryData?.capitalProvinceId;

  console.log('[GameView] Player Nation Tag:', localGame?.playerNationTag);
  console.log('[GameView] Initial Capital ID being passed:', initialCapitalId);

  const { playerGold: currentGold, playerPopulation: totalPopulation, playerIndustry: totalIndustry, playerArmy: totalArmy } = playerNationResourceTotals;

  // Get player nation name
  const playerNationName = localGame ? getNationName(localGame.playerNationTag) : 'Unknown Nation';

  // Props for the main ButtonGroup (now 4 buttons)
  const fourButtonHandlerProps = {
    fadeIn: fadeIn,
    onTaskListClick: () => { if (user) { handleProvinceSelect(null); setIsTaskModalOpen(true); } },
    onHabitsClick: () => { handleProvinceSelect(null); setIsHabitsModalOpen(true); },
    onConquestClick: () => { 
      handleProvinceSelect(null);
      setIsModalOpen(false);
      setIsTaskModalOpen(false);
      setIsHabitsModalOpen(false);
      setIsNationalPathModalOpen(false);
      setIsMissionsModalOpen(false);
      setIsInConqueringMode(true);
    },
    onMissionsClick: () => { handleProvinceSelect(null); setIsMissionsModalOpen(true); },
  };

  // Click handler for the standalone FocusNowButton
  const handleFocusNowClick = () => {
    if (user && localGame) {
      handleProvinceSelect(null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden bg-[#0B1423] transition-opacity ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- UI Elements for NON-CONQUEST MODE --- */}
      {!isInConqueringMode && (
        <>
          {/* Top-Left: BackButton */}
          <div className="absolute top-4 left-4 z-40">
            <BackButton onClick={onBack} />
          </div>
          {/* Top-Center: ResourceBar */}
          {localGame && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
              <ResourceBar
                playerGold={currentGold}
                totalPopulation={totalPopulation}
                totalIndustry={totalIndustry}
                totalArmy={totalArmy}
                playerNationTag={localGame.playerNationTag}
                gameDate={localGame.date}
                fadeIn={fadeIn}
              />
            </div>
          )}

          {/* Middle-Left: Vertical ButtonGroup (4 buttons) */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 z-40">
            <ButtonGroup {...fourButtonHandlerProps} orientation="vertical" />
          </div>

          {/* Bottom-Center: Standalone FocusNowButton with size="large" */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <FocusNowButton 
              fadeIn={fadeIn} 
              hasActiveSession={hasActiveSession} 
              onClick={handleFocusNowClick} 
              focusTimeRemaining={focusTimeRemaining}
              size="large"
            />
          </div>
        </>
      )}
      
      {/* Conquest Mode Text Prompt */}
      {isInConqueringMode && (
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 md:px-9 md:py-4.5 bg-white rounded-lg border-2 border-gray-300 [font-family:var(--font-mplus-rounded)]"
          style={{ boxShadow: '0 3px 0px #cccccc' }}
        >
          <p className="text-xl md:text-2xl font-semibold text-gray-800 whitespace-nowrap">⚔️ Select a province to conquer ⚔️</p>
        </div>
      )}

      {/* MapView and Modals (structure remains the same) */}
      <div
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      >
        <MapView
          mapName={localGame?.mapName || 'world_states'}
          isDemo={isDemo}
          selectedProvinceRef={selectedProvinceRef}
          onProvinceSelect={handleProvinceSelect}
          onMapReady={handleMapReady}
          disableKeyboardControls={isModalOpen || isTaskModalOpen || isHabitsModalOpen || isNationalPathModalOpen || isMissionsModalOpen}
          initialFocusProvinceId={initialCapitalId}
          panzoomInstanceRef={panzoomInstanceRef}
        />
      </div>

      {isNationalPathModalOpen && (
        <NationalPathModal onClose={() => setIsNationalPathModalOpen(false)} />
      )}
      <div id="missions-modal" style={{ display: isMissionsModalOpen ? 'block' : 'none' }}>
        <MissionsModal 
          onClose={() => setIsMissionsModalOpen(false)} 
          playerNationName={playerNationName} 
          playerNationTag={localGame?.playerNationTag || ''}
        />
      </div>
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
              setIsInConqueringMode(false);
              setIsModalOpen(false);
              setIsTaskModalOpen(false);
              setIsHabitsModalOpen(false);
              setIsNationalPathModalOpen(false);
              setIsMissionsModalOpen(false);
              handleProvinceSelect(null);
            }}
            className={`
              px-7 py-3.5 rounded-lg font-semibold border-2 text-white
              transition-all duration-150 ease-in-out 
              hover:translate-y-[-1px] active:translate-y-[0.5px]
              [font-family:var(--font-mplus-rounded)] text-xl
            `}
            style={{ 
              backgroundColor: '#dc2626', 
              borderColor: '#991b1b',     
              boxShadow: '0 3px 0px #991b1b',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 0px #991b1b'; 
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = '0 3px 0px #991b1b'; 
            }}
            onMouseLeave={(e) => { 
              if (e.buttons === 1) {
                  e.currentTarget.style.boxShadow = '0 3px 0px #991b1b';
              }
            }}
          >
            Cancel Conquest
          </button>
        </div>
      )}

      {/* Achievement Popups (bottom left, stacked) */}
      {achievementPopups.map((popup, idx) => (
        <GameAchievementPopup
          key={popup.name + idx}
          achievementName={popup.name}
          nationFlag={popup.nationFlag}
          nationName={popup.nationName}
          onClose={() => setAchievementPopups(prev => prev.filter((_, i) => i !== idx))}
          style={{ bottom: `${1.5 + idx * 4}rem`, left: '1.5rem' }}
        />
      ))}
    </div>
  );
} 
