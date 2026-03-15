
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, AppConfig, Currency, Task, Withdrawal, News, TransactionLog } from '../types';
import { DEFAULT_CONFIG, MOCK_TASKS, MOCK_NEWS } from '../constants';
import axios from 'axios';

export const getGMTTime = () => new Date().toISOString();
export const getGMTDay = () => new Date().toISOString().split('T')[0];

// ── API client ─────────────────────────────────────────────────────────────
const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '';
const ADMIN_SECRET = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_SECRET) || 'gyk_admin_secret_2024';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gyk_token');
  if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
  cfg.headers!['x-admin-secret'] = ADMIN_SECRET;
  return cfg;
});

// ── Helper ─────────────────────────────────────────────────────────────────
const tg = (window as any).Telegram?.WebApp;

// ── Store ──────────────────────────────────────────────────────────────────
export const useAppStore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfigState] = useState<AppConfig>(DEFAULT_CONFIG);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [news, setNews] = useState<News[]>(MOCK_NEWS);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Auth on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        if (tg) { tg.ready(); tg.expand(); }

        const initData = tg?.initData || '';
        const startParam = tg?.initDataUnsafe?.start_param || '';
        const sponsorId = startParam.startsWith('ref_') ? startParam.replace('ref_', '') : null;

        const stored = localStorage.getItem('gyk_token');

        if (stored) {
          try {
            // Try to use stored token
            const { data } = await api.get('/api/users/me');
            setUser(mapServerUser(data));
          } catch (tokenErr: any) {
            // Token is bad/expired — clear it and re-auth
            console.warn('Stored token invalid, re-authenticating...');
            localStorage.removeItem('gyk_token');
            const { data } = await api.post('/api/auth/telegram', {
              initData: initData || 'dev_mode',
              sponsorId
            });
            localStorage.setItem('gyk_token', data.token);
            setUser(mapServerUser(data.user));
          }
        } else {
          // No token — authenticate via Telegram or dev mode
          const { data } = await api.post('/api/auth/telegram', {
            initData: initData || 'dev_mode',
            sponsorId
          });
          localStorage.setItem('gyk_token', data.token);
          setUser(mapServerUser(data.user));
        }

        // Load config
        const { data: cfgData } = await api.get('/api/config');
        setConfigState(mapServerConfig(cfgData));

        // Load tasks
        await refreshTasks();

        // Load withdrawals
        const { data: wData } = await api.get('/api/withdrawals/mine');
        setWithdrawals(wData);

      } catch (err: any) {
        console.error('Init error:', err?.response?.data || err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/me');
      setUser(mapServerUser(data));
    } catch {}
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.map((t: any) => ({
        id: t._id, title: t.title, description: t.description, link: t.link,
        rewards: t.rewards, isCompleted: t.isCompleted
      })));
    } catch {}
  }, []);

  // ── Mining ───────────────────────────────────────────────────────────────
  const startMining = useCallback(async () => {
    try {
      const { data } = await api.post('/api/mining/start');
      setUser(prev => prev ? { ...prev, miningSession: {
        isActive: data.miningSession.isActive,
        startTime: data.miningSession.startTime,
        lastMinedAmount: prev.miningSession.lastMinedAmount
      }} : null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error starting mining');
    }
  }, []);

  const claimAndRestartMining = useCallback(async () => {
    try {
      const { data } = await api.post('/api/mining/claim');
      setUser(mapServerUser(data.user));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error claiming');
    }
  }, []);

  // ── Daily Login ──────────────────────────────────────────────────────────
  const claimDailyLogin = useCallback(async () => {
    try {
      const { data } = await api.post('/api/mining/daily-login');
      setUser(mapServerUser(data.user));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Already claimed today');
    }
  }, []);

  // ── Tasks ────────────────────────────────────────────────────────────────
  const completeTask = useCallback(async (taskId: string) => {
    try {
      const { data } = await api.post(`/api/tasks/${taskId}/complete`);
      setUser(mapServerUser(data.user));
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error completing task');
    }
  }, []);

  // ── Referral tree (used by ProfilePage) ─────────────────────────────────
  const getRecursiveDownlineCount = useCallback((_userId: string) => {
    // Returned as a numeric placeholder; full tree available via /api/users/referrals
    return user?.stats?.totalTeamSize || 0;
  }, [user]);

  // ── Admin helpers (proxy to backend) ────────────────────────────────────
  const setConfig = useCallback(async (newConfig: AppConfig) => {
    try {
      const payload = mapLocalConfigToServer(newConfig);
      await api.patch('/api/admin/config', payload);
      setConfigState(newConfig);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving config');
    }
  }, []);

  const registerNewUser = useCallback(async (userData: any) => {
    // Simulate a referral join via backend (used in admin simulator tab)
    try {
      const { data } = await api.post('/api/auth/telegram', {
        initData: 'dev_mode',
        sponsorId: userData.sponsorId,
        _override: { telegramId: userData.telegramId, username: userData.username, fullName: userData.fullName }
      });
      await refreshUser();
      return mapServerUser(data.user);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Sim error');
    }
  }, [refreshUser]);

  // Load allUsers for admin panel
  const loadAllUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      setAllUsers(data.map(mapServerUser));
    } catch {}
  }, []);

  // Load withdrawals for admin panel
  const loadAllWithdrawals = useCallback(async (status?: string) => {
    try {
      const url = status ? `/api/admin/withdrawals?status=${status}` : '/api/admin/withdrawals';
      const { data } = await api.get(url);
      setWithdrawals(data);
    } catch {}
  }, []);

  return {
    user, setUser, config, setConfig, tasks, setTasks, withdrawals, setWithdrawals,
    news, setNews, allUsers, setAllUsers, loading,
    startMining, claimAndRestartMining, claimDailyLogin, completeTask,
    registerNewUser, getRecursiveDownlineCount,
    refreshUser, refreshTasks, loadAllUsers, loadAllWithdrawals,
    api // expose api for AdminDashboard direct calls
  };
};

