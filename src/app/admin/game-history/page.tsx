import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GameRound } from '@/lib/definitions';

const mockAllGameHistory: (GameRound & { username: string })[] = [
    { id: 'g1', user_id: 'u1', username: 'CheekyMonkey', bet_amount: 10, difficulty: 'Easy', crash_multiplier: 3.45, cashed_out_at: 2.5, winnings: 25, status: 'won', created_at: '2023-10-27 10:45 AM' },
    { id: 'g2', user_id: 'u1', username: 'CheekyMonkey', bet_amount: 20, difficulty: 'Medium', crash_multiplier: 1.82, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-27 10:44 AM' },
    { id: 'g3', user_id: 'u3', username: 'HighRoller', bet_amount: 200, difficulty: 'Hard', crash_multiplier: 15.2, cashed_out_at: 14.1, winnings: 2820, status: 'won', created_at: '2023-10-26 03:19 PM' },
    { id: 'g4', user_id: 'u4', username: 'Newbie', bet_amount: 1, difficulty: 'Hardcore', crash_multiplier: 1.01, cashed_out_at: null, winnings: 0, status: 'busted', created_at: '2023-10-26 01:10 PM' },
    { id: 'g5', user_id: 'u1', username: 'CheekyMonkey', bet_amount: 1, difficulty: 'Easy', crash_multiplier: 100, cashed_out_at: 95.5, winnings: 95.5, status: 'snackpot', created_at: '2023-10-25 09:00 AM' },
];

function StatusBadge({ status }: { status: GameRound['status'] }) {
    const variant = status === 'won' ? 'secondary' : status === 'busted' ? 'destructive' : 'default';
    const className = status === 'won' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
        : status === 'busted' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
        : status === 'snackpot' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
        : '';
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function AdminHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Game History</CardTitle>
        <CardDescription>A log of all games played on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bet</TableHead>
              <TableHead>Cashed Out</TableHead>
              <TableHead>Crash Point</TableHead>
              <TableHead className="text-right">Winnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAllGameHistory.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.username}</TableCell>
                <TableCell>
                  <StatusBadge status={game.status} />
                </TableCell>
                <TableCell>${game.bet_amount.toFixed(2)}</TableCell>
                <TableCell>{game.cashed_out_at ? `${game.cashed_out_at.toFixed(2)}x` : '—'}</TableCell>
                <TableCell>{game.crash_multiplier.toFixed(2)}x</TableCell>
                <TableCell className={`text-right font-medium ${game.winnings > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {game.winnings > game.bet_amount ? `+$${(game.winnings - game.bet_amount).toFixed(2)}` : (game.winnings > 0 ? `-$${(game.bet_amount - game.winnings).toFixed(2)}` : `-$${game.bet_amount.toFixed(2)}`)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
