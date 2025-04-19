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
  const [showScenarios, setShowScenarios] = useState(false);
  const [saveGames, setSaveGames] = useState<Record<number, SaveGame | null>>({
    1: null,
    2: null,
    3: null
  });
  const [loading, setLoading] = useState(true);

  const scenarios = [
    { year: "1836", name: "Age of Industrialization" },
  ];

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
      <div className="flex flex-col items-center gap-8 w-64 sm:w-96 -mt-16">
        {!showSaveGames ? (
          <div className="w-full flex flex-col items-center">
            {!showScenarios && (
              <button
                onClick={() => setShowSaveGames(true)}
                className="group relative w-full mb-6 px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-[#FFD700] bg-[#0B1423] rounded-lg transition-all duration-200 historical-game-title flex items-center justify-center gap-3 border-2 border-[#FFD700]/40 hover:border-[#FFD700] hover:bg-[#162033] shadow-[4px_4px_0px_0px_rgba(255,215,0,0.3)]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              >
                <span role="img" aria-label="timer" className="text-2xl sm:text-3xl">🏰</span>
                Resume Nation
              </button>
            )}
            
            <div className="w-full relative">
              <div className={`absolute bottom-full w-[140%] sm:w-[160%] left-1/2 mb-1 -translate-x-1/2 transition-all duration-500 ease-in-out transform 
                ${showScenarios ? 'opacity-100 translate-y-[0%] sm:translate-y-[55%] md:translate-y-[74%] lg:translate-y-[74%] xl:translate-y-[74%] 2xl:translate-y-[74%]' : 'opacity-0 translate-y-0 pointer-events-none'}`}>
                {/* 1836 Scenario Button */}
                <div className="relative w-full h-40 sm:h-56 md:h-70 lg:h-70 xl:h-70 2xl:h-70 sm:mb-3">
                  <button
                    onClick={() => router.push(`/country_select`)}
                    className="w-full h-full text-lg sm:text-xl font-medium text-[#FFD700] rounded-3xl transition-all duration-200 historical-game-title border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 overflow-hidden group"
                    style={{
                      backgroundImage: "url('/backgrounds/civil_war_background.png')",
                      backgroundSize: 'cover',
                      opacity: 1,
                      backgroundPosition: 'center 70%',
                      backgroundRepeat: 'no-repeat',
                      clipPath: 'inset(0 0 0 0 round 24px)',
                      boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/60 opacity-27" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col z-10">
                      <div className="flex flex-row items-center justify-between px-6 pt-4 sm:pt-6">
                        <span className="text-3xl sm:text-4xl font-bold text-[#FFD700] drop-shadow-lg">{scenarios[0].year}</span>
                        <span className="text-xl sm:text-2xl text-[#FFD700] drop-shadow-lg font-medium">{scenarios[0].name}</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Coming Soon Message */}
                <div className="text-center py-2 absolute w-full -bottom-12">
                  <span className="text-[#FFD700]/70 text-sm sm:text-base historical-game-title">More scenarios coming soon...</span>
                </div>
              </div>

              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className={`group relative w-full px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-[#FFD700] bg-[#0B1423] rounded-lg transition-all duration-500 ease-in-out historical-game-title flex items-center justify-center gap-3 border-2 border-[#FFD700]/40 hover:border-[#FFD700] hover:bg-[#162033] shadow-[4px_4px_0px_0px_rgba(255,215,0,0.3)] 
                  ${showScenarios ? 'mt-13 sm:mt-44 md:mt-70 lg:mt-70 xl:mt-70 2xl:mt-70' : ''}`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              >
                <span role="img" aria-label="book" className="text-2xl sm:text-3xl">⚔️</span>
                New Nation
              </button>
            </div>
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