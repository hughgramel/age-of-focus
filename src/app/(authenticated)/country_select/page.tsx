'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { getScenarioDetails, ScenarioDetails, ScenarioCountryInfo } from '@/data/scenarios';
import { countries_1836, Country1836 } from '@/data/countries_1836';
import { getNationName } from '@/data/nationTags';
import { getNationFlag } from '@/utils/nationFlags';
import { world_1836, scenarioDetails_1836 } from '@/data/world_1836';
import { world_1936, scenarioDetails_1936 } from '@/data/world_1936';
import { Nation as GameNation, Province as GameProvince, Game } from '@/types/game';
import MapCanvas from '@/components/MapCanvas';
import panzoom from 'panzoom';

// Helper to format numbers for display
const formatResourceNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0'; // Handle undefined or NaN
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// getBaseCountryInfo now returns resources as well, but not rank yet
const getBaseCountryInfoWithResources = (tag: string, initialWorldState: typeof world_1836): Omit<ScenarioCountryInfo, 'powerRank'> | null => {
  const countryData1836 = countries_1836.find(c => c.nationTag === tag);
  const nationInWorld = initialWorldState.nations.find((n: GameNation) => n.nationTag === tag);

  if (!nationInWorld) {
    console.warn(`Nation with tag ${tag} not found in initialWorldState. Skipping.`);
    return null;
  }

  const provincesOfNation = initialWorldState.provinces.filter((p: GameProvince) => p.ownerTag === tag);
  const startingPopulation = provincesOfNation.reduce((sum, p) => sum + p.population, 0);
  const startingIndustry = provincesOfNation.reduce((sum, p) => sum + p.industry, 0);
  const startingArmy = provincesOfNation.reduce((sum, p) => sum + p.army, 0);

  return {
    tag,
    name: getNationName(tag),
    flag: getNationFlag(tag),
    description: countryData1836?.description || 'A nation with a rich history and bold ambitions.',
    startingGold: nationInWorld.gold,
    startingPopulation: startingPopulation,
    startingIndustry: startingIndustry,
    startingArmy: startingArmy,
  };
};

const scenarioMap = {
  '1836': { gameData: world_1836, details: scenarioDetails_1836 },
  '1936': { gameData: world_1936, details: scenarioDetails_1936 },
};

function CountrySelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('1836');
  const [loadedGameData, setLoadedGameData] = useState<Game | null>(null);
  const [loadedScenarioDetails, setLoadedScenarioDetails] = useState<ScenarioDetails | null>(null);
  
  const [greatPowers, setGreatPowers] = useState<ScenarioCountryInfo[]>([]);
  const [otherNations, setOtherNations] = useState<ScenarioCountryInfo[]>([]);
  const [selectedNation, setSelectedNation] = useState<ScenarioCountryInfo | null>(null);
  const [capitalProvinceId, setCapitalProvinceId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panzoomInstanceRef = useRef<ReturnType<typeof panzoom> | null>(null);

  // Effect to load scenario data based on URL parameter
  useEffect(() => {
    const scenarioIdFromQuery = searchParams?.get('scenario') || '1836';
    setSelectedScenarioId(scenarioIdFromQuery);
    setIsLoading(true);

    const scenario = scenarioMap[scenarioIdFromQuery as keyof typeof scenarioMap];

    if (scenario) {
      setLoadedGameData(scenario.gameData as Game);
      setLoadedScenarioDetails(scenario.details as ScenarioDetails);
    } else {
      // Fallback to 1836 if scenario not found
      setLoadedGameData(scenarioMap['1836'].gameData as Game);
      setLoadedScenarioDetails(scenarioMap['1836'].details as ScenarioDetails);
      setSelectedScenarioId('1836'); // Reflect fallback in state
      console.warn(`Scenario "${scenarioIdFromQuery}" not found, defaulting to 1836.`);
    }
  }, [searchParams]);

  // Effect to populate nation lists and set initial capital when scenario data is loaded
  useEffect(() => {
    if (loadedGameData && loadedScenarioDetails) {
      const gpTags = loadedScenarioDetails.greatPowers || [];
      const onTags = loadedScenarioDetails.otherPlayableNations || [];

      const allScenarioNations = loadedGameData.nations || [];

      const enrichNationData = (tag: string): ScenarioCountryInfo | null => {
        const nationInfo = getBaseCountryInfoWithResources(tag, loadedGameData as Game);
        if (nationInfo) {
          return { ...nationInfo, powerRank: 0 };
        }
        return null;
      };

      setGreatPowers(
        gpTags.map(tag => enrichNationData(tag)).filter(n => n !== null) as ScenarioCountryInfo[]
      );
      setOtherNations(
        onTags.map(tag => enrichNationData(tag)).filter(n => n !== null) as ScenarioCountryInfo[]
      );

      if (selectedNation) {
        const stillExists = [...greatPowers, ...otherNations].find(n => n.tag === selectedNation.tag);
        if (!stillExists) {
          setSelectedNation(null);
          setCapitalProvinceId(undefined);
        }
      } else {
        const defaultPlayerTag = loadedScenarioDetails.playerNationTag || (gpTags.length > 0 ? gpTags[0] : null);
        const defaultNationFromGreatPowers = greatPowers.find(n => n.tag === defaultPlayerTag);
        const defaultNationFromOthers = otherNations.find(n => n.tag === defaultPlayerTag);
        const defaultNation = defaultNationFromGreatPowers || defaultNationFromOthers || (greatPowers.length > 0 ? greatPowers[0] : (otherNations.length > 0 ? otherNations[0] : null));
        
        if (defaultNation) {
          handleNationBoxClick(defaultNation);
        }
      }
      setIsLoading(false);
    } 
  }, [loadedGameData, loadedScenarioDetails]);

  const handleNationBoxClick = (nation: ScenarioCountryInfo) => {
    setSelectedNation(nation);
    if (loadedGameData) {
        const nationProvinces = loadedGameData.provinces.filter((p: GameProvince) => p.ownerTag === nation.tag);
        let foundCapitalId: string | undefined = undefined;

        const commonCapitals: { [key: string]: string[] } = {
            FRA: ['Ile_De_France'],
            GBR: ['Home_Counties', 'London'],
            PRU: ['Brandenburg'],
            GER: ['Brandenburg'],
            RUS: ['Ingria', 'Moscow'],
            SOV: ['Moscow'],
            AUT: ['Austria'],
            SPA: ['Castile', 'Toledo'],
            USA: ['Washington']
        };

        if (commonCapitals[nation.tag]) {
            for (const capId of commonCapitals[nation.tag]) {
                if (nationProvinces.find(p => p.id === capId)) {
                    foundCapitalId = capId;
                    break;
                }
            }
        }
        if (!foundCapitalId && nationProvinces.length > 0) {
            foundCapitalId = nationProvinces[0].id;
        }
        setCapitalProvinceId(foundCapitalId);
    }
  };

  const handleStartGame = async () => {
    if (!selectedNation || !user || !loadedGameData) return;
    setIsStartingGame(true);
    setError(null);
    try {
      const saves = await GameService.getSaveGames(user.uid);
      const emptySlotEntry = Object.entries(saves).find(([_, save]) => !save);
      
      if (!emptySlotEntry) {
        setError('No empty save slots available. Please delete an existing save.');
        setIsStartingGame(false);
        return;
      }
      const emptySlot = parseInt(emptySlotEntry[0]);

      // For now, hardcode to use world_1836 for an 1836 scenario
      // Later, this should use scenarioDetails.mapDataFile to load the correct base game data
      let baseGameData;
      if (loadedGameData) {
        baseGameData = JSON.parse(JSON.stringify(loadedGameData));
      } else {
        // This case should ideally not be reached if UI prevents starting game without loaded data
        setError('Game data not loaded. Please try again.');
        setIsStartingGame(false);
        return;
      }

      const newGame: Game = {
        ...baseGameData,
        id: `game_${Date.now()}_${user.uid.slice(0,5)}_${selectedNation.tag}`,
        gameName: `${getNationName(selectedNation.tag)} - ${loadedScenarioDetails?.year}`,
        playerNationTag: selectedNation.tag,
        scenario: selectedScenarioId,
        date: loadedScenarioDetails?.year ? `${loadedScenarioDetails.year}-01-01` : baseGameData.date
      };

      await GameService.saveGame(user.uid, emptySlot, newGame, selectedScenarioId);
      router.push(`/game?save=${emptySlot}`);

    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
      setIsStartingGame(false);
    }
  };

  if (isLoading || !loadedScenarioDetails) {
    return <div className="flex-1 flex items-center justify-center [font-family:var(--font-mplus-rounded)] text-[#0B1423]">Loading scenario...</div>;
  }
  if (error && !loadedScenarioDetails) { // Show error if scenarioDetails couldn't be loaded
    return <div className="flex-1 flex flex-col items-center justify-center p-8 [font-family:var(--font-mplus-rounded)] text-red-600">
      <p>{error}</p>
      <button onClick={() => router.push('/scenario_select')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Back to Scenarios</button>
    </div>;
  }

  return (
    <main className={`flex-1 flex flex-col items-center px-4 py-8 [font-family:var(--font-mplus-rounded)] h-full transition-opacity duration-300 ${isStartingGame ? 'opacity-50' : 'opacity-100'}`}>
      <div className="w-full max-w-6xl pb-24"> {/* Added pb-24 to prevent overlap with fixed Start Game button */}
        {/* Header: Title and Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0B1423]">
            Choose Your Nation - {loadedScenarioDetails.name} ({loadedScenarioDetails.year})
          </h1>
          <button
            onClick={() => router.push('/scenario_select')}
            disabled={isStartingGame}
            className="px-5 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(156,163,175,0.2)] flex items-center gap-2 text-sm disabled:opacity-70"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Scenarios
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setSelectedScenarioId('1836')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-lg transition-colors
                ${selectedScenarioId === '1836' 
                  ? 'border-[#67b9e7] text-[#67b9e7]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}
              `}
            >
              Great Powers ({greatPowers.length})
            </button>
            <button
              onClick={() => setSelectedScenarioId('1936')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-lg transition-colors
                ${selectedScenarioId === '1936' 
                  ? 'border-[#67b9e7] text-[#67b9e7]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}
              `}
            >
              Other Nations ({otherNations.length})
            </button>
          </nav>
        </div>

        {/* Country Selection Grid - Ensure it's scrollable if content overflows */}
        {greatPowers.length > 0 || otherNations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 overflow-y-auto" style={{maxHeight: 'calc(100vh - 220px)'}}> {/* Adjusted maxHeight slightly */}
            {selectedScenarioId === '1836' ? (
              greatPowers.map((nation) => (
                <button
                  key={nation.tag}
                  onClick={() => handleNationBoxClick(nation)}
                  disabled={isStartingGame}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-[270px] flex flex-col justify-between 
                    bg-white hover:shadow-lg text-left
                    ${selectedNation === nation 
                      ? 'border-[#67b9e7] shadow-[0_0px_15px_rgba(103,185,231,0.5),0_4px_0px_#4792ba]' 
                      : 'border-gray-300 shadow-[0_4px_0px_#d1d5db]'}
                    ${isStartingGame ? 'opacity-70 cursor-default' : 'hover:translate-y-[-2px] active:translate-y-[1px]'}
                  `}
                >
                  <div className="w-full flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl leading-none">{nation.flag}</span>
                        <h3 className="text-lg font-bold text-[#0B1423]">{nation.name}</h3>
                      </div>
                    </div>

                    {/* Resources Section (2x2 grid) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-3 text-gray-700 w-fit mx-auto">
                      {/* Population */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">👥</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingPopulation)}</span>
                      </div>
                      {/* Army */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">⚔️</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingArmy)}</span>
                      </div>
                      {/* Industry */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">🏭</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingIndustry)}</span>
                      </div>
                      {/* Gold */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">💰</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingGold)}</span> 
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-snug line-clamp-3 mb-2">{nation.description}</p>
                  </div>

                  {selectedNation === nation && (
                    <div className="w-full text-center mt-auto pt-2 border-t border-gray-200">
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-[#67b9e7] rounded-full">Selected</span>
                    </div>
                  )}
                </button>
              ))
            ) : (
              otherNations.map((nation) => (
                <button
                  key={nation.tag}
                  onClick={() => handleNationBoxClick(nation)}
                  disabled={isStartingGame}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-[270px] flex flex-col justify-between 
                    bg-white hover:shadow-lg text-left
                    ${selectedNation === nation 
                      ? 'border-[#67b9e7] shadow-[0_0px_15px_rgba(103,185,231,0.5),0_4px_0px_#4792ba]' 
                      : 'border-gray-300 shadow-[0_4px_0px_#d1d5db]'}
                    ${isStartingGame ? 'opacity-70 cursor-default' : 'hover:translate-y-[-2px] active:translate-y-[1px]'}
                  `}
                >
                  <div className="w-full flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl leading-none">{nation.flag}</span>
                        <h3 className="text-lg font-bold text-[#0B1423]">{nation.name}</h3>
                      </div>
                    </div>

                    {/* Resources Section (2x2 grid) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-3 text-gray-700 w-fit mx-auto">
                      {/* Population */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">👥</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingPopulation)}</span>
                      </div>
                      {/* Army */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">⚔️</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingArmy)}</span>
                      </div>
                      {/* Industry */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">🏭</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingIndustry)}</span>
                      </div>
                      {/* Gold */}
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg">💰</span>
                          <span className="text-base font-semibold">{formatResourceNumber(nation.startingGold)}</span> 
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-snug line-clamp-3 mb-2">{nation.description}</p>
                  </div>

                  {selectedNation === nation && (
                    <div className="w-full text-center mt-auto pt-2 border-t border-gray-200">
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-[#67b9e7] rounded-full">Selected</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No countries available in this category for {loadedScenarioDetails?.name || 'selected scenario'}.</p>
        )}
      </div>

      {/* Fixed Start Game Button Area */}
      {selectedNation && (
        <div className="fixed bottom-6 right-6 z-50">
          {error && <p className="text-red-500 mb-2 text-right text-sm">Error: {error}</p>}
          <button
            onClick={handleStartGame}
            disabled={isStartingGame} // Redundant due to parent check, but safe
            className={`
              px-10 py-4 text-xl font-semibold rounded-xl border-2 transition-all duration-200 
              flex items-center justify-center gap-3 shadow-[0_4px_0px] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_2px_0px]
              min-w-[260px]
              ${isStartingGame
                ? 'bg-gray-300 text-gray-500 border-gray-400 shadow-gray-400 cursor-not-allowed' 
                : 'bg-[#6ec53e] text-white border-[#59a700] shadow-[#59a700] hover:bg-[#60b33a] active:bg-[#539e30]' 
              }
            `}
          >
            {isStartingGame ? 'Starting Game...' : 'Start Game'}
          </button>
        </div>
      )}
    </main>
  );
}

// Wrap with Suspense for useSearchParams
export default function CountrySelectPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center [font-family:var(--font-mplus-rounded)] text-[#0B1423]">Loading scenario options...</div>}>
      <CountrySelectContent />
    </Suspense>
  );
} 