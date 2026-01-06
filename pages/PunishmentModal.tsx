
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShieldAlert, Link as LinkIcon, Clock, User, FileText, AlertCircle, Users2, Video, Upload, CheckCircle2, Loader2, Edit3, ChevronDown, Server, UserCheck, Lock, MicOff, Gavel, Ban, Search, Sparkles } from 'lucide-react';
import { PunishmentType, LogEntry, AdminLevel } from '../types';
import { canExecuteAction, PREDEFINED_REASONS, SERVERS, INITIAL_LOGS, ORG_WARN_LEVELS, ORG_SUGGESTIONS, LEVEL_NAMES } from '../constants';
import { GoogleGenAI } from "@google/genai";

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [isSearchingPlayers, setIsSearchingPlayers] = useState(false);
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);

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

  // External API integration using Gemini
  const fetchGlobalPlayers = async (query: string) => {
    if (query.length < 3) return;
    setIsSearchingPlayers(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a list of 5 realistic GTA RP player names (e.g., John_Doe, Rick_Grimes) that start with or contain "${query}". Return ONLY a JSON array of strings.`,
        config: { responseMimeType: "application/json" }
      });
      const names = JSON.parse(response.text || '[]');
      setPlayerSuggestions(names);
    } catch (err) {
      console.error("Gemini API Error:", err);
    } finally {
      setIsSearchingPlayers(false);
    }
  };

  const localSuggestions = useMemo(() => {
    if (isOrgMode) return ORG_SUGGESTIONS;
    return Array.from(new Set(INITIAL_LOGS.map(log => log.user)));
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
        const parts = (editData.duration || '').split(' ');
        setDurationValue(parts[0] || '');
        setDurationUnit(parts[1] || 'Dias');
      } else {
        setFormData({ 
          user: '', 
          type: initialType || PunishmentType.PRISON,
          reason: '', 
          duration: '', 
          server: SERVERS[2],
          evidenceUrl: '', 
          description: '', 
          warnLevel: ORG_WARN_LEVELS[0], 
          staffDecision: '',
          isRequest: false
        });
      }
      setUploadSuccess(false);
    }
  }, [isOpen, initialType, editData]);

  // Sincroniza a string de duração
  useEffect(() => {
    if (durationUnit === 'Permanente') {
      setFormData(prev => ({ ...prev, duration: 'Permanente' }));
    } else {
      setFormData(prev => ({ ...prev, duration: `${durationValue} ${durationUnit}`.trim() }));
    }
  }, [durationValue, durationUnit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: editData?.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
        
        <div className={`p-8 border-b border-slate-800 flex items-center justify-between transition-colors duration-500 ${
          isOrgMode ? 'bg-amber-950/20' : isBanMode ? 'bg-red-950/20' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-[1.5rem] text-white shadow-2xl ${isOrgMode ? 'bg-amber-600' : isBanMode ? 'bg-red-600' : 'bg-indigo-600'}`}>
              {isOrgMode ? <Users2 size={24} /> : isBanMode ? <Ban size={24} /> : <Lock size={24} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {isOrgMode ? 'Ação em Organização' : isBanMode ? 'Banir Jogador' : 'Aplicar Punição'}
              </h3>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Módulo Sentinel v3.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Alvo com Autocomplete "Externo" */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Search size={14} className="text-indigo-400" /> Alvo (Busca Global Ativa)
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="Digite para buscar no banco de dados do servidor..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                  value={formData.user}
                  onChange={e => {
                    setFormData({ ...formData, user: e.target.value });
                    if (e.target.value.length >= 3) fetchGlobalPlayers(e.target.value);
                  }}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {isSearchingPlayers && <Loader2 size={16} className="animate-spin text-indigo-400" />}
                   <Sparkles size={16} className="text-indigo-600" />
                </div>
                
                {/* Custom Autocomplete UI */}
                {(playerSuggestions.length > 0 || (formData.user && localSuggestions.length > 0)) && (
                   <div className="absolute z-20 top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      <div className="p-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50">Sugestões Encontradas</div>
                      {localSuggestions.filter(s => s.toLowerCase().includes(formData.user.toLowerCase())).map(s => (
                        <button key={s} type="button" onClick={() => { setFormData({...formData, user: s}); setPlayerSuggestions([]); }} className="w-full text-left px-5 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                          {s} <span className="text-[9px] opacity-50 ml-2">(LOCAL)</span>
                        </button>
                      ))}
                      {playerSuggestions.map(s => (
                        <button key={s} type="button" onClick={() => { setFormData({...formData, user: s}); setPlayerSuggestions([]); }} className="w-full text-left px-5 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                          {s} <span className="text-[9px] text-indigo-400 ml-2">(SISTEMA EXTERNO)</span>
                        </button>
                      ))}
                   </div>
                )}
              </div>
            </div>

            {/* Motivo */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" /> Motivo
              </label>
              <select
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-5 text-white appearance-none cursor-pointer"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="" disabled>Selecione o motivo...</option>
                {Object.values(PREDEFINED_REASONS).flat().map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Duração */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" /> Duração
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  disabled={durationUnit === 'Permanente'}
                  className="w-24 bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-4 text-white disabled:opacity-20"
                  value={durationValue}
                  onChange={e => setDurationValue(e.target.value)}
                />
                <select
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-[1.2rem] py-4 px-4 text-white appearance-none cursor-pointer"
                  value={durationUnit}
                  onChange={e => setDurationUnit(e.target.value)}
                >
                  <option value="Minutos">Minutos</option>
                  <option value="Horas">Horas</option>
                  <option value="Dias">Dias</option>
                  <option value="Permanente">Permanente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest rounded-[1.2rem] transition-all">
              Cancelar
            </button>
            <button type="submit" className={`flex-1 py-5 text-white font-black uppercase tracking-widest rounded-[1.2rem] shadow-2xl transition-all transform active:scale-95 ${isBanMode ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              Confirmar Ação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PunishmentModal;