// ── Mappers ────────────────────────────────────────────────────────────────
function mapServerUser(u: any): User {
  return {
    id: u._id || u.id || u.telegramId,
    telegramId: u.telegramId || '',
    username: u.username || '',
    fullName: u.fullName || '',
    ipAddress: '',
    sponsorId: u.sponsorId || null,
    joinedAt: u.joinedAt || u.createdAt || getGMTTime(),
    balances: {
      [Currency.COIN]: u.balances?.COIN || 0,
      [Currency.USD]: u.balances?.USD || 0,
      [Currency.DIAMOND]: u.balances?.DIAMOND || 0,
      [Currency.STAR]: u.balances?.STAR || 0,
    },
    miningSpeed: u.miningSpeed || 1,
    miningSession: {
      startTime: u.miningSession?.startTime || null,
      isActive: u.miningSession?.isActive || false,
      lastMinedAmount: u.miningSession?.lastMinedAmount || 0,
    },
    stats: {
      totalReferrals: u.stats?.totalReferrals || 0,
      totalTeamSize: u.stats?.totalTeamSize || 0,
      dailyLogins: u.stats?.dailyLogins || 0,
      tasksCompleted: u.stats?.tasksCompleted || 0,
    },
    lastDailyLogin: u.lastDailyLogin || null,
    logs: (u.logs || []).map((l: any): TransactionLog => ({
      id: l._id || Math.random().toString(),
      currency: l.currency as Currency,
      amount: l.amount,
      type: l.type,
      description: l.description,
      timestamp: typeof l.timestamp === 'string' ? l.timestamp : new Date(l.timestamp).toISOString()
    })),
  };
}

function mapServerConfig(c: any): AppConfig {
  return {
    coinName: c.coinName || 'GYK Coin',
    coinLogo: c.coinLogo || c.miningPicture || 'https://picsum.photos/seed/gyk/200/200',
    welcomeBonus: { coin: c.welcomeBonus?.coin || 50, speed: c.welcomeBonus?.speed || 1 },
    referralRewards: {
      lev1: c.referralRewards?.lev1 || { coin: 50, speed: 0.1, usd: 0.02, diamond: 1 },
      lev2to5: c.referralRewards?.lev2 || { coin: 30, speed: 0.05, usd: 0.01, diamond: 0 },
    },
    miningSessionMinutes: c.miningSessionMinutes || 480,
    minWithdrawal: c.minWithdrawal || 1,
    maxWithdrawal: c.maxWithdrawal || 100,
    withdrawalFeePerUsd: c.withdrawalFeePerUsd || 1,
    adsgramToken: c.adsgramToken || '',
    telegramBotToken: '',
    socialLinks: c.socialLinks || { telegram: '', facebook: '', youtube: '', twitter: '' },
    airdrop: c.airdrop || {
      title: 'AIRDROP LIVE SOON', description: '', phase: 'Pre-Listing',
      countdown: 'Q4 2025', items: []
    },
  };
}

function mapLocalConfigToServer(c: AppConfig) {
  return {
    coinName: c.coinName,
    miningPicture: c.coinLogo,
    welcomeBonus: c.welcomeBonus,
    referralRewards: {
      lev1: c.referralRewards.lev1,
      lev2: c.referralRewards.lev2to5,
      lev3: c.referralRewards.lev2to5,
      lev4: c.referralRewards.lev2to5,
      lev5: c.referralRewards.lev2to5,
    },
    miningSessionMinutes: c.miningSessionMinutes,
    minWithdrawal: c.minWithdrawal,
    maxWithdrawal: c.maxWithdrawal,
    withdrawalFeePerUsd: c.withdrawalFeePerUsd,
    adsgramToken: c.adsgramToken,
    socialLinks: c.socialLinks,
    airdrop: c.airdrop,
  };
}
