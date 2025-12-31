import React from 'react';
import { useLoading } from './LoadingContext';

interface LoadingProps {
  lang: 'pt' | 'en';
}

export const Loading: React.FC<LoadingProps> = ({ lang }) => {
  const { isLoading, showTimeoutError } = useLoading();

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 bg-transparent pointer-events-none ${isLoading ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[24px] flex flex-col items-center justify-center shadow-sm w-20 h-20 animate-in zoom-in-95 duration-300 pointer-events-auto border border-white/10">
          <div className="ios-spinner">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bar" style={{ transform: `rotate(${i * 30}deg) translate(0, -120%)`, animationDelay: `${-1.1 + i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>

      {showTimeoutError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-8 pointer-events-none">
          <div className="p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto bg-white dark:bg-dark-card border-2 border-red-500">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1 bg-red-50 dark:bg-red-900/20">
              <span className="material-symbols-outlined text-4xl text-red-500">wifi_off</span>
            </div>
            <p className="text-base font-extrabold text-red-600">{lang === 'pt' ? 'Erro de conectividade' : 'Connectivity error'}</p>
            <p className="text-sm font-bold text-dark/70 dark:text-white/70 leading-relaxed">
              {lang === 'pt' ? 'Não foi possível concluir a operação. Verifique sua conexão com a internet ou a estabilidade da rede e tente novamente.' : 'The operation could not be completed. Please check your internet connection or network stability and try again.'}
            </p>
          </div>
        </div>
      )}

      <style>{`
        .ios-spinner {
          position: relative;
          width: 32px;
          height: 32px;
        }
        .ios-spinner .bar {
          position: absolute;
          left: 44.5%;
          top: 37%;
          width: 8%;
          height: 28%;
          background: white;
          border-radius: 50px;
          opacity: 0;
          animation: ios-spinner-anim 1.2s linear infinite;
        }
        @keyframes ios-spinner-anim {
          from { opacity: 1; }
          to { opacity: 0.25; }
        }
      `}</style>
    </>
  );
};
