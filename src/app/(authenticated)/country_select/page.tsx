'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { countries_1836, Country1836 } from '@/data/countries_1836';
import { useState } from 'react';
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

  const handleCountrySelect = async (country: Country1836) => {
    if (!user) {
      setError('You must be logged in to create a game');
      return;
    }

    setSelectedCountry(country);
    setLoading(true);
    setError(null);

    try {
      // Find an empty save slot
      const saves = await GameService.getSaveGames(user.uid);
      console.log('Current saves:', saves);
      
      const emptySlot = Object.entries(saves).find(([_, save]) => !save)?.[0];
      
      if (!emptySlot) {
        setError('No empty save slots available');
        return;
      }

      console.log('Found empty slot:', emptySlot);

      // Map country ID to nation tag
      let nationTag = '';
      switch (country.id) {
        case 'france':
          nationTag = 'FRA';
          break;
        case 'prussia':
          nationTag = 'PRU';
          break;
        case 'usa':
          // USA not implemented yet
          setError('United States not implemented yet');
          return;
        default:
          setError('Invalid country selected');
          return;
      }

      // Create new game based on world_1836 but with selected country
      const newGame = {
        ...world_1836,
        id: `game_${Date.now()}`,
        gameName: `${country.name} - 1836`,
        playerNationTag: nationTag
      };

      console.log('Creating new game:', newGame);

      // Save the game
      await GameService.saveGame(user.uid, parseInt(emptySlot), newGame, 'world_1836');
      console.log('Game saved successfully');

      // Navigate to the game
      router.push(`/game?save=${emptySlot}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-11/12 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-[1800px] px-4 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl text-center text-[#FFD700] mt-12 mb-15 historical-game-title">
          Choose Your Nation
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 w-full max-w-[1600px] px-4 sm:px-8">
          {countries_1836.map((country) => (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country)}
              disabled={loading}
              className={`w-full aspect-[1] text-lg sm:text-xl font-medium text-[#FFD700] rounded-3xl transition-all duration-200 historical-game-title border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 overflow-hidden group relative ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                backgroundImage: `url('${country.backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                clipPath: 'inset(0 0 0 0 round 24px)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1423]/50 to-[#0B1423]/90 opacity-60 group-hover:opacity-40 transition-opacity duration-200" />
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-between z-10 p-10">
                <div className="flex flex-row items-center gap-4">
                  <span className="text-5xl">{country.flag}</span>
                  <span className="text-3xl sm:text-4xl font-bold text-[#FFD700] drop-shadow-lg">{country.name}</span>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-xl sm:text-2xl text-white/90 drop-shadow-lg font-medium">
                    {country.description}
                  </span>
                  <span className={`text-lg sm:text-xl font-medium drop-shadow-lg
                    ${country.difficulty === 'Easy' ? 'text-green-400' :
                      country.difficulty === 'Medium' ? 'text-yellow-400' :
                      country.difficulty === 'Hard' ? 'text-orange-400' :
                      'text-red-400'}`}
                  >
                    {country.difficulty} Difficulty
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-25 text-center">
          <span className="text-[#FFD700]/70 text-2xl sm:text-3xl historical-game-title">
            More nations coming soon...
          </span>
        </div>
      </div>
    </div>
  );
} 