
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface NotificationItem {
  id_notificacao: string;
  user_id: string;
  tipo_notificacao: string;
  mensagem: string;
  data_evento: string;
  origem_dados: string;
}

interface NotificationsPageProps {
  onBack: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes_usuario')
        .select('*')
        .order('data_evento', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotifications(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    setShowFeedback('Funcionalidade em desenvolvimento.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposito': return { name: 'account_balance_wallet', color: 'bg-green-100 text-green-600' };
      case 'saque': return { name: 'payments', color: 'bg-blue-100 text-blue-600' };
      case 'bonus': return { name: 'redeem', color: 'bg-accent/10 text-accent' };
      case 'compra': return { name: 'shopping_bag', color: 'bg-purple-100 text-purple-600' };
      case 'conta_bancaria': return { name: 'account_balance', color: 'bg-indigo-100 text-indigo-600' };
      default: return { name: 'notifications', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('pt-AO');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
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

        <h1 className="font-extrabold text-dark text-lg">Notificações</h1>

        <div className="w-10 flex justify-end">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-primary hover:text-primary-dark transition-colors"
              title="Marcar todas como lidas"
            >
              <span className="material-symbols-outlined">done_all</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          // Skeleton Loading
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const icon = getIcon(n.tipo_notificacao);
            return (
              <div
                key={n.id_notificacao}
                className="bg-white p-5 rounded-2xl border border-gray-100 transition-all shadow-sm flex gap-4"
              >
                <div className={`w-12 h-12 ${icon.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{icon.name}</span>
                </div>

                <div className="flex-1">
                  <p className="text-xs text-dark leading-relaxed mb-2">
                    {n.mensagem}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {formatTimeAgo(n.data_evento)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-5xl">notifications_off</span>
            </div>
            <div className="space-y-1">
              <p className="text-dark font-extrabold">Nada por aqui</p>
              <p className="text-sm text-gray-400 max-w-[200px]">Nenhuma notificação disponível no momento.</p>
            </div>
          </div>
        )}
      </div>

      {/* Snackbar Feedback */}
      {showFeedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
