'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Difficulty, GameStatus } from '@/lib/definitions';
import { difficultySettings } from '@/lib/definitions';
import { ArrowRight, DollarSign } from 'lucide-react';

interface ControlPanelProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onPlay: () => void;
  onMove: () => void;
  onCashOut: () => void;
  onReset: () => void;
  status: GameStatus;
  balance: number;
  multiplier: number;
}

export default function ControlPanel({
  betAmount,
  setBetAmount,
  difficulty,
  setDifficulty,
  onPlay,
  onMove,
  onCashOut,
  onReset,
  status,
  balance,
  multiplier,
}: ControlPanelProps) {
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0;
    if (value < 0.01) value = 0.01;
    if (value > 200) value = 200;
    setBetAmount(value);
  };

  const isPlaying = status === 'playing';
  const potentialWinnings = (betAmount * multiplier).toFixed(2);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline">Game Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="bet-amount">Bet Amount</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={handleBetChange}
              min="0.01"
              max="200"
              step="0.01"
              disabled={isPlaying}
            />
          </div>
          <div className="flex justify-between mt-1">
            <Button variant="outline" size="sm" onClick={() => setBetAmount(betAmount / 2)} disabled={isPlaying}>/2</Button>
            <Button variant="outline" size="sm" onClick={() => setBetAmount(betAmount * 2)} disabled={isPlaying}>x2</Button>
            <Button variant="outline" size="sm" onClick={() => setBetAmount(balance)} disabled={isPlaying}>Max</Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Difficulty</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={(value: Difficulty) => setDifficulty(value)}
            className="grid grid-cols-2 gap-2"
            disabled={isPlaying}
          >
            {Object.keys(difficultySettings).map((level) => (
              <div key={level}>
                <RadioGroupItem value={level} id={level} className="peer sr-only" />
                <Label
                  htmlFor={level}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent"
                >
                  {level}
                  <span className="text-xs text-muted-foreground">{difficultySettings[level as Difficulty].lanes} lanes</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        {status === 'idle' && (
          <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground text-lg" size="lg" onClick={onPlay}>
            Place Bet
          </Button>
        )}
        {status === 'playing' && (
          <div className="w-full grid grid-cols-2 gap-2">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-foreground text-lg" size="lg" onClick={onCashOut}>
              <DollarSign className="mr-2 h-5 w-5" />
              Cash Out (${potentialWinnings})
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white text-lg" size="lg" onClick={onMove}>
              Move <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
        {status === 'busted' && (
          <Button className="w-full" size="lg" onClick={onReset}>
            Play Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
