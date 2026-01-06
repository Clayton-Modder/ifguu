
import React from 'react';
import { Smartphone, Monitor, Download, ArrowRight, Share2, Globe } from 'lucide-react';

const InstallPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
      <header className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-white">Sentinel em Qualquer Lugar</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Acesse os logs e gerencie sua comunidade de onde estiver. Baixe o aplicativo oficial ou instale a versão PWA.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mobile App */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center text-center group hover:border-indigo-500/50 transition-all">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Mobile (APK)</h3>
          <p className="text-slate-400 text-sm mb-8">Ideal para Android. Receba notificações push em tempo real.</p>
          <button className="mt-auto w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download size={20} />
            Baixar APK
          </button>
        </div>

        {/* Desktop App */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center text-center group hover:border-emerald-500/50 transition-all">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Monitor size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Desktop Version</h3>
          <p className="text-slate-400 text-sm mb-8">Performance otimizada para administradores no Windows/macOS.</p>
          <button className="mt-auto w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download size={20} />
            Baixar Setup
          </button>
        </div>

        {/* PWA */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center text-center group hover:border-orange-500/50 transition-all">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instalar como App</h3>
          <p className="text-slate-400 text-sm mb-8">Transforme este site em um app sem baixar arquivos.</p>
          <button className="mt-auto w-full py-3 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            Adicionar à Tela
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl">
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Share2 className="text-indigo-400" size={24} />
          Como instalar (PWA)
        </h3>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Acesse o site no seu navegador', desc: 'Abra sentinel-admin.io no Chrome ou Safari do seu smartphone.' },
            { step: '2', title: 'Clique em Compartilhar / Menu', desc: 'No menu do navegador, procure pela opção de compartilhamento ou os três pontinhos.' },
            { step: '3', title: 'Adicionar à Tela de Início', desc: 'Toque na opção "Adicionar à tela de início" ou "Instalar Aplicativo".' }
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start">
              <div className="w-10 h-10 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                {item.step}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
