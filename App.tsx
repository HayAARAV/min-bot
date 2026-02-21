
import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { 
  Home, 
  Wallet, 
  CheckSquare, 
  User as UserIcon, 
  LayoutDashboard,
  Zap,
  History
} from 'lucide-react';

import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import NewsPage from './pages/NewsPage';
import SupportPage from './pages/SupportPage';
import AirdropPage from './pages/AirdropPage';
import AdminDashboard from './pages/AdminDashboard';
import LogsPage from './pages/LogsPage';

const App: React.FC = () => {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'wallet' | 'profile' | 'news' | 'support' | 'airdrop' | 'admin' | 'logs'>('home');

  if (!store.user) return <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-bold tracking-widest animate-pulse">GYK MINING BOT</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage store={store} onNews={() => setActiveTab('news')} />;
      case 'tasks': return <TasksPage store={store} />;
      case 'wallet': return <WalletPage store={store} onLogs={() => setActiveTab('logs')} />;
      case 'profile': return <ProfilePage store={store} />;
      case 'news': return <NewsPage store={store} />;
      case 'support': return <SupportPage store={store} />;
      case 'airdrop': return <AirdropPage store={store} />;
      case 'admin': return <AdminDashboard store={store} />;
      case 'logs': return <LogsPage store={store} />;
      default: return <HomePage store={store} onNews={() => setActiveTab('news')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-950 relative overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-3 px-2 z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Home" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={20} />} label="Tasks" />
        <NavButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={20} />} label="Wallet" />
        <NavButton active={activeTab === 'airdrop'} onClick={() => setActiveTab('airdrop')} icon={<Zap size={20} />} label="Airdrop" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />} label="Profile" />
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'admin' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1">Admin</span>
        </button>
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
