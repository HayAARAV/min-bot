
import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  coinName: 'GYK Coin',
  coinLogo: 'https://picsum.photos/seed/gyk/200/200',
  welcomeBonus: {
    coin: 50,
    speed: 1
  },
  referralRewards: {
    lev1: { coin: 50, speed: 0.1, usd: 0.02, diamond: 1 },
    lev2to5: { coin: 50, speed: 0.1, usd: 0.02, diamond: 1 }
  },
  miningSessionMinutes: 5,
  minWithdrawal: 1,
  maxWithdrawal: 100,
  withdrawalFeePerUsd: 1,
  adsgramToken: '9089b9fa76cc45a7abc5f329f8d7aaff',
  telegramBotToken: 'xxxyyyzzz',
  socialLinks: {
    telegram: 'https://t.me/gyk_mining',
    facebook: 'https://facebook.com/gyk_mining',
    youtube: 'https://youtube.com/@gyk_mining',
    twitter: 'https://x.com/gyk_mining'
  },
  airdrop: {
    title: 'AIRDROP LIVE SOON',
    description: 'We are currently in the mining phase. Your GYK Coins will be converted to tradable tokens upon listing.',
    phase: 'Pre-Listing',
    countdown: 'Q4 2024',
    items: [
      { label: 'Minimum 500 Coins', isCompleted: true },
      { label: 'At least 5 Referrals', isCompleted: false },
      { label: 'Connect TON Wallet', isCompleted: true },
      { label: 'Hold 10+ Stars', isCompleted: false }
    ]
  }
};

export const MOCK_TASKS = [
  {
    id: 't1',
    title: 'Subscribe to YouTube',
    description: 'Watch our latest video and subscribe.',
    link: 'https://youtube.com',
    rewards: { coin: 100, diamond: 5 }
  },
  {
    id: 't2',
    title: 'Follow on X',
    description: 'Join our X community for updates.',
    link: 'https://x.com',
    rewards: { usd: 0.5, speed: 0.05 }
  }
];

export const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Major Listing Update',
    content: 'We are excited to announce our upcoming listing on major exchanges! Stay tuned for more details.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Referral Contest',
    content: 'Invite your friends and win up to 1000 USD in TON. Top 10 referrers win extra rewards.',
    timestamp: new Date().toISOString()
  }
];
