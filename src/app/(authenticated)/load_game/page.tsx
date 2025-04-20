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

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, gameName }: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0B1423] border-2 border-[#FFD700]/30 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl text-[#FFD700] historical-game-title mb-4">Delete Save Game?</h2>
        <p className="text-[#FFD700]/90 mb-6">
          Are you sure you want to delete your {gameName} save game? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#FFD700] historical-game-title hover:text-[#FFD700]/80 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-900/50 text-red-200 historical-game-title border border-red-500/50 rounded hover:bg-red-900/70 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoadGame() {
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<GameData[]>([]);
  const [saveSlots, setSaveSlots] = useState<Record<string, GameData | null>>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    gameId?: string;
    gameName?: string;
    slot?: string;
  }>({ isOpen: false });

  const loadGames = async () => {
    if (user) {
      try {
        const savedGames = await GameService.getSaveGames(user.uid);
        // Convert the object into an array of non-null games
        const gamesArray = Object.entries(savedGames)
          .filter(([_, game]) => game !== null)
          .map(([_, game]) => game as GameData);

        // Sort by savedAt date
        gamesArray.sort((a, b) => 
          new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
        );
        
        setGames(gamesArray);
        // Store mapping of game IDs to save slots
        setSaveSlots(savedGames);
      } catch (error) {
        console.error('Error loading games:', error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGames();
  }, [user]);

  const handleLoadGame = (game: GameData) => {
    // Find which save slot contains this game
    for (const [slot, savedGame] of Object.entries(saveSlots)) {
      if (savedGame && savedGame.game.id === game.game.id) {
        router.push(`/game?save=${slot}`);
        return;
      }
    }
    // Fallback - this shouldn't happen but just in case
    router.push('/dashboard');
  };

  const handleDeleteClick = (e: React.MouseEvent, game: GameData) => {
    e.stopPropagation(); // Prevent triggering the game load
    
    // Find the slot for this game
    const slot = Object.entries(saveSlots).find(([_, savedGame]) => 
      savedGame && savedGame.game.id === game.game.id
    )?.[0];

    if (slot) {
      setDeleteConfirmation({
        isOpen: true,
        gameId: game.game.id,
        gameName: getNationName(game.game.playerNationTag),
        slot
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteConfirmation.slot) return;

    try {
      await GameService.deleteSaveGame(user.uid, parseInt(deleteConfirmation.slot));
      // Refresh the games list
      await loadGames();
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-[#0B1423] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[1200px] flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="text-[#FFD700] historical-game-title text-xl hover:text-[#FFD700]/80 transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <h1 className="text-4xl sm:text-5xl text-center text-[#FFD700] mb-12 historical-game-title">
          Load Game
        </h1>

        {loading ? (
          <div className="text-[#FFD700] text-2xl historical-game-title">
            Loading saved games...
          </div>
        ) : games.length === 0 ? (
          <div className="text-[#FFD700] text-2xl historical-game-title text-center">
            No saved games found
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <div
                key={index}
                onClick={() => handleLoadGame(game)}
                className="group cursor-pointer"
              >
                <div className="relative h-64 rounded-2xl overflow-hidden border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-all duration-200"
                  style={{
                    backgroundImage: "url('/backgrounds/civil_war_background.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 70%',
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1423]/50 to-[#0B1423]/90 group-hover:opacity-80 transition-opacity duration-200" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl text-[#FFD700] font-bold historical-game-title mb-2">
                          {getNationName(game.game.playerNationTag)}
                        </h3>
                        <p className="text-xl text-[#FFD700]/90 historical-game-title">
                          {game.game.date.substring(0, 4)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, game)}
                        className="p-2 text-[#FFD700]/50 hover:text-red-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#FFD700]/70">
                        {new Date(game.metadata.savedAt).toLocaleDateString()} at {new Date(game.metadata.savedAt).toLocaleTimeString()}
                      </div>
                      <div className="text-[#FFD700]/50 group-hover:text-[#FFD700] transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        gameName={deleteConfirmation.gameName || ''}
      />
    </div>
  );
} 