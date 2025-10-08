'use client';

import React, { useState } from 'react';
import ControlPanel from '@/components/game/ControlPanel';
import GameDisplay from '@/components/game/GameDisplay';
import { GameState, Difficulty, difficultySettings } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';

const INITIAL_STATE: Omit<GameState, 'betAmount' | 'difficulty'> = {
  status: 'idle',
  currentMultiplier: 1,
  monkeyPosition: 0,
  gameId: null,
};

const GRID_COLUMNS = 12;

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_STATE,
    betAmount: 1,
    difficulty: 'Easy',
  });
  
  const [jumpCount, setJumpCount] = useState(0);
  const { balance, addToBalance, subtractFromBalance } = useWallet();
  const { toast } = useToast();

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

    subtractFromBalance(gameState.betAmount);
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
    addToBalance(winnings);
    
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
    </div>
  );
}
