
import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { Wallet, ArrowUpRight, History, ShieldCheck, AlertTriangle, CreditCard, ChevronRight, Lock } from 'lucide-react';

interface WalletPageProps {
  store: any;
  onLogs: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ store, onLogs }) => {
  const { user, config, setUser, api } = store;
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [walletInput, setWalletInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const diamondFee = Math.ceil(Number(amount) * (config?.withdrawalFeePerUsd || 1));

  useEffect(() => {
    if (api) {
      api.get('/api/withdrawals/mine').then(({ data }: any) => setWithdrawals(data)).catch(() => {});
    }
  }, [api]);

  const handleSetWallet = async () => {
    if (!walletInput.trim()) return setError('Enter a valid wallet address');
    if (!confirm('⚠️ Wallet address will be LOCKED after saving. Are you sure?')) return;
    try {
      const { data } = await api.patch('/api/users/wallet', { walletAddress: walletInput });
      setUser((prev: any) => ({ ...prev, walletAddress: data.user.walletAddress, walletLocked: true }));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error setting wallet');
    }
  };

  const handleWithdraw = async () => {
    setError('');
    const val = Number(amount);
    if (!val || val <= 0) return setError('Enter a valid amount');
    if (!user?.walletAddress) return setError('Please set your wallet address first');
    
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/withdrawals/request', { amountUsd: val });
      setUser((prev: any) => ({
        ...prev,
        balances: data.user.balances,
        logs: data.user.logs
      }));
      setWithdrawals((prev: any[]) => [data.withdrawal, ...prev]);
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="text-indigo-400" />
            <h1 className="text-2xl font-bold">Wallet</h1>
          </div>
          <button onClick={onLogs} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-400/10 px-3 py-2 rounded-lg border border-indigo-400/20 shadow-md">
            View All Logs <ChevronRight size={12}/>
          </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
          <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Available for Payout</p>
              <h2 className="text-4xl font-black">${(user?.balances?.[Currency.USD] || 0).toFixed(4)} USD</h2>
              <div className="flex gap-4 mt-6">
                  <div>
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Speed</p>
                      <p className="text-sm font-bold">{(user?.miningSpeed || 0).toFixed(2)}/hr</p>
                  </div>
                  <div>
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Diamonds (Fees)</p>
                      <p className="text-sm font-bold">{user?.balances?.[Currency.DIAMOND] || 0} 💎</p>
                  </div>
              </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
              <Wallet size={120} />
          </div>
      </div>

      {/* Wallet Address Section */}
      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Lock size={16} className="text-indigo-400" /> Wallet Address
        </h3>
        {user?.walletAddress ? (
          <div className="flex items-start gap-2 bg-slate-800 rounded-xl px-4 py-3">
            <Lock size={14} className="text-green-400 mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-green-400 break-all">{user.walletAddress}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-amber-400 flex items-center gap-1">
              <AlertTriangle size={11} /> Set once and locked. Contact admin to change.
            </p>
            <input
              type="text"
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              placeholder="Enter your wallet address..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSetWallet}
              className="bg-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all"
            >
              Set & Lock Wallet
            </button>
          </div>
        )}
      </section>

      {/* Withdrawal Form */}
      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ArrowUpRight className="text-green-500" size={20} />
              Request Withdrawal
          </h3>
          
          <div className="flex flex-col gap-4">
              <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount ($ USD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min $${config?.minWithdrawal || 1} – Max $${config?.maxWithdrawal || 100}`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  {amount && (
                      <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">
                          Diamond Fee: <span className="text-blue-400">{diamondFee} 💎</span>
                          {' '}(You have: {user?.balances?.[Currency.DIAMOND] || 0}💎)
                      </p>
                  )}
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-pulse"><AlertTriangle size={14}/> {error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold rounded-lg flex items-center gap-2"><ShieldCheck size={14}/> Withdrawal requested successfully!</div>}

              <button 
                onClick={handleWithdraw}
                disabled={submitting || !user?.walletAddress}
                className="bg-indigo-600 py-4 rounded-xl font-bold mt-2 hover:bg-indigo-500 transition-all text-white shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-60"
              >
                  {submitting ? 'Processing...' : 'CONFIRM PAYOUT'}
              </button>
          </div>
      </section>

      {/* Withdrawal History */}
      <section>
          <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Withdrawal Status</h3>
              <History size={16} className="text-slate-500" />
          </div>
          <div className="flex flex-col gap-3">
              {withdrawals.length === 0 ? (
                  <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 shadow-inner">
                      <p className="text-slate-600 text-sm">No withdrawal requests yet.</p>
                  </div>
              ) : (
                  withdrawals.map((w: any) => (
                      <div key={w._id || w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="text-sm font-black text-slate-100">${w.amountUsd} USD</p>
                                  <p className="text-[10px] text-slate-500 mt-1">{new Date(w.timestamp || w.createdAt).toLocaleString()}</p>
                              </div>
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                                  w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                  w.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                  {w.status}
                              </span>
                          </div>
                          {w.remarks && (
                            <div className="mt-3 pt-2 border-t border-slate-800/50">
                                <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Remarks</p>
                                <p className="text-[10px] text-slate-400 font-medium italic">{w.remarks}</p>
                            </div>
                          )}
                      </div>
                  ))
              )}
          </div>
      </section>
    </div>
  );
};

export default WalletPage;
