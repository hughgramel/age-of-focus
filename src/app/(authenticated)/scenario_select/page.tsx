'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { world_1836 } from '@/data/world_1836';

interface Country {
  id: string;
  name: string;
  description: string;
  isTutorialNation?: boolean;
}

const AVAILABLE_COUNTRIES: Country[] = [
  {
    id: 'FRA',
    name: 'France',
    description: 'A major European power with strong industrial potential and colonial ambitions. Recommended for new players (Tutorial Scenario).',
    isTutorialNation: true
  },
  {
    id: 'BEL',
    name: 'Belgium',
    description: 'A newly independent nation at the heart of the industrial revolution. For players seeking a more challenging start.'
  }
];

export default function ScenarioSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedYear] = useState('1836'); // For now, only 1836 is available
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    if (!selectedCountry || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Find an empty save slot
      const saves = await GameService.getSaveGames(user.uid);
      console.log('Current saves:', saves);
      
      const emptySlot = Object.entries(saves).find(([_, save]) => !save)?.[0];
      
      if (!emptySlot) {
        setError('No empty save slots available');
        return;
      }

      console.log('Found empty slot:', emptySlot);

      // Create new game based on world_1836 but with selected country
      const newGame = {
        ...world_1836,
        id: `game_${Date.now()}`,
        gameName: `${selectedCountry} - ${selectedYear}`,
        playerNationTag: selectedCountry
      };

      console.log('Creating new game:', newGame);

      // Save the game
      await GameService.saveGame(user.uid, parseInt(emptySlot), newGame, 'world_1836');
      console.log('Game saved successfully');

      // Verify the save was created
      const savedGame = await GameService.getSaveGame(user.uid, parseInt(emptySlot));
      console.log('Verified save:', savedGame);

      if (!savedGame) {
        throw new Error('Failed to verify save game creation');
      }

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
    <div className="w-full h-screen bg-[#0B1423] flex items-center justify-center">
      <div className="w-96 space-y-6">
        <h1 className="text-2xl font-bold text-[#FFD700] mb-8">Select Scenario</h1>

        <div className="space-y-4">
          <h2 className="text-xl text-[#FFD700]">Country</h2>
          {AVAILABLE_COUNTRIES.map((country) => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country.id)}
              className={`w-full p-4 text-left rounded-lg border transition-colors duration-200 ${
                selectedCountry === country.id
                  ? 'bg-[#1C2942] border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#162033] border-[#FFD700]/25 text-[#FFD700]/70 hover:bg-[#1C2942]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{country.name}</span>
                {country.isTutorialNation && (
                  <span className="text-xs bg-[#FFD700] text-[#0B1423] px-2 py-1 rounded">
                    Tutorial
                  </span>
                )}
              </div>
              <p className="text-sm mt-2 text-[#FFD700]/70">{country.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl text-[#FFD700]">Year</h2>
          <div className="p-4 bg-[#162033] border border-[#FFD700]/25 rounded-lg text-[#FFD700]">
            <div className="flex items-center justify-between">
              <span>1836</span>
              <span className="text-sm text-[#FFD700]/70">More options coming soon</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        <button
          onClick={handleStartGame}
          disabled={!selectedCountry || loading}
          className={`w-full px-6 py-3 rounded-lg border transition-colors duration-200 ${
            !selectedCountry || loading
              ? 'bg-[#162033] border-[#FFD700]/25 text-[#FFD700]/50 cursor-not-allowed'
              : 'bg-[#FFD700] border-[#FFD700] text-[#0B1423] hover:bg-[#FFD700]/90'
          }`}
        >
          {loading ? 'Starting Game...' : 'Start Game'}
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 bg-transparent text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#162033] transition-colors duration-200"
        >
          Back
        </button>
      </div>
    </div>
  );
} 