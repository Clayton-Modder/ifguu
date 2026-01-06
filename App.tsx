
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LogsPage from './pages/LogsPage';
import RequestsPage from './pages/RequestsPage';
import RankingPage from './pages/RankingPage';
import InstallPage from './pages/InstallPage';
import SettingsPage from './pages/SettingsPage';
import UserHistoryPage from './pages/UserHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminsSearchPage from './pages/AdminsSearchPage';
import LoginHistoryPage from './pages/LoginHistoryPage';
import { PunishmentType, UserAuth, AdminLevel } from './types';
import { LEVEL_NAMES, MOCK_USER } from './constants';
import { db } from './services/store';
import { Bell, Search, User, ShieldCheck, Database, RefreshCcw } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode; user: UserAuth; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');
  const [dbStatus, setDbStatus] = useState<'Online' | 'Sincronizando'>('Online');

  useEffect(() => {
    const interval = setInterval(() => {
      setDbStatus('Sincronizando');
      setTimeout(() => setDbStatus('Online'), 1200);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/user/${quickSearch.trim()}/history`);
      setQuickSearch('');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-inter">
      <Sidebar currentPath={location.pathname} onNavigate={(path) => navigate(path)} onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <form onSubmit={handleQuickSearch} className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar ID ou Nick..." 
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
             </form>
             <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <Database size={16} className={dbStatus === 'Online' ? 'text-emerald-500' : 'text-indigo-400'} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">JSON Drive</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${dbStatus === 'Online' ? 'text-emerald-500' : 'text-indigo-400 animate-pulse'}`}>
                    {dbStatus}
                  </span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <ShieldCheck className="text-indigo-400" size={16} />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.1em]">{LEVEL_NAMES[user.level]}</span>
            </div>
            
            <button onClick={() => navigate('/notifications')} className="relative p-2.5 text-slate-500 hover:text-white transition-all bg-slate-800/50 rounded-xl group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>

            <div className="h-10 w-px bg-slate-800"></div>

            <div onClick={() => navigate('/profile')} className="flex items-center gap-4 pl-2 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.status}</p>
              </div>
              <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-white shadow-2xl transition-all group-hover:scale-110 overflow-hidden ${
                user.level >= 4 ? 'bg-red-600' : 'bg-indigo-600'
              }`}>
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = localStorage.getItem('sentinel_auth') === 'true';
      if (isAuth) {
        const currentUser = await db.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (userData: UserAuth) => {
    localStorage.setItem('sentinel_auth', 'true');
    await db.updateCurrentUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinel_auth');
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <RefreshCcw className="text-indigo-500 animate-spin" size={48} />
    </div>
  );

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationsPage userLevel={user.level} userName={user.name} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/security/logins" element={<LoginHistoryPage />} />
          <Route path="/admins/search" element={<AdminsSearchPage currentUserLevel={user.level} />} />
          <Route path="/logs/ban" element={<LogsPage title="Banimentos" typeFilter={PunishmentType.BAN} userLevel={user.level} userName={user.name} />} />
          <Route path="/logs/disciplinary" element={<LogsPage title="Prisão / Mute" typesFilter={[PunishmentType.PRISON, PunishmentType.MUTE]} userLevel={user.level} userName={user.name} />} />
          <Route path="/logs/warn" element={<LogsPage title="Warns (Jogador)" typeFilter={PunishmentType.WARN} userLevel={user.level} userName={user.name} />} />
          <Route path="/logs/org" element={<LogsPage title="Warns (Org / Máfia / Família)" typeFilter={PunishmentType.ORG_WARN} userLevel={user.level} userName={user.name} />} />
          <Route path="/requests/new" element={<RequestsPage view="NEW" userLevel={user.level} userName={user.name} />} />
          <Route path="/requests/pending" element={<RequestsPage view="PENDING" userLevel={user.level} userName={user.name} />} />
          <Route path="/requests/history" element={<RequestsPage view="HISTORY" userLevel={user.level} userName={user.name} />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/user/:username/history" element={<UserHistoryPage userLevel={user.level} userName={user.name} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
