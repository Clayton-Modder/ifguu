
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShieldAlert, Link as LinkIcon, Clock, User, FileText, AlertCircle, Users2, Video, Upload, CheckCircle2, Loader2, Edit3, ChevronDown, Server, UserCheck, Lock, MicOff, Gavel, Ban } from 'lucide-react';
import { PunishmentType, LogEntry, AdminLevel } from '../types';
import { canExecuteAction, PREDEFINED_REASONS, SERVERS, INITIAL_LOGS, ORG_WARN_LEVELS, ORG_SUGGESTIONS, LEVEL_NAMES } from '../constants';

interface PunishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<LogEntry, 'id' | 'timestamp' | 'adminIp' | 'admin' | 'adminLevel'> & { id?: string }) => void;
  initialType?: PunishmentType;
  isTypeLocked?: boolean;
  userLevel: AdminLevel;
  userName: string;
  editData?: LogEntry | null;
}

const PunishmentModal: React.FC<PunishmentModalProps> = ({ isOpen, onClose, onSave, initialType, isTypeLocked, userLevel, userName, editData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCustomReason, setIsCustomReason] = useState(false);

  // Estados locais para controle de duração decomposta
  const [durationValue, setDurationValue] = useState<string>('');
  const [durationUnit, setDurationUnit] = useState<string>('Dias');

  const [formData, setFormData] = useState({
    user: '',
    type: initialType || PunishmentType.PRISON,
    reason: '',
    duration: '',
    server: SERVERS[0],
    evidenceUrl: '',
    description: '',
    warnLevel: ORG_WARN_LEVELS[0],
    staffDecision: '',
    isRequest: false
  });

  const isOrgMode = formData.type === PunishmentType.ORG_WARN;
  const isBanMode = formData.type === PunishmentType.BAN || formData.type === PunishmentType.IP_BAN;

  // Autocomplete dinâmico
  const suggestions = useMemo(() => {
    if (isOrgMode) {
      return Array.from(new Set([...ORG_SUGGESTIONS, ...INITIAL_LOGS.filter(l => l.type === PunishmentType.ORG_WARN).map(l => l.user)]));
    }
    return Array.from(new Set(INITIAL_LOGS.filter(l => l.type !== PunishmentType.ORG_WARN).map(log => log.user)));
  }, [isOrgMode]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          user: editData.user,
          type: editData.type,
          reason: editData.reason,
          duration: editData.duration || '',
          server: editData.server || SERVERS[0],
          evidenceUrl: editData.evidenceUrl || '',
          description: editData.description || '',
          warnLevel: editData.warnLevel || ORG_WARN_LEVELS[0],
          staffDecision: editData.staffDecision || '',
          isRequest: editData.isRequest || false
        });

        if (editData.duration === 'Permanente') {
          setDurationValue('');
          setDurationUnit('Permanente');
        } else {
          const parts = (editData.duration || '').split(' ');
          setDurationValue(parts[0] || '');
          setDurationUnit(parts[1] || (isBanMode ? 'Dias' : 'Minutos'));
        }
        
        const allPredefined = Object.values(PREDEFINED_REASONS).flat();
        setIsCustomReason(!allPredefined.includes(editData.reason));
        setUploadSuccess(!!editData.evidenceUrl && editData.evidenceUrl.includes('drive.google.com'));
      } else {
        const defaultType = initialType || PunishmentType.PRISON;
        const canDoDefault = canExecuteAction(userLevel, defaultType);
        
        setFormData({ 
          user: '', 
          type: canDoDefault ? defaultType : PunishmentType.PRISON,
          reason: '', 
          duration: '', 
          server: SERVERS[2] || SERVERS[0],
          evidenceUrl: '', 
          description: '', 
          warnLevel: ORG_WARN_LEVELS[0], 
          staffDecision: '',
          isRequest: !canDoDefault
        });
        setDurationValue('');
        setDurationUnit(isBanMode ? 'Dias' : 'Minutos');
        setIsCustomReason(false);
        setUploadSuccess(false);
      }
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [initialType, isOpen, userLevel, editData, isBanMode]);

  // Sincroniza a string de duração conforme os inputs mudam
  useEffect(() => {
    if (isOrgMode) {
      setFormData(prev => ({ ...prev, duration: '' }));
    } else {
      if (durationUnit === 'Permanente') {
        setFormData(prev => ({ ...prev, duration: 'Permanente' }));
        setDurationValue('');
      } else {
        setFormData(prev => ({ ...prev, duration: `${durationValue} ${durationUnit}`.trim() }));
      }
    }
  }, [durationValue, durationUnit, isOrgMode]);

  if (!isOpen) return null;

  const canActuallyDo = canExecuteAction(userLevel, formData.type);
  const isEditing = !!editData;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsUploading(false);
        setUploadSuccess(true);
        const driveId = Math.random().toString(36).substring(2, 15);
        setFormData(prev => ({ 
          ...prev, 
          evidenceUrl: `https://drive.google.com/file/d/${driveId}/view?usp=sharing` 
        }));
      }
      setUploadProgress(progress);
    }, 400);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "CUSTOM") {
      setIsCustomReason(true);
      setFormData({ ...formData, reason: '' });
    } else {
      setIsCustomReason(false);
      setFormData({ ...formData, reason: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editData?.id,
      isRequest: !canActuallyDo,
      orgName: isOrgMode ? formData.user : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
        
        {/* Modal Header */}
        <div className={`p-8 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 transition-colors duration-500 ${
          isOrgMode ? 'bg-amber-950/20' : isBanMode ? 'bg-red-950/20' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-[1.5rem] text-white shadow-2xl transition-all duration-500 ${
              isOrgMode ? 'bg-amber-600' : 
              isBanMode ? 'bg-red-600' : 
              formData.type === PunishmentType.PRISON ? 'bg-indigo-600' : 'bg-sky-600'
            }`}>
              {isEditing ? <Edit3 size={24} /> : (isOrgMode ? <Users2 size={24} /> : isBanMode ? <Ban size={24} /> : (formData.type === PunishmentType.PRISON ? <Lock size={24} /> : <MicOff size={24} />))}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Editar Registro' : isOrgMode ? 'Advertência de Org' : isBanMode ? 'Banimento de Jogador' : `Nova Punir: ${formData.type === PunishmentType.PRISON ? 'Prisão' : 'Mute'}`}
              </h3>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
                {isOrgMode ? 'Gestão de Facções' : isBanMode ? 'Departamento de Segurança' : 'Painel de Disciplina'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Nome do Sujeito */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {isOrgMode ? <Users2 size={14} className="text-amber-400" /> : <User size={14} className="text-indigo-400" />}
                {isOrgMode ? 'Nome da Org / Família / Máfia' : 'Nome do Jogador'}
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  list="autocomplete-list"
                  placeholder={isOrgMode ? "Ex: Comando Vermelho" : "Ex: Nome_Sobrenome"}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                  value={formData.user}
                  onChange={e => setFormData({ ...formData, user: e.target.value })}
                />
                <datalist id="autocomplete-list">
                  {suggestions.map(name => <option key={name} value={name} />)}
                </datalist>
              </div>
            </div>

            {/* 2. Motivo Padronizado */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" /> Motivo Principal
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
                  value={isCustomReason ? "CUSTOM" : formData.reason}
                  onChange={handleReasonChange}
                >
                  <option value="" disabled>Selecione o motivo...</option>
                  {Object.entries(PREDEFINED_REASONS).map(([category, reasons]) => (
                    <optgroup key={category} label={category}>
                      {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </optgroup>
                  ))}
                  <option value="CUSTOM" className="font-bold text-indigo-400 italic">-- Outro Motivo --</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Campo Customizado */}
            {isCustomReason && (
              <div className="md:col-span-2 animate-in slide-in-from-top-2">
                 <input
                  required
                  type="text"
                  placeholder="Descreva o motivo administrativo detalhadamente..."
                  className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-[1.2rem] py-4 px-5 text-white font-medium"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
            )}

            {/* 3. Duração ou Nível */}
            {isOrgMode ? (
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <Gavel size={14} /> Tipo de Advertência
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-slate-800/50 border border-amber-500/30 rounded-[1.2rem] py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none cursor-pointer font-bold"
                    value={formData.warnLevel}
                    onChange={e => setFormData({ ...formData, warnLevel: e.target.value })}
                  >
                    {ORG_WARN_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" /> Duração da Punição
                </label>
                <div className="flex gap-3">
                  <input
                    disabled={durationUnit === 'Permanente'}
                    required={durationUnit !== 'Permanente'}
                    type="number"
                    min="1"
                    placeholder="7"
                    className="w-28 bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-20 text-center font-bold text-lg"
                    value={durationValue}
                    onChange={e => setDurationValue(e.target.value)}
                  />
                  <div className="relative flex-1">
                    <select
                      className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer font-semibold"
                      value={durationUnit}
                      onChange={e => setDurationUnit(e.target.value)}
                    >
                      <option value="Minutos">Minutos</option>
                      <option value="Horas">Horas</option>
                      <option value="Dias">Dias</option>
                      <option value="Permanente">Permanente</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Servidor */}
            <div className={`space-y-3 ${isOrgMode ? 'md:col-span-2' : ''}`}>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Server size={14} className="text-indigo-400" /> Servidor
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white appearance-none cursor-pointer font-semibold"
                  value={formData.server}
                  onChange={e => setFormData({ ...formData, server: e.target.value })}
                >
                  {SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* 5. Solicitado Por (Auditoria Automática) */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={14} className="text-indigo-400" /> Solicitado Por
              </label>
              <div className="w-full bg-slate-950/40 border border-slate-800 rounded-[1.2rem] py-4 px-6 text-slate-300 font-bold flex items-center justify-between">
                <span>{userName}</span>
                <span className="text-[10px] bg-slate-800 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-black uppercase tracking-widest">
                  {LEVEL_NAMES[userLevel]}
                </span>
              </div>
            </div>

            {/* 6. Evidência */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Video size={14} className="text-indigo-400" /> Evidência (Obrigatório)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[1.5rem] transition-all group ${
                    uploadSuccess 
                      ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' 
                      : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-500'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin mb-2" size={24} />
                  ) : uploadSuccess ? (
                    <CheckCircle2 className="mb-2" size={24} />
                  ) : (
                    <Upload className="mb-2 group-hover:scale-110 transition-transform" size={24} />
                  )}
                  <span className="text-xs font-black uppercase">Upload Vídeo (Drive)</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
                </button>

                <div className="relative h-full">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="url"
                    required={!uploadSuccess}
                    placeholder="Cole o link da prova..."
                    className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-[1.5rem] py-4 pl-14 pr-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    value={formData.evidenceUrl}
                    onChange={e => setFormData({ ...formData, evidenceUrl: e.target.value })}
                  />
                </div>
              </div>
              {uploadSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-mono text-emerald-400 truncate flex-1 font-bold">Upload concluído: {formData.evidenceUrl}</p>
                </div>
              )}
            </div>

            {/* 7. Observação */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" /> Observação (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Detalhes extras sobre a situação, testemunhas ou reincidência..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.5rem] py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-medium placeholder:text-slate-600"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 pt-8 border-t border-slate-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest rounded-[1.2rem] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`flex-1 py-5 text-white font-black uppercase tracking-widest rounded-[1.2rem] shadow-2xl transition-all transform active:scale-95 ${
                isUploading ? 'bg-slate-800 cursor-not-allowed opacity-50' :
                isEditing ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' :
                isBanMode ? 'bg-red-600 hover:bg-red-500 shadow-red-500/40' :
                'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40'
              }`}
            >
              {isEditing ? 'Atualizar Banimento' : 'Confirmar Banimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PunishmentModal;
