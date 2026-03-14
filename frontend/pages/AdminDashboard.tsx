
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, CreditCard, CheckCircle, XCircle, Save, UserPlus, Newspaper, Zap, Plus, Trash2, CheckSquare, Copy, Trophy
} from 'lucide-react';
import { Currency } from '../types';

interface AdminDashboardProps { store: any; }

const AdminDashboard: React.FC<AdminDashboardProps> = ({ store }) => {
  const { config, setConfig, allUsers, setAllUsers, news, setNews, registerNewUser, tasks, setTasks, getRecursiveDownlineCount, api } = store;
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'stats' | 'users' | 'withdrawals' | 'settings' | 'sim' | 'news' | 'airdrop' | 'tasks'>('stats');
  const [withdrawalView, setWithdrawalView] = useState<'pending' | 'history'>('pending');
  const [formData, setFormData] = useState({ ...config });
  const [newNews, setNewNews] = useState({ title: '', content: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', link: '', rewards: { coin: 0, usd: 0, diamond: 0, speed: 0 } });
  const [simData, setSimData] = useState({ username: 'test_user', telegramId: '100200300', fullName: 'Simulated Referrer', sponsorId: store.user?.telegramId || '' });
  const [activeWithdrawal, setActiveWithdrawal] = useState<any>(null);
  const [withdrawalRemark, setWithdrawalRemark] = useState('');

  // Load admin data from backend on mount
  useEffect(() => {
    if (!api) return;
    // Load users
    api.get('/api/admin/users').then(({ data }: any) => setAllUsers(data)).catch(() => {});
    // Load all withdrawals
    api.get('/api/admin/withdrawals').then(({ data }: any) => setWithdrawals(data)).catch(() => {});
    // Load tasks
    api.get('/api/admin/tasks').then(({ data }: any) => setTasks(data.map((t: any) => ({ id: t._id, ...t })))).catch(() => {});
  }, [api]);

  const leaderboardUsers = useMemo(() => {
    return [...allUsers]
      .sort((a: any, b: any) => (b.balances[Currency.COIN] || 0) - (a.balances[Currency.COIN] || 0))
      .slice(0, 10);
  }, [allUsers]);

  const handleSaveConfig = () => {
    setConfig(formData); // calls backend via store
    alert('Settings saved to backend!');
  };

  const addNews = () => {
    if (!newNews.title || !newNews.content) return;
    const item = { id: 'n_' + Date.now(), ...newNews, timestamp: new Date().toISOString() };
    setNews([item, ...news]);
    setNewNews({ title: '', content: '' });
  };

  const addTask = async () => {
    if (!newTask.title) return alert('Enter task title');
    try {
      const { data } = await api.post('/api/admin/tasks', newTask);
      setTasks([...tasks, { id: data._id, ...data }]);
      setNewTask({ title: '', description: '', link: '', rewards: { coin: 0, usd: 0, diamond: 0, speed: 0 } });
    } catch (e: any) { alert(e.response?.data?.error || 'Error creating task'); }
  };

  const finalizeWithdrawal = async (status: 'APPROVED' | 'REJECTED') => {
    if (!activeWithdrawal) return;
    try {
      await api.patch(`/api/admin/withdrawals/${activeWithdrawal._id || activeWithdrawal.id}`, { status, remarks: withdrawalRemark });
      setWithdrawals((prev: any[]) => prev.map((w: any) =>
        (w._id || w.id) === (activeWithdrawal._id || activeWithdrawal.id) ? { ...w, status, remarks: withdrawalRemark } : w
      ));
      setActiveWithdrawal(null);
      setWithdrawalRemark('');
      alert(`Withdrawal ${status}. ${status === 'REJECTED' ? 'Balance refunded automatically.' : ''}`);
    } catch (e: any) { alert(e.response?.data?.error || 'Error'); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Wallet address copied to clipboard!');
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-indigo-400">ADMIN MASTER</h1>
          <div className="bg-slate-800 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700 uppercase tracking-widest shadow-lg">Root Privileges</div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          <TabBtn active={adminTab === 'stats'} onClick={() => setAdminTab('stats')} icon={<BarChart3 size={16} />} label="Stats" />
          <TabBtn active={adminTab === 'users'} onClick={() => setAdminTab('users')} icon={<Users size={16} />} label="Users" />
          <TabBtn active={adminTab === 'withdrawals'} onClick={() => setAdminTab('withdrawals')} icon={<CreditCard size={16} />} label="Payouts" />
          <TabBtn active={adminTab === 'tasks'} onClick={() => setAdminTab('tasks')} icon={<CheckSquare size={16} />} label="Tasks" />
          <TabBtn active={adminTab === 'news'} onClick={() => setAdminTab('news')} icon={<Newspaper size={16} />} label="News" />
          <TabBtn active={adminTab === 'airdrop'} onClick={() => setAdminTab('airdrop')} icon={<Zap size={16} />} label="Airdrop" />
          <TabBtn active={adminTab === 'settings'} onClick={() => setAdminTab('settings')} icon={<Settings size={16} />} label="Config" />
          <TabBtn active={adminTab === 'sim'} onClick={() => setAdminTab('sim')} icon={<UserPlus size={16} />} label="Simulator" />
      </div>

      {adminTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Live Users" value={allUsers.length} />
                  <StatCard label="Total Coins" value={Math.floor(allUsers.reduce((acc: number, u: any) => acc + (u.balances[Currency.COIN] || 0), 0))} />
                  <StatCard label="Pending Withdrawals" value={withdrawals.filter((w: any) => w.status === 'PENDING').length} />
                  <StatCard label="System USD Pool" value={'$' + allUsers.reduce((acc: number, u: any) => acc + (u.balances[Currency.USD] || 0), 0).toFixed(2)} />
              </div>

              <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-2">
                      <Trophy className="text-yellow-400" size={18} />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Leaderboard (Top 10)</h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] md:text-xs">
                          <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-tighter">
                              <tr>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Entity</th>
                                  <th className="p-3 text-center">Team Size</th>
                                  <th className="p-3 text-right">GYK Coins</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {leaderboardUsers.map((u, index) => (
                                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                                      <td className="p-3">
                                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black ${index === 0 ? 'bg-yellow-500 text-slate-950' : index === 1 ? 'bg-slate-400 text-slate-950' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                              {index + 1}
                                          </span>
                                      </td>
                                      <td className="p-3">
                                          <p className="font-black text-slate-100 group-hover:text-indigo-400 transition-colors">{u.username || 'Citizen'}</p>
                                          <p className="text-[8px] text-slate-500 font-mono">{u.telegramId}</p>
                                      </td>
                                      <td className="p-3 text-center">
                                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                              {getRecursiveDownlineCount(u.telegramId)}
                                          </span>
                                      </td>
                                      <td className="p-3 text-right">
                                          <span className="text-yellow-500 font-black">{u.balances[Currency.COIN].toFixed(2)}</span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </section>
          </div>
      )}

      {adminTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="w-full text-[10px] md:text-[11px] text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold uppercase tracking-tighter">
                      <tr>
                        <th className="p-3">User Details</th>
                        <th className="p-3">Sponsor ID</th>
                        <th className="p-3">Joined (GMT)</th>
                        <th className="p-3">Coins</th>
                        <th className="p-3">USD</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {allUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-3">
                                <p className="font-black text-slate-200">{u.username || 'Anon'}</p>
                                <p className="text-[9px] text-slate-500">{u.telegramId}</p>
                              </td>
                              <td className="p-3 font-mono text-indigo-400">{u.sponsorId || '-'}</td>
                              <td className="p-3 text-slate-500">{new Date(u.joinedAt).toLocaleDateString()}</td>
                              <td className="p-3 text-yellow-500 font-bold">{(u.balances[Currency.COIN] || 0).toFixed(1)}</td>
                              <td className="p-3 text-green-500 font-bold">${(u.balances[Currency.USD] || 0).toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {adminTab === 'tasks' && (
          <div className="flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <h3 className="text-xs font-black uppercase text-indigo-400 mb-4 tracking-widest">Create New Task</h3>
                  <div className="space-y-4">
                    <InputGroup label="Task Title" value={newTask.title} onChange={v => setNewTask({...newTask, title: v})} />
                    <InputGroup label="Instructions" value={newTask.description} onChange={v => setNewTask({...newTask, description: v})} />
                    <InputGroup label="Link (URL)" value={newTask.link} onChange={v => setNewTask({...newTask, link: v})} />
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup type="number" label="Reward Coins" value={newTask.rewards.coin} onChange={v => setNewTask({...newTask, rewards: {...newTask.rewards, coin: Number(v)}})} />
                        <InputGroup type="number" label="Reward USD" value={newTask.rewards.usd} onChange={v => setNewTask({...newTask, rewards: {...newTask.rewards, usd: Number(v)}})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup type="number" label="Reward Diamonds" value={newTask.rewards.diamond} onChange={v => setNewTask({...newTask, rewards: {...newTask.rewards, diamond: Number(v)}})} />
                        <InputGroup type="number" label="Reward Speed (hr)" value={newTask.rewards.speed} onChange={v => setNewTask({...newTask, rewards: {...newTask.rewards, speed: Number(v)}})} />
                    </div>
                    <button onClick={addTask} className="w-full bg-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"><Plus size={18}/> CREATE TASK</button>
                  </div>
              </div>
              <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 ml-1">Existing Tasks</h3>
                  {tasks.map((t: any) => (
                      <div key={t._id || t.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{t.title}</span>
                            <span className="text-[10px] text-indigo-400 font-mono">Rewards: {t.rewards?.coin || 0}C / ${t.rewards?.usd || 0}U / +{t.rewards?.speed || 0}S</span>
                          </div>
                          <button onClick={async () => {
                            try { await api.delete(`/api/admin/tasks/${t._id || t.id}`); setTasks(tasks.filter((x: any) => (x._id || x.id) !== (t._id || t.id))); }
                            catch(e: any) { alert(e.response?.data?.error || 'Error'); }
                          }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {adminTab === 'withdrawals' && (
          <div className="flex flex-col gap-4">
              <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                <button onClick={() => setWithdrawalView('pending')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${withdrawalView === 'pending' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Pending Requests</button>
                <button onClick={() => setWithdrawalView('history')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${withdrawalView === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Full History</button>
              </div>

              {withdrawalView === 'pending' ? (
                <div className="space-y-3">
                  {withdrawals.filter((w: any) => w.status === 'PENDING').length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs italic bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">No active payout requests.</div>
                  ) : (
                    withdrawals.filter((w: any) => w.status === 'PENDING').map((w: any) => (
                        <div key={w._id || w.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-start mb-5">
                                <div className="space-y-1">
                                    <p className="font-black text-white text-xl tracking-tighter">${w.amountUsd} USD</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{w.walletAddress}</p>
                                      <button onClick={() => copyToClipboard(w.walletAddress)} className="text-indigo-400 p-1 hover:bg-indigo-400/10 rounded transition-colors"><Copy size={12}/></button>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold italic">Fee: {w.feeAmount}💎 · @{w.username}</p>
                                </div>
                                <button onClick={() => setActiveWithdrawal(activeWithdrawal?._id === w._id ? null : w)} className="bg-indigo-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20 active:scale-95">MANAGE</button>
                            </div>
                            {activeWithdrawal?._id === w._id && (
                                <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                                    <InputGroup label="Transaction Remark / Hash" value={withdrawalRemark} onChange={setWithdrawalRemark} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => finalizeWithdrawal('APPROVED')} className="bg-green-600 py-3 rounded-xl font-bold text-xs shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"><CheckCircle size={14}/> APPROVE</button>
                                        <button onClick={() => finalizeWithdrawal('REJECTED')} className="bg-red-600 py-3 rounded-xl font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"><XCircle size={14}/> REJECT+REFUND</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-slate-800 text-slate-500 font-bold uppercase tracking-widest">
                      <tr><th className="p-3">Amount</th><th className="p-3">Wallet</th><th className="p-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {withdrawals.filter((w: any) => w.status !== 'PENDING').map((w: any) => (
                        <tr key={w.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-200">${w.amountUsd}</td>
                          <td className="p-3 font-mono text-slate-500 truncate max-w-[100px]">{w.walletAddress}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-black uppercase ${w.status === 'APPROVED' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{w.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
      )}

      {adminTab === 'settings' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings size={18} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Global Ecosystem Configuration</h3>
              </div>
              
              <div className="space-y-5">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Zap size={10}/> Monetization</h4>
                  <InputGroup label="Adsgram Block ID" value={formData.adsgramToken} onChange={v => setFormData({...formData, adsgramToken: v})} />
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><CreditCard size={10}/> Withdrawal Limits & Fees</h4>
                  <div className="grid grid-cols-2 gap-4">
                      <InputGroup type="number" label="Min Limit ($)" value={formData.minWithdrawal} onChange={v => setFormData({...formData, minWithdrawal: Number(v)})} />
                      <InputGroup type="number" label="Max Limit ($)" value={formData.maxWithdrawal} onChange={v => setFormData({...formData, maxWithdrawal: Number(v)})} />
                  </div>
                  <InputGroup type="number" label="Fee per $1 USD (Diamonds)" value={formData.withdrawalFeePerUsd} onChange={v => setFormData({...formData, withdrawalFeePerUsd: Number(v)})} />
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><BarChart3 size={10}/> Mining Rules</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Coin Name" value={formData.coinName} onChange={v => setFormData({...formData, coinName: v})} />
                    <InputGroup type="number" label="Session (Minutes)" value={formData.miningSessionMinutes} onChange={v => setFormData({...formData, miningSessionMinutes: Number(v)})} />
                  </div>
                </section>
              </div>

              <button onClick={handleSaveConfig} className="bg-indigo-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all active:scale-95"><Save size={20}/> UPDATE SYSTEM PARAMETERS</button>
          </div>
      )}

      {adminTab === 'sim' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-2xl">
              <div className="flex flex-col gap-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-indigo-400 tracking-tighter">5-Level Referral Engine Test</h3>
                <p className="text-[10px] text-slate-500 italic">Inject a new user to verify multi-level reward distribution across the upline chain.</p>
              </div>
              
              <div className="space-y-4">
                <InputGroup label="Simulated Username" value={simData.username} onChange={v => setSimData({...simData, username: v})} />
                <InputGroup label="Simulated TG ID" value={simData.telegramId} onChange={v => setSimData({...simData, telegramId: v})} />
                <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20">
                  <InputGroup label="Direct Sponsor TG ID (Upline)" value={simData.sponsorId} onChange={v => setSimData({...simData, sponsorId: v})} />
                  <p className="text-[9px] text-indigo-400/60 mt-2 font-bold uppercase tracking-tighter">* Set this to your own ID to see immediate balance growth.</p>
                </div>
                <button onClick={() => { registerNewUser(simData); alert('Simulation Complete. Check Profile/Admin Users for updated balances across the chain!'); }} className="w-full bg-indigo-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all"><UserPlus size={20}/> INJECT & DISTRIBUTE</button>
              </div>
          </div>
      )}

      {adminTab === 'news' && (
          <div className="flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Publish Announcement</h3>
                  <div className="space-y-4">
                    <InputGroup label="Headline" value={newNews.title} onChange={v => setNewNews({...newNews, title: v})} />
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5 ml-1 tracking-widest">Story Content</label>
                      <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white h-32 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" placeholder="Break the news..." value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} />
                    </div>
                    <button onClick={addNews} className="w-full bg-indigo-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"><Plus size={16}/> PUBLISH BROADCAST</button>
                  </div>
              </div>
              <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 ml-1">Live Feed Items</h3>
                  {news.map((n: any) => (
                      <div key={n.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center group shadow-md hover:border-indigo-500/30 transition-all">
                          <span className="text-xs font-bold truncate flex-1 pr-4 text-slate-200">{n.title}</span>
                          <button onClick={() => setNews(news.filter((x: any) => x.id !== n.id))} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                  ))}
              </div>
          </div>
      )}
      
      {adminTab === 'airdrop' && (
          <div className="bg-slate-900 p-6 border border-slate-800 rounded-2xl flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Zap size={18} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Airdrop Roadmap Editor</h3>
              </div>
              <div className="space-y-4">
                <InputGroup label="Main Campaign Headline" value={formData.airdrop.title} onChange={v => setFormData({...formData, airdrop: {...formData.airdrop, title: v}})} />
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase block ml-1">Roadmap Details</label>
                  <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white h-24 outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" value={formData.airdrop.description} onChange={e => setFormData({...formData, airdrop: {...formData.airdrop, description: e.target.value}})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Active Phase" value={formData.airdrop.phase} onChange={v => setFormData({...formData, airdrop: {...formData.airdrop, phase: v}})} />
                    <InputGroup label="Target TGE Date" value={formData.airdrop.countdown} onChange={v => setFormData({...formData, airdrop: {...formData.airdrop, countdown: v}})} />
                </div>
                <button onClick={handleSaveConfig} className="bg-indigo-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 w-full mt-2">SAVE ROADMAP CONFIG</button>
              </div>
          </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full font-black text-[10px] uppercase transition-all ${active ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'}`}>
        {icon}{label}
    </button>
);

const StatCard: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl border-t-indigo-500/20 group hover:border-indigo-500/50 transition-all"><p className="text-[9px] text-slate-500 font-black uppercase mb-1.5 tracking-wider border-b border-slate-800 pb-1">{label}</p><p className="text-lg font-black text-white">{value}</p></div>
);

const InputGroup: React.FC<{ label: string, value: any, onChange?: (val: string) => void, type?: string }> = ({ label, value, onChange, type = 'text' }) => (
    <div className="w-full"><label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5 ml-1 tracking-widest">{label}</label><input type={type} value={value} onChange={e => onChange?.(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" /></div>
);

export default AdminDashboard;
