
import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { 
  Home, 
  Wallet, 
  CheckSquare, 
  User as UserIcon, 
  Zap,
} from 'lucide-react';

import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import NewsPage from './pages/NewsPage';
import SupportPage from './pages/SupportPage';
import AirdropPage from './pages/AirdropPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import LogsPage from './pages/LogsPage';

// ── Admin route detection via URL hash ──────────────────────────────────────
// Admin panel is at:  /#gyk-admin-panel
// This URL is NOT shown anywhere in the app — it's a secret link for admins
const ADMIN_HASH = '#gyk-admin-panel';

const isAdminRoute = () => window.location.hash === ADMIN_HASH;

const App: React.FC = () => {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'wallet' | 'profile' | 'news' | 'support' | 'airdrop' | 'logs'>('home');
  const [isAdmin, setIsAdmin] = useState(isAdminRoute());
  const [adminAuthed, setAdminAuthed] = useState(false);

  // Listen for hash changes (e.g. back button)
  useEffect(() => {
    const onHashChange = () => setIsAdmin(isAdminRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // ── Admin route → show login/dashboard ──────────────────────────────────
  if (isAdmin) {
    if (!adminAuthed) {
      return <AdminLoginPage onSuccess={() => setAdminAuthed(true)} />;
    }
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminDashboard store={store} />
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (store.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950">
        <div className="text-5xl mb-5 animate-bounce">⛏️</div>
        <p className="text-indigo-400 font-black text-xl tracking-widest animate-pulse">GYK MINING BOT</p>
        <p className="text-slate-500 text-xs mt-3">Connecting to server...</p>
      </div>
    );
  }

  if (!store.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950">
        <div className="text-5xl mb-5">⚠️</div>
        <p className="text-red-400 font-bold text-lg">Failed to load</p>
        <p className="text-slate-500 text-xs mt-2">Check your connection and refresh</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':    return <HomePage store={store} onNews={() => setActiveTab('news')} />;
      case 'tasks':   return <TasksPage store={store} />;
      case 'wallet':  return <WalletPage store={store} onLogs={() => setActiveTab('logs')} />;
      case 'profile': return <ProfilePage store={store} />;
      case 'news':    return <NewsPage store={store} />;
      case 'support': return <SupportPage store={store} />;
      case 'airdrop': return <AirdropPage store={store} />;
      case 'logs':    return <LogsPage store={store} />;
      default:        return <HomePage store={store} onNews={() => setActiveTab('news')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-950 relative overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </div>

      {/* Bottom Nav — NO Admin button here */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-3 px-2 z-50">
        <NavButton active={activeTab === 'home'}    onClick={() => setActiveTab('home')}    icon={<Home size={20} />}        label="Home" />
        <NavButton active={activeTab === 'tasks'}   onClick={() => setActiveTab('tasks')}   icon={<CheckSquare size={20} />} label="Tasks" />
        <NavButton active={activeTab === 'wallet'}  onClick={() => setActiveTab('wallet')}  icon={<Wallet size={20} />}      label="Wallet" />
        <NavButton active={activeTab === 'airdrop'} onClick={() => setActiveTab('airdrop')} icon={<Zap size={20} />}         label="Airdrop" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />}    label="Profile" />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center transition-all duration-200 ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

export default App;
