'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/context/WalletContext';

const mockTransactions = [
  { id: '1', type: 'win', amount: 45.50, date: '2023-10-27 10:45 AM' },
  { id: '2', type: 'bet', amount: -20.00, date: '2023-10-27 10:44 AM' },
  { id: '3', type: 'deposit', amount: 100.00, date: '2023-10-26 08:00 PM' },
  { id: '4', type: 'win', amount: 12.30, date: '2023-10-26 03:20 PM' },
  { id: '5', type: 'bet', amount: -5.00, date: '2023-10-26 03:19 PM' },
];

export default function WalletPage() {
  const { balance } = useWallet();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available funds for playing.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold font-headline">${balance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add virtual funds to your wallet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="Enter amount" defaultValue="50" />
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Deposit</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge
                      variant={
                        tx.type === 'deposit' ? 'default'
                        : tx.type === 'win' ? 'secondary'
                        : 'destructive'
                      }
                      className={
                        tx.type === 'win' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                        : tx.type === 'bet' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                        : ''
                      }
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
