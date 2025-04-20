'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';
import { getNationName } from '@/data/nationTags';

interface GameData {
  game: {
    mapName: string;
    gameName: string;
    playerNationTag: string;
    id?: string;
    date: string;
  };
  metadata: {
    scenarioId: string;
    savedAt: string;
    playerNation: string;
  };
}

interface SaveGames {
  [key: string]: GameData;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [showResumeOptions, setShowResumeOptions] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showLoadGames, setShowLoadGames] = useState(false);
  const [recentGame, setRecentGame] = useState<GameData | null>(null);
  const [previousGames, setPreviousGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      if (user) {
        try {
          const games = await GameService.getSaveGames(user.uid);
          // Convert the object into an array of non-null games
          const gamesArray = Object.entries(games)
            .filter(([_, game]) => game !== null)
            .map(([slot, game]) => game as GameData);

          if (gamesArray.length > 0) {
            // Sort by savedAt date
            gamesArray.sort((a, b) => 
              new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
            );
            setRecentGame(gamesArray[0]);
            setPreviousGames(gamesArray.slice(1));
          }
        } catch (error) {
          console.error('Error loading games:', error);
        }
      }
      setLoading(false);
    };

    loadGames();
  }, [user]);

  const handleContinueGame = () => {
    if (recentGame) {
      router.push(`/game?id=${recentGame.game.id || ''}`);
    }
  };

  const handleLoadGame = (game: GameData) => {
    router.push(`/game?id=${game.game.id || ''}`);
    setShowLoadGames(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 w-64 sm:w-96 -mt-16">
        <div className="w-full flex flex-col items-center">
          <div className="w-full relative">
            {/* Resume Nation Options */}
            <div className={`absolute bottom-full w-[140%] sm:w-[160%] left-1/2 mb-0 -translate-x-1/2 transition-all duration-500 ease-in-out transform 
              ${showResumeOptions ? 'opacity-100 translate-y-[0%] sm:translate-y-[55%] md:translate-y-[78%] lg:translate-y-[78%] xl:translate-y-[78%] 2xl:translate-y-[78%]' : 'opacity-0 translate-y-0 pointer-events-none'}`}>
              <div className="grid grid-cols-2 gap-6 relative w-full">
                {/* Continue Game Box */}
                <button
                  onClick={handleContinueGame}
                  disabled={!recentGame}
                  className={`w-full h-40 sm:h-56 md:h-70 lg:h-70 xl:h-70 2xl:h-70 text-lg sm:text-xl font-medium text-[#FFD700] rounded-3xl transition-all duration-200 historical-game-title border-2 ${!recentGame ? 'border-[#FFD700]/10 opacity-50 cursor-not-allowed' : 'border-[#FFD700]/30 hover:border-[#FFD700]/50'} overflow-hidden group`}
                  style={{
                    backgroundImage: "url('/backgrounds/civil_war_background.png')",
                    backgroundSize: 'cover',
                    opacity: recentGame ? 1 : 0.5,
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
                    <div className="flex flex-col items-top justify-start h-full mt-4 px-6">
                      <span className="text-4xl sm:text-4xl font-bold text-[#FFD700] drop-shadow-lg">
                        {recentGame ? 'Continue' : 'No Recent Game'}
                      </span>
                      {recentGame && (
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="text-2xl text-[#FFD700]/90 historical-game-title">
                            {getNationName(recentGame.game.playerNationTag)}, {recentGame.game.date.substring(0, 4)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Load Game Box */}
                <div
                  onClick={() => router.push('/load_game')}
                  className={`w-full h-40 sm:h-56 md:h-70 lg:h-70 xl:h-70 2xl:h-70 text-lg sm:text-xl font-medium text-[#FFD700] rounded-3xl transition-all duration-200 historical-game-title border-2 ${previousGames.length === 0 ? 'border-[#FFD700]/10 opacity-50 cursor-not-allowed' : 'border-[#FFD700]/30 hover:border-[#FFD700]/50 cursor-pointer'} overflow-hidden group relative`}
                  style={{
                    backgroundImage: "url('/backgrounds/civil_war_background.png')",
                    backgroundSize: 'cover',
                    opacity: previousGames.length > 0 ? 1 : 0.5,
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
                    <div className="flex flex-col items-top justify-start h-full mt-4 px-6">
                      <span className="text-4xl sm:text-4xl font-bold text-[#FFD700] drop-shadow-lg">
                        {previousGames.length > 0 ? 'Load Game' : 'No Other Games'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Nation Button */}
            <button
              onClick={() => {
                setShowResumeOptions(!showResumeOptions);
                setShowScenarios(false);
              }}
              disabled={loading}
              className={`group relative w-full mb-6 px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-[#FFD700] bg-[#0B1423] rounded-lg transition-all duration-500 ease-in-out historical-game-title flex items-center justify-center gap-3 border-2 ${!recentGame && !loading ? 'border-[#FFD700]/10 opacity-50 cursor-not-allowed' : 'border-[#FFD700]/40 hover:border-[#FFD700] hover:bg-[#162033]'} shadow-[4px_4px_0px_0px_rgba(255,215,0,0.3)]
                ${showResumeOptions ? 'mt-13 sm:mt-44 md:mt-70 lg:mt-70 xl:mt-70 2xl:mt-70' : ''}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <span role="img" aria-label="timer" className="text-2xl sm:text-3xl">🏰</span>
              {!recentGame && !loading ? 'No Recent Nation' : 'Resume Nation'}
            </button>

            {/* Scenario Selection */}
            <div className={`absolute bottom-full w-[140%] sm:w-[160%] left-1/2 mb-1 -translate-x-1/2 transition-all duration-500 ease-in-out transform 
              ${showScenarios ? 'opacity-100 translate-y-[0%] sm:translate-y-[55%] md:translate-y-[94%] lg:translate-y-[94%] xl:translate-y-[94%] 2xl:translate-y-[94%]' : 'opacity-0 translate-y-0 pointer-events-none'}`}>
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
                      <span className="text-3xl sm:text-4xl font-bold text-[#FFD700] drop-shadow-lg">1836</span>
                      <span className="text-xl sm:text-2xl text-[#FFD700] drop-shadow-lg font-medium">Age of Industrialization</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Coming Soon Message */}
              <div className="text-center py-2 absolute w-full -bottom-12">
                <span className="text-[#FFD700]/70 text-sm sm:text-base historical-game-title">More scenarios coming soon...</span>
              </div>
            </div>

            {/* New Nation Button */}
            <button
              onClick={() => {
                setShowScenarios(!showScenarios);
                setShowResumeOptions(false);
              }}
              className={`group relative w-full px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-[#FFD700] bg-[#0B1423] rounded-lg transition-all duration-500 ease-in-out historical-game-title flex items-center justify-center gap-3 border-2 border-[#FFD700]/40 hover:border-[#FFD700] hover:bg-[#162033] shadow-[4px_4px_0px_0px_rgba(255,215,0,0.3)] 
                ${showScenarios ? 'mt-13 sm:mt-44 md:mt-70 lg:mt-70 xl:mt-70 2xl:mt-70' : ''}
                ${showResumeOptions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <span role="img" aria-label="book" className="text-2xl sm:text-3xl">⚔️</span>
              New Nation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}