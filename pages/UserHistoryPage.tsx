
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_LOGS } from '../constants';
import { PunishmentType, LogEntry, AdminLevel } from '../types';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Filter, 
  Download, 
  Search,
  Ban,
  Lock,
  MicOff,
  AlertTriangle,
  History,
  ShieldAlert,
  Activity,
  Globe,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Video,
  // Added Server icon to fix "Cannot find name 'Server'" error on line 187
  Server
} from 'lucide-react';
import StatCard from '../components/StatCard';
import PunishmentModal from '../components/PunishmentModal';

interface UserHistoryPageProps {
  userLevel: AdminLevel;
  userName: string;
}

const UserHistoryPage: React.FC<UserHistoryPageProps> = ({ userLevel, userName }) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  const canManage = userLevel >= 4;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  const userLogs = logs.filter(log => log.user === username);

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = log.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    
    let matchesDate = true;
    if (dateFrom) matchesDate = matchesDate && new Date(log.timestamp) >= new Date(dateFrom);
    if (dateTo) matchesDate = matchesDate && new Date(log.timestamp) <= new Date(dateTo);

    return matchesSearch && matchesType && matchesDate;
  });

  const handleSavePunishment = (logData: any) => {
    if (logData.id) {
      setLogs(logs.map(l => l.id === logData.id ? { 
        ...l, 
        ...logData,
        admin: `${l.admin} (Editado)`
      } : l));
    } else {
      const newLog: LogEntry = {
        ...logData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        admin: userName,
        adminLevel: userLevel,
        adminIp: '127.0.0.1',
      };
      setLogs([newLog, ...logs]);
    }
    setEditingLog(null);
  };

  const deleteLog = (id: string) => {
    if (confirm('Deseja realmente excluir este registro do histórico?')) {
      setLogs(logs.filter(l => l.id !== id));
    }
  };

  const openEdit = (log: LogEntry) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const getBadgeStyle = (type: PunishmentType) => {
    switch (type) {
      case PunishmentType.BAN:
      case PunishmentType.IP_BAN: return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case PunishmentType.PRISON: return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case PunishmentType.MUTE: return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case PunishmentType.WARN: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getIcon = (type: PunishmentType) => {
    switch (type) {
      case PunishmentType.BAN: return <Ban size={18} />;
      case PunishmentType.IP_BAN: return <Lock size={18} />;
      case PunishmentType.PRISON: return <Lock size={18} />;
      case PunishmentType.MUTE: return <MicOff size={18} />;
      case PunishmentType.WARN: return <AlertTriangle size={18} />;
      default: return <ShieldAlert size={18} />;
    }
  };

  const isBanned = userLogs.some(l => l.type === PunishmentType.BAN || l.type === PunishmentType.IP_BAN);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl text-slate-300 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="relative px-6 -mt-24 flex flex-col md:flex-row items-end gap-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-4xl font-bold text-slate-300">
            {username?.[0]}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center ${isBanned ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {isBanned ? <Ban size={14} className="text-white" /> : <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
          </div>
        </div>

        <div className="flex-1 pb-2">
          <h2 className="text-4xl font-black text-white tracking-tight">{username}</h2>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm font-medium mt-2">
            <span className="flex items-center gap-2"><Globe size={16} className="text-indigo-400" /> ID: #3842</span>
            <span className="flex items-center gap-2"><Activity size={16} className="text-indigo-400" /> Atividade Alta</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => { setEditingLog(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-white font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
          >
            <ShieldAlert size={18} />
            Punir Usuário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] hover:border-slate-600 transition-all group relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                log.type === PunishmentType.BAN || log.type === PunishmentType.IP_BAN ? 'bg-red-500' :
                log.type === PunishmentType.PRISON ? 'bg-orange-500' : 'bg-indigo-500'
              }`}></div>

              <div className="flex justify-between gap-6">
                <div className="flex gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getBadgeStyle(log.type)}`}>
                    {getIcon(log.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white uppercase">{log.type.replace('_', ' ')}</span>
                      <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed">{log.reason}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User size={12} className="text-indigo-400" /> {log.admin}</span>
                      {log.server && <span className="flex items-center gap-1"><Server size={12} className="text-indigo-400" /> {log.server}</span>}
                      {log.evidenceUrl && <a href={log.evidenceUrl} target="_blank" className="text-indigo-400 flex items-center gap-1 font-bold"><Video size={12}/> Vídeo</a>}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEdit(log)}
                      className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteLog(log.id)}
                      className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PunishmentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingLog(null); }} 
        onSave={handleSavePunishment}
        userLevel={userLevel}
        userName={userName}
        editData={editingLog}
      />
    </div>
  );
};

export default UserHistoryPage;
