
import React, { useMemo, useState } from 'react';
import { Currency } from '../types';
import { History, Coins, DollarSign, Gem, Star, TrendingUp, TrendingDown, Filter } from 'lucide-react';

interface LogsPageProps {
  store: any;
}

const LogsPage: React.FC<LogsPageProps> = ({ store }) => {
  const { user } = store;
  const [filter, setFilter] = useState<Currency | 'ALL'>('ALL');

  const filteredLogs = useMemo(() => {
    if (!user.logs) return [];
    if (filter === 'ALL') return user.logs;
    return user.logs.filter((l: any) => l.currency === filter);
  }, [user.logs, filter]);

  const currencyIcon = (curr: Currency) => {
    switch (curr) {
        case Currency.COIN: return <Coins className="text-yellow-400" size={14} />;
        case Currency.USD: return <DollarSign className="text-green-400" size={14} />;
        case Currency.DIAMOND: return <Gem className="text-blue-400" size={14} />;
        case Currency.STAR: return <Star className="text-purple-400" size={14} />;
        default: return null;
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2">
          <History className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Transaction Logs</h1>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          <FilterBtn active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All" />
          <FilterBtn active={filter === Currency.COIN} onClick={() => setFilter(Currency.COIN)} label="Coins" />
          <FilterBtn active={filter === Currency.USD} onClick={() => setFilter(Currency.USD)} label="USD" />
          <FilterBtn active={filter === Currency.DIAMOND} onClick={() => setFilter(Currency.DIAMOND)} label="Diamonds" />
          <FilterBtn active={filter === Currency.STAR} onClick={() => setFilter(Currency.STAR)} label="Stars" />
      </div>

      <div className="flex flex-col gap-3">
          {filteredLogs.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 shadow-inner">
                  <p className="text-slate-600 text-sm">No logs found for this filter.</p>
              </div>
          ) : (
              filteredLogs.map((log: any) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${log.type === 'CREDIT' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                              {log.type === 'CREDIT' ? <TrendingUp className="text-green-500" size={18} /> : <TrendingDown className="text-red-500" size={18} />}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-slate-100">{log.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                  <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-slate-400">
                                      {currencyIcon(log.currency)} {log.currency}
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className={`text-right ${log.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                          <p className="text-sm font-black tracking-tighter">
                              {log.type === 'CREDIT' ? '+' : '-'}{log.amount.toFixed(log.currency === Currency.COIN || log.currency === Currency.USD ? 2 : 0)}
                          </p>
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-50">{log.type}</p>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

const FilterBtn: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`shrink-0 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
            active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
        }`}
    >
        {label}
    </button>
);

export default LogsPage;
