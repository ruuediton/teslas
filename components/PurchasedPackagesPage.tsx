
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { useLoading } from './LoadingContext';

interface PurchasedPackage {
  id: string;
  name: string;
  amountInvested: number;
  dailyIncome: number;
  totalIncome: number;
  daysActive: number;
  totalDays: number;
  purchaseDate: string;
  emoji: string;
}

interface PurchasedPackagesPageProps {
  onBack: () => void;
  lang: Language;
}

const MOCK_PURCHASED: PurchasedPackage[] = [
  {
    id: 'PP1',
    name: 'Fundo Safira',
    amountInvested: 50000,
    dailyIncome: 250,
    totalIncome: 1250,
    daysActive: 5,
    totalDays: 180,
    purchaseDate: '20/10/2025',
    emoji: '💎'
  },
  {
    id: 'PP2',
    name: 'Pacote Starter',
    amountInvested: 5000,
    dailyIncome: 25,
    totalIncome: 375,
    daysActive: 15,
    totalDays: 30,
    purchaseDate: '10/10/2025',
    emoji: '⚡'
  }
];

export const PurchasedPackagesPage: React.FC<PurchasedPackagesPageProps> = ({ onBack, lang }) => {
  const { setIsLoading: setGlobalLoading } = useLoading();
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setGlobalLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setGlobalLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [setGlobalLoading]);

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO').format(val) + ' Kz';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative overflow-x-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <div className="w-10">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {t.purchasedPackages}
        </h1>

        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">{t.loading}</p>
          </div>
        ) : MOCK_PURCHASED.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700">
              <span className="material-symbols-outlined text-5xl">history_toggle_off</span>
            </div>
            <div className="space-y-1">
              <p className="text-dark dark:text-white font-black">{t.noPurchasedPackages}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-2">
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t.activeInvestments}</h2>
            </div>

            {MOCK_PURCHASED.map((pkg) => {
              const progress = (pkg.daysActive / pkg.totalDays) * 100;
              return (
                <div key={pkg.id} className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-6 group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/5 dark:bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">{pkg.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-dark dark:text-white text-base">{pkg.name}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t.investmentDate}: {pkg.purchaseDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-green-600 dark:text-green-400">+{formatKz(pkg.dailyIncome)}/dia</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-gray-50 dark:border-white/5 py-5">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-1">{t.accumulatedIncome}</p>
                      <p className="text-sm font-black text-dark dark:text-white">{formatKz(pkg.totalIncome)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-1">{t.daysRemaining}</p>
                      <p className="text-sm font-black text-dark dark:text-white">{pkg.totalDays - pkg.daysActive} {lang === 'pt' ? 'dias' : 'days'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <span>{t.progress}</span>
                      <span className="text-primary">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100/50 dark:border-blue-900/20 flex gap-4">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-xl shrink-0">info</span>
          <p className="text-[10px] text-blue-600 dark:text-blue-300 font-medium leading-relaxed">
            Seus rendimentos são creditados automaticamente no seu saldo principal todos os dias à meia-noite.
          </p>
        </div>
      </div>
    </div>
  );
};
