
import React, { useEffect, useState, useMemo } from 'react';
import { Currency } from '../types';
import { Coins, DollarSign, Gem, Star, TrendingUp, RefreshCw, Newspaper, Clock } from 'lucide-react';

interface HomePageProps {
  store: any;
  onNews: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ store, onNews }) => {
  const { user, config, startMining, claimAndRestartMining } = store;
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    let interval: any;
    if (user?.miningSession.isActive) {
      const start = new Date(user.miningSession.startTime).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setSessionSeconds(diff);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(interval);
  }, [user?.miningSession]);

  const progress = useMemo(() => {
    const max = config.miningSessionMinutes * 60;
    return Math.min(100, (sessionSeconds / max) * 100);
  }, [sessionSeconds, config.miningSessionMinutes]);

  const currentMined = useMemo(() => {
    const maxSeconds = config.miningSessionMinutes * 60;
    const effectiveSeconds = Math.min(sessionSeconds, maxSeconds);
    return (effectiveSeconds / 3600) * user.miningSpeed;
  }, [sessionSeconds, user.miningSpeed, config.miningSessionMinutes]);

  const timeLeft = useMemo(() => {
    const total = config.miningSessionMinutes * 60;
    const remaining = Math.max(0, total - sessionSeconds);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [sessionSeconds, config.miningSessionMinutes]);

  const handleReset = () => {
    setShowAdModal(true);
    setTimeout(() => {
      setShowAdModal(false);
      claimAndRestartMining();
    }, 2000);
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700">
            <img src={config.coinLogo} alt="Logo" className="w-8 h-8 rounded-full shadow-lg shadow-indigo-500/20" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hello, {user.username}</h1>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              Mining at {user.miningSpeed.toFixed(2)} {config.coinName}/hr
            </p>
          </div>
        </div>
        <button onClick={onNews} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-indigo-400 shadow-lg hover:bg-slate-700 transition-colors">
            <Newspaper size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BalanceCard icon={<Coins className="text-yellow-400" />} label="Coins" value={user.balances[Currency.COIN].toFixed(2)} />
        <BalanceCard icon={<DollarSign className="text-green-400" />} label="USD" value={user.balances[Currency.USD].toFixed(2)} />
        <BalanceCard icon={<Gem className="text-blue-400" />} label="Diamonds" value={user.balances[Currency.DIAMOND]} />
        <BalanceCard icon={<Star className="text-purple-400" />} label="Stars" value={user.balances[Currency.STAR]} />
      </div>

      <div className={`relative flex flex-col items-center justify-center py-16 rounded-[40px] border transition-all duration-500 ${user.miningSession.isActive ? 'border-green-500/30 bg-green-500/5 mining-gradient shadow-2xl shadow-green-500/10' : 'border-red-500/30 bg-red-500/5 stopped-gradient shadow-2xl shadow-red-500/5'}`}>
        <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="102" className="stroke-slate-900" strokeWidth="10" fill="transparent" />
                <circle 
                    cx="112" cy="112" r="102" 
                    className={`${user.miningSession.isActive ? 'stroke-green-500' : 'stroke-red-500'} transition-all duration-1000 ease-linear`}
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={640} 
                    strokeDashoffset={640 - (640 * progress) / 100} 
                    strokeLinecap="round"
                />
            </svg>
            <div className={`w-40 h-40 rounded-full overflow-hidden border-8 ${user.miningSession.isActive ? 'border-green-400/30' : 'border-red-400/30'} flex items-center justify-center bg-slate-950 shadow-inner relative z-10`}>
                <img src={config.coinLogo} alt="Bot" className={`w-full h-full object-contain p-4 ${user.miningSession.isActive ? 'animate-[spin_4s_linear_infinite]' : 'opacity-40 grayscale'}`} />
            </div>
            <div className={`absolute top-0 right-4 w-10 h-10 rounded-full border-4 border-slate-950 shadow-lg flex items-center justify-center z-20 ${user.miningSession.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
               <TrendingUp size={18} className="text-white" />
            </div>
        </div>

        <div className="mt-10 text-center px-4">
            <h3 className="text-3xl font-black text-white tracking-tighter">
                {currentMined.toFixed(6)}
            </h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{config.coinName} Mined</p>
            {user.miningSession.isActive && (
              <div className={`flex items-center justify-center gap-2 font-mono text-base mt-5 px-6 py-2 rounded-full border shadow-xl ${progress === 100 ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-green-400 border-green-500/20 bg-green-500/10'}`}>
                <Clock size={16} /> <span>{progress === 100 ? 'Finished' : timeLeft}</span>
              </div>
            )}
        </div>

        <div className="mt-10 w-full px-10">
            {!user.miningSession.isActive ? (
                <button 
                    onClick={startMining}
                    className="w-full bg-indigo-600 py-4.5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95"
                >
                    <RefreshCw size={22} />
                    START MINER
                </button>
            ) : (
                <button 
                    onClick={handleReset}
                    className={`w-full py-4.5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${progress === 100 ? 'bg-green-600 hover:bg-green-500 shadow-green-600/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                >
                    <RefreshCw size={22} className={progress === 100 ? 'animate-spin-slow' : ''} />
                    {progress === 100 ? 'CLAIM & RESTART' : 'CLAIM EARLY'}
                </button>
            )}
        </div>
      </div>

      {showAdModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <RefreshCw className="text-indigo-500 animate-spin mb-6" size={64} />
              <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Syncing rewards</h2>
              <p className="text-slate-400 text-sm font-medium">Validating assets with Adsgram unskippable verification.</p>
          </div>
      )}
    </div>
  );
};

const BalanceCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-4 shadow-md group hover:border-indigo-500/30 transition-all">
        <div className="bg-slate-800 p-2.5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-slate-100">{value}</p>
        </div>
    </div>
);

export default HomePage;
