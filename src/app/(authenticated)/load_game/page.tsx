'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameService, SaveGame as GameData } from '@/services/gameService';
import { getNationName } from '@/data/nationTags';
import { getNationFlag } from '@/utils/nationFlags';
import { FaTrashAlt } from 'react-icons/fa';

// Helper to format numbers (from profile/statistics page)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
  } else {
    return num.toString();
  }
};

// Helper function to format game date (from profile page)
const formatGameDate = (dateString: string): string => {
  if (!dateString || !dateString.includes('-')) return 'Invalid Date';
  try {
    const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
    const date = new Date(year, month - 1, day);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

// Helper to format last saved timestamp
const formatLastSaved = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return 'Invalid Date';
  }
};

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, gameName }: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 [font-family:var(--font-mplus-rounded)]">
      <div className="bg-white rounded-xl p-6 max-w-md w-full border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
        <h2 className="text-2xl text-[#0B1423] font-bold mb-4">Delete Save Game?</h2>
        <p className="text-[#0B1423]/80 mb-6">
          Are you sure you want to delete your <span className="font-semibold">{getNationName(gameName)}</span> save game? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[#0B1423] bg-white rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(156,163,175,0.2)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg border-2 border-red-600 hover:bg-red-600 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.3)]"
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
    nationTag?: string;
    slot?: string;
  }>({ isOpen: false });

  const loadGamesList = async () => {
    if (user) {
      setLoading(true);
      try {
        const savedGamesData = await GameService.getSaveGames(user.uid);
        const gamesArray = Object.values(savedGamesData)
          .filter((game): game is GameData => game !== null)
          .sort((a, b) => new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime());
        
        setGames(gamesArray);
        setSaveSlots(savedGamesData);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setGames([]);
      setSaveSlots({});
    }
  };

  useEffect(() => {
    loadGamesList();
  }, [user]);

  const handleLoadGame = (game: GameData) => {
    for (const [slot, savedGame] of Object.entries(saveSlots)) {
      if (savedGame && savedGame.game.id === game.game.id) {
        router.push(`/game?save=${slot}`);
        return;
      }
    }
    router.push('/dashboard');
  };

  const handleDeleteClick = (e: React.MouseEvent, game: GameData) => {
    e.stopPropagation();
    const slot = Object.entries(saveSlots).find(([_, sg]) => sg && sg.game.id === game.game.id)?.[0];
    if (slot) {
      setDeleteConfirmation({
        isOpen: true,
        gameId: game.game.id,
        nationTag: game.game.playerNationTag,
        slot
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteConfirmation.slot) return;
    try {
      await GameService.deleteSaveGame(user.uid, parseInt(deleteConfirmation.slot));
      await loadGamesList();
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  // Small emoji style from profile page
  const emojiStyle = {
    textShadow: `
      -0.5px -0.5px 0 rgba(0,0,0,0.1),
      0.5px -0.5px 0 rgba(0,0,0,0.1),
      -0.5px 0.5px 0 rgba(0,0,0,0.1),
      0.5px 0.5px 0 rgba(0,0,0,0.1)
    `
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 [font-family:var(--font-mplus-rounded)]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#0B1423]">
          Load Saved Game
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-5 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(156,163,175,0.2)] flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#0B1423]/70">Loading saved games...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-16 text-[#0B1423]/70">
          No saved games found. Start a new nation!
        </div>
      ) : (
        <div className="space-y-6">
          {games.map((gameData) => {
            const playerNationTag = gameData.game.playerNationTag;
            const playerNation = gameData.game.nations.find(n => n.nationTag === playerNationTag);
            const playerProvinces = gameData.game.provinces.filter(p => p.ownerTag === playerNationTag);
            const playerResources = {
              gold: playerNation?.gold ?? 0,
              population: playerProvinces.reduce((sum, p) => sum + p.population, 0),
              industry: playerProvinces.reduce((sum, p) => sum + p.industry, 0),
              army: playerProvinces.reduce((sum, p) => sum + p.army, 0),
            };

            return (
              <div 
                key={gameData.game.id || gameData.metadata.savedAt}
                onClick={() => handleLoadGame(gameData)}
                className="bg-white rounded-xl p-5 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] cursor-pointer hover:border-[#67b9e7]/60 hover:shadow-[6px_6px_0px_0px_rgba(103,185,231,0.35)] transition-all duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left Side: Flag, Name, Dates */}
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl" style={emojiStyle}>{getNationFlag(playerNationTag)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-[#0B1423]">
                        {getNationName(playerNationTag)}
                      </h3>
                      <p className="text-sm text-[#0B1423]/70">
                        {formatGameDate(gameData.game.date)}
                      </p>
                      <p className="text-xs text-[#0B1423]/60 mt-1">
                        Last Saved: {formatLastSaved(gameData.metadata.savedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Resources & Delete Button */} 
                  <div className="flex flex-col items-end gap-2 sm:gap-3">
                    <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-md sm:text-lg" style={emojiStyle}>💰</span>
                        <span className="text-[#0B1423] text-sm font-medium whitespace-nowrap">
                          {formatNumber(playerResources.gold)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-md sm:text-lg" style={emojiStyle}>👥</span>
                        <span className="text-[#0B1423] text-sm font-medium whitespace-nowrap">
                          {formatNumber(playerResources.population)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-md sm:text-lg" style={emojiStyle}>🏭</span>
                        <span className="text-[#0B1423] text-sm font-medium whitespace-nowrap">
                          {formatNumber(playerResources.industry)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-md sm:text-lg" style={emojiStyle}>⚔️</span>
                        <span className="text-[#0B1423] text-sm font-medium whitespace-nowrap">
                          {formatNumber(playerResources.army)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, gameData)}
                      className="mt-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors duration-150 shadow-sm hover:shadow-md"
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        gameName={deleteConfirmation.nationTag || ''}
      />
    </div>
  );
} 