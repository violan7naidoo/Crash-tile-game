'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '@/lib/definitions';

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  addToBalance: (amount: number, type: 'deposit' | 'win') => void;
  subtractFromBalance: (amount: number, type: 'bet') => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const mockTransactions: Transaction[] = [
  { id: '1', wallet_id: 'wallet-1', type: 'win', amount: 45.50, created_at: '2023-10-27 10:45 AM' },
  { id: '2', wallet_id: 'wallet-1', type: 'bet', amount: -20.00, created_at: '2023-10-27 10:44 AM' },
  { id: '3', wallet_id: 'wallet-1', type: 'deposit', amount: 100.00, created_at: '2023-10-26 08:00 PM' },
  { id: '4', wallet_id: 'wallet-1', type: 'win', amount: 12.30, created_at: '2023-10-26 03:20 PM' },
  { id: '5', wallet_id: 'wallet-1', type: 'bet', amount: -5.00, created_at: '2023-10-26 03:19 PM' },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1000);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = (type: 'deposit' | 'win' | 'bet', amount: number) => {
    const newTransaction: Transaction = {
      id: `${Date.now()}`,
      wallet_id: 'wallet-1',
      type,
      amount,
      created_at: new Date().toLocaleString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addToBalance = (amount: number, type: 'deposit' | 'win') => {
    setBalance((prevBalance) => prevBalance + amount);
    addTransaction(type, amount);
  };

  const subtractFromBalance = (amount: number, type: 'bet') => {
    setBalance((prevBalance) => prevBalance - amount);
    addTransaction(type, -amount);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, setBalance, addToBalance, subtractFromBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}