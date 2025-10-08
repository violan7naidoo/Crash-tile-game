import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GameRound, Difficulty } from '@/lib/definitions';

const mockGameHistory: GameRound[] = [
    { id: 'g1', user_id: 'u1', bet_amount: 10, difficulty: 'Easy', crash_multiplier: 3.45, cashed_out_at: 2.5, winnings: 25, status: 'won', created_at: '2023-10-27 10:45 AM' },
    { id: 'g2', user_id: 'u1', bet_amount: 20, difficulty: 'Medium', crash_multiplier: 1.82, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-27 10:44 AM' },
    { id: 'g3', user_id: 'u1', bet_amount: 5, difficulty: 'Hard', crash_multiplier: 15.2, cashed_out_at: 14.1, winnings: 70.5, status: 'won', created_at: '2023-10-26 03:19 PM' },
    { id: 'g4', user_id: 'u1', bet_amount: 50, difficulty: 'Hardcore', crash_multiplier: 1.01, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-26 01:10 PM' },
    { id: 'g5', user_id: 'u1', bet_amount: 1, difficulty: 'Easy', crash_multiplier: 100, cashed_out_at: 95.5, winnings: 95.5, status: 'snackpot', created_at: '2023-10-25 09:00 AM' },
];

function StatusBadge({ status }: { status: GameRound['status'] }) {
    const variant = status === 'won' ? 'secondary' : status === 'busted' ? 'destructive' : 'default';
    const className = status === 'won' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
        : status === 'busted' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
        : status === 'snackpot' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
        : '';
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function HistoryPage() {
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
            {mockGameHistory.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <StatusBadge status={game.status} />
                </TableCell>
                <TableCell>${game.bet_amount.toFixed(2)}</TableCell>
                <TableCell>{game.difficulty}</TableCell>
                <TableCell>{game.cashed_out_at ? `${game.cashed_out_at.toFixed(2)}x` : '—'}</TableCell>
                <TableCell>{game.crash_multiplier.toFixed(2)}x</TableCell>
                <TableCell className={`text-right font-medium ${game.winnings > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {game.winnings > 0 ? `+$${game.winnings.toFixed(2)}` : '$0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
