import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Language } from '../types';
import { translations } from '../translations';
import { useLoading } from './LoadingContext';

// Note: Using the backend view 'notificacoes_usuario'
type TransactionType = 'all' | 'deposito' | 'saque' | 'income' | 'bonus' | 'compra' | 'conta_bancaria';

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  timestamp: string;
  rawDate: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryPageProps {
  onBack: () => void;
  lang: Language;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ onBack, lang }) => {
  const { setIsLoading: setGlobalLoading } = useLoading();
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatRelativeDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return lang === 'pt' ? 'agora mesmo' : 'just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return lang === 'pt' ? `há ${diffInMinutes} min` : `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return lang === 'pt' ? `há ${diffInHours}h` : `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return lang === 'pt' ? `há ${diffInDays} dias` : `${diffInDays}d ago`;

    return date.toLocaleDateString(lang === 'pt' ? 'pt-AO' : 'en-US');
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    setGlobalLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notificacoes_usuario')
        .select('*')
        .eq('user_id', user.id)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Transaction[] = data.map((item: any) => ({
          id: item.id_notificacao,
          type: item.tipo_notificacao as TransactionType,
          title: item.mensagem,
          amount: 0,
          timestamp: formatRelativeDate(item.data_evento),
          rawDate: item.data_evento,
          status: 'completed'
        }));
        setTransactions(mapped);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    activeFilter === 'all' ? true : t.type === activeFilter
  );

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposito': return { name: 'add_card', color: 'text-green-500', bg: 'bg-green-50' };
      case 'saque': return { name: 'payments', color: 'text-red-500', bg: 'bg-red-50' };
      case 'income': return { name: 'trending_up', color: 'text-primary', bg: 'bg-primary/5' };
      case 'bonus': return { name: 'redeem', color: 'text-accent', bg: 'bg-accent/10' };
      case 'compra': return { name: 'shopping_cart', color: 'text-indigo-500', bg: 'bg-indigo-50' };
      case 'conta_bancaria': return { name: 'account_balance', color: 'text-blue-500', bg: 'bg-blue-50' };
      default: return { name: 'list_alt', color: 'text-gray-400', bg: 'bg-gray-50' };
    }
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

        <h1 className="font-extrabold text-dark dark:text-white text-lg">{t.transactionHistory}</h1>

        <div className="w-10"></div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark border-b border-gray-100 dark:border-white/5 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 px-4 shrink-0">
        {[
          { id: 'all', label: lang === 'pt' ? 'Todos' : 'All' },
          { id: 'deposito', label: lang === 'pt' ? 'Depósitos' : 'Deposits' },
          { id: 'saque', label: lang === 'pt' ? 'Saques' : 'Withdrawals' },
          { id: 'bonus', label: 'Bônus' },
          { id: 'compra', label: lang === 'pt' ? 'Compras' : 'Purchases' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter.id
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
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
            <div key={i} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-20"></div>
            </div>
          ))
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map(t => {
            const icon = getIcon(t.type);
            return (
              <div key={t.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-all">
                <div className={`w-12 h-12 ${icon.bg} ${icon.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{icon.name}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-bold text-dark dark:text-white leading-tight">{t.title}</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">{t.timestamp}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-tighter decoration-from-font">
                    {lang === 'pt' ? 'Concluído' : 'Success'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700">
              <span className="material-symbols-outlined text-5xl">history_toggle_off</span>
            </div>
            <div className="space-y-1">
              <p className="text-dark dark:text-white font-extrabold">{lang === 'pt' ? 'Nenhum registro' : 'No records'}</p>
              <p className="text-xs text-gray-400 max-w-[200px]">{lang === 'pt' ? 'Nenhuma transação encontrada nesta categoria.' : 'No transactions found in this category.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-white dark:bg-dark border-t border-gray-100 dark:border-white/5 p-4 px-6 flex justify-between items-center shrink-0">
        <div className="text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'pt' ? 'Visualizando' : 'Viewing'}</p>
          <p className="text-sm font-black text-dark dark:text-white">{filteredTransactions.length} {lang === 'pt' ? 'Registros' : 'Records'}</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-50 dark:bg-white/5 text-dark dark:text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          {lang === 'pt' ? 'Fechar' : 'Close'}
        </button>
      </div>
    </div>
  );
};
