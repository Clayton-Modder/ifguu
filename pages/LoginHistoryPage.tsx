
import React, { useState, useEffect } from 'react';
import { db } from '../services/store';
import { LoginRecord } from '../types';
import { ShieldCheck, ShieldAlert, Monitor, Clock, Globe, Search, Database, FileJson, Trash2 } from 'lucide-react';

const LoginHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await db.getLoginHistory();
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = history.filter(h => 
    h.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.ip.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Histórico de Logins</h2>
          <p className="text-slate-500 font-medium tracking-tight">Auditoria do arquivo virtual <span className="text-indigo-400 font-mono">logins.json</span>.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => db.exportFile('logins.json')}
             className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
           >
              <FileJson size={18} /> Exportar JSON
           </button>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-800/10 flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="relative w-full max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
               type="text" 
               placeholder="Filtrar por usuário ou IP..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-800/30 border border-slate-700 rounded-2xl text-white focus:outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-500 tracking-widest">
              <Database size={14} className="text-indigo-400" />
              {history.length} Registros no Arquivo
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Usuário Staff</th>
                <th className="px-8 py-5">Endereço IP</th>
                <th className="px-8 py-5">Dispositivo / Browser</th>
                <th className="px-8 py-5 text-right">Data & Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-800/20 transition-all">
                  <td className="px-8 py-6">
                    {log.status === 'SUCCESS' ? (
                      <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
                        <ShieldCheck size={16} /> Sucesso
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase">
                        <ShieldAlert size={16} /> Falha
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white font-bold">{log.username}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                       <Globe size={14} className="text-indigo-400" />
                       {log.ip}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs truncate max-w-[200px]">
                       <Monitor size={14} />
                       {log.userAgent}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400 text-xs">
                       <Clock size={14} className="text-indigo-400" />
                       {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.3em]">
                    Nenhum registro encontrado no logins.json
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginHistoryPage;
