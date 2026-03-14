
import React from 'react';
import { Zap, Timer, CheckCircle2, AlertCircle } from 'lucide-react';

const AirdropPage: React.FC<{ store: any }> = ({ store }) => {
  const { config } = store;
  const airdrop = config.airdrop;

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center gap-6">
      <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center border-4 border-indigo-500 animate-pulse shadow-2xl shadow-indigo-500/40">
          <Zap size={48} className="text-indigo-400" />
      </div>
      
      <div>
          <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">{airdrop.title}</h1>
          <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
              {airdrop.description}
          </p>
      </div>

      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phase</span>
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-500/20 uppercase">
                {airdrop.phase}
              </span>
          </div>
          
          <div className="space-y-4 text-left">
              {airdrop.items.map((item: any, idx: number) => (
                  <EligibilityItem key={idx} done={item.isCompleted} label={item.label} />
              ))}
          </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 font-bold uppercase tracking-widest text-xs">
          <Timer size={18} />
          Countdown: {airdrop.countdown}
      </div>
    </div>
  );
};

const EligibilityItem: React.FC<{ done: boolean, label: string }> = ({ done, label }) => (
    <div className="flex items-center gap-3">
        {done ? (
            <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-500" /></div>
        ) : (
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
            </div>
        )}
        <span className={`text-xs font-medium ${done ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
    </div>
);

export default AirdropPage;
