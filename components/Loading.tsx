import React from 'react';
import { useLoading } from './LoadingContext';

export const Loading: React.FC = () => {
  const { isLoading, message } = useLoading();

  // Removed early return to allow CSS transitions to work correctly
  // The component remains rendered but invisible and non-interactive when not loading.

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 bg-black/20 backdrop-blur-[2px] ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="bg-black/80 backdrop-blur-md p-6 rounded-[32px] flex flex-col items-center gap-4 shadow-2xl min-w-[150px] animate-in zoom-in-95 duration-300">
        <div className="ios-spinner">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bar" style={{ transform: `rotate(${i * 30}deg) translate(0, -120%)`, animationDelay: `${-1.1 + i * 0.1}s` }} />
          ))}
        </div>
        {(message || 'Carregando...') && (
          <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase opacity-90 mt-2 text-center max-w-[200px]">
            {message || 'Carregando...'}
          </span>
        )}
      </div>

      <style>{`
        .ios-spinner {
          position: relative;
          width: 36px;
          height: 36px;
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
          to { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};
