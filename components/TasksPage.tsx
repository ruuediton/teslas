
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Language } from '../types';
import { translations } from '../translations';

interface Task {
  id: string;
  name: string;
  description: string;
  reward: string;
  status: 'available' | 'completed';
  type: 'daily' | 'bonus' | 'special';
  icon: string;
}

interface TasksPageProps {
  onBack: () => void;
  lang: Language;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(true);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string, reward?: string } | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyIncomeTotal, setDailyIncomeTotal] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Calcular renda diária total (soma da user_purchases)
      const { data: purchases, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('daily_income')
        .eq('user_id', user.id);

      if (purchaseError) throw purchaseError;

      const total = purchases?.reduce((acc, curr) => acc + Number(curr.daily_income), 0) || 0;
      setDailyIncomeTotal(total);

      // 2. Buscar histórico de tarefas concluídas hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTasks, error: taskError } = await supabase
        .from('tarefas_diarias')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_atribuicao', today);

      if (taskError) throw taskError;
      const isCompleted = todayTasks && todayTasks.length > 0;

      // 3. Montar a lista de tarefas
      setTasks([
        {
          id: 'DAILY_INCOME',
          name: 'Rendimento Diário',
          description: 'Sua renda passiva baseada nos pacotes ativos.',
          reward: `${total.toLocaleString('pt-AO')} Kz`,
          status: isCompleted ? 'completed' : 'available',
          type: 'daily',
          icon: 'account_balance_wallet'
        }
      ]);

      // 4. Buscar histórico geral
      const { data: allHistory, error: historyError } = await supabase
        .from('tarefas_diarias')
        .select('*')
        .eq('user_id', user.id)
        .order('data_atribuicao', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setHistory(allHistory || []);

    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFeedback = (type: 'success' | 'error', message: string, reward?: string) => {
    setShowFeedback({ type, message, reward });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const executeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'completed') return;

    setExecutingTaskId(taskId);

    // Simulação de execução da tarefa
    setTimeout(() => {
      setExecutingTaskId(null);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const } : t));
      triggerFeedback('success', `Tarefa "${task.name}" concluída!`, task.reward);
    }, 2500);
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

        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {t.tasksTitle}
        </h1>

        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-12">
        {/* Intro Section */}
        <div className="bg-primary rounded-[32px] p-6 text-white shadow-xl shadow-primary/20 flex items-center gap-5 relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <h2 className="text-xl font-black mb-1">{dailyIncomeTotal.toLocaleString('pt-AO')} Kz</h2>
            <p className="text-white/70 text-xs font-medium leading-relaxed">
              Minha Renda Diária Acumulada
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center relative z-10 backdrop-blur-md">
            <span className="material-symbols-outlined text-white text-3xl">task_alt</span>
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-white/5 rotate-12">assignment</span>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">{t.activityList}</h3>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-card p-5 rounded-[28px] border border-gray-100 dark:border-white/5 flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-50 dark:bg-white/5 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-50 dark:bg-white/5 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white dark:bg-dark-card rounded-[28px] border shadow-sm p-5 transition-all duration-300 ${task.status === 'completed' ? 'border-gray-50 dark:border-white/5 opacity-60' : 'border-gray-100 dark:border-white/10 hover:border-primary/20'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600' : 'bg-primary/5 dark:bg-primary/20 text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-2xl">{task.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-dark dark:text-white text-sm truncate">{task.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${task.type === 'daily' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' :
                          task.type === 'special' ? 'bg-accent/10 dark:bg-accent/20 text-accent' : 'bg-gray-50 dark:bg-white/5 text-gray-400'
                        }`}>
                        {task.type === 'daily' ? 'DIÁRIA' : task.type === 'special' ? 'ESPECIAL' : 'BÔNUS'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-1 mt-3">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight">{t.reward}:</span>
                      <span className="text-xs font-black text-green-600 dark:text-green-400">{task.reward}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  {task.status === 'completed' ? (
                    <div className="w-full py-3 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {t.taskCompleted}
                    </div>
                  ) : (
                    <button
                      onClick={() => executeTask(task.id)}
                      disabled={executingTaskId !== null}
                      className="w-full py-3 bg-dark dark:bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-dark/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                    >
                      {executingTaskId === task.id ? (
                        <>
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{t.validating}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">bolt</span>
                          {t.executeTask}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                <span className="material-symbols-outlined text-5xl">inventory_2</span>
              </div>
              <div>
                <p className="text-dark dark:text-white font-extrabold">Sem pacotes ativos</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px] mx-auto">Adquira um pacote para começar a gerar renda automática.</p>
              </div>
            </div>
          )}

          {/* Histórico Adicional */}
          {history.length > 0 && (
            <div className="pt-4 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">Histórico de Rendimentos</h3>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">trending_up</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark dark:text-white">Renda Passiva</p>
                        <p className="text-[10px] text-gray-400">{new Date(h.data_atribuicao).toLocaleDateString('pt-AO')}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-green-600">+{Number(h.valor_renda).toLocaleString('pt-AO')} Kz</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100/50 dark:border-blue-900/20 flex gap-4">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-xl shrink-0">info</span>
          <p className="text-[11px] text-blue-600 dark:text-blue-300 font-medium leading-relaxed">
            {t.tasksResetNote}
          </p>
        </div>
      </div>

      {/* Reward Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto bg-white dark:bg-dark-card border-2 ${showFeedback.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'celebration' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? t.congrats : t.error}
            </p>
            <p className="text-sm font-bold text-dark/70 dark:text-white/70 leading-relaxed mb-2">
              {showFeedback.message}
            </p>
            {showFeedback.reward && (
              <div className="bg-green-50 dark:bg-green-900/20 px-6 py-2 rounded-full border border-green-100 dark:border-green-900/40">
                <p className="text-green-600 dark:text-green-400 font-black text-lg">+{showFeedback.reward}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
