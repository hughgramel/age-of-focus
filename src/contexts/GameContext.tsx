'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Game } from '@/types/game';

interface GameContextType {
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
  gameLoading: boolean;
}

const defaultGameContext: GameContextType = {
  currentGame: null,
  setCurrentGame: () => {},
  gameLoading: true,
};

export const GameContext = createContext<GameContextType>(defaultGameContext);

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameLoading, setGameLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Reset game state when user changes
  useEffect(() => {
    if (!user) {
      setCurrentGame(null);
    }
    setGameLoading(false);
  }, [user]);

  const value = {
    currentGame,
    setCurrentGame,
    gameLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}; 