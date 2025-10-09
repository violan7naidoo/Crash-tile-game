'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameRound } from '@/lib/definitions';

interface GameHistoryContextType {
  gameHistory: GameRound[];
  addGameToHistory: (game: GameRound) => void;
  clearGameHistory: () => void;
}

const GameHistoryContext = createContext<GameHistoryContextType | undefined>(undefined);

const mockGameHistory: GameRound[] = [
  { 
    id: 'g1', 
    user_id: 'u1', 
    bet_amount: 10, 
    difficulty: 'Easy', 
    crash_multiplier: 3.45, 
    cashed_out_at: 2.5, 
    winnings: 25, 
    status: 'won', 
    created_at: '2023-10-27 10:45 AM' 
  },
  // Add more mock data as needed
];

export function GameHistoryProvider({ children }: { children: ReactNode }) {
  const [gameHistory, setGameHistory] = useState<GameRound[]>(mockGameHistory);

  const addGameToHistory = (game: GameRound) => {
    setGameHistory(prev => [game, ...prev]);
  };

  const clearGameHistory = () => {
    setGameHistory([]);
  };

  return (
    <GameHistoryContext.Provider value={{ gameHistory, addGameToHistory, clearGameHistory }}>
      {children}
    </GameHistoryContext.Provider>
  );
}

export function useGameHistory() {
  const context = useContext(GameHistoryContext);
  if (context === undefined) {
    throw new Error('useGameHistory must be used within a GameHistoryProvider');
  }
  return context;
}
