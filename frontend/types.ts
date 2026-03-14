
export enum Currency {
  COIN = 'COIN',
  USD = 'USD',
  DIAMOND = 'DIAMOND',
  STAR = 'STAR'
}

export interface TransactionLog {
  id: string;
  currency: Currency;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  telegramId: string;
  username: string;
  fullName: string;
  ipAddress: string;
  sponsorId: string | null;
  joinedAt: string; // ISO String (GMT)
  balances: {
    [Currency.COIN]: number;
    [Currency.USD]: number;
    [Currency.DIAMOND]: number;
    [Currency.STAR]: number;
  };
  miningSpeed: number; // coins/hour
  miningSession: {
    startTime: string | null; // ISO String (GMT)
    isActive: boolean;
    lastMinedAmount: number;
  };
  stats: {
    totalReferrals: number;
    totalTeamSize: number;
    dailyLogins: number;
    tasksCompleted: number;
  };
  lastDailyLogin: string | null; // YYYY-MM-DD
  logs: TransactionLog[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  link: string;
  rewards: {
    coin?: number;
    speed?: number;
    usd?: number;
    diamond?: number;
    star?: number;
  };
  isCompleted?: boolean;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amountUsd: number;
  feeAmount: number; // in diamonds
  walletAddress: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  remarks: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface AirdropEligibility {
  label: string;
  isCompleted: boolean;
}

export interface AirdropConfig {
  title: string;
  description: string;
  phase: string;
  countdown: string;
  items: AirdropEligibility[];
}

export interface AppConfig {
  coinName: string;
  coinLogo: string;
  welcomeBonus: {
    coin: number;
    speed: number;
  };
  referralRewards: {
    lev1: { coin: number; speed: number; usd: number; diamond: number };
    lev2to5: { coin: number; speed: number; usd: number; diamond: number };
  };
  miningSessionMinutes: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFeePerUsd: number; // in diamonds
  adsgramToken: string;
  telegramBotToken: string;
  socialLinks: {
    telegram: string;
    facebook: string;
    youtube: string;
    twitter: string;
  };
  airdrop: AirdropConfig;
}
