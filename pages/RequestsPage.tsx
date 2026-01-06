
import React, { useState, useMemo, useRef } from 'react';
import { PunishmentType, RequestStatus, RequestEntry, AdminLevel } from '../types';
import { PREDEFINED_REASONS, SERVERS, LEVEL_NAMES, INITIAL_REQUESTS, ORG_WARN_LEVELS } from '../constants';
// Added Users2 to imports to fix "Cannot find name 'Users2'" error on line 146
import { PlusCircle, Clock, History, ClipboardList, User, ShieldAlert, FileText, Server, Video, Link as LinkIcon, Upload, Loader2, CheckCircle2, Search, Filter, ChevronDown, Check, X, AlertCircle, Users2 } from 'lucide-react';

interface RequestsPageProps {
  view: 'NEW' | 'PENDING' | 'HISTORY' | 'MINE';
  userLevel: AdminLevel;
  userName: string;
}

const RequestsPage: React.FC<RequestsPageProps> = ({ view, userLevel, userName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<RequestEntry[]>(INITIAL_REQUESTS);
  
  // Form State
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: PunishmentType.BAN,
    user: '',
    reason: '',
    duration: '',
    server: SERVERS[2],
    evidenceUrl: '',
    description: '',
    warnLevel: ORG_WARN_LEVELS[0]
  });

  const isOrgType = formData.type === PunishmentType.ORG_WARN;
  const canApprove = userLevel >= 4;

  const filteredRequests = useMemo(() => {
    switch (view) {
      case 'PENDING':
        return requests.filter(r => r.status === RequestStatus.PENDING);
      case 'HISTORY':
        return requests.filter(r => r.status !== RequestStatus.PENDING);
      case 'MINE':
        return requests.filter(r => r.admin === userName);
      default:
        return [];
    }
  }, [requests, view, userName]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const fakeUrl = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
      setFormData(prev => ({ ...prev, evidenceUrl: fakeUrl }));
    }, 1500);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: RequestEntry = {
      ...formData,
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      admin: userName,
      adminLevel: userLevel,
      status: RequestStatus.PENDING,
      orgName: isOrgType ? formData.user : undefined
    };
    setRequests([newRequest, ...requests]);
    setFormData({
      type: PunishmentType.BAN,
      user: '',
      reason: '',
      duration: '',
      server: SERVERS[2],
      evidenceUrl: '',
      description: '',
      warnLevel: ORG_WARN_LEVELS[0]
    });
    alert('Solicitação enviada com sucesso para análise!');
  };

  const handleReview = (id: string, status: RequestStatus) => {
    const comment = prompt(`Comentário de revisão para a ${status === RequestStatus.APPROVED ? 'Aprovação' : 'Rejeição'}:`);
    setRequests(requests.map(r => r.id === id ? {
      ...r,
      status,
      reviewedBy: userName,
      reviewDate: new Date().toISOString(),
      reviewComment: comment || undefined
    } : r));
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case RequestStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case RequestStatus.REJECTED: return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
            {view === 'NEW' ? <PlusCircle size={24} /> : view === 'PENDING' ? <Clock size={24} /> : view === 'HISTORY' ? <History size={24} /> : <ClipboardList size={24} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {view === 'NEW' ? 'Solicitar Punição' : view === 'PENDING' ? 'Solicitações Pendentes' : view === 'HISTORY' ? 'Histórico de Decisões' : 'Minhas Solicitações'}
            </h2>
            <p className="text-slate-500 font-medium">
              {view === 'NEW' ? 'Encaminhe punições para revisão de superiores.' : 'Fila de análise prioritária para cargos LV4+.'}
            </p>
          </div>
        </div>
      </header>

      {view === 'NEW' ? (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmitRequest} className="p-10 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Tipo */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} className="text-indigo-400" /> Tipo de Punição
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white appearance-none cursor-pointer font-bold"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as PunishmentType })}
                    >
                      <option value={PunishmentType.BAN}>Solicitar Banimento</option>
                      <option value={PunishmentType.IP_BAN}>Solicitar Banimento de IP</option>
                      <option value={PunishmentType.WARN}>Solicitar WARN Jogador</option>
                      <option value={PunishmentType.ORG_WARN}>Solicitar WARN Org / Família</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* 2. Alvo */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {isOrgType ? <Users2 size={14} className="text-amber-400" /> : <User size={14} className="text-indigo-400" />}
                    {isOrgType ? 'Nome da Org / Família' : 'Nome do Jogador / IP'}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={isOrgType ? "Ex: Comando Vermelho" : "Ex: Nick_Name ou IP"}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white focus:ring-2 focus:ring-indigo-500/40"
                    value={formData.user}
                    onChange={e => setFormData({ ...formData, user: e.target.value })}
                  />
                </div>

                {/* 3. Motivo */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" /> Motivo da Solicitação
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white appearance-none"
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    >
                      <option value="" disabled>Selecione um motivo padronizado...</option>
                      {Object.entries(PREDEFINED_REASONS).map(([cat, reasons]) => (
                        <optgroup key={cat} label={cat}>
                          {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* 4. Duração ou Nível */}
                {isOrgType ? (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={14} /> Severidade da Advertência
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-800/50 border border-amber-500/30 rounded-[1.2rem] py-4 px-5 text-white appearance-none font-bold"
                        value={formData.warnLevel}
                        onChange={e => setFormData({ ...formData, warnLevel: e.target.value })}
                      >
                        {ORG_WARN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-indigo-400" /> Duração Sugerida
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 7 Dias ou Permanente"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                )}

                {/* 5. Servidor */}
                <div className={`space-y-3 ${isOrgType ? 'hidden' : ''}`}>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Server size={14} className="text-indigo-400" /> Servidor da Ocorrência
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white appearance-none"
                      value={formData.server}
                      onChange={e => setFormData({ ...formData, server: e.target.value })}
                    >
                      {SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* 6. Evidência */}
                <div className="space-y-4 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Video size={14} className="text-indigo-400" /> Evidência Obrigatória
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[1.5rem] transition-all ${
                        formData.evidenceUrl ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' : 'border-slate-700 bg-slate-800/30 text-slate-500 hover:border-indigo-500/50'
                      }`}
                    >
                      {isUploading ? <Loader2 className="animate-spin mb-2" /> : formData.evidenceUrl ? <CheckCircle2 className="mb-2" /> : <Upload className="mb-2" />}
                      <span className="text-xs font-black uppercase">Upload Prova</span>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    </button>
                    <div className="relative h-full">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input
                        type="url"
                        placeholder="Ou cole o link aqui..."
                        className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-[1.5rem] py-4 pl-14 pr-5 text-sm text-white"
                        value={formData.evidenceUrl}
                        onChange={e => setFormData({ ...formData, evidenceUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Observação */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" /> Detalhes Extras
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.5rem] py-4 px-6 text-white resize-none"
                    placeholder="Explique o contexto para o Gerente/Master..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
             </div>

             <div className="pt-8 border-t border-slate-800">
                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-[1.2rem] shadow-2xl shadow-indigo-600/20 transition-all transform active:scale-[0.98]">
                  Enviar Solicitação para Análise
                </button>
             </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
            <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-700/50 px-5 py-2.5 rounded-2xl w-full max-w-md">
              <Search className="text-slate-500" size={18} />
              <input type="text" placeholder="Pesquisar solicitante, alvo ou motivo..." className="bg-transparent border-none text-white focus:ring-0 text-sm w-full" />
            </div>
            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Filter size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/30 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 text-slate-500">ID / Data</th>
                  <th className="px-8 py-5 text-slate-500">Tipo de Pedido</th>
                  <th className="px-8 py-5 text-slate-500">Alvo (Jogador/Org)</th>
                  <th className="px-8 py-5 text-slate-500">Solicitado Por</th>
                  <th className="px-8 py-5 text-slate-500">Status</th>
                  <th className="px-8 py-5 text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-white font-bold text-sm tracking-tight">#{req.id.split('-')[1]}</div>
                      <div className="text-[10px] text-slate-600 font-medium">{new Date(req.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${req.type === PunishmentType.ORG_WARN ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            {req.user[0]}
                          </div>
                          <span className="text-white font-bold">{req.user}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-slate-300 font-bold text-xs">{req.admin}</span>
                          <span className="text-[9px] text-slate-500 font-black uppercase">{LEVEL_NAMES[req.adminLevel]}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(req.status)}`}>
                         {req.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white" title="Ver Detalhes">
                            <AlertCircle size={18} />
                         </button>
                         {view === 'PENDING' && canApprove && (
                           <>
                             <button onClick={() => handleReview(req.id, RequestStatus.APPROVED)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                <Check size={18} />
                             </button>
                             <button onClick={() => handleReview(req.id, RequestStatus.REJECTED)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <X size={18} />
                             </button>
                           </>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold uppercase tracking-widest italic">
                       Nenhum registro encontrado nesta visualização.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
