'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/context/WalletContext';

export default function WalletPage() {
  const { balance, transactions, addToBalance } = useWallet();
  const [depositAmount, setDepositAmount] = React.useState(50);

  const handleDeposit = () => {
    addToBalance(depositAmount, 'deposit');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available funds for playing.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold font-headline">R{balance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add virtual funds to your wallet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="Enter amount" value={depositAmount} onChange={(e) => setDepositAmount(parseFloat(e.target.value))} />
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleDeposit}>Deposit</Button>
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
              {transactions.map((tx) => (
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
                    {tx.amount > 0 ? `+R${tx.amount.toFixed(2)}` : `-R${Math.abs(tx.amount).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}