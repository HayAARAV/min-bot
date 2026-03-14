
import React, { useState, useMemo } from 'react';
import { useAppStore, getGMTDay } from '../store/useAppStore';
import { CheckCircle, Clock, ExternalLink, Gift, Star, Zap, History } from 'lucide-react';

interface TasksPageProps {
  store: any;
}

const TasksPage: React.FC<TasksPageProps> = ({ store }) => {
  const { user, tasks, claimDailyLogin, completeTask } = store;
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  const today = getGMTDay();
  const isDailyClaimed = user.lastDailyLogin === today;

  const handleDaily = () => {
    setLoadingTask('daily');
    setTimeout(() => {
        claimDailyLogin();
        setLoadingTask(null);
    }, 2000);
  };

  const handleTask = (task: any) => {
    setLoadingTask(task.id);
    // Simulate opening the link in a real environment
    window.open(task.link, '_blank');
    
    // Require user to stay on the page / wait for "verification"
    setTimeout(() => {
        completeTask(task.id);
        setLoadingTask(null);
    }, 4000); // 4 seconds verification delay
  };

  const completedTasks = useMemo(() => {
    return tasks.filter((t: any) => t.isCompleted).slice(-10).reverse();
  }, [tasks]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2">
          <Gift className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Earn Rewards</h1>
      </div>

      <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Daily Boost</h2>
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-lg font-bold">Daily Check-in</h3>
                      <p className="text-slate-400 text-xs mt-1">Visit every 24 hours to earn 1 Star.</p>
                  </div>
                  <div className="bg-indigo-500/20 p-2 rounded-xl">
                      <Star className="text-indigo-400" size={24} />
                  </div>
              </div>
              <button 
                onClick={handleDaily}
                disabled={isDailyClaimed || loadingTask === 'daily'}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isDailyClaimed ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}`}
              >
                  {loadingTask === 'daily' ? (
                      <Clock className="animate-spin" size={20} />
                  ) : isDailyClaimed ? (
                      <CheckCircle size={20} />
                  ) : <Zap size={20} />}
                  {isDailyClaimed ? 'CLAIMED TODAY' : 'CLAIM 1 STAR'}
              </button>
          </div>
      </section>

      <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Active Tasks</h2>
          <div className="flex flex-col gap-3">
              {tasks.filter((t: any) => !t.isCompleted).map((task: any) => (
                  <div key={task.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-100">{task.title}</h4>
                          <p className="text-slate-400 text-xs mt-1">{task.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                              {task.rewards.coin ? <RewardBadge type="COIN" value={task.rewards.coin} /> : null}
                              {task.rewards.usd ? <RewardBadge type="USD" value={task.rewards.usd} /> : null}
                              {task.rewards.speed ? <RewardBadge type="SPEED" value={task.rewards.speed} /> : null}
                          </div>
                      </div>
                      <div className="ml-4">
                          <button 
                            onClick={() => handleTask(task)}
                            disabled={loadingTask === task.id}
                            className="bg-indigo-600/10 p-3 rounded-xl hover:bg-indigo-600/20 transition-all border border-indigo-500/30 text-indigo-400"
                          >
                            {loadingTask === task.id ? <Clock className="animate-spin" size={20} /> : <ExternalLink size={20} />}
                          </button>
                      </div>
                  </div>
              ))}
              {tasks.filter((t: any) => !t.isCompleted).length === 0 && (
                  <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 shadow-inner">
                      <p className="text-slate-500 text-sm italic">All tasks completed! Check back later.</p>
                  </div>
              )}
          </div>
      </section>

      <section>
          <div className="flex items-center gap-2 mb-3">
              <History size={16} className="text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Task History (Last 10)</h2>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 shadow-lg">
              {completedTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-600 text-sm">No tasks completed yet.</div>
              ) : (
                  completedTasks.map((t: any) => (
                      <div key={t.id} className="p-3.5 flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-xs font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">{t.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono font-bold uppercase">Verified</span>
                      </div>
                  ))
              )}
          </div>
      </section>

      {loadingTask && loadingTask !== 'daily' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">Verifying Task...</h2>
              <p className="text-slate-400 text-sm">Please ensure you completed the action in the opened tab.</p>
              <div className="mt-8 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">Powered by Adsgram Verification</p>
              </div>
          </div>
      )}
    </div>
  );
};

const RewardBadge: React.FC<{ type: string, value: number }> = ({ type, value }) => {
    const colors: any = {
        COIN: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        USD: 'bg-green-500/10 text-green-500 border-green-500/20',
        SPEED: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
            +{value} {type}
        </span>
    );
};

export default TasksPage;
