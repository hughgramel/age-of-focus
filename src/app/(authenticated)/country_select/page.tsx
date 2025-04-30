'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { countries_1836, Country1836 } from '@/data/countries_1836';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { world_1836 } from '@/data/world_1836';

export default function CountrySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<Country1836 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Add fade-in effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCountrySelect = async (country: Country1836) => {
    if (!user) {
      setError('You must be logged in to create a game');
      return;
    }

    setSelectedCountry(country);
    setLoading(true);
    setError(null);

    try {
      const saves = await GameService.getSaveGames(user.uid);
      console.log('Current saves:', saves);
      
      const emptySlot = Object.entries(saves).find(([_, save]) => !save)?.[0];
      
      if (!emptySlot) {
        setError('No empty save slots available');
        setLoading(false);
        return;
      }

      console.log('Found empty slot:', emptySlot);

      // Directly use the nationTag from the selected country data
      const nationTag = country.nationTag;

      // Special handling for countries not yet implemented in the simulation
      
      // Add other checks for unimplemented tags here if necessary

      // Check if nationTag exists in world_1836 data
      const nationExists = world_1836.nations.some(n => n.nationTag === nationTag);
      if (!nationExists) {
           setError(`Nation tag '${nationTag}' for ${country.name} not found in world data. Implementation missing.`);
           setLoading(false);
           return;
      }

      const newGame = {
        ...world_1836,
        id: `game_${Date.now()}`,
        gameName: `${country.name} - 1836`,
        playerNationTag: nationTag
      };

      console.log('Creating new game:', newGame);

      await GameService.saveGame(user.uid, parseInt(emptySlot), newGame, 'world_1836');
      console.log('Game saved successfully');

      router.push(`/game?save=${emptySlot}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-white transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Main Content */}
      <div className="w-full max-w-[800px] mx-auto px-4 py-8 mb-32">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl text-center text-[#0B1423] mb-12 [font-family:var(--font-mplus-rounded)]">
          Choose Your Nation
        </h1>

        {error && (
            <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-200 [font-family:var(--font-mplus-rounded)] w-full">
            {error}
          </div>
        )}

          <div className="flex flex-col gap-6 w-full">
            {countries_1836.map((country) => {
              return (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country)}
              disabled={loading}
                  className={`w-full p-6 bg-white rounded-2xl transition-all duration-200 [font-family:var(--font-mplus-rounded)] border border-[#67b9e7]/20 hover:border-[#67b9e7]/40 hover:shadow-lg
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Nation Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl">{country.flag}</span>
                    <span className="text-2xl font-bold text-[#0B1423]">{country.name}</span>
                    <span className={`ml-2 text-sm font-medium px-3 py-1 rounded-full
                      ${country.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        country.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        country.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'}`}
            >
                      {country.difficulty}
                    </span>
                  </div>

                  {/* Resources Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        <span className="text-lg text-[#0B1423]/80">Population</span>
                      </div>
                      <span className="text-xl font-semibold text-[#0B1423] ml-9">
                        {country.populationM}M
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏭</span>
                        <span className="text-lg text-[#0B1423]/80">Industry</span>
                      </div>
                      <span className="text-xl font-semibold text-[#0B1423] ml-9">
                        {country.industryM}M
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        <span className="text-lg text-[#0B1423]/80">Gold</span>
                </div>
                      <span className="text-xl font-semibold text-[#0B1423] ml-9">
                        {country.goldM}M
                  </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚔️</span>
                        <span className="text-lg text-[#0B1423]/80">Army</span>
                      </div>
                      <span className="text-xl font-semibold text-[#0B1423] ml-9">
                        {country.armyM}M
                  </span>
                </div>
              </div>
            </button>
              );
            })}
        </div>

          <div className="mt-12 text-center">
            <span className="text-[#0B1423]/70 text-xl sm:text-2xl [font-family:var(--font-mplus-rounded)]">
            More nations coming soon...
          </span>
          </div>
        </div>
      </div>

      {/* Return to Dashboard Button - Fixed above bottom nav */}
      <div className="fixed bottom-[72px] sm:bottom-6 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-[#67b9e7]/20 z-10">
        <div className="max-w-[800px] mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 bg-[#67b9e7] text-white rounded-xl font-bold text-lg sm:text-xl hover:bg-[#4792ba] transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 [font-family:var(--font-mplus-rounded)]"
          >
            <span className="text-xl sm:text-2xl">←</span>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 