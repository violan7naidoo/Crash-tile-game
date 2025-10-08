export type User = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'player' | 'admin';
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
};

export type Transaction = {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'bet' | 'win';
  amount: number;
  created_at: string;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Hardcore';

export const difficultySettings = {
  Easy: { lanes: 30, multiplier: 1.1, bustChance: 0.7 },
  Medium: { lanes: 25, multiplier: 1.5, bustChance: 1.0 },
  Hard: { lanes: 20, multiplier: 2.0, bustChance: 1.5 },
  Hardcore: { lanes: 15, multiplier: 3.0, bustChance: 2.0 },
};

export type GameRound = {
  id: string;
  user_id: string;
  bet_amount: number;
  difficulty: Difficulty;
  crash_multiplier: number;
  cashed_out_at: number | null;
  winnings: number;
  status: 'playing' | 'busted' | 'won' | 'snackpot';
  created_at: string;
};

export type GameConfig = {
  key: 'RTP';
  value: string;
};

export type GameStatus = 'idle' | 'playing' | 'busted';

export type GameState = {
  status: GameStatus;
  betAmount: number;
  difficulty: Difficulty;
  monkeyPosition: number;
  currentMultiplier: number;
  gameId: string | null;
};
