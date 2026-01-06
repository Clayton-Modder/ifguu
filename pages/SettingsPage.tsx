
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Users, UserPlus, Trash2, Key, Info, 
  FileJson, Download, RefreshCcw, Database, 
  Code, Save, FileCode, FolderOpen, ChevronRight,
  Terminal, Activity, Clock, AlertTriangle
} from 'lucide-react';
import { Admin, AdminLevel, UserAuth } from '../types';
import { db } from '../services/store';

const SettingsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', level: 1 as AdminLevel });
  const [selectedFile, setSelectedFile] = useState<'LOGINS' | 'ADMINS' | 'LOGS'>('LOGINS');
  const [fileContent, setFileContent] = useState('[]');
  const [dbSize, setDbSize] = useState('0 KB');
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const u = await db.getCurrentUser();
      const a = await db.getAdmins();
      setCurrentUser(u);
      setAdmins(a);
      setDbSize(db.getRawDBSize());
      
      const content = db.getRawFileContent(selectedFile);
      setFileContent(content);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
      setError("Falha ao ler o banco de dados local.");
    }
  }, [selectedFile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const admin: Admin = {
      ...newAdmin,
      id: Math.random().toString(36).substr(2, 9),
      actionsCount: 0,
      lastActive: 'Nunca',
      status: 'Offline',
      efficiency: 0,
      joinedDate: new Date().toLocaleDateString(),
      lastLoginIp: '0.0.0.0'
    };
    await db.saveAdmin(admin);
    loadData();
    setShowAddForm(false);
    setNewAdmin({ name: '', email: '', level: 1 });
  };

  const removeAdmin = async (id: string) => {
    const target = admins.find(a => a.id === id);
    if (!target) return;

    if (currentUser?.level === 4 && target.level >= 4) {
      alert("Permissão insuficiente para remover este nível.");
      return;
    }

    if (confirm(`Remover ${target.name} do arquivo admins.json?`)) {
      await db.deleteAdmin(id);
      loadData();
    }
  };

  const downloadFile = (file: string) => {
    db.exportFile(file as any);
  };

  const renderEditorContent = () => {
    try {
      if (!fileContent || fileContent === '') return "// Arquivo Vazio";
      const parsed = JSON.parse(fileContent);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return `// Erro Crítico de Formatação no JSON\n// Conteúdo Bruto: \n${fileContent}`;
    }
  };

  if (!currentUser) return null;

  const canManageAdmins = currentUser.level >= 4;

  return (
    <div className="max-w-7xl space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Arquivos do Sistema</h2>
          <p className="text-slate-500 font-medium tracking-tight">Gestão centralizada de dados JSON e permissões staff.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => loadData()}
             className="p-3 bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-2xl transition-all border border-slate-700/50"
             title="Recarregar do Disco"
           >
              <RefreshCcw size={18} />
           </button>
           <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
              <Database className="text-indigo-400" size={18} />
              <div className="flex flex-col leading-none">
                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tamanho DB</span>
                 <span className="text-sm font-black text-white">{dbSize}</span>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: File Explorer (IDE Style) */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[700px]">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <FolderOpen className="text-slate-500" size={18} />
                  <div className="flex gap-2">
                     {['LOGINS', 'ADMINS', 'LOGS'].map((file) => (
                        <button 
                           key={file}
                           onClick={() => setSelectedFile(file as any)}
                           className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedFile === file ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                           {file.toLowerCase()}.json
                        </button>
                     ))}
                  </div>
               </div>
               <button 
                  onClick={() => downloadFile(selectedFile.toLowerCase() + '.json')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                  <Download size={14} /> Baixar
               </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
               {/* Sidebar de Arquivos */}
               <div className="w-48 bg-slate-950/50 border-r border-slate-800 p-4 hidden md:block">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Estrutura</p>
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs py-1">
                        <FileJson size={14} /> /root
                     </div>
                     <div className="pl-4 space-y-1">
                        {['logins.json', 'admins.json', 'logs.json'].map(f => (
                           <div 
                             key={f} 
                             onClick={() => setSelectedFile(f.split('.')[0].toUpperCase() as any)}
                             className={`flex items-center gap-2 text-xs py-1.5 cursor-pointer transition-colors group ${selectedFile.toLowerCase() + '.json' === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                           >
                              <ChevronRight size={10} className={selectedFile.toLowerCase() + '.json' === f ? 'text-indigo-500' : 'text-slate-700'} />
                              <span>{f}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Editor View */}
               <div className="flex-1 relative bg-slate-900 overflow-hidden">
                  {error && (
                    <div className="absolute inset-0 z-20 bg-red-950/20 backdrop-blur-sm flex items-center justify-center p-8">
                       <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl text-center max-w-sm">
                          <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                          <p className="text-white font-bold">{error}</p>
                          <button onClick={() => loadData()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase">Tentar Novamente</button>
                       </div>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-12 h-full bg-slate-950 border-r border-slate-800 flex flex-col items-center pt-4 text-slate-700 font-mono text-[10px] select-none">
                     {Array.from({length: 100}).map((_, i) => <div key={i} className="leading-5 h-5">{i+1}</div>)}
                  </div>
                  <pre className="pl-16 p-4 font-mono text-[11px] text-indigo-300 overflow-auto h-full custom-scrollbar leading-5 selection:bg-indigo-500/30">
                     <code>{renderEditorContent()}</code>
                  </pre>
               </div>
            </div>

            <div className="bg-slate-950 border-t border-slate-800 p-3 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
               <div className="flex gap-4">
                  <span className="flex items-center gap-1"><Terminal size={10} /> UTF-8</span>
                  <span className="flex items-center gap-1 text-indigo-500"><Activity size={10} /> Live JSON Stream</span>
               </div>
               <span>Sentinel Core v3.3</span>
            </div>
          </section>
        </div>

        {/* Lado Direito: Gestão de Staff */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">Equipe Staff</h3>
                {canManageAdmins && (
                   <button onClick={() => setShowAddForm(!showAddForm)} className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-transform active:scale-95">
                      <UserPlus size={18} />
                   </button>
                )}
             </div>

             {showAddForm && (
                <form onSubmit={handleAddAdmin} className="mb-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
                   <input 
                    required 
                    placeholder="Nick Staff" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                    value={newAdmin.name}
                    onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                   />
                   <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                    value={newAdmin.level}
                    onChange={e => setNewAdmin({...newAdmin, level: parseInt(e.target.value) as AdminLevel})}
                   >
                      <option value={1}>Moderador Básico (LV1)</option>
                      <option value={2}>Moderador Avançado (LV2)</option>
                      <option value={3}>Supervisor (LV3)</option>
                      <option value={4}>Gerente (LV4)</option>
                      <option value={5}>Staff Geral (MASTER)</option>
                   </select>
                   <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">Cadastrar no JSON</button>
                </form>
             )}

             <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {admins.map(admin => (
                   <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-2xl group hover:border-indigo-500/20 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-slate-700 group-hover:scale-110 transition-transform">
                            {admin.name[0]}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm tracking-tight">{admin.name}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">LV{admin.level} Staff</p>
                         </div>
                      </div>
                      {canManageAdmins && admin.name !== currentUser.name && (
                         <button onClick={() => removeAdmin(admin.id)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                         </button>
                      )}
                   </div>
                ))}
             </div>
          </section>

          <section className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                <FileCode size={100} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <Save size={24} />
                   </div>
                   <h3 className="text-xl font-black tracking-tight">Exportar Tudo</h3>
                </div>
                <p className="text-sm text-indigo-100 mb-8 leading-relaxed font-medium">Baixe o banco de dados completo contendo todos os arquivos JSON do Sentinel para auditoria externa.</p>
                <button 
                  onClick={() => downloadFile('full_backup.json')}
                  className="w-full py-4 bg-white text-indigo-600 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98]"
                >
                   Baixar Full Backup
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
