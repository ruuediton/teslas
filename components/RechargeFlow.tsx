
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Language } from '../types';
import { translations } from '../translations';
import { useLoading } from './LoadingContext';

interface RechargeFlowProps {
  onBack: () => void;
  lang: Language;
}



export const RechargeFlow: React.FC<RechargeFlowProps> = ({ onBack, lang }) => {
  const { setIsLoading: setGlobalLoading } = useLoading();
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<any | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isConcluding, setIsConcluding] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Data from Supabase
  const [quickValues, setQuickValues] = useState<number[]>([]);
  const [partnerBanks, setPartnerBanks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isWithinHours, setIsWithinHours] = useState(true);
  const [timeUntil9AM, setTimeUntil9AM] = useState(0);

  useEffect(() => {
    loadData();
    checkBusinessHours();
  }, []);

  const loadData = async () => {
    setGlobalLoading(true);
    // Load quick values from products table
    const { data: products } = await supabase.from('products').select('price').eq('status', 'active');
    if (products) {
      const prices = products.map(p => p.price).sort((a, b) => a - b);
      setQuickValues(prices);
    }

    // Load partner banks
    const { data: banks } = await supabase.from('bancos_empresa').select('*').eq('ativo', true);
    if (banks) setPartnerBanks(banks);

    // Load history
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: deposits } = await supabase
        .from('depositos_clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (deposits) {
        setHistory(deposits.map(d => ({
          id: d.id.substring(0, 8),
          title: 'Depósito',
          amount: d.valor_deposito,
          bank: d.nome_do_banco,
          status: d.estado_de_pagamento === 'recarregado' ? 'Aprovado' : d.estado_de_pagamento === 'falha' ? 'Falha' : 'Pendente',
          date: new Date(d.created_at).toLocaleString('pt-AO')
        })));
      }
    }
    setGlobalLoading(false);
  };

  const checkBusinessHours = () => {
    const now = new Date();
    const angolaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Luanda' }));
    const hour = angolaTime.getHours();

    if (hour < 9 || hour >= 21) {
      setIsWithinHours(false);

      // Calculate minutes until 9 AM
      const tomorrow = new Date(angolaTime);
      if (hour >= 21) tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const diff = tomorrow.getTime() - angolaTime.getTime();
      setTimeUntil9AM(Math.floor(diff / 60000)); // minutes
    } else {
      setIsWithinHours(true);
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
    if (!num) return '';
    return new Intl.NumberFormat('pt-AO').format(parseInt(num));
  };

  const handleAmountChange = (val: string) => {
    const num = val.replace(/\D/g, '');
    setAmount(num);
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleGoToBanks = () => {
    if (!isWithinHours) {
      triggerFeedback('error', `Por favor, aguarde até as 09:00 para realizar seu depósito. Faltam ${timeUntil9AM} minutos.`);
      return;
    }

    const numValue = parseInt(amount);
    if (!amount || isNaN(numValue)) {
      triggerFeedback('error', 'Informe um valor para continuar.');
      return;
    }
    if (numValue < 500) {
      triggerFeedback('error', 'Valor mínimo permitido é 500 Kz.');
      return;
    }
    setStep(2);
  };

  const handleSelectBank = (bank: any) => {
    setSelectedBank(bank);
    setStep(3);
  };

  const handleCopyIBAN = () => {
    if (selectedBank) {
      navigator.clipboard.writeText(selectedBank.iban);
      triggerFeedback('success', 'IBAN copiado!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleConclude = async () => {
    if (!receiptFile) {
      triggerFeedback('error', 'Por favor, carregue o comprovativo de pagamento.');
      return;
    }

    setIsConcluding(true);
    setGlobalLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        triggerFeedback('error', 'Usuário não autenticado.');
        setIsConcluding(false);
        return;
      }

      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprovativos')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('comprovativos')
        .getPublicUrl(fileName);

      // Submit deposit via RPC
      const { data, error } = await supabase.rpc('submit_deposit', {
        p_valor: parseInt(amount),
        p_banco: selectedBank?.nome_do_banco || '',
        p_url_comprovativo: publicUrl
      });

      if (error) throw error;

      if (data.success) {
        triggerFeedback('success', data.message);
        setTimeout(() => {
          loadData(); // Refresh history
          onBack();
        }, 2000);
      } else {
        triggerFeedback('error', data.message);
      }

    } catch (error: any) {
      console.error('Deposit error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });

      // Friendly error messages
      let errorMessage = 'Erro ao processar depósito.';

      if (error.message?.includes('storage') || error.message?.includes('bucket')) {
        errorMessage = 'Bucket de storage não configurado. Contate o administrador.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Erro de autenticação. Por favor, faça login novamente.';
      } else if (error.message) {
        // Show actual error message for debugging
        errorMessage = `Erro: ${error.message}`;
      }

      triggerFeedback('error', errorMessage);
    } finally {
      setIsConcluding(false);
      setGlobalLoading(false);
    }
  };

  const renderHistory = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-2 mb-4">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Registros de Depósito</p>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">history_toggle_off</span>
            <p className="text-sm font-bold">Nenhum depósito encontrado.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3 group active:scale-[0.99] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.status === 'Aprovado' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' :
                      item.status === 'Falha' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                        'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                    }`}>
                    <span className="material-symbols-outlined text-xl">
                      {item.status === 'Aprovado' ? 'check_circle' : item.status === 'Falha' ? 'cancel' : 'pending'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-dark dark:text-white">{item.title}</h4>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">{item.date}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-base font-black text-dark dark:text-white">{formatCurrency(item.amount)} Kz</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'Aprovado' ? 'bg-green-100/50 text-green-600 dark:bg-green-900/40 dark:text-green-400' :
                      item.status === 'Falha' ? 'bg-red-100/50 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                        'bg-orange-100/50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                    }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">Valor do depósito</label>
          <div className="relative flex justify-center items-center gap-2">
            <input
              type="text"
              value={formatCurrency(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="text-center w-full text-5xl font-black text-dark dark:text-white py-4 px-0 bg-transparent border-none focus:ring-0 placeholder:text-gray-100 dark:placeholder:text-gray-800"
            />
            <span className="text-2xl font-black text-primary">Kz</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickValues.map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className={`py-3 rounded-xl text-xs font-bold transition-all border ${parseInt(amount) === val
                ? 'bg-primary border-primary text-white shadow-lg'
                : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-100'
                }`}
            >
              {val >= 1000 ? `${val / 1000}k` : val} Kz
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGoToBanks}
        className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98]"
      >
        Continuar
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div >
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-2">
        <h2 className="text-lg font-black text-dark dark:text-white mb-1">Selecione o Banco</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Escolha uma de nossas contas para depósito</p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        {partnerBanks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => handleSelectBank(bank)}
            className={`w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border-b border-gray-50 dark:border-white/5 last:border-0 group`}
          >
            <div className="w-12 h-12 bg-primary/5 dark:bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-dark dark:text-white text-sm">{bank.nome_do_banco}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate max-w-[180px]">{bank.iban}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors">chevron_right</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(1)}
        className="w-full bg-white dark:bg-white/5 text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-all"
      >
        Voltar para valor
      </button>
    </div >
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Valor a Transferir</p>
          <h2 className="text-4xl font-black text-dark dark:text-white">{formatCurrency(amount)} <span className="text-lg font-bold text-primary">Kz</span></h2>
        </div>

        <div className="space-y-4 border-t border-gray-50 dark:border-white/5 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Banco Destino</span>
            <span className="text-sm font-black text-dark dark:text-white">{selectedBank?.nome_do_banco}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Favorecido</span>
            <span className="text-sm font-black text-dark dark:text-white">{selectedBank?.nome_favorecido || 'DEEPBANK LDA'}</span>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block text-center">IBAN de Depósito</span>
            <div className="bg-gray-50 dark:bg-dark/50 p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/10">
              <p className="font-mono text-[11px] font-black text-dark dark:text-white break-all pr-2">{selectedBank?.iban}</p>
              <button onClick={handleCopyIBAN} className="text-primary hover:scale-110 transition-transform shrink-0">
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* UPLOAD DE COMPROVANTE */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block text-center">{t.uploadReceipt}</span>
          {!receiptFile ? (
            <label className="w-full h-24 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 mt-1 uppercase tracking-tighter">{t.receiptHint}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-100 dark:bg-gray-900">
              <img src={URL.createObjectURL(receiptFile)} alt="Comprovativo" className="w-full h-full object-contain" />
              <button
                onClick={() => setReceiptFile(null)}
                className="absolute top-2 right-2 bg-dark/60 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
          <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold leading-relaxed flex gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">info</span>
            O comprovativo ajuda nosso time financeiro a liberar seu saldo em tempo recorde.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleConclude}
          disabled={isConcluding}
          className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98]"
        >
          {isConcluding ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined">verified</span>
              Concluir Depósito
            </>
          )}
        </button>
        <button
          onClick={() => setStep(2)}
          className="w-full bg-white dark:bg-white/5 text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-all"
        >
          Mudar banco
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative pb-24 overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <div className="w-10 flex items-center justify-center">
          <button
            onClick={showHistory ? () => setShowHistory(false) : (step === 1 ? onBack : () => setStep(step - 1))}
            className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {showHistory ? 'Histórico' : 'Recarregar'}
        </h1>

        <div className="w-10 flex items-center justify-center">
          {!showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full transition-all"
            >
              <span className="material-symbols-outlined">history</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {showHistory ? renderHistory() : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </>
        )}
      </div>

      {/* Feedback Notification */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto bg-white dark:bg-dark-card border-2 ${showFeedback.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? t.success : t.error}
            </p>
            <p className="text-sm font-bold text-dark/70 dark:text-white/70 leading-relaxed">
              {showFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
