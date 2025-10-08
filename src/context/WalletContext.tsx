'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  balance: number;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1000);

  const addToBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };

  const subtractFromBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };

  return (
    <WalletContext.Provider value={{ balance, setBalance, addToBalance, subtractFromBalance }}>
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
