
import React, { useState } from 'react';
import { Bell, Megaphone, Plus, Calendar, User, Pin, Trash2, Tag, Info, AlertTriangle, Settings, Sparkles, X } from 'lucide-react';
import { NotificationEntry, NotificationCategory, AdminLevel } from '../types';
import { INITIAL_NOTIFICATIONS, LEVEL_NAMES } from '../constants';

interface NotificationsPageProps {
  userLevel: AdminLevel;
  userName: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userLevel, userName }) => {
  const [notifications, setNotifications] = useState<NotificationEntry[]>(INITIAL_NOTIFICATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: NotificationCategory.NOTICE,
    isPinned: false
  });

  const canCreateNotice = userLevel >= 4;

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: NotificationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...newNotice,
      author: userName,
      authorLevel: userLevel,
      timestamp: new Date().toISOString()
    };
    setNotifications([entry, ...notifications]);
    setIsModalOpen(false);
    setNewNotice({ title: '', content: '', category: NotificationCategory.NOTICE, isPinned: false });
  };

  const deleteNotice = (id: string) => {
    if (confirm('Deseja realmente remover este anúncio?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.UPDATE: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case NotificationCategory.PATCH: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case NotificationCategory.NOTICE: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case NotificationCategory.MAINTENANCE: return 'bg-red-500/10 text-red-400 border-red-500/20';
      case NotificationCategory.NEWS: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.UPDATE: return <Sparkles size={14} />;
      case NotificationCategory.PATCH: return <Settings size={14} />;
      case NotificationCategory.NOTICE: return <Info size={14} />;
      case NotificationCategory.MAINTENANCE: return <AlertTriangle size={14} />;
      case NotificationCategory.NEWS: return <Megaphone size={14} />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Central de Avisos</h2>
          <p className="text-slate-400">Notificações da Staff, atualizações de sistema e comunicados gerais.</p>
        </div>
        {canCreateNotice && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-white font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
          >
            <Plus size={20} />
            Novo Anúncio
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {notifications.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((notice) => (
          <div 
            key={notice.id} 
            className={`bg-slate-800/40 border rounded-[2rem] p-8 transition-all relative overflow-hidden group ${
              notice.isPinned ? 'border-indigo-500/30' : 'border-slate-700/50'
            }`}
          >
            {notice.isPinned && (
              <div className="absolute top-0 right-0 p-4">
                <Pin size={18} className="text-indigo-500 -rotate-45" />
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border ${getCategoryColor(notice.category)}`}>
                {getCategoryIcon(notice.category)}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getCategoryColor(notice.category)}`}>
                    {notice.category}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{notice.title}</h3>
                </div>

                <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {notice.content}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-700/30 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-indigo-400" />
                    Por: <span className="text-indigo-300 font-bold">{notice.author}</span>
                    <span className="bg-slate-700/50 px-1.5 rounded text-[8px] font-black uppercase">{LEVEL_NAMES[notice.authorLevel]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(notice.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {canCreateNotice && (
                <div className="flex md:flex-col gap-2 self-start md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteNotice(notice.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    title="Remover anúncio"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-slate-800/10 border border-slate-800 border-dashed rounded-[3rem]">
            <Bell size={48} className="mx-auto text-slate-700" />
            <h3 className="text-xl font-bold text-slate-500">Nenhuma notificação publicada</h3>
          </div>
        )}
      </div>

      {/* Modal Criar Anúncio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Novo Anúncio</h3>
                  <p className="text-slate-400 text-sm">Publique uma mensagem para todos os admins.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Título do Anúncio</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Ex: Manutenção agendada..."
                    value={newNotice.title}
                    onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Categoria</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 px-4 text-white appearance-none cursor-pointer"
                      value={newNotice.category}
                      onChange={e => setNewNotice({...newNotice, category: e.target.value as NotificationCategory})}
                    >
                      <option value={NotificationCategory.NOTICE}>Aviso Geral</option>
                      <option value={NotificationCategory.UPDATE}>Atualização</option>
                      <option value={NotificationCategory.PATCH}>Patch Notes</option>
                      <option value={NotificationCategory.MAINTENANCE}>Manutenção</option>
                      <option value={NotificationCategory.NEWS}>Notícia</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-3">
                    <button 
                      type="button"
                      onClick={() => setNewNotice({...newNotice, isPinned: !newNotice.isPinned})}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${newNotice.isPinned ? 'text-indigo-400' : 'text-slate-500'}`}
                    >
                      <Pin size={16} className={newNotice.isPinned ? '-rotate-45' : ''} />
                      Fixar no topo?
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Conteúdo da Mensagem</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 px-4 text-white resize-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Descreva os detalhes do anúncio..."
                    value={newNotice.content}
                    onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-700 text-white font-bold rounded-2xl">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20">
                  Publicar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
