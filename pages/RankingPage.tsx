
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

const RankingPage: React.FC = () => {
  const [period, setPeriod] = useState('Semana');

  const rankData = [
    { rank: 1, name: 'X_Griefer_X', value: 124, type: 'Punições' },
    { rank: 2, name: 'TrollLord', value: 89, type: 'Punições' },
    { rank: 3, name: 'ToxicPlayer', value: 76, type: 'Punições' },
    { rank: 4, name: 'GhostHacker', value: 45, type: 'Punições' },
    { rank: 5, name: 'NoobDestruction', value: 38, type: 'Punições' },
  ];

  const adminData = [
    { rank: 1, name: 'AdminX', value: 342, type: 'Ações' },
    { rank: 2, name: 'SuperAdmin', value: 215, type: 'Ações' },
    { rank: 3, name: 'ModeratorY', value: 187, type: 'Ações' },
    { rank: 4, name: 'HelperBot', value: 120, type: 'Ações' },
    { rank: 5, name: 'AdminZ', value: 98, type: 'Ações' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Top Ranking</h2>
          <p className="text-slate-400">Ranking automático de atividades do servidor.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['Dia', 'Semana', 'Mês'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Ranking */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-red-400" size={24} />
              <h3 className="text-lg font-bold text-white">Usuários mais Punidos</h3>
            </div>
            <span className="text-slate-500 text-sm">Atualizado há 5 min</span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {rankData.map((item, idx) => (
              <Link 
                key={item.name} 
                to={`/user/${item.name}/history`}
                className="flex items-center justify-between p-6 hover:bg-slate-700/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-400' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-500' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}º
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold border border-slate-600">
                      {item.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        {item.name}
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">Jogador Registrado</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-slate-500 uppercase font-medium">{item.type}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Ranking */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="text-lg font-bold text-white">Admins mais Ativos</h3>
            </div>
            <span className="text-slate-500 text-sm">Tempo real</span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {adminData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-6 hover:bg-slate-700/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-400' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-500' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}º
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                      {item.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">Staff Administrativa</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-slate-500 uppercase font-medium">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
