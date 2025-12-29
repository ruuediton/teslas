
import React from 'react';

interface AboutUsPageProps {
  onBack: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack }) => {
  const values = [
    { icon: 'verified', title: 'Transparência', desc: 'Clareza total em todas as operações e rendimentos.' },
    { icon: 'security', title: 'Segurança', desc: 'Proteção rigorosa de dados e ativos financeiros.' },
    { icon: 'bolt', title: 'Agilidade', desc: 'Processos rápidos de recarga, conversão e retirada.' },
    { icon: 'groups', title: 'Inovação', desc: 'Tecnologia de ponta para democratizar investimentos.' }
  ];

  const stats = [
    { label: 'Investidores', value: '50k+' },
    { label: 'Volume Mensal', value: '250M Kz' },
    { label: 'Suporte', value: '24/7' }
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
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
        
        <h1 className="font-extrabold text-dark text-lg">Sobre nós</h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Hero Section */}
        <div className="relative h-64 flex items-center justify-center text-center px-6 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 scale-110"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 rotate-3">
              <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
            </div>
            <h2 className="text-3xl font-black text-dark tracking-tight">DeepBank</h2>
            <p className="text-gray-500 text-sm max-w-[300px] mx-auto leading-relaxed">
              Redefinindo o futuro dos investimentos digitais com inteligência e proximidade.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 space-y-10">
          {/* History */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-primary/30"></span>
              Nossa História
            </h3>
            <p className="text-sm text-dark/70 leading-relaxed text-justify">
              O DeepBank nasceu da necessidade de simplificar o acesso ao mercado financeiro estruturado. 
              Fundado por especialistas em fintech e gestão de ativos, nossa plataforma combina a robustez 
              bancária tradicional com a agilidade do mundo digital, permitindo que cada investidor, 
              independente de seu capital inicial, possa construir um patrimônio sólido.
            </p>
          </section>

          {/* Vision/Mission Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <h4 className="font-extrabold text-dark mb-2">Missão</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Proporcionar liberdade financeira através de produtos de investimento transparentes, acessíveis e rentáveis.
              </p>
            </div>
            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10">
              <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <h4 className="font-extrabold text-dark mb-2">Visão</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ser a plataforma de referência em investimentos estruturados na região, reconhecida pela inovação e confiança.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-between items-center py-8 border-y border-gray-100">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-black text-primary">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-primary/30"></span>
              Nossos Valores
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4 p-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100">
                    <span className="material-symbols-outlined text-accent">{v.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-dark text-sm">{v.title}</h5>
                    <p className="text-xs text-gray-500">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
