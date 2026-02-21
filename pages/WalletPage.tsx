
import React, { useState } from 'react';
import { Currency } from '../types';
import { Wallet, ArrowUpRight, History, ShieldCheck, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react';

interface WalletPageProps {
  store: any;
  onLogs: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ store, onLogs }) => {
  const { user, config, withdrawals, setWithdrawals, setUser } = store;
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const diamondFee = Number(amount) * config.withdrawalFeePerUsd;

  const handleWithdraw = () => {
    setError('');
    const val = Number(amount);

    if (val < config.minWithdrawal || val > config.maxWithdrawal) {
      setError(`Withdrawal must be between ${config.minWithdrawal} and ${config.maxWithdrawal} USD`);
      return;
    }
    if (user.balances[Currency.USD] < val) {
      setError('Insufficient USD balance');
      return;
    }
    if (user.balances[Currency.DIAMOND] < diamondFee) {
      setError(`Insufficient Diamonds. Fee is ${diamondFee} Diamonds.`);
      return;
    }
    if (!address.startsWith('U')) {
      setError('Please enter a valid TON wallet address.');
      return;
    }

    const newWithdrawal = {
      id: 'W_' + Date.now(),
      userId: user.id,
      amountUsd: val,
      feeAmount: diamondFee,
      walletAddress: address,
      status: 'PENDING' as const,
      timestamp: new Date().toISOString(),
      remarks: 'Awaiting admin processing'
    };

    setWithdrawals([newWithdrawal, ...withdrawals]);
    
    // Updated logic: Create new logs for withdrawal
    const usdLog = { id: 'L_W_U_'+Date.now(), currency: Currency.USD, amount: val, type: 'DEBIT', description: 'Withdrawal Request', timestamp: new Date().toISOString() };
    const diamondLog = { id: 'L_W_D_'+Date.now(), currency: Currency.DIAMOND, amount: diamondFee, type: 'DEBIT', description: 'Withdrawal Fee', timestamp: new Date().toISOString() };

    setUser((prev: any) => ({
      ...prev,
      balances: {
        ...prev.balances,
        [Currency.USD]: prev.balances[Currency.USD] - val,
        [Currency.DIAMOND]: prev.balances[Currency.DIAMOND] - diamondFee
      },
      logs: [usdLog, diamondLog, ...(prev.logs || [])].slice(0, 50)
    }));

    setSuccess(true);
    setAmount('');
    setAddress('');
    setTimeout(() => setSuccess(false), 5000);
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

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
          <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Available for Payout</p>
              <h2 className="text-4xl font-black">${user.balances[Currency.USD].toFixed(2)} USD</h2>
              <div className="flex gap-4 mt-6">
                  <div>
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Rate</p>
                      <p className="text-sm font-bold">{user.miningSpeed.toFixed(2)}/hr</p>
                  </div>
                  <div>
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Diamonds (Fees)</p>
                      <p className="text-sm font-bold">{user.balances[Currency.DIAMOND]} 💎</p>
                  </div>
              </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
              <Wallet size={120} />
          </div>
      </div>

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
                    placeholder={`Min $${config.minWithdrawal}`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  {amount && (
                      <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">
                          Required Fee: <span className="text-blue-400">{diamondFee} Diamonds</span>
                      </p>
                  )}
              </div>
              
              <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Your Wallet Address (TON)</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="U..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-pulse"><AlertTriangle size={14}/> {error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold rounded-lg flex items-center gap-2"><ShieldCheck size={14}/> Request sent to review!</div>}

              <button 
                onClick={handleWithdraw}
                className="bg-indigo-600 py-4 rounded-xl font-bold mt-2 hover:bg-indigo-500 transition-all text-white shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                  CONFIRM PAYOUT
              </button>
          </div>
      </section>

      <section>
          <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Withdrawal Status</h3>
              <History size={16} className="text-slate-500" />
          </div>
          <div className="flex flex-col gap-3">
              {withdrawals.length === 0 ? (
                  <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 shadow-inner">
                      <p className="text-slate-600 text-sm">No transaction requests yet.</p>
                  </div>
              ) : (
                  withdrawals.map((w: any) => (
                      <div key={w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="text-sm font-black text-slate-100">${w.amountUsd} USD</p>
                                  <p className="text-[10px] text-slate-500 mt-1">{new Date(w.timestamp).toLocaleString()}</p>
                              </div>
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                                  w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                  w.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                  {w.status}
                              </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-800/50">
                              <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Remarks</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">{w.remarks}</p>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </section>
    </div>
  );
};

export default WalletPage;
