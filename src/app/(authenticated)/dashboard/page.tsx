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
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 w-80 -mt-16">
        {!showSaveGames ? (
          <div className="w-full flex flex-col items-center">
            <button
              onClick={() => setShowSaveGames(true)}
              className="w-full mb-4 px-5 py-2.5 text-base font-medium text-[#FFD700] bg-[#141618] rounded-lg border border-[#FFD700]/60 hover:bg-[#1a1d20] transition-all duration-200 font-lora tracking-wide hover:shadow-md"
            >
              Focus now
            </button>
            
            <button
              onClick={() => router.push('/game?mode=demo')}
              className="w-full px-5 py-2.5 text-base font-medium text-[#FFD700] bg-[#141618] rounded-lg border border-[#FFD700]/60 hover:bg-[#1a1d20] transition-all duration-200 font-lora tracking-wide hover:shadow-md"
            >
              Tutorial
            </button>
          </div>
        ) : (
          <div className="w-full relative backdrop-blur-sm bg-[#0B1423]/70 rounded-xl p-8 border border-[#FFD700]/30 shadow-2xl">
            <h2 className="text-2xl font-serif text-center text-[#FFD700] mb-6">Select Game</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowSaveGames(false)}
                className="w-full px-5 py-2.5 text-base font-medium text-[#FFD700] bg-transparent rounded-lg border border-[#FFD700]/30 hover:bg-[#1C2942] transition-all duration-200 hover:border-[#FFD700]/60 font-lora tracking-wide hover:shadow-md"
              >
                Back
              </button>

              {loading ? (
                <div className="text-[#FFD700] text-center py-8">
                  <div className="animate-pulse">Loading saves...</div>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map((slotNumber) => {
                    const save = saveGames[slotNumber];
                    return (
                      <button
                        key={slotNumber}
                        onClick={() => handleSaveGameSelect(slotNumber, !save)}
                        className="w-full px-8 py-4 bg-[#162033]/90 text-[#FFD700] rounded-lg border border-[#FFD700]/40 hover:bg-[#1C2942] transition-all duration-200 text-lg flex flex-col items-start shadow-lg hover:border-[#FFD700]/70 font-lora"
                      >
                        {save ? (
                          <>
                            <span className="text-lg font-lora">{save.metadata.playerNation}</span>
                            <span className="text-sm text-[#FFD700]/70">
                              {save.metadata.scenarioId} - {new Date(save.metadata.savedAt).toLocaleDateString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-lora">New Game</span>
                            <span className="text-sm text-[#FFD700]/70">Empty save slot</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}