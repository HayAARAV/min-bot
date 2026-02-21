
import { useState, useEffect, useCallback } from 'react';
import { User, AppConfig, Currency, Task, Withdrawal, News, TransactionLog } from '../types';
import { DEFAULT_CONFIG, MOCK_TASKS, MOCK_NEWS } from '../constants';

export const getGMTTime = () => new Date().toISOString();
export const getGMTDay = () => new Date().toISOString().split('T')[0];

const addLog = (user: User, currency: Currency, amount: number, type: 'CREDIT' | 'DEBIT', desc: string): User => {
  const newLog: TransactionLog = {
    id: 'L_' + Math.random().toString(36).substr(2, 9),
    currency,
    amount,
    type,
    description: desc,
    timestamp: getGMTTime()
  };
  return {
    ...user,
    logs: [newLog, ...(user.logs || [])].slice(0, 50)
  };
};

export const useAppStore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [news, setNews] = useState<News[]>(MOCK_NEWS);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('gyk_user');
    const storedConfig = localStorage.getItem('gyk_config');
    const storedTasks = localStorage.getItem('gyk_tasks');
    const storedAllUsers = localStorage.getItem('gyk_all_users');
    const storedWithdrawals = localStorage.getItem('gyk_withdrawals');
    const storedNews = localStorage.getItem('gyk_news');

    if (storedConfig) setConfig(JSON.parse(storedConfig));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedWithdrawals) setWithdrawals(JSON.parse(storedWithdrawals));
    if (storedNews) setNews(JSON.parse(storedNews));
    
    const usersList: User[] = storedAllUsers ? JSON.parse(storedAllUsers) : [];
    setAllUsers(usersList);

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const latest = usersList.find(u => u.id === parsed.id || u.telegramId === parsed.telegramId);
      setUser(latest || parsed);
    } else {
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        telegramId: '12345678',
        username: 'cryptominer_demo',
        fullName: 'Demo Miner',
        ipAddress: '127.0.0.1',
        sponsorId: null,
        joinedAt: getGMTTime(),
        balances: { [Currency.COIN]: DEFAULT_CONFIG.welcomeBonus.coin, [Currency.USD]: 0, [Currency.DIAMOND]: 0, [Currency.STAR]: 0 },
        miningSpeed: DEFAULT_CONFIG.welcomeBonus.speed,
        miningSession: { startTime: null, isActive: false, lastMinedAmount: 0 },
        stats: { totalReferrals: 0, totalTeamSize: 0, dailyLogins: 0, tasksCompleted: 0 },
        lastDailyLogin: null,
        logs: []
      };
      const initialUser = addLog(newUser, Currency.COIN, DEFAULT_CONFIG.welcomeBonus.coin, 'CREDIT', 'Welcome Bonus');
      setUser(initialUser);
      const updatedUsers = [...usersList, initialUser];
      setAllUsers(updatedUsers);
      localStorage.setItem('gyk_all_users', JSON.stringify(updatedUsers));
      localStorage.setItem('gyk_user', JSON.stringify(initialUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gyk_user', JSON.stringify(user));
      setAllUsers(prev => prev.map(u => u.id === user.id ? user : u));
    }
    localStorage.setItem('gyk_config', JSON.stringify(config));
    localStorage.setItem('gyk_tasks', JSON.stringify(tasks));
    localStorage.setItem('gyk_all_users', JSON.stringify(allUsers));
    localStorage.setItem('gyk_withdrawals', JSON.stringify(withdrawals));
    localStorage.setItem('gyk_news', JSON.stringify(news));
  }, [user, config, tasks, allUsers, withdrawals, news]);

  const startMining = useCallback(() => {
    if (!user || user.miningSession.isActive) return;
    setUser(prev => prev ? ({ ...prev, miningSession: { ...prev.miningSession, isActive: true, startTime: getGMTTime() } }) : null);
  }, [user]);

  const claimAndRestartMining = useCallback(() => {
    if (!user) return;
    const now = new Date();
    const start = new Date(user.miningSession.startTime || now);
    const diffMs = now.getTime() - start.getTime();
    
    // Cap mining duration to configured session time
    const maxMs = config.miningSessionMinutes * 60 * 1000;
    const effectiveMs = Math.min(diffMs, maxMs);
    const diffHours = effectiveMs / 3600000;
    const mined = diffHours * user.miningSpeed;
    
    setUser(prev => {
      if (!prev) return null;
      let updated = {
        ...prev,
        balances: { ...prev.balances, [Currency.COIN]: prev.balances[Currency.COIN] + mined },
        miningSession: { startTime: getGMTTime(), isActive: true, lastMinedAmount: mined }
      };
      return addLog(updated, Currency.COIN, mined, 'CREDIT', 'Mining Claim');
    });
  }, [user, config.miningSessionMinutes]);

  const claimDailyLogin = useCallback(() => {
    if (!user) return;
    const today = getGMTDay();
    if (user.lastDailyLogin === today) return;
    setUser(prev => {
      if (!prev) return null;
      let updated = {
        ...prev,
        balances: { ...prev.balances, [Currency.STAR]: prev.balances[Currency.STAR] + 1 },
        stats: { ...prev.stats, dailyLogins: prev.stats.dailyLogins + 1 },
        lastDailyLogin: today
      };
      return addLog(updated, Currency.STAR, 1, 'CREDIT', 'Daily Login Bonus');
    });
  }, [user]);

  const completeTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;
    setUser(prev => {
      if (!prev) return null;
      let updated = { ...prev };
      const newBalances = { ...updated.balances };
      if (task.rewards.coin) {
        newBalances[Currency.COIN] += task.rewards.coin;
        updated = addLog(updated, Currency.COIN, task.rewards.coin, 'CREDIT', `Task: ${task.title}`);
      }
      if (task.rewards.usd) {
        newBalances[Currency.USD] += task.rewards.usd;
        updated = addLog(updated, Currency.USD, task.rewards.usd, 'CREDIT', `Task: ${task.title}`);
      }
      if (task.rewards.diamond) {
        newBalances[Currency.DIAMOND] += task.rewards.diamond;
        updated = addLog(updated, Currency.DIAMOND, task.rewards.diamond, 'CREDIT', `Task: ${task.title}`);
      }
      if (task.rewards.star) {
        newBalances[Currency.STAR] += task.rewards.star;
        updated = addLog(updated, Currency.STAR, task.rewards.star, 'CREDIT', `Task: ${task.title}`);
      }
      updated.balances = newBalances;
      updated.miningSpeed += (task.rewards.speed || 0);
      updated.stats = { ...updated.stats, tasksCompleted: updated.stats.tasksCompleted + 1 };
      return updated;
    });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t));
  }, [tasks, user]);

  const getRecursiveDownlineCount = (userId: string, depth = 0): number => {
    if (depth >= 10) return 0;
    const direct = allUsers.filter(u => u.sponsorId === userId);
    let count = direct.length;
    for (const d of direct) {
      count += getRecursiveDownlineCount(d.telegramId, depth + 1);
    }
    return count;
  };

  const registerNewUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      telegramId: userData.telegramId || '',
      username: userData.username || '',
      fullName: userData.fullName || '',
      ipAddress: '127.0.0.1',
      sponsorId: userData.sponsorId || null,
      joinedAt: getGMTTime(),
      balances: { [Currency.COIN]: config.welcomeBonus.coin, [Currency.USD]: 0, [Currency.DIAMOND]: 0, [Currency.STAR]: 0 },
      miningSpeed: config.welcomeBonus.speed,
      miningSession: { startTime: null, isActive: false, lastMinedAmount: 0 },
      stats: { totalReferrals: 0, totalTeamSize: 0, dailyLogins: 0, tasksCompleted: 0 },
      lastDailyLogin: null,
      logs: []
    };

    setAllUsers(prev => {
      let updatedUsers = [...prev, newUser];
      let currentSponsorId = newUser.sponsorId;

      for (let level = 1; level <= 5; level++) {
        if (!currentSponsorId) break;
        const sponsorIdx = updatedUsers.findIndex(u => u.telegramId === currentSponsorId || u.id === currentSponsorId);
        if (sponsorIdx === -1) break;

        const reward = level === 1 ? config.referralRewards.lev1 : config.referralRewards.lev2to5;
        let sponsor = { ...updatedUsers[sponsorIdx] };
        
        sponsor.balances = {
          ...sponsor.balances,
          [Currency.COIN]: (sponsor.balances[Currency.COIN] || 0) + reward.coin,
          [Currency.USD]: (sponsor.balances[Currency.USD] || 0) + reward.usd,
          [Currency.DIAMOND]: (sponsor.balances[Currency.DIAMOND] || 0) + reward.diamond,
        };
        sponsor.miningSpeed += reward.speed;
        sponsor.stats = { 
          ...sponsor.stats, 
          totalTeamSize: sponsor.stats.totalTeamSize + 1,
          totalReferrals: level === 1 ? sponsor.stats.totalReferrals + 1 : sponsor.stats.totalReferrals
        };

        if (reward.coin) sponsor = addLog(sponsor, Currency.COIN, reward.coin, 'CREDIT', `Ref Level ${level}: ${newUser.username}`);
        if (reward.usd) sponsor = addLog(sponsor, Currency.USD, reward.usd, 'CREDIT', `Ref Level ${level}: ${newUser.username}`);
        if (reward.diamond) sponsor = addLog(sponsor, Currency.DIAMOND, reward.diamond, 'CREDIT', `Ref Level ${level}: ${newUser.username}`);

        updatedUsers[sponsorIdx] = sponsor;

        if (user && sponsor.id === user.id) {
          setTimeout(() => setUser(sponsor), 0);
        }

        currentSponsorId = sponsor.sponsorId;
      }

      return updatedUsers;
    });

    return newUser;
  };

  return {
    user, setUser, config, setConfig, tasks, setTasks, withdrawals, setWithdrawals,
    news, setNews, allUsers, setAllUsers, startMining, claimAndRestartMining,
    claimDailyLogin, completeTask, registerNewUser, getRecursiveDownlineCount
  };
};
