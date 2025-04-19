'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { countries_1836, Country1836 } from '@/data/countries_1836';
import { useState } from 'react';

export default function CountrySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState<Country1836 | null>(null);

  const handleCountrySelect = (country: Country1836) => {
    setSelectedCountry(country);
    // TODO: Create new game with selected country
    router.push(`/game?country=${country.id}`);
  };

  return (
    <div className="w-full h-11/12 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-[1800px] px-4 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl text-center text-[#FFD700] mt-12 mb-15 historical-game-title">
          Choose Your Nation
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 w-full max-w-[1600px] px-4 sm:px-8">
          {countries_1836.map((country) => (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country)}
              className="w-full aspect-[1] text-lg sm:text-xl font-medium text-[#FFD700] rounded-3xl transition-all duration-200 historical-game-title border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 overflow-hidden group relative"
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
                  {/* <span className={`text-lg sm:text-xl font-medium drop-shadow-lg
                    ${country.difficulty === 'Easy' ? 'text-green-400' :
                      country.difficulty === 'Medium' ? 'text-yellow-400' :
                      country.difficulty === 'Hard' ? 'text-orange-400' :
                      'text-red-400'}`}
                  >
                    {country.difficulty} Difficulty
                  </span> */}
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