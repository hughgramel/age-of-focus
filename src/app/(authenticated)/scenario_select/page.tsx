'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Country = {
  id: string;
  name: string;
  description: string;
  isTutorialNation?: boolean;
};

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
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedYear] = useState('1836'); // For now, only 1836 is available

  const handleStartGame = () => {
    if (selectedCountry) {
      router.push(`/game?new=true&country=${selectedCountry}&year=${selectedYear}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1423] p-8 flex flex-col">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-[#FFD700] hover:text-[#FFD700]/80 transition-colors mb-8 self-start"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-[#FFD700] mb-4">New Game</h1>

        {/* Country Selection */}
        <div className="bg-[#162033] rounded-lg p-6 border border-[#FFD700]/25">
          <h2 className="text-xl text-[#FFD700] mb-4">Select Your Nation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_COUNTRIES.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedCountry === country.id
                    ? 'border-[#FFD700] bg-[#1C2942]'
                    : 'border-[#FFD700]/25 bg-[#162033] hover:bg-[#1C2942]'
                } ${country.isTutorialNation ? 'border-[#FFD700]/50' : ''}`}
              >
                <h3 className="text-[#FFD700] text-lg font-medium flex items-center gap-2">
                  {country.name}
                  {country.isTutorialNation && (
                    <span className="text-sm bg-[#FFD700]/20 px-2 py-0.5 rounded">Tutorial</span>
                  )}
                </h3>
                <p className="text-gray-400 mt-2">{country.description}</p>
              </button>
            ))}
          </div>
          <p className="text-gray-400 mt-4 text-sm italic">More nations coming soon...</p>
        </div>

        {/* Year Selection */}
        <div className="bg-[#162033] rounded-lg p-6 border border-[#FFD700]/25">
          <h2 className="text-xl text-[#FFD700] mb-4">Select Start Year</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 rounded-lg border border-[#FFD700] bg-[#1C2942]"
            >
              <h3 className="text-[#FFD700] text-lg font-medium">1836</h3>
              <p className="text-gray-400 mt-2">The Dawn of Industrialization</p>
            </button>
          </div>
          <p className="text-gray-400 mt-4 text-sm italic">More start dates coming soon...</p>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          disabled={!selectedCountry}
          className={`px-8 py-4 rounded-lg text-lg font-medium transition-all ${
            selectedCountry
              ? 'bg-[#FFD700] text-[#0B1423] hover:bg-[#FFD700]/90'
              : 'bg-[#FFD700]/50 text-[#0B1423] cursor-not-allowed'
          }`}
        >
          Start Game
        </button>
      </div>
    </div>
  );
} 