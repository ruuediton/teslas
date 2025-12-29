
import React, { useState, useEffect } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'deposit' | 'security' | 'promo' | 'system';
  read: boolean;
}

interface NotificationsPageProps {
  onBack: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Simulação de carregamento de dados do backend
    const timer = setTimeout(() => {
      const mockData: NotificationItem[] = [
        {
          id: '1',
          title: 'Depósito Confirmado',
          message: 'Seu depósito de 50.000 Kz foi processado com sucesso e já está disponível em seu saldo.',
          timestamp: 'Há 5 minutos',
          type: 'deposit',
          read: false
        },
        {
          id: '2',
          title: 'Novo Dispositivo Detectado',
          message: 'Um novo acesso foi realizado em sua conta. Se não foi você, altere sua senha imediatamente.',
          timestamp: 'Hoje, 09:12',
          type: 'security',
          read: false
        },
        {
          id: '3',
          title: 'Promoção de Verão',
          message: 'Ganhe 20% de bônus na compra de qualquer Fundo Diamante durante este fim de semana.',
          timestamp: 'Ontem, 18:45',
          type: 'promo',
          read: true
        },
        {
          id: '4',
          title: 'Atualização do Sistema',
          message: 'Realizamos melhorias na estabilidade do chat IA para uma experiência mais fluida.',
          timestamp: '25 Out, 10:00',
          type: 'system',
          read: true
        }
      ];
      setNotifications(mockData);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setShowFeedback('Todas as notificações marcadas como lidas.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deposit': return { name: 'account_balance_wallet', color: 'bg-green-100 text-green-600' };
      case 'security': return { name: 'shield_lock', color: 'bg-red-100 text-red-600' };
      case 'promo': return { name: 'sell', color: 'bg-accent/10 text-accent' };
      default: return { name: 'notifications', color: 'bg-blue-100 text-blue-600' };
    }
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
            const icon = getIcon(n.type);
            return (
              <div 
                key={n.id} 
                className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex gap-4 relative group ${
                  n.read ? 'border-gray-100 opacity-75' : 'border-primary/20 bg-primary/5'
                }`}
              >
                {!n.read && <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full"></div>}
                
                <div className={`w-12 h-12 ${icon.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{icon.name}</span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-extrabold ${n.read ? 'text-dark/80' : 'text-dark'}`}>{n.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {n.timestamp}
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
