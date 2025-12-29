
import React, { useState } from 'react';

interface InvitationGeneratorProps {
  onBack: () => void;
}

export const InvitationGenerator: React.FC<InvitationGeneratorProps> = ({ onBack }) => {
  const inviteCode = "DEEP777";
  const inviteUrl = `https://deepbank.app/register?ref=${inviteCode}`;
  
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setShowFeedback(`${label} copiado com sucesso!`);
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const hierarchyData = [
    { level: 1, count: 12, label: 'Nível 1 (Diretos)' },
    { level: 2, count: 45, label: 'Nível 2 (Indiretos)' },
    { level: 3, count: 128, label: 'Nível 3 (Rede)' },
  ];

  const rewardsData = [
    { level: '1', value: '2.000 Kz', percentage: '12%' },
    { level: '2', value: '800 Kz', percentage: '5%' },
    { level: '3', value: '400 Kz', percentage: '2%' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 px-4">
        <div className="w-10 flex items-center justify-center">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Convites
        </h1>
        
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        {/* Banner Motivacional */}
        <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-primary/20">
           <div className="relative z-10">
              <h2 className="text-xl font-black mb-2">Convide e Ganhe</h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-[200px]">
                Expanda sua rede e receba recompensas em até 3 níveis de profundidade.
              </p>
           </div>
           <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">share_reviews</span>
        </div>

        {/* Link de Convite Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Link de Convite Personalizado</label>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-600 font-mono break-all leading-relaxed text-center">
                {inviteUrl}
              </p>
            </div>
            <button 
              onClick={() => handleCopy(inviteUrl, 'Link')}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              Copiar link de convite
            </button>
          </div>
        </div>

        {/* Código de Convite Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Código de Referência</label>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-4">
            <div className="text-3xl font-black tracking-[0.3em] text-dark bg-accent/5 px-8 py-3 rounded-2xl border border-accent/20">
              {inviteCode}
            </div>
            <button 
              onClick={() => handleCopy(inviteCode, 'Código')}
              className="w-full bg-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-dark/10"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copiar código de convite
            </button>
          </div>
        </div>

        {/* Árvore de Hierarquia Simples */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-dark uppercase tracking-widest pl-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">account_tree</span>
            Sua Estrutura
          </h3>
          <div className="space-y-2">
            {hierarchyData.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-primary text-white' : idx === 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-dark">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-dark">{item.count}</span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Ativos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Recompensas */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-dark uppercase tracking-widest pl-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 text-lg">military_tech</span>
            Tabela de Ganhos
          </h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase">Nível</th>
                  <th className="text-center py-4 px-2 text-[10px] font-black text-gray-400 uppercase">Comissão</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase">Fixo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rewardsData.map((row, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 px-6 text-sm font-bold text-dark">Lvl {row.level}</td>
                    <td className="py-4 px-2 text-center text-xs font-black text-primary bg-primary/5">{row.percentage}</td>
                    <td className="py-4 px-6 text-right text-sm font-black text-green-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Snackbar Feedback */}
      {showFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">done</span>
            </div>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
