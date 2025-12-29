
import React, { useState } from 'react';
import { View, Language, Theme } from '../types';
import { translations } from '../translations';

interface SettingsPageProps {
  onBack: () => void;
  setView: (view: View) => void;
  currentLanguage: Language;
  currentTheme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onBack, 
  setView, 
  currentLanguage, 
  currentTheme, 
  setLanguage, 
  setTheme 
}) => {
  const t = translations[currentLanguage];
  
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setShowFeedback(msg);
    setTimeout(() => setShowFeedback(null), 2500);
  };

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    triggerFeedback(t.themeSuccess);
  };

  const handleSelectLang = (lang: Language) => {
    setLanguage(lang);
    setShowLangPicker(false);
    triggerFeedback(translations[lang].langSuccess);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <div className="w-10">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark dark:text-white text-lg">{t.settingsTitle}</h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Perfil Rápido */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center dark:bg-primary/20">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
          </div>
          <div>
            <p className="text-sm font-black text-dark dark:text-white">+244 923 000 000</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Usuário Verificado</p>
          </div>
        </div>

        {/* Seção: Aparência & Idioma */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">{t.preferences}</h3>
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            
            {/* Tema Switch */}
            <div className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl">
                  {currentTheme === 'dark' ? 'dark_mode' : 'light_mode'}
                </span>
                <span className="text-sm font-bold text-dark dark:text-white">{t.darkMode}</span>
              </div>
              <button 
                onClick={handleToggleTheme}
                className={`w-12 h-6 rounded-full transition-all relative ${currentTheme === 'dark' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentTheme === 'dark' ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Idioma Selector */}
            <button 
              onClick={() => setShowLangPicker(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl">language</span>
                <span className="text-sm font-bold text-dark dark:text-white">{t.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{t.languageName}</span>
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* Seção: Segurança & Atalhos */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">{t.security}</h3>
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <button 
              onClick={() => setView(View.CHANGE_PASSWORD)}
              className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-500 text-xl">lock_reset</span>
                <span className="text-sm font-bold text-dark dark:text-white">{t.changePassword}</span>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
            </button>
            
            <button 
              onClick={() => setView(View.ADD_BANK)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500 text-xl">account_balance</span>
                <span className="text-sm font-bold text-dark dark:text-white">{t.manageBanks}</span>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Seção: Sobre */}
        <div className="text-center pt-4 space-y-4">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.4em]">DeepBank v3.2.0</p>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-primary uppercase">
            <button className="hover:underline">Privacidade</button>
            <span className="text-gray-200 dark:text-gray-800">•</span>
            <button className="hover:underline">Termos</button>
          </div>
        </div>
      </div>

      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4">
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowLangPicker(false)}></div>
          <div className="relative bg-white dark:bg-dark-card w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <h3 className="font-extrabold text-dark dark:text-white">{t.chooseLanguage}</h3>
              <button onClick={() => setShowLangPicker(false)} className="text-gray-300 dark:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleSelectLang('pt')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentLanguage === 'pt' ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">🇧🇷</div>
                   <span className="font-bold text-dark dark:text-white">Português</span>
                </div>
                {currentLanguage === 'pt' && <span className="material-symbols-outlined text-primary">check_circle</span>}
              </button>

              <button 
                onClick={() => handleSelectLang('en')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentLanguage === 'en' ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">🇺🇸</div>
                   <span className="font-bold text-dark dark:text-white">English</span>
                </div>
                {currentLanguage === 'en' && <span className="material-symbols-outlined text-primary">check_circle</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Feedback */}
      {showFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark dark:bg-white text-white dark:text-dark px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-dark/10">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
