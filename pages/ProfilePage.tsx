
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Camera, ShieldCheck, Server, Calendar, Clock, Globe, 
  TrendingUp, CheckCircle2, XCircle, Award, Activity, 
  PieChart as PieIcon, BarChart3, History, Search, Filter, 
  Lock, MicOff, Ban, AlertTriangle, ChevronRight, Upload,
  Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { MOCK_USER, LEVEL_NAMES, INITIAL_LOGS, INITIAL_REQUESTS, INITIAL_ADMINS } from '../constants';
import { PunishmentType, UserAuth } from '../types';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'];

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserAuth>(MOCK_USER);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && id !== 'own') {
      const adminData = INITIAL_ADMINS.find(a => a.id === id);
      if (adminData) {
        // Adapt Admin type to UserAuth for visualization
        setUser({
          name: adminData.name,
          email: adminData.email,
          level: adminData.level,
          avatar: adminData.avatar,
          status: adminData.status === 'Online' ? 'Online' : 'Offline',
          mainServer: adminData.mainServer || 'Principal',
          lastLogin: {
            date: adminData.lastActive.split(' ')[0],
            time: adminData.lastActive.split(' ')[2] || '',
            ip: adminData.lastLoginIp
          },
          efficiency: {
            punishmentsApplied: adminData.actionsCount,
            requestsCreated: Math.floor(adminData.actionsCount * 0.3),
            requestsApproved: Math.floor(adminData.actionsCount * 0.25),
            requestsRejected: Math.floor(adminData.actionsCount * 0.05),
            avgResponseTime: '5min',
            precision: adminData.efficiency
          }
        });
        setIsReadOnly(true);
      }
    } else {
      setUser(MOCK_USER);
      setIsReadOnly(false);
    }
  }, [id]);

  // Unificando logs e solicitações para o histórico pessoal
  const personalHistory = useMemo(() => {
    const logs = INITIAL_LOGS.filter(l => l.admin === user.name).map(l => ({
      ...l,
      category: 'PUNIÇÃO'
    }));
    const requests = INITIAL_REQUESTS.filter(r => r.admin === user.name).map(r => ({
      ...r,
      category: 'SOLICITAÇÃO'
    }));
    return [...logs, ...requests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [user.name]);

  const filteredHistory = personalHistory.filter(item => 
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setUser(prev => ({ ...prev, avatar: reader.result as string }));
        setIsUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const chartData = [
    { name: 'Prisão', value: 45 },
    { name: 'Mute', value: 32 },
    { name: 'Ban', value: 25 },
    { name: 'Warn', value: 40 },
  ];

  const activityData = [
    { day: 'Seg', actions: 12 },
    { day: 'Ter', actions: 19 },
    { day: 'Qua', actions: 15 },
    { day: 'Qui', actions: 22 },
    { day: 'Sex', actions: 30 },
    { day: 'Sab', actions: 45 },
    { day: 'Dom', actions: 35 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header do Perfil */}
      <section className="relative h-80 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col md:flex-row items-end gap-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 border-4 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-slate-600" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <Activity size={32} className="text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
            {!isReadOnly && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-white tracking-tighter">{user.name}</h1>
              <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                {user.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300 font-bold text-sm">
                <ShieldCheck size={18} /> {LEVEL_NAMES[user.level]}
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Server size={18} className="text-slate-600" /> {user.mainServer}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Eficiência do Administrador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={120} />
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Eficiência Global</h3>
                <div className="flex items-end gap-4 mb-6">
                  <span className="text-6xl font-black text-white">{user.efficiency.precision}%</span>
                  <span className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-1">
                    <TrendingUp size={14} /> +4.2%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${user.efficiency.precision}%` }}></div>
                </div>
                <p className="mt-4 text-slate-400 text-xs font-medium">Índice de assertividade baseado em punições válidas.</p>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Análise de Pedidos</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 size={18} /></div>
                      <span className="text-slate-300 font-bold">Aprovados</span>
                    </div>
                    <span className="text-white font-black text-xl">{user.efficiency.requestsApproved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><XCircle size={18} /></div>
                      <span className="text-slate-300 font-bold">Rejeitados</span>
                    </div>
                    <span className="text-white font-black text-xl">{user.efficiency.requestsRejected}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Clock size={18} /></div>
                      <span className="text-slate-300 font-bold">Tempo Resposta</span>
                    </div>
                    <span className="text-white font-black text-xl">{user.efficiency.avgResponseTime}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* 6. Gráficos de Atividade */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-white font-black flex items-center gap-3"><Activity size={20} className="text-indigo-500" /> Fluxo de Atividade Semanal</h3>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total: {user.efficiency.punishmentsApplied} ações</div>
             </div>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={activityData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="day" stroke="#475569" fontSize={12} fontWeight="bold" />
                   <YAxis stroke="#475569" fontSize={12} fontWeight="bold" />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Line type="monotone" dataKey="actions" stroke="#6366f1" strokeWidth={4} dot={{ fill: '#6366f1', r: 6 }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* 5. Histórico de Atividades */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="p-8 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h3 className="text-white font-black flex items-center gap-3"><History size={20} className="text-indigo-500" /> Registro de Auditoria Staff</h3>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                  type="text" 
                  placeholder="Pesquisar histórico..." 
                  className="pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-800/10 text-[10px] font-black uppercase tracking-widest text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4">Data / Hora</th>
                    <th className="px-8 py-4">Ação</th>
                    <th className="px-8 py-4">Alvo</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredHistory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="text-slate-300 font-bold text-xs">{new Date(item.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                           {item.type === PunishmentType.BAN ? <Ban size={14} className="text-red-500" /> : 
                            item.type === PunishmentType.PRISON ? <Lock size={14} className="text-orange-500" /> :
                            <History size={14} className="text-indigo-400" />}
                           <span className="text-white font-bold text-xs">{item.category}: {item.type}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-slate-400 text-xs font-medium">{item.user}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-tighter text-slate-400">
                          CONCLUÍDO
                          <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar do Perfil */}
        <div className="space-y-8">
          
          {/* 2. Dados de Login */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={14} /> Dados de Acesso
            </h3>
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <Calendar size={20} className="text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase">Último Login</p>
                    <p className="text-white font-bold">{user.lastLogin.date}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <Clock size={20} className="text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase">Horário</p>
                    <p className="text-white font-bold">{user.lastLogin.time}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <Globe size={20} className="text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase">IP de Sessão</p>
                    <p className="text-white font-mono font-bold">{user.lastLogin.ip}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* 4. Estatísticas Detalhadas */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
             <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <PieIcon size={14} /> Distribuição de Ações
            </h3>
             <div className="h-64 mb-6">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={8}
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-3">
                {chartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-slate-400 font-medium">{item.name}</span>
                    </div>
                    <span className="text-white font-black">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>

          {!isReadOnly && (
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 text-white space-y-6">
               <h3 className="font-black text-xl tracking-tight flex items-center gap-3"><Settings size={22} /> Ajustes da Conta</h3>
               <div className="space-y-4">
                  <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold flex items-center justify-between transition-all">
                     Alterar Senha
                     <ChevronRight size={16} />
                  </button>
                  <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold flex items-center justify-between transition-all">
                     Ativar 2FA (Segurança)
                     <ShieldCheck size={16} />
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
