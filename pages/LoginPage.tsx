
import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { db } from '../services/store';
import { UserAuth } from '../types';

interface LoginPageProps {
  onLogin: (data: UserAuth) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (captchaValue !== '4839') {
      setError('Código Captcha incorreto!');
      return;
    }
    
    setIsLoading(true);

    try {
      const admins = await db.getAdmins();
      const foundAdmin = admins.find(a => a.name.toLowerCase() === username.toLowerCase());

      setTimeout(async () => {
        if (foundAdmin) {
          // Gravação no "Arquivo JSON" de Logins
          await db.recordLogin({
            username: username,
            ip: '189.124.55.201',
            userAgent: navigator.userAgent,
            status: 'SUCCESS',
            details: 'Autenticação via Painel Sentinel'
          });

          setIsLoading(false);
          setIsSuccess(true);
          
          const userSession: UserAuth = { 
            name: foundAdmin.name, 
            email: foundAdmin.email, 
            level: foundAdmin.level,
            avatar: foundAdmin.avatar,
            status: 'Online',
            mainServer: foundAdmin.mainServer || 'Principal',
            lastLogin: {
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              ip: '189.124.55.201'
            },
            efficiency: {
              punishmentsApplied: foundAdmin.actionsCount,
              requestsCreated: Math.floor(foundAdmin.actionsCount * 0.2),
              requestsApproved: Math.floor(foundAdmin.actionsCount * 0.18),
              requestsRejected: Math.floor(foundAdmin.actionsCount * 0.02),
              avgResponseTime: '4min',
              precision: foundAdmin.efficiency
            }
          };
          
          localStorage.setItem('sentinel_user', JSON.stringify(userSession));
          
          setTimeout(() => {
            onLogin(userSession);
          }, 800);
        } else {
          // Gravação de falha no logins.json
          await db.recordLogin({
            username: username,
            ip: '189.124.55.201',
            userAgent: navigator.userAgent,
            status: 'FAILED',
            details: 'Tentativa de login com usuário inexistente'
          });

          setIsLoading(false);
          setError('Acesso Negado: Usuário não encontrado no registro staff.');
        }
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      setError('Erro ao conectar com o banco de dados JSON.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-inter">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-600/20 mb-4 animate-pulse">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Sentinel Admin</h1>
          <p className="text-slate-400 mt-2 font-medium">Autenticação Restrita Staff</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
              <XCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!error && !isSuccess && (
            <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3 text-indigo-300 text-xs">
              <AlertCircle size={18} className="shrink-0" />
              <p>O sistema exige que seu login já esteja cadastrado no arquivo <b>admins.json</b>.</p>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={18} className="shrink-0" />
              <p>Login registrado em logins.json. Autorizando...</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Staff</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
                  placeholder="Seu nome no registro"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Validação Humana</label>
              <div className="flex gap-3 justify-center">
                <div className="w-28 bg-slate-900/80 border border-slate-700 rounded-2xl py-3 text-center font-mono font-bold tracking-[0.2em] text-white/30 select-none italic line-through decoration-indigo-500 select-none">
                  4839
                </div>
                <input 
                  type="text" 
                  required
                  maxLength={4}
                  className="w-24 bg-slate-900/50 border border-slate-700 rounded-2xl py-3 px-4 text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-black text-lg"
                  placeholder="----"
                  value={captchaValue}
                  onChange={(e) => setCaptchaValue(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`w-full py-4 mt-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 ${
                isSuccess 
                  ? 'bg-emerald-600 shadow-emerald-600/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={20} />
                  Acesso Autorizado
                </>
              ) : (
                <>
                  Entrar no Sentinel
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
