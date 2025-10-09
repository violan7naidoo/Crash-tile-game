'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GameRound } from '@/lib/definitions';
import { useGameHistory } from '@/context/GameHistoryContext';

function StatusBadge({ status }: { status: GameRound['status'] }) {
    const variant = status === 'won' ? 'secondary' : status === 'busted' ? 'destructive' : 'default';
    const className = status === 'won' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
        : status === 'busted' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
        : status === 'snackpot' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
        : '';
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function HistoryPage() {
  const { gameHistory } = useGameHistory();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game History</CardTitle>
        <CardDescription>A log of all your past games.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Bet</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Cashed Out</TableHead>
              <TableHead>Crash Point</TableHead>
              <TableHead className="text-right">Winnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameHistory.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <StatusBadge status={game.status} />
                </TableCell>
                <TableCell>R{game.bet_amount.toFixed(2)}</TableCell>
                <TableCell>{game.difficulty}</TableCell>
                <TableCell>{game.cashed_out_at ? `${game.cashed_out_at.toFixed(2)}x` : '—'}</TableCell>
                <TableCell>{game.crash_multiplier.toFixed(2)}x</TableCell>
                <TableCell className={`text-right font-medium ${game.winnings > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {game.winnings > 0 ? `+R${game.winnings.toFixed(2)}` : 'R0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}