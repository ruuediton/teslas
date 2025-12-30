import React from 'react';
import { useLoading } from './LoadingContext';

export const Loading: React.FC = () => {
    const { isLoading, message } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 animate-in fade-in duration-300">
            <div className="bg-black/80 backdrop-blur-md p-6 rounded-3xl flex flex-col items-center gap-4 shadow-2xl min-w-[140px]">
                <div className="ios-spinner">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="bar" style={{ transform: `rotate(${i * 30}deg) translate(0, -120%)`, animationDelay: `${-1.1 + i * 0.1}s` }} />
                    ))}
                </div>
                {message && (
                    <span className="text-white text-xs font-bold tracking-widest uppercase opacity-80 mt-2">
                        {message}
                    </span>
                )}
            </div>

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
          width: 10%;
          height: 30%;
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
        </div>
    );
};
