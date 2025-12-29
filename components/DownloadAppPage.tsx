
import React, { useState } from 'react';

interface DownloadAppPageProps {
  onBack: () => void;
}

export const DownloadAppPage: React.FC<DownloadAppPageProps> = ({ onBack }) => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const platforms = [
    { 
      id: 'android', 
      name: 'Google Play', 
      icon: 'smartphone', 
      desc: 'Versão oficial para Android',
      color: 'bg-green-500'
    },
    { 
      id: 'ios', 
      name: 'App Store', 
      icon: 'apple', 
      desc: 'Versão oficial para iOS (iPhone)',
      color: 'bg-dark'
    },
    { 
      id: 'apk', 
      name: 'Arquivo APK', 
      icon: 'download_for_offline', 
      desc: 'Instalação direta (Android)',
      color: 'bg-primary'
    }
  ];

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    setTimeout(() => {
      setIsDownloading(null);
      // Aqui seria o link real de download
      alert(`Iniciando download da versão ${id.toUpperCase()}...`);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 px-4">
        <div className="w-10">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark text-lg">Baixar aplicativo</h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-4xl">install_mobile</span>
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight">Leve o DeepBank com você</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto">
            Acesse seus investimentos de qualquer lugar com nossa experiência nativa.
          </p>
        </div>

        {/* Platform List */}
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div 
              key={platform.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${platform.color} rounded-2xl flex items-center justify-center text-white`}>
                  <span className="material-symbols-outlined">{platform.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-dark">{platform.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{platform.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(platform.id)}
                disabled={isDownloading !== null}
                className="bg-gray-50 hover:bg-primary hover:text-white text-primary px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              >
                {isDownloading === platform.id ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <>
                    Baixar
                    <span className="material-symbols-outlined text-sm">download</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-dark uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">info</span>
            Como instalar (APK)
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
              <p className="text-xs text-gray-500 leading-relaxed">Clique no botão <b>Baixar</b> na opção Arquivo APK.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
              <p className="text-xs text-gray-500 leading-relaxed">Após o download, abra o arquivo e permita <b>"Instalação de fontes desconhecidas"</b> em suas configurações.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
              <p className="text-xs text-gray-500 leading-relaxed">Siga as instruções na tela e faça login com sua conta DeepBank.</p>
            </li>
          </ul>
        </div>

        {/* Support Link */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-400">Problemas com o download? <button className="text-primary font-bold">Fale com o suporte</button></p>
        </div>
      </div>
    </div>
  );
};
