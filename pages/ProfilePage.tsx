
import React, { useMemo } from 'react';
import { Currency } from '../types';
import { User, Copy, Users, Calendar, Award, ShieldCheck, Share2, TrendingUp } from 'lucide-react';

interface ProfilePageProps {
  store: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ store }) => {
  const { user, config, allUsers } = store;

  const copyRefLink = () => {
      const link = `https://t.me/GykMiningBot?start=${user.telegramId}`;
      navigator.clipboard.writeText(link);
      alert('Referral link copied!');
  };

  const downline = useMemo(() => {
    return allUsers
      .filter((u: any) => u.sponsorId === user.telegramId || u.sponsorId === user.id)
      .sort((a: any, b: any) => (b.balances[Currency.COIN] + b.balances[Currency.USD]) - (a.balances[Currency.COIN] + a.balances[Currency.USD]))
      .slice(0, 5);
  }, [allUsers, user]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-indigo-500 shadow-xl shadow-indigo-500/20">
              <User size={32} className="text-indigo-400" />
          </div>
          <div>
              <h1 className="text-xl font-bold">{user.fullName}</h1>
              <p className="text-slate-400 text-xs font-mono">{user.telegramId}</p>
          </div>
          <div className="ml-auto">
              <div className="bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Verified</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
          <StatBox label="Referrals" value={user.stats.totalReferrals} icon={<Users size={14} />} />
          <StatBox label="Logins" value={user.stats.dailyLogins} icon={<Calendar size={14} />} />
          <StatBox label="Tasks" value={user.stats.tasksCompleted} icon={<Award size={14} />} />
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          <div className="p-4 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inventory</h3>
          </div>
          <div className="grid grid-cols-2">
              <BalanceItem label="GYK Tokens" value={user.balances[Currency.COIN].toFixed(2)} color="text-yellow-400" />
              <BalanceItem label="USD Balance" value={user.balances[Currency.USD].toFixed(2)} color="text-green-400" />
              <BalanceItem label="Diamonds" value={user.balances[Currency.DIAMOND]} color="text-blue-400" />
              <BalanceItem label="Stars" value={user.balances[Currency.STAR]} color="text-purple-400" />
          </div>
      </section>

      <section>
          <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-indigo-400" size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Top 5 Downline</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                      <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Coins</th>
                          <th className="p-3">USD</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {downline.length === 0 ? (
                          <tr><td colSpan={3} className="p-6 text-center text-slate-600 italic">No referrals yet. Share your link!</td></tr>
                      ) : (
                          downline.map((u: any) => (
                              <tr key={u.id}>
                                  <td className="p-3 font-bold text-slate-200">{u.username || 'Anon'}</td>
                                  <td className="p-3 text-yellow-500">{u.balances[Currency.COIN].toFixed(1)}</td>
                                  <td className="p-3 text-green-500">${u.balances[Currency.USD].toFixed(2)}</td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </section>

      <section className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Share2 className="text-indigo-400" size={20} />
              Invite & Earn
          </h3>
          <div className="flex gap-2">
              <div className="flex-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800 font-mono text-[11px] truncate text-indigo-300">
                  https://t.me/GykMiningBot?start={user.telegramId}
              </div>
              <button onClick={copyRefLink} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30">
                  <Copy size={18} />
              </button>
          </div>
      </section>

      {/* MLM Rewards Table */}
      <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">MLM Rewards (5 Levels)</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-[10px] md:text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-bold">
                      <tr>
                          <th className="p-3">Level</th>
                          <th className="p-3">Coin</th>
                          <th className="p-3">USD</th>
                          <th className="p-3">Speed</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      <tr>
                          <td className="p-3 font-bold text-indigo-400">Level 1</td>
                          <td className="p-3">+{config.referralRewards.lev1.coin}</td>
                          <td className="p-3 text-green-400">${config.referralRewards.lev1.usd}</td>
                          <td className="p-3 text-orange-400">+{config.referralRewards.lev1.speed}</td>
                      </tr>
                      {[2, 3, 4, 5].map(lvl => (
                          <tr key={lvl}>
                              <td className="p-3 text-slate-400">Level {lvl}</td>
                              <td className="p-3">+{config.referralRewards.lev2to5.coin}</td>
                              <td className="p-3 text-green-400">${config.referralRewards.lev2to5.usd}</td>
                              <td className="p-3 text-orange-400">+{config.referralRewards.lev2to5.speed}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </section>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-md">
        <div className="text-indigo-400 mb-1">{icon}</div>
        <p className="text-sm font-black text-white">{value}</p>
        <p className="text-[9px] text-slate-500 uppercase font-bold">{label}</p>
    </div>
);

const BalanceItem: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => (
    <div className="p-4 border-r border-b border-slate-800 last:border-r-0">
        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">{label}</p>
        <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
);

export default ProfilePage;
