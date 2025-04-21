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
  [key: string]: GameData | null;
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
  const [saveGames, setSaveGames] = useState<SaveGames>({});
  const [isNavigating, setIsNavigating] = useState(false);

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
            setSaveGames(games);
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
      // Start transition animation
      setIsNavigating(true);
      
      // Add a slight delay for the animation
      setTimeout(() => {
        // Find the save slot number for this game
        for (const [slot, game] of Object.entries(saveGames)) {
          if (game && game.game.id === recentGame.game.id) {
            router.push(`/game?save=${slot}`);
            return;
          }
        }
        // If we can't find it in the slots, use the first slot as fallback
        router.push(`/game?save=1`);
      }, 500);
    }
  };

  const handleLoadGame = (game: GameData) => {
    // Start transition animation
    setIsNavigating(true);
    
    // Add a slight delay for the animation
    setTimeout(() => {
      // Find the save slot number for this game
      for (const [slot, savedGame] of Object.entries(saveGames)) {
        if (savedGame && savedGame.game.id === game.game.id) {
          router.push(`/game?save=${slot}`);
          return;
        }
      }
      // If we can't find it in the slots, use fallback
      router.push(`/game?save=1`);
    }, 500);
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center bg-white transition-opacity duration-500 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
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
                  className={`w-full h-40 sm:h-56 md:h-70 lg:h-70 xl:h-70 2xl:h-70 text-lg sm:text-xl font-medium text-white rounded-3xl transition-all duration-200 [font-family:var(--font-mplus-rounded)] border-2 ${!recentGame ? 'border-[#67b9e7]/10 opacity-50 cursor-not-allowed' : 'border-[#67b9e7]/30 hover:border-[#67b9e7]/50'} overflow-hidden group`}
                  style={{
                    backgroundImage: "url('/backgrounds/civil_war_background.png')",
                    backgroundSize: 'cover',
                    opacity: recentGame ? 1 : 0.5,
                    backgroundPosition: 'center 70%',
                    backgroundRepeat: 'no-repeat',
                    clipPath: 'inset(0 0 0 0 round 24px)',
                    boxShadow: '0 4px 0 rgba(103, 185, 231, 0.3)'
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 opacity-60" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col z-10">
                    <div className="flex flex-col items-top justify-start h-full mt-4 px-6">
                      <span className="text-4xl sm:text-4xl font-bold text-white drop-shadow-lg">
                        {recentGame ? 'Continue' : 'No Recent Game'}
                      </span>
                      {recentGame && (
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="text-2xl text-white/90 [font-family:var(--font-mplus-rounded)]">
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
                  className={`w-full h-40 sm:h-56 md:h-70 lg:h-70 xl:h-70 2xl:h-70 text-lg sm:text-xl font-medium text-white rounded-3xl transition-all duration-200 [font-family:var(--font-mplus-rounded)] border-2 ${previousGames.length === 0 ? 'border-[#67b9e7]/10 opacity-50 cursor-not-allowed' : 'border-[#67b9e7]/30 hover:border-[#67b9e7]/50 cursor-pointer'} overflow-hidden group relative`}
                  style={{
                    backgroundImage: "url('/backgrounds/redcoats_background.png')",
                    backgroundSize: 'cover',
                    opacity: previousGames.length > 0 ? 1 : 0.4,
                    backgroundPosition: 'center 40%',
                    backgroundRepeat: 'no-repeat',
                    clipPath: 'inset(0 0 0 0 round 24px)',
                    boxShadow: '0 4px 0 rgba(103, 185, 231, 0.3)'
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 opacity-60" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col z-10">
                    <div className="flex flex-col items-top justify-start h-full mt-4 px-6 pl-13">
                      <span className="text-4xl sm:text-4xl font-bold text-white drop-shadow-lg">
                        {previousGames.length != 0 ? 'Load Game' : 'No Other Games'}
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
              className={`group relative w-full mb-6 px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-white bg-[#67b9e7] rounded-lg transition-all duration-500 ease-in-out [font-family:var(--font-mplus-rounded)] flex items-center justify-center gap-3 border-2 ${!recentGame && !loading ? 'border-[#67b9e7]/10 opacity-50 cursor-not-allowed' : 'border-[#67b9e7] hover:bg-[#4792ba]'} shadow-[0_4px_0_#4792ba]
                ${showResumeOptions ? 'mt-13 sm:mt-44 md:mt-70 lg:mt-70 xl:mt-70 2xl:mt-70' : ''}`}
              style={{ transform: 'translateY(-2px)' }}
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
                  className="w-full h-full text-lg sm:text-xl font-medium text-white rounded-3xl transition-all duration-200 [font-family:var(--font-mplus-rounded)] border-2 border-[#67b9e7]/30 hover:border-[#67b9e7]/50 overflow-hidden group"
                  style={{
                    backgroundImage: "url('/backgrounds/civil_war_background.png')",
                    backgroundSize: 'cover',
                    opacity: 1,
                    backgroundPosition: 'center 70%',
                    backgroundRepeat: 'no-repeat',
                    clipPath: 'inset(0 0 0 0 round 24px)',
                    boxShadow: '0 4px 0 rgba(103, 185, 231, 0.3)'
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 opacity-60" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col z-10">
                    <div className="flex flex-row items-center justify-between px-6 pt-4 sm:pt-6">
                      <span className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">1836</span>
                      <span className="text-xl sm:text-2xl text-white drop-shadow-lg font-medium">Age of Industrialization</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Coming Soon Message */}
              <div className="text-center py-2 absolute w-full -bottom-12">
                <span className="text-[#0B1423]/70 text-sm sm:text-base [font-family:var(--font-mplus-rounded)]">More scenarios coming soon...</span>
              </div>
            </div>

            {/* New Nation Button */}
            <button
              onClick={() => {
                setShowScenarios(!showScenarios);
                setShowResumeOptions(false);
              }}
              className={`group relative w-full px-3 py-3 sm:py-4 text-2xl sm:text-3xl font-medium text-white bg-[#67b9e7] rounded-lg transition-all duration-500 ease-in-out [font-family:var(--font-mplus-rounded)] flex items-center justify-center gap-3 border-2 border-[#67b9e7] hover:bg-[#4792ba] shadow-[0_4px_0_#4792ba] 
                ${showScenarios ? 'mt-13 sm:mt-44 md:mt-70 lg:mt-70 xl:mt-70 2xl:mt-70' : ''}
                ${showResumeOptions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ transform: 'translateY(-2px)' }}
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