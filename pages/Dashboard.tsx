
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ban, Lock, MicOff, AlertTriangle, Activity, Users, ArrowRight, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { db } from '../services/store';
import { PunishmentType, LogEntry } from '../types';

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const allLogs = await db.getLogs();
      setLogs(allLogs);
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    total: logs.length,
    bans: logs.filter(l => l.type === PunishmentType.BAN || l.type === PunishmentType.IP_BAN).length,
    prisons: logs.filter(l => l.type === PunishmentType.PRISON).length,
    mutes: logs.filter(l => l.type === PunishmentType.MUTE).length,
    warns: logs.filter(l => l.type === PunishmentType.WARN).length,
    orgWarns: logs.filter(l => l.type === PunishmentType.ORG_WARN).length,
  };

  const pieData = [
    { name: 'Banimentos', value: stats.bans, color: '#ef4444' },
    { name: 'Prisões', value: stats.prisons, color: '#f59e0b' },
    { name: 'Mutes', value: stats.mutes, color: '#10b981' },
    { name: 'Warns', value: stats.warns + stats.orgWarns, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Agrupar logs por dia da semana para o gráfico
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const weeklyData = days.map(day => ({
    name: day,
    ações: logs.filter(l => {
      const d = new Date(l.timestamp);
      return days[d.getDay()] === day;
    }).length
  }));

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="text-indigo-500 animate-spin" size={48} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Consultando Sentinel Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Intelligence Dashboard</h2>
        <p className="text-slate-500 font-medium">Dados analíticos em tempo real sincronizados com o banco de dados.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Geral" value={stats.total} icon={<Activity size={20} />} color="text-slate-100" />
        <StatCard label="Banimentos" value={stats.bans} icon={<Ban size={20} />} color="text-red-500" />
        <StatCard label="Prisões" value={stats.prisons} icon={<Lock size={20} />} color="text-orange-500" />
        <StatCard label="Mutes" value={stats.mutes} icon={<MicOff size={20} />} color="text-emerald-500" />
        <StatCard label="Warns" value={stats.warns} icon={<AlertTriangle size={20} />} color="text-blue-500" />
        <StatCard label="Org Warns" value={stats.orgWarns} icon={<Users size={20} />} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
             <Activity className="text-indigo-500" size={20} /> Fluxo de Atividade Semanal
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight="bold" />
                <YAxis stroke="#475569" fontSize={12} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="ações" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Distribuição Operacional</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="text-white font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-lg font-bold text-white flex items-center gap-3">
             <Users className="text-indigo-400" size={20} /> Últimos Infratores Detectados
           </h3>
           <Link to="/logs/ban" className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2">
             Ver Todos <ArrowRight size={14} />
           </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-4">Usuário</th>
                <th className="pb-4">Infração</th>
                <th className="pb-4">Responsável</th>
                <th className="pb-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="group hover:bg-slate-800/20 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">{log.user[0]}</div>
                      <span className="text-white font-bold">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase">{log.type}</span>
                  </td>
                  <td className="py-5 text-slate-400 text-sm">{log.admin}</td>
                  <td className="py-5 text-right">
                    <Link to={`/user/${log.user}/history`} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition-all">
                      <ArrowRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
