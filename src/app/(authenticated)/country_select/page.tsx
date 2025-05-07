'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { getScenarioDetails, ScenarioDetails, ScenarioCountryInfo } from '@/data/scenarios';
import { countries_1836, Country1836 } from '@/data/countries_1836';
import { getNationName } from '@/data/nationTags';
import { getNationFlag } from '@/utils/nationFlags';
import { world_1836 } from '@/data/world_1836';
import { Nation as GameNation, Province as GameProvince } from '@/types/game';

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

function CountrySelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [scenarioDetails, setScenarioDetails] = useState<ScenarioDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'greatPowers' | 'otherNations'>('greatPowers');
  const [displayedCountries, setDisplayedCountries] = useState<ScenarioCountryInfo[]>([]);
  const [selectedCountryTag, setSelectedCountryTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      const scenarioId = searchParams.get('scenario');
      if (scenarioId) {
        const details = getScenarioDetails(scenarioId);
        if (details) {
          setScenarioDetails(details);
        } else {
          setError(`Scenario "${scenarioId}" not found.`);
        }
      } else {
        setError('No scenario selected in URL.');
      }
    } else {
      setError('Could not read scenario from URL.');
    }
    setIsLoading(false);
  }, [searchParams]); // Removed router from deps here

  useEffect(() => {
    if (scenarioDetails) {
      const initialWorldState = scenarioDetails.id === '1836' ? world_1836 : null;
      if (!initialWorldState) {
        setError(`Initial game state for scenario ${scenarioDetails.name} not found.`);
        setDisplayedCountries([]);
        return;
      }

      const allPlayableTagsInScenario = [
        ...new Set([...scenarioDetails.greatPowers, ...scenarioDetails.otherPlayableNations])
      ];

      const nationsWithScoresAndData = allPlayableTagsInScenario.map(tag => {
        const baseInfo = getBaseCountryInfoWithResources(tag, initialWorldState);
        if (!baseInfo) return null;
        
        // Power score calculation using the resources from baseInfo
        const powerScore = (baseInfo.startingGold / 100) + 
                         (baseInfo.startingPopulation / 10000) + 
                         baseInfo.startingIndustry + 
                         (baseInfo.startingArmy * 0.1);
        return { ...baseInfo, powerScore }; // tag, name, flag, desc, resources, powerScore
      }).filter(n => n !== null) as (Omit<ScenarioCountryInfo, 'powerRank'> & {powerScore: number})[];

      nationsWithScoresAndData.sort((a, b) => b.powerScore - a.powerScore);

      const rankedNationsData = nationsWithScoresAndData.map((scoredNation, index) => ({
        ...scoredNation, // Contains all fields from Omit<ScenarioCountryInfo, 'powerRank'> + powerScore
        powerRank: index + 1,
      })) as ScenarioCountryInfo[]; // Now includes powerRank and all resource fields
      
      const currentTabTags = new Set(activeTab === 'greatPowers' 
        ? scenarioDetails.greatPowers 
        : scenarioDetails.otherPlayableNations);

      const finalTabCountries = rankedNationsData
        .filter(country => currentTabTags.has(country.tag))
        .sort((a, b) => a.powerRank - b.powerRank);

      setDisplayedCountries(finalTabCountries);
      setSelectedCountryTag(null);
    }
  }, [scenarioDetails, activeTab]);

  const handleStartGame = async () => {
    if (!selectedCountryTag || !user || !scenarioDetails) return;

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
      if (scenarioDetails.id === '1836') {
        baseGameData = JSON.parse(JSON.stringify(world_1836)); // Corrected typo: world_1836
      } else {
        // Placeholder for other scenarios - ideally load dynamically
        alert('This scenario\'s game data is not yet configured for starting a new game.');
        setIsStartingGame(false);
        return;
      }

      const newGame = {
        ...baseGameData,
        id: `game_${Date.now()}_${user.uid.slice(0,5)}_${selectedCountryTag}`,
        gameName: `${getNationName(selectedCountryTag)} - ${scenarioDetails.year}`,
        playerNationTag: selectedCountryTag,
        scenario: scenarioDetails.id, // Store scenario ID in game data
        date: `${scenarioDetails.year}-01-01` // Set game start date based on scenario
      };

      await GameService.saveGame(user.uid, emptySlot, newGame, scenarioDetails.id);
      router.push(`/game?save=${emptySlot}`);

    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
      setIsStartingGame(false);
    }
  };

  if (isLoading || !scenarioDetails) {
    return <div className="flex-1 flex items-center justify-center [font-family:var(--font-mplus-rounded)] text-[#0B1423]">Loading scenario...</div>;
  }
  if (error && !scenarioDetails) { // Show error if scenarioDetails couldn't be loaded
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
            Choose Your Nation - {scenarioDetails.name} ({scenarioDetails.year})
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
              onClick={() => setActiveTab('greatPowers')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-lg transition-colors
                ${activeTab === 'greatPowers' 
                  ? 'border-[#67b9e7] text-[#67b9e7]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}
              `}
            >
              Great Powers ({scenarioDetails.greatPowers.length})
            </button>
            <button
              onClick={() => setActiveTab('otherNations')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-lg transition-colors
                ${activeTab === 'otherNations' 
                  ? 'border-[#67b9e7] text-[#67b9e7]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}
              `}
            >
              Other Nations ({scenarioDetails.otherPlayableNations.length})
            </button>
          </nav>
        </div>

        {/* Country Selection Grid - Ensure it's scrollable if content overflows */}
        {displayedCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 overflow-y-auto" style={{maxHeight: 'calc(100vh - 220px)'}}> {/* Adjusted maxHeight slightly */}
            {displayedCountries.map((country) => (
              <button
                key={country.tag}
                onClick={() => setSelectedCountryTag(country.tag)}
                disabled={isStartingGame}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-[270px] flex flex-col justify-between 
                  bg-white hover:shadow-lg text-left
                  ${selectedCountryTag === country.tag 
                    ? 'border-[#67b9e7] shadow-[0_0px_15px_rgba(103,185,231,0.5),0_4px_0px_#4792ba]' 
                    : 'border-gray-300 shadow-[0_4px_0px_#d1d5db]'}
                  ${isStartingGame ? 'opacity-70 cursor-default' : 'hover:translate-y-[-2px] active:translate-y-[1px]'}
                `}
              >
                <div className="w-full flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl leading-none">{country.flag}</span>
                      <h3 className="text-lg font-bold text-[#0B1423]">{country.name}</h3>
                    </div>
                    <span className="text-2xl font-bold text-gray-400">#{country.powerRank}</span>
                  </div>

                  {/* Resources Section (2x2 grid) */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-3 text-gray-700 w-fit mx-auto">
                    {/* Population */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">👥</span>
                        <span className="text-base font-semibold">{formatResourceNumber(country.startingPopulation)}</span>
                    </div>
                    {/* Army */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">⚔️</span>
                        <span className="text-base font-semibold">{formatResourceNumber(country.startingArmy)}</span>
                    </div>
                    {/* Industry */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">🏭</span>
                        <span className="text-base font-semibold">{formatResourceNumber(country.startingIndustry)}</span>
                    </div>
                    {/* Gold */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">💰</span>
                        <span className="text-base font-semibold">{formatResourceNumber(country.startingGold)}</span> 
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-snug line-clamp-3 mb-2">{country.description}</p>
                </div>

                {selectedCountryTag === country.tag && (
                  <div className="w-full text-center mt-auto pt-2 border-t border-gray-200">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-[#67b9e7] rounded-full">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No countries available in this category for {scenarioDetails?.name || 'selected scenario'}.</p>
        )}
      </div>

      {/* Fixed Start Game Button Area */}
      {selectedCountryTag && (
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