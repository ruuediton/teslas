
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface CompanyIntroProps {
  onFinish: () => void;
  lang: Language;
}

export const CompanyIntro: React.FC<CompanyIntroProps> = ({ onFinish, lang }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark overflow-hidden">
      {/* Header Fixo */}
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <div className="w-10">
          <button 
            onClick={onFinish} 
            className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {t.companyIntroTitle}
        </h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Hero Section */}
        <div className="relative h-64 overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop" 
            alt="Corporate" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent"></div>
          <div className="absolute bottom-6 left-8 right-8 text-white">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined text-white">account_balance</span>
               </div>
               <h2 className="text-2xl font-black tracking-tight">DeepBank</h2>
            </div>
            <p className="text-white/70 text-sm font-medium">Finanças Estruturadas para o Futuro</p>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Nossa História */}
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
               <span className="w-8 h-1 bg-primary rounded-full"></span>
               <h3 className="text-lg font-black text-dark dark:text-white uppercase tracking-wider">{t.ourHistory}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-justify">
              {t.historyDesc}
            </p>
          </section>

          {/* Fundação e Crescimento */}
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center gap-3">
               <span className="w-8 h-1 bg-accent rounded-full"></span>
               <h3 className="text-lg font-black text-dark dark:text-white uppercase tracking-wider">{t.foundationGrowth}</h3>
            </div>
            <div className="rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop" 
                alt="London Headquarters" 
                className="w-full h-40 object-cover"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-justify">
              {t.foundationDesc}
            </p>
          </section>

          {/* Visão e Missão Grid */}
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-[32px] border border-primary/10 dark:border-primary/20 space-y-3">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                 <span className="material-symbols-outlined text-white">visibility</span>
               </div>
               <h4 className="text-lg font-black text-dark dark:text-white">{t.ourVision}</h4>
               <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.visionDesc}</p>
             </div>

             <div className="bg-accent/5 dark:bg-accent/10 p-8 rounded-[32px] border border-accent/10 dark:border-accent/20 space-y-3">
               <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                 <span className="material-symbols-outlined text-white">rocket_launch</span>
               </div>
               <h4 className="text-lg font-black text-dark dark:text-white">{t.ourMission}</h4>
               <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.missionDesc}</p>
             </div>
          </div>

          {/* Objetivos */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
               <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
               <h3 className="text-lg font-black text-dark dark:text-white uppercase tracking-wider">{t.objectives}</h3>
            </div>
            <div className="space-y-3">
              {[t.obj1, t.obj2, t.obj3, t.obj4, t.obj5].map((obj, i) => (
                <div key={i} className="flex items-start gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-50 dark:border-white/5 shadow-sm">
                   <span className="material-symbols-outlined text-primary">check_circle</span>
                   <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{obj}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Localização e Alcance */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="w-8 h-1 bg-teal-500 rounded-full"></span>
               <h3 className="text-lg font-black text-dark dark:text-white uppercase tracking-wider">{t.locationReach}</h3>
            </div>
            <div className="relative h-48 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5">
               <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" alt="Global Network" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-justify italic">
              {t.locationDesc}
            </p>
          </section>

          {/* Nossos Valores Grid */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
               <h3 className="text-lg font-black text-dark dark:text-white uppercase tracking-wider">{t.ourValues}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { icon: 'verified_user', title: t.val1Title, desc: t.val1Desc, color: 'text-blue-500' },
                 { icon: 'security', title: t.val2Title, desc: t.val2Desc, color: 'text-green-500' },
                 { icon: 'bolt', title: t.val3Title, desc: t.val3Desc, color: 'text-amber-500' },
                 { icon: 'group', title: t.val4Title, desc: t.val4Desc, color: 'text-purple-500' }
               ].map((v, i) => (
                 <div key={i} className="bg-white dark:bg-dark-card p-5 rounded-[28px] border border-gray-50 dark:border-white/5 shadow-sm flex flex-col items-center text-center gap-3">
                    <span className={`material-symbols-outlined ${v.color} text-3xl`}>{v.icon}</span>
                    <h5 className="text-[10px] font-black text-dark dark:text-white uppercase tracking-tighter leading-tight">{v.title}</h5>
                    <p className="text-[9px] text-gray-400 leading-tight">{v.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Compromisso com os Usuários */}
          <section className="bg-dark dark:bg-black/40 p-8 rounded-[40px] text-white space-y-4 shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black">{t.userCommitment}</h3>
                <p className="text-sm text-white/60 leading-relaxed text-justify">
                  {t.commitmentDesc}
                </p>
                <div className="flex justify-center pt-4">
                   <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 flex items-center gap-2">
                     <span className="material-symbols-outlined text-green-400">verified</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">Plataforma Certificada</span>
                   </div>
                </div>
             </div>
             <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] text-white/5 rotate-12">gavel</span>
          </section>
        </div>
      </div>
    </div>
  );
};
