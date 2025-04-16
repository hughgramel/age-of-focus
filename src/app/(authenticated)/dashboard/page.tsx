'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [showSaveGames, setShowSaveGames] = useState(false);

  const handleSaveGameSelect = (saveNumber: number, isNew: boolean = false) => {
    if (isNew) {
      router.push('/scenario_select');
    } else {
      router.push(`/game?save=${saveNumber}`);
    }
  };

  return (
    <div className="w-full h-screen bg-[#0B1423] flex items-center justify-end p-8 translate-x-30">
      <div className="flex flex-col gap-6 w-80 -translate-y-20">
        {!showSaveGames ? (
          <>
            <button
              onClick={() => setShowSaveGames(true)}
              className="w-full px-10 py-4 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200 text-lg"
            >
              Focus now
            </button>
            
            <button
              onClick={() => router.push('/game?mode=demo')}
              className="w-full px-10 py-4 bg-transparent text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#162033] transition-colors duration-200 text-lg"
            >
              Tutorial
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowSaveGames(false)}
              className="w-full px-10 py-4 bg-transparent text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#162033] transition-colors duration-200 text-lg"
            >
              Back
            </button>

            <button
              onClick={() => handleSaveGameSelect(1)}
              className="w-full px-10 py-4 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200 text-lg flex flex-col items-start"
            >
              <span className="text-lg">Empty Save</span>
              <span className="text-sm text-[#FFD700]/70">No game data</span>
            </button>
            
            <button
              onClick={() => handleSaveGameSelect(2, true)}
              className="w-full px-10 py-4 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200 text-lg"
            >
              New Game
            </button>
            
            <button
              onClick={() => handleSaveGameSelect(3, true)}
              className="w-full px-10 py-4 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200 text-lg"
            >
              New Game
            </button>
          </>
        )}
      </div>
    </div>
  );
} 