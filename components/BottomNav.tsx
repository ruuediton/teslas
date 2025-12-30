
import React from 'react';
import { View, Language } from '../types';
import { translations } from '../translations';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, lang }) => {
  const t = translations[lang];

  const navItems = [
    { id: View.HOME, icon: 'home', label: t.navHome },
    { id: View.PRODUCTS, icon: 'inventory_2', label: t.navPackages },
    { id: View.INVITATION, icon: 'card_membership', label: t.navInvite },
    { id: View.PROFILE, icon: 'person', label: t.navProfile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 flex justify-around items-center px-4 py-2 pb-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center gap-1 min-w-[70px] transition-all relative ${currentView === item.id ? 'text-primary scale-105' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentView === item.id ? 'fill-current' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          {currentView === item.id && (
            <div className="absolute -top-0.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </nav>
  );
};
