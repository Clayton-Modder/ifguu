
import React from 'react';
import { MENU_GROUPS } from '../constants';
import { Shield, LogOut } from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-2xl shadow-indigo-600/30">
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white">SENTINEL</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-1">Security Sys</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8">
        {MENU_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    currentPath === item.path
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_20px_rgba(79,70,229,0.05)]'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${currentPath === item.path ? 'text-indigo-400 scale-110' : 'group-hover:text-slate-200 group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Sair do Sentinel</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
