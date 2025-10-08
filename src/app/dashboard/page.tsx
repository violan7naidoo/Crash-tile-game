'use client';

import React, { useState, useMemo } from 'react';
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

const GRID_COLUMNS = 10;

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
      ...INITIAL_STATE,
      betAmount: 1,
      difficulty: 'Easy',
  });
  const { balance, addToBalance, subtractFromBalance } = useWallet();
  const { toast } = useToast();

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
    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      gameId: `game_${Math.random()}`,
      monkeyPosition: 0,
      currentMultiplier: 1,
    }));
  };

  const handleMove = () => {
    if (gameState.status !== 'playing') return;

    // Get difficulty settings
    const { bustChance } = difficultySettings[gameState.difficulty];
    
    // Calculate base bust chance (scales with position to make later moves riskier)
    const positionFactor = (gameState.monkeyPosition + 1) / GRID_COLUMNS;
    const bustProbability = 0.05 * bustChance * (1 + positionFactor * 2); // 5% base chance, scaled by difficulty and position

    // Check if the monkey gets busted
    const isBusted = Math.random() < bustProbability;

    if (isBusted) {
      setGameState((prev) => ({ ...prev, status: 'busted' }));
      toast({
        title: 'Busted!',
        description: `You lost your $${gameState.betAmount.toFixed(2)} bet.`,
        variant: 'destructive',
      });
      return;
    }

    // Calculate new position and multiplier
    const newPosition = gameState.monkeyPosition + 1;
    const difficultyMultiplier = difficultySettings[gameState.difficulty].multiplier;
    const baseMultiplierIncrement = 0.2 * difficultyMultiplier; // Base increment scaled by difficulty
    const positionBasedIncrement = (newPosition / GRID_COLUMNS) * 0.3 * difficultyMultiplier; // Increases as you progress
    const newMultiplier = parseFloat((gameState.currentMultiplier + baseMultiplierIncrement + positionBasedIncrement).toFixed(2));

    if (newPosition >= GRID_COLUMNS) {
      handleCashOut(); // Auto cash-out at the end
    } else {
      setGameState((prev) => ({
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
      description: `You won $${winnings.toFixed(2)}!`,
    });
    resetGame();
  };

  const resetGame = () => {
    setGameState(prevState => ({
      ...INITIAL_STATE,
      // Keep bet amount and difficulty from last round
      betAmount: prevState.betAmount,
      difficulty: prevState.difficulty,
    }));
  };

  const setBetAmount = (amount: number) => {
    setGameState((prev) => ({ ...prev, betAmount: amount }));
  };

  const setDifficulty = (difficulty: Difficulty) => {
    setGameState((prev) => ({ ...prev, difficulty }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 rounded-lg bg-card border overflow-hidden relative">
        <GameDisplay
          status={gameState.status}
          monkeyPosition={gameState.monkeyPosition}
          columns={GRID_COLUMNS}
          multiplier={gameState.currentMultiplier}
        />
      </div>
      <div className="lg:col-span-1">
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
