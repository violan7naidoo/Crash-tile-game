'use client';

import React, { useState, useEffect } from 'react';
import ControlPanel from '@/components/game/ControlPanel';
import GameDisplay from '@/components/game/GameDisplay';
import { GameState, Difficulty, difficultySettings, GameRound } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { useGameHistory } from '@/context/GameHistoryContext';
import HistoryPage from './history/page';

const INITIAL_STATE: Omit<GameState, 'betAmount' | 'difficulty'> = {
  status: 'idle',
  currentMultiplier: 1,
  monkeyPosition: 0,
  gameId: null,
};

const GRID_COLUMNS = 12;

const mockGameHistory: GameRound[] = [
    { id: 'g1', user_id: 'u1', bet_amount: 10, difficulty: 'Easy', crash_multiplier: 3.45, cashed_out_at: 2.5, winnings: 25, status: 'won', created_at: '2023-10-27 10:45 AM' },
    { id: 'g2', user_id: 'u1', bet_amount: 20, difficulty: 'Medium', crash_multiplier: 1.82, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-27 10:44 AM' },
    { id: 'g3', user_id: 'u1', bet_amount: 5, difficulty: 'Hard', crash_multiplier: 15.2, cashed_out_at: 14.1, winnings: 70.5, status: 'won', created_at: '2023-10-26 03:19 PM' },
    { id: 'g4', user_id: 'u1', bet_amount: 50, difficulty: 'Hardcore', crash_multiplier: 1.01, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-26 01:10 PM' },
    { id: 'g5', user_id: 'u1', bet_amount: 1, difficulty: 'Easy', crash_multiplier: 100, cashed_out_at: 95.5, winnings: 95.5, status: 'snackpot', created_at: '2023-10-25 09:00 AM' },
];

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_STATE,
    betAmount: 1,
    difficulty: 'Easy',
  });
  
  const [jumpCount, setJumpCount] = useState(0);
  const { balance, addToBalance, subtractFromBalance } = useWallet();
  const { toast } = useToast();
  const { gameHistory, addGameToHistory } = useGameHistory();

  // Calculate the next potential multiplier
  const calculateNextMultiplier = (currentPosition: number, currentMultiplier: number): number => {
    if (currentPosition >= GRID_COLUMNS - 1) return currentMultiplier;
    
    const difficultyMultiplier = difficultySettings[gameState.difficulty].multiplier;
    const baseIncrement = 0.2 * difficultyMultiplier;
    const positionBasedIncrement = ((currentPosition + 1) / GRID_COLUMNS) * 0.3 * difficultyMultiplier;
    return parseFloat((currentMultiplier + baseIncrement + positionBasedIncrement).toFixed(2));
  };

  const handlePlay = () => {
    if (balance < gameState.betAmount) {
      toast({
        title: 'Insufficient Funds',
        description: 'You do not have enough money to place this bet.',
        variant: 'destructive',
      });
      return;
    }

    subtractFromBalance(gameState.betAmount, 'bet');
    setJumpCount(0);
    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      gameId: `game_${Math.random()}`,
      monkeyPosition: 0,
      currentMultiplier: 1,
    }));
  };

  const handleBust = () => {
    const newGame: GameRound = {
      id: `game_${Date.now()}`,
      user_id: 'u1', // Replace with actual user ID
      bet_amount: gameState.betAmount,
      difficulty: gameState.difficulty,
      crash_multiplier: gameState.currentMultiplier,
      cashed_out_at: null,
      winnings: 0,
      status: 'busted',
      created_at: new Date().toLocaleString(),
    };
    addGameToHistory(newGame);
    setGameState(prev => ({ ...prev, status: 'busted' }));
    toast({
      title: 'Busted!',
      description: `You lost your R${gameState.betAmount.toFixed(2)} bet.`,
      variant: 'destructive',
    });
  };

  const handleMove = () => {
    if (gameState.status !== 'playing') return;

    // Increment jump count
    setJumpCount(prev => prev + 1);

    // Calculate new position and multiplier
    const newPosition = gameState.monkeyPosition + 1;
    const newMultiplier = calculateNextMultiplier(newPosition, gameState.currentMultiplier);

    if (newPosition >= GRID_COLUMNS) {
      handleCashOut();
    } else {
      setGameState(prev => ({
        ...prev,
        monkeyPosition: newPosition,
        currentMultiplier: newMultiplier,
      }));
    }
  };

  const handleCashOut = () => {
    const finalMultiplier = gameState.currentMultiplier;
    const winnings = gameState.betAmount * finalMultiplier;
    addToBalance(winnings, 'win');
    
    const newGame: GameRound = {
      id: `game_${Date.now()}`,
      user_id: 'u1', // Replace with actual user ID
      bet_amount: gameState.betAmount,
      difficulty: gameState.difficulty,
      crash_multiplier: finalMultiplier,
      cashed_out_at: finalMultiplier,
      winnings,
      status: 'won',
      created_at: new Date().toLocaleString(),
    };
    addGameToHistory(newGame);
    
    toast({
      title: 'Cashed Out!',
      description: `You won R${winnings.toFixed(2)}!`,
    });
    
    resetGame();
  };

  const resetGame = () => {
    setJumpCount(0);
    setGameState(prevState => ({
      ...INITIAL_STATE,
      betAmount: prevState.betAmount,
      difficulty: prevState.difficulty,
    }));
  };

  const setBetAmount = (amount: number) => {
    setGameState(prev => ({ ...prev, betAmount: amount }));
  };

  const setDifficulty = (difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };

  // Calculate next multiplier to display
  const nextMultiplier = calculateNextMultiplier(
    gameState.monkeyPosition + 1, 
    gameState.currentMultiplier
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full min-h-[calc(100vh-8rem)]">
      <div className="lg:col-span-4 rounded-lg bg-card border overflow-hidden relative">
        <GameDisplay
          status={gameState.status}
          monkeyPosition={gameState.monkeyPosition}
          columns={GRID_COLUMNS}
          multiplier={gameState.currentMultiplier}
          onBust={handleBust}
          jumpCount={jumpCount}
          nextMultiplier={nextMultiplier}
        />
      </div>
      <div className="lg:col-span-1 pr-4">
        <ControlPanel
          betAmount={gameState.betAmount}
          setBetAmount={setBetAmount}
          difficulty={gameState.difficulty}
          setDifficulty={setDifficulty}
          onPlay={handlePlay}
          onMove={handleMove}
          onCashOut={handleCashOut}
          onReset={resetGame}
          status={gameState.status}
          balance={balance}
          multiplier={gameState.currentMultiplier}
        />
      </div>
       <div className="lg:col-span-5">
        <HistoryPage />
      </div>
    </div>
  );
}