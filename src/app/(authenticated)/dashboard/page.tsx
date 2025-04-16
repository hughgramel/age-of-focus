'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService, SaveGame } from '@/services/gameService';
import { world_1836 } from '@/data/world_1836';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSaveGames, setShowSaveGames] = useState(false);
  const [saveGames, setSaveGames] = useState<Record<number, SaveGame | null>>({
    1: null,
    2: null,
    3: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaveGames = async () => {
      if (user) {
        const saves = await GameService.getSaveGames(user.uid);
        setSaveGames(saves);
      }
      setLoading(false);
    };

    loadSaveGames();
  }, [user]);

  const handleSaveGameSelect = async (saveNumber: number, isNew: boolean = false) => {
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

            {loading ? (
              <div className="text-[#FFD700] text-center">Loading saves...</div>
            ) : (
              <>
                {[1, 2, 3].map((slotNumber) => {
                  const save = saveGames[slotNumber];
                  return (
                    <button
                      key={slotNumber}
                      onClick={() => handleSaveGameSelect(slotNumber, !save)}
                      className="w-full px-10 py-4 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200 text-lg flex flex-col items-start"
                    >
                      {save ? (
                        <>
                          <span className="text-lg">{save.metadata.playerNation}</span>
                          <span className="text-sm text-[#FFD700]/70">
                            {save.metadata.scenarioId} - {new Date(save.metadata.savedAt).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">New Game</span>
                          <span className="text-sm text-[#FFD700]/70">Empty save slot</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 