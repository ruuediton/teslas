
import React, { useState, useEffect } from 'react';

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'income' | 'bonus';

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'T1', type: 'deposit', title: 'Recarga via IBAN', amount: 50000, timestamp: 'Hoje, 14:30', status: 'completed' },
  { id: 'T2', type: 'income', title: 'Rendimento Fundo Safira', amount: 250, timestamp: 'Hoje, 00:01', status: 'completed' },
  { id: 'T3', type: 'bonus', title: 'Presente de Boas-vindas', amount: 1000, timestamp: 'Ontem, 18:20', status: 'completed' },
  { id: 'T4', type: 'withdrawal', title: 'Levantamento Bancário', amount: -15000, timestamp: 'Ontem, 09:15', status: 'completed' },
  { id: 'T5', type: 'income', title: 'Rendimento Fundo Rubi', amount: 900, timestamp: '26 Out, 00:01', status: 'completed' },
  { id: 'T6', type: 'withdrawal', title: 'Levantamento Bancário', amount: -2500, timestamp: '25 Out, 16:40', status: 'completed' },
  { id: 'T7', type: 'deposit', title: 'Recarga via IBAN', amount: 10000, timestamp: '24 Out, 11:30', status: 'completed' },
  { id: 'T8', type: 'bonus', title: 'Comissão de Convite', amount: 450, timestamp: '24 Out, 08:00', status: 'completed' },
];

interface TransactionHistoryPageProps {
  onBack: () => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<TransactionType>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => 
    activeFilter === 'all' ? true : t.type === activeFilter
  );

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit': return { name: 'add_card', color: 'text-green-500', bg: 'bg-green-50' };
      case 'withdrawal': return { name: 'payments', color: 'text-red-500', bg: 'bg-red-50' };
      case 'income': return { name: 'trending_up', color: 'text-primary', bg: 'bg-primary/5' };
      case 'bonus': return { name: 'redeem', color: 'text-accent', bg: 'bg-accent/10' };
      default: return { name: 'list_alt', color: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };

  const formatKz = (amount: number) => {
    const formatted = new Intl.NumberFormat('pt-AO').format(Math.abs(amount));
    return `${amount > 0 ? '+' : '-'} ${formatted} Kz`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
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
        
        <h1 className="font-extrabold text-dark text-lg">Histórico</h1>
        
        <div className="w-10"></div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 px-4 shrink-0">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'deposit', label: 'Depósitos' },
          { id: 'withdrawal', label: 'Saques' },
          { id: 'income', label: 'Renda' },
          { id: 'bonus', label: 'Bônus' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as TransactionType)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === filter.id 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-20"></div>
            </div>
          ))
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map(t => {
            const icon = getIcon(t.type);
            return (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-all">
                <div className={`w-12 h-12 ${icon.bg} ${icon.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{icon.name}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-dark truncate">{t.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{t.timestamp}</p>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-black ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatKz(t.amount)}
                  </p>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Concluído</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-5xl">history_toggle_off</span>
            </div>
            <div className="space-y-1">
              <p className="text-dark font-extrabold">Nenhum registro</p>
              <p className="text-xs text-gray-400 max-w-[200px]">Nenhuma transação encontrada nesta categoria.</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-white border-t border-gray-100 p-4 px-6 flex justify-between items-center shrink-0">
        <div className="text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo de Hoje</p>
          <p className="text-lg font-black text-dark">+ 1.240,00 Kz</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-50 text-dark font-bold px-6 py-2 rounded-xl text-xs"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
