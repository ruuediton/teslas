
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQPageProps {
  onBack: () => void;
  onNavigateToSupport: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack, onNavigateToSupport, lang }) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const FAQ_DATA: FAQItem[] = [
    {
      category: t.faqConta,
      question: t.faqQ1,
      answer: t.faqA1
    },
    {
      category: t.faqInvestimentos,
      question: t.faqQ2,
      answer: t.faqA2
    },
    {
      category: t.faqSaques,
      question: t.faqQ3,
      answer: t.faqA3
    },
    {
      category: t.faqSaques,
      question: t.faqQ4,
      answer: t.faqA4
    },
    {
      category: t.faqRecargas,
      question: t.faqQ5,
      answer: t.faqA5
    },
    {
      category: t.faqSeguranca,
      question: t.faqQ6,
      answer: t.faqA6
    }
  ];

  const filteredFaq = FAQ_DATA.filter(
    item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark overflow-hidden">
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

        <h1 className="font-extrabold text-dark dark:text-white text-lg">{t.faqTitle}</h1>

        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
          <input
            type="text"
            placeholder={t.faqSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white transition-all"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                    <h3 className={`text-sm font-bold transition-colors ${expandedIndex === index ? 'text-primary' : 'text-dark dark:text-white'}`}>
                      {item.question}
                    </h3>
                  </div>
                  <span className={`material-symbols-outlined text-gray-300 dark:text-gray-600 transition-transform duration-300 ${expandedIndex === index ? 'rotate-180 text-primary' : ''}`}>
                    expand_more
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="p-5 pt-0 border-t border-gray-50 dark:border-white/5 text-justify">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.answer}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex justify-end">
                      <button
                        onClick={onNavigateToSupport}
                        className="text-[10px] font-bold text-primary uppercase flex items-center gap-1 hover:underline"
                      >
                        {t.faqStillDoubt}
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-gray-600">
                <span className="material-symbols-outlined text-4xl">search_off</span>
              </div>
              <div>
                <p className="text-dark dark:text-white font-bold">{t.faqNoResults}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t.faqTryDifferent}</p>
              </div>
            </div>
          )}
        </div>

        {/* Support CTA */}
        <div className="bg-primary p-6 rounded-[32px] text-white flex items-center gap-4 shadow-xl shadow-primary/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">support_agent</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black">{t.faqHumanHelp}</p>
            <p className="text-[10px] text-white/70">{t.faqTeamAvailable}</p>
          </div>
          <button
            onClick={onNavigateToSupport}
            className="bg-white text-primary p-2 rounded-xl hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
        </div>
      </div>
    </div>
  );
};
