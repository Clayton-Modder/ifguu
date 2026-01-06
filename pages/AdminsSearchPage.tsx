
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, User, ShieldCheck, Globe, Activity, 
  ChevronRight, Eye, Settings, ShieldAlert, Ban, UserX, 
  ArrowUpRight, Clock, Star, AlertTriangle, CheckCircle2, History, Key
} from 'lucide-react';
import { Admin, AdminLevel } from '../types';
import { INITIAL_ADMINS, LEVEL_NAMES } from '../constants';

interface AdminsSearchPageProps {
  currentUserLevel: AdminLevel;
}

const AdminsSearchPage: React.FC<AdminsSearchPageProps> = ({ currentUserLevel }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);

  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            admin.id.includes(searchTerm) || 
                            admin.mainServer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'ALL' || admin.level.toString() === levelFilter;
      const matchesStatus = statusFilter === 'ALL' || admin.status === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [searchTerm, levelFilter, statusFilter, admins]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-emerald-500';
    if (efficiency >= 70) return 'text-indigo-400';
    if (efficiency >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Offline': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Inativo': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return '';
    }
  };

  const handleAction = (adminName: string, action: string) => {
    alert(`Ação "${action}" para o administrador ${adminName} executada.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
              <Search size={24} />
            </div>
            Pesquisar Administrador
          </h2>
          <p className="text-slate-500 font-medium ml-1">Auditoria e visualização da equipe administrativa.</p>
        </div>
      </header>

      {/* Busca e Filtros */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por Nome, ID ou Servidor..."
              className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <select 
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white appearance-none cursor-pointer font-bold"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
             >
               <option value="ALL">Todos os Cargos</option>
               {[1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>{LEVEL_NAMES[lvl as AdminLevel]}</option>)}
             </select>
          </div>
          <div className="relative">
             <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <select 
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white appearance-none cursor-pointer font-bold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="ALL">Todos os Status</option>
               <option value="Online">Online</option>
               <option value="Offline">Offline</option>
               <option value="Inativo">Inativo</option>
             </select>
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5 text-slate-500">Foto</th>
                <th className="px-8 py-5 text-slate-500">Nome</th>
                <th className="px-8 py-5 text-slate-500">Cargo</th>
                <th className="px-8 py-5 text-slate-500 text-center">Status</th>
                <th className="px-8 py-5 text-slate-500 text-center">Eficiência</th>
                <th className="px-8 py-5 text-slate-500">Último Login</th>
                <th className="px-8 py-5 text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-slate-800/20 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-indigo-400 text-lg shadow-xl overflow-hidden">
                      {admin.avatar ? <img src={admin.avatar} className="w-full h-full object-cover" /> : admin.name[0]}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-white font-black text-base tracking-tight">{admin.name}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">ID: {admin.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      admin.level >= 4 ? 'text-red-500' : 'text-slate-300'
                    }`}>
                      LV{admin.level}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(admin.status)}`}>
                       {admin.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-2">
                       <span className={`text-xs font-black ${getEfficiencyColor(admin.efficiency)}`}>{admin.efficiency}%</span>
                       <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${
                            admin.efficiency >= 90 ? 'bg-emerald-500' :
                            admin.efficiency >= 50 ? 'bg-indigo-500' : 'bg-red-500'
                          }`} style={{ width: `${admin.efficiency}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                    <div className="flex flex-col">
                      <span>{admin.lastActive.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-50">{admin.lastActive.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => navigate(`/profile/${admin.id}`)}
                        className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition-all hover:bg-slate-700" 
                        title="Ver Perfil Completo"
                       >
                         <Eye size={18} />
                       </button>
                       <button 
                        onClick={() => navigate(`/user/${admin.name}/history`)}
                        className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-slate-700" 
                        title="Ver Histórico"
                       >
                         <History size={18} />
                       </button>
                       {currentUserLevel === 5 && (
                         <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
                            <button onClick={() => handleAction(admin.name, 'Cargo')} className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all" title="Gerenciar Cargo">
                               <Settings size={18} />
                            </button>
                            <button onClick={() => handleAction(admin.name, 'Bloqueio')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Bloquear Admin">
                               <UserX size={18} />
                            </button>
                            <button onClick={() => handleAction(admin.name, 'Senha')} className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all" title="Resetar Senha">
                               <Key size={18} />
                            </button>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-amber-500/20 text-amber-500 rounded-2xl">
               <AlertTriangle size={24} />
            </div>
            <div>
               <h4 className="text-amber-500 font-black text-sm uppercase">Baixa Eficiência</h4>
               <p className="text-xs text-amber-500/70 font-medium">Mod Silva está com {admins.find(a => a.name === 'Mod Silva')?.efficiency}%</p>
            </div>
         </div>
         <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl">
               <Star size={24} />
            </div>
            <div>
               <h4 className="text-indigo-400 font-black text-sm uppercase">Staff do Mês</h4>
               <p className="text-xs text-indigo-400/70 font-medium">Admin Master lidera o ranking.</p>
            </div>
         </div>
         <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-red-500/20 text-red-500 rounded-2xl">
               <Clock size={24} />
            </div>
            <div>
               <h4 className="text-red-500 font-black text-sm uppercase">Inatividade</h4>
               <p className="text-xs text-red-500/70 font-medium">1 moderador está há 7 dias offline.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminsSearchPage;
