
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PunishmentType, LogEntry, AdminLevel } from '../types';
import { db } from '../services/store';
import { LEVEL_NAMES } from '../constants';
import { Search, Filter, Download, Eye, Edit, Trash2, ShieldAlert, Users2, Clock, Video, Link as LinkIcon, Lock, MicOff, Ban, AlertTriangle, Loader2 } from 'lucide-react';
import PunishmentModal from '../components/PunishmentModal';

interface LogsPageProps {
  typeFilter?: PunishmentType;
  typesFilter?: PunishmentType[];
  title: string;
  userLevel: AdminLevel;
  userName: string;
}

const LogsPage: React.FC<LogsPageProps> = ({ typeFilter, typesFilter, title, userLevel, userName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);

  const canManage = userLevel >= 4;

  const loadLogs = async () => {
    setLoading(true);
    const allLogs = await db.getLogs();
    setLogs(allLogs);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    let matchesType = true;
    if (typesFilter) matchesType = typesFilter.includes(log.type);
    else if (typeFilter) matchesType = log.type === typeFilter;

    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.admin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSavePunishment = async (logData: any) => {
    const logToSave: LogEntry = {
      ...logData,
      id: logData.id || Math.random().toString(36).substr(2, 9),
      timestamp: logData.timestamp || new Date().toISOString(),
      admin: logData.id ? `${logData.admin} (Editado)` : userName,
      adminLevel: userLevel,
      adminIp: '189.124.55.201',
    };
    await db.saveLog(logToSave);
    await loadLogs();
    setEditingLog(null);
  };

  const deleteLog = async (id: string) => {
    if (confirm('Excluir permanentemente do banco de dados?')) {
      await db.deleteLog(id);
      await loadLogs();
    }
  };

  if (loading && logs.length === 0) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="text-indigo-500 animate-spin" size={48} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium">Visualizando base de dados de punições em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditingLog(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-2xl transition-all">
            <ShieldAlert size={18} /> Novo Registro
          </button>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-800/10 flex items-center justify-between">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input type="text" placeholder="Filtrar base de dados..." className="w-full pl-12 pr-4 py-3 bg-slate-800/30 border border-slate-700 rounded-2xl text-white focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           {loading && <Loader2 className="text-indigo-500 animate-spin" size={20} />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-5">Alvo</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5">Provas</th>
                <th className="px-8 py-5">Staff</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-800/20 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-indigo-400">{log.user[0]}</div>
                      <span className="text-white font-bold">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-400">{log.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    {log.evidenceUrl ? <a href={log.evidenceUrl} target="_blank" className="text-indigo-400 flex items-center gap-2 text-xs font-bold uppercase"><Video size={14} /> Drive</a> : <span className="text-slate-600 text-xs italic">Nenhuma</span>}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{log.admin}</span>
                      <span className="text-[9px] text-slate-600 font-black uppercase">{LEVEL_NAMES[log.adminLevel || 1]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {canManage && (
                        <>
                          <button onClick={() => { setEditingLog(log); setIsModalOpen(true); }} className="p-2.5 bg-slate-800 rounded-xl text-slate-500 hover:text-emerald-400 transition-all"><Edit size={18} /></button>
                          <button onClick={() => deleteLog(log.id)} className="p-2.5 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PunishmentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLog(null); }} onSave={handleSavePunishment} initialType={typeFilter} userLevel={userLevel} userName={userName} editData={editingLog} />
    </div>
  );
};

export default LogsPage;
