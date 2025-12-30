
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { View as AppView, Language } from '../types';

interface ConvertBonusPageProps {
  onBack: () => void;
  lang: Language;
}

interface PendingSubordinate {
  telefone_subordinado: string;
  valor: number;
  id: string;
}

export const ConvertBonusPage: React.FC<ConvertBonusPageProps> = ({ onBack, lang }) => {
  const [pendingSubordinates, setPendingSubordinates] = useState<PendingSubordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetPhone, setTargetPhone] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchPendingSubordinates();
  }, []);

  const fetchPendingSubordinates = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('red_equipe')
        .select('id, telefone_subordinado, valor')
        .eq('user_id_convidador', user.id)
        .eq('codigo_convite', profile.invite_code)
        .eq('investimento_valido', false);

      if (error) throw error;

      if (data) {
        setPendingSubordinates(data as PendingSubordinate[]);
      }
    } catch (error) {
      console.error('Error fetching pending bonuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleCopy = (phone: string, val: number) => {
    setTargetPhone(phone);
    setTargetAmount(val.toString());
    triggerFeedback('success', lang === 'pt' ? 'Dados copiados para o formulário.' : 'Data copied to form.');
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNumber = Number(targetAmount);

    if (!targetPhone || !targetAmount) {
      triggerFeedback('error', lang === 'pt' ? 'Preencha os dados do subordinado.' : 'Fill in subordinate data.');
      return;
    }

    // Validação do valor mínimo
    if (amountNumber <= 100) {
      triggerFeedback('error', lang === 'pt' ? 'Valor mínimo para conversão: 100 Kz.' : 'Minimum conversion amount: 100 Kz.');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Verify availability
      const { data: subordinate, error: searchError } = await supabase
        .from('red_equipe')
        .select('id, valor')
        .eq('user_id_convidador', user.id)
        .eq('codigo_convite', profile.invite_code)
        .eq('telefone_subordinado', targetPhone)
        .eq('valor', Number(targetAmount))
        .eq('investimento_valido', false)
        .single();

      if (searchError || !subordinate) {
        triggerFeedback('error', lang === 'pt' ? 'Falha na conversão: número ou valor inválido.' : 'Conversion failed: invalid number or value.');
        setIsProcessing(false);
        return;
      }

      // Start transaction process
      // 1. Mark as valid in red_equipe
      const { error: updateTeamError } = await supabase
        .from('red_equipe')
        .update({ investimento_valido: true })
        .eq('id', subordinate.id);

      if (updateTeamError) throw updateTeamError;

      // 2. Add to profile balance
      const { error: updateBalanceError } = await supabase.rpc('increment_balance', {
        user_id: user.id,
        amount: Number(targetAmount)
      });

      // If RPC fails (maybe not created), try direct update
      if (updateBalanceError) {
        const { data: currentProfile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        await supabase.from('profiles').update({ balance: (currentProfile?.balance || 0) + Number(targetAmount) }).eq('id', user.id);
      }

      // 3. Record in bonus_transacoes
      await supabase.from('bonus_transacoes').insert([{
        user_id: user.id,
        valor_recebido: Number(targetAmount),
        origem_bonus: "Recompensa de investimento de subordinado",
        codigo_presente: targetPhone
      }]);

      triggerFeedback('success', lang === 'pt' ? `Bônus convertido: ${targetAmount} Kz adicionados.` : `Bonus converted: ${targetAmount} Kz added.`);

      // Update UI
      setTargetPhone('');
      setTargetAmount('');
      fetchPendingSubordinates();

    } catch (error) {
      console.error('Error during conversion:', error);
      triggerFeedback('error', lang === 'pt' ? 'Ocorreu um erro no processamento.' : 'An error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-bold text-dark pr-10">
          {lang === 'pt' ? 'Converter Bônus' : 'Convert Bonus'}
        </h1>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Banner Motivacional */}
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-3">
          <span className="material-symbols-outlined text-blue-500">info</span>
          <p className="text-xs text-blue-700 font-bold leading-relaxed uppercase tracking-tight">
            {lang === 'pt'
              ? 'CONVERTA SEUS BÔNUS EM SALDO PRINCIPAL PARA USAR EM RECARGAS, INVESTIMENTOS E TRANSFERÊNCIAS INSTANTÂNEAS'
              : 'CONVERT YOUR BONUSES INTO MAIN BALANCE FOR RECHARGES, INVESTMENTS, AND INSTANT TRANSFERS'}
          </p>
        </div>

        {/* Pending Subordinates Horizontal List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
            {lang === 'pt' ? 'Subordinados Disponíveis' : 'Available Subordinates'}
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {loading ? (
              <div className="h-20 w-full animate-pulse bg-gray-200 rounded-2xl" />
            ) : pendingSubordinates.length > 0 ? (
              pendingSubordinates.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleCopy(sub.telefone_subordinado, sub.valor)}
                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm min-w-[200px] flex items-center justify-between group active:scale-95 transition-all text-left"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-black text-dark dark:text-gray-800">
                      {sub.telefone_subordinado}
                    </p>
                    <p className="text-[10px] font-bold text-primary">
                      {sub.valor.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="w-full text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400">
                  {lang === 'pt' ? 'Nenhum bônus disponível para conversão' : 'No bonuses available for conversion'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Form */}
        <form onSubmit={handleConvert} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                {lang === 'pt' ? 'Número do Subordinado' : 'Subordinate Number'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">person_search</span>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder={lang === 'pt' ? 'Cole ou digite o número' : 'Paste or type number'}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                {lang === 'pt' ? 'Valor para Conversão' : 'Amount to Convert'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">payments</span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">Kz</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isProcessing || !targetPhone || !targetAmount}
              className={`w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined">currency_exchange</span>
              )}
              {isProcessing ? (lang === 'pt' ? 'Convertendo...' : 'Converting...') : (lang === 'pt' ? 'Converter Bônus' : 'Convert Bonus')}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
            >
              {lang === 'pt' ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>

      {/* Snackbar Feedback */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${showFeedback.type === 'success' ? 'bg-white border-2 border-green-500' : 'bg-white border-2 border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? (lang === 'pt' ? 'Sucesso!' : 'Success!') : (lang === 'pt' ? 'Erro!' : 'Error!')}
            </p>
            <p className="text-sm font-bold text-dark/70 leading-relaxed">
              {showFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
