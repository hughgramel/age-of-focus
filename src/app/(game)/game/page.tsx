'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import GameView from '@/components/GameView';
import { world_1836 } from '@/data/world_1836';
import { useAuth } from '@/contexts/AuthContext';
import { GameService } from '@/services/gameService';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [game, setGame] = useState<typeof world_1836 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);

        const mode = searchParams?.get('mode');
        const saveNumber = searchParams?.get('save');
        const gameId = searchParams?.get('id');

        if (mode === 'demo') {
          setGame(world_1836);
        } else if (saveNumber && user) {
          const save = await GameService.getSaveGame(user.uid, parseInt(saveNumber));
          if (save) {
            setGame(save.game);
          } else {
            setError('Save game not found');
          }
        } else if (gameId && user) {
          const allSaves = await GameService.getSaveGames(user.uid);
          let gameFound = false;
          
          for (const [slot, save] of Object.entries(allSaves)) {
            if (save && save.game.id === gameId) {
              setGame(save.game);
              gameFound = true;
              break;
            }
          }
          
          if (!gameFound) {
            setError('Game not found with the provided ID');
          }
        } else {
          setError('Invalid game parameters');
        }
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [searchParams, user]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0B1423] flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="w-full h-screen bg-[#0B1423] flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Game not found'}</div>
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <GameView game={game} onBack={handleBack} />;
} 