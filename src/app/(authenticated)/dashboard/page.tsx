'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService, SaveGame as GameData } from '@/services/gameService';
import { getNationName } from '@/data/nationTags';
import Link from 'next/link';
import ResourceBar from '@/components/ResourceBar';
import { Province, Nation } from '@/types/game';

// Sidebar Navigation Items
const navigation = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  { name: 'Alliances', href: '/alliances', icon: '🤝' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

// Calculate resources for ResourceBar
const calculateResources = (game: GameData['game']) => {
  const playerNation = game.nations.find((n: Nation) => n.nationTag === game.playerNationTag);
  const playerProvinces = game.provinces.filter((p: Province) => p.ownerTag === game.playerNationTag);

  return {
    playerGold: playerNation?.gold ?? 0,
    totalPopulation: playerProvinces.reduce((sum, p) => sum + p.population, 0),
    totalIndustry: playerProvinces.reduce((sum, p) => sum + p.industry, 0),
    totalArmy: playerProvinces.reduce((sum, p) => sum + p.army, 0),
  };
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentGame, setRecentGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveGames, setSaveGames] = useState<{ [key: string]: GameData | null }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [resourceBarFadeIn, setResourceBarFadeIn] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      if (user) {
        try {
          const games = await GameService.getSaveGames(user.uid);
          const gamesArray = Object.values(games)
            .filter((game): game is GameData => game !== null)
            .sort((a, b) => 
              new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
            );

          if (gamesArray.length > 0) {
            setRecentGame(gamesArray[0]);
            setSaveGames(games);
          } else {
            setRecentGame(null);
            setSaveGames({});
          }
        } catch (error) {
          console.error('Error loading games:', error);
          setRecentGame(null);
          setSaveGames({});
        } finally {
           setTimeout(() => setResourceBarFadeIn(true), 100);
        }
      } else {
        setRecentGame(null);
        setSaveGames({});
         setTimeout(() => setResourceBarFadeIn(true), 100);
      }
      setLoading(false);
    };

    loadGames();
  }, [user]);

  const handleContinueGame = () => {
    if (recentGame) {
      setIsNavigating(true);
      let saveSlot = '1';
      for (const [slot, game] of Object.entries(saveGames)) {
        if (game && game.game.id === recentGame.game.id) {
          saveSlot = slot;
          break;
        }
      }
      setTimeout(() => {
        router.push(`/game?save=${saveSlot}`);
      }, 300); 
    }
  };

  const handleNewGame = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push(`/country_select`);
    }, 300);
  };

  const recentGameResources = recentGame ? calculateResources(recentGame.game) : null;

  return (
    <main className={`flex-1 flex flex-col px-4 py-8 transition-opacity duration-300 h-full ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        
      {/* Resource Bar (Top) */} 
      <div className="w-full max-w-4xl mx-auto h-[48px] mb-8 flex-shrink-0">
        {recentGame && recentGameResources && (
          <ResourceBar 
            playerGold={recentGameResources.playerGold}
            totalPopulation={recentGameResources.totalPopulation}
            totalIndustry={recentGameResources.totalIndustry}
            totalArmy={recentGameResources.totalArmy}
            playerNationTag={recentGame.game.playerNationTag}
            gameDate={recentGame.game.date}
            fadeIn={resourceBarFadeIn}
          />
        )}
      </div>

      {/* Main Content Area (Buttons Left, Placeholder Right) */} 
      <div className="flex-grow flex items-center w-full max-w-7xl mx-auto">
        
        {/* Left Column: Buttons (Centered Horizontally) */}
        <div className="w-1/3 flex flex-col items-center pr-4">
          <div className="flex flex-col gap-6">
            {/* Resume Nation Button */} 
            <button
              onClick={handleContinueGame}
              disabled={!recentGame || loading || isNavigating}
              className={`
                px-8 py-4 text-xl font-semibold rounded-xl border-2 transition-all duration-200 
                flex items-center justify-center gap-3 shadow-[0_4px_0px] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_2px_0px]
                [font-family:var(--font-mplus-rounded)] w-60 whitespace-nowrap
                ${!recentGame || loading
                  ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-gray-300 cursor-not-allowed'
                  : 'bg-[#67b9e7] text-white border-[#4792ba] shadow-[#4792ba] hover:bg-[#5aa8d6] active:bg-[#4792ba]'
                }
              `}
            >
              <span role="img" aria-label="castle" className="text-xl">🏰</span>
              {loading ? 'Loading...' : (recentGame ? 'Resume Nation' : 'No Recent Nation')}
            </button>

            {/* New Nation Button */} 
            <button
              onClick={handleNewGame}
              disabled={loading || isNavigating}
              className={`
                px-8 py-4 text-xl font-semibold rounded-xl border-2 transition-all duration-200 
                flex items-center justify-center gap-3 shadow-[0_4px_0px] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_2px_0px]
                [font-family:var(--font-mplus-rounded)] w-60 whitespace-nowrap
                ${loading 
                  ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-gray-300 cursor-not-allowed'
                  : 'bg-white text-[#0B1423] border-gray-300 shadow-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 active:shadow-gray-200'
                }
              `}
            >
              <span role="img" aria-label="swords" className="text-xl">⚔️</span>
              New Nation
            </button>
          </div>
        </div>

        {/* Right Column: Grid Content */} 
        <div className="flex-grow self-stretch p-6 ml-4 flex flex-col justify-center"> 
          {/* Grid Container - Increased gap, removed flex-grow */} 
          <div className="grid grid-cols-2 gap-4"> 
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300 p-4 flex items-center justify-center h-40"
              >
                <span className="text-gray-400 text-sm [font-family:var(--font-mplus-rounded)]">
                  Box {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}