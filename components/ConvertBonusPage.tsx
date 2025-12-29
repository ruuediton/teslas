
import React, { useState } from 'react';

interface ConvertBonusPageProps {
  onBack: () => void;
}

export const ConvertBonusPage: React.FC<ConvertBonusPageProps> = ({ onBack }) => {
  const [bonusBalance, setBonusBalance] = useState(5000);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('pt-AO').format(parseInt(num));
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amount.replace(/\D/g, ''));

    if (!amount || isNaN(cleanAmount)) {
      triggerFeedback('error', 'Informe um valor para continuar.');
      return;
    }

    if (cleanAmount < 100) {
      triggerFeedback('error', 'O valor mínimo para conversão é 100 Kz.');
      return;
    }

    if (cleanAmount > bonusBalance) {
      triggerFeedback('error', 'Saldo de bônus insuficiente.');
      return;
    }

    setIsProcessing(true);

    // Simulate Backend Processing
    setTimeout(() => {
      setIsProcessing(false);
      setBonusBalance(prev => prev - cleanAmount);
      triggerFeedback('success', 'Bônus convertido com sucesso!');
      setAmount('');
    }, 2000);
  };

  const setQuickValue = (val: number) => {
    if (val <= bonusBalance) {
      setAmount(val.toString());
    } else {
      triggerFeedback('error', 'Valor excede seu saldo de bônus.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-bold text-dark pr-10">Converter Bônus</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Bonus Balance Card */}
        <div className="bg-dark rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-8xl">currency_exchange</span>
          </div>
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Saldo de Bônus Disponível</p>
            <h2 className="text-4xl font-black">
              {new Intl.NumberFormat('pt-AO').format(bonusBalance)} 
              <span className="text-lg font-bold text-white/40 ml-1 font-sans">Kz</span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Pronto para converter</span>
            </div>
          </div>
        </div>

        {/* Informative Text */}
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex gap-3">
          <span className="material-symbols-outlined text-blue-500">info</span>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Converta seu bônus em saldo principal para usar em recargas, investimentos e transferências instantâneas.
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleConvert} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Valor para conversão</label>
              <div className="relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">token</span>
                 <input 
                  type="text" 
                  value={formatCurrency(amount)}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Quanto deseja converter?"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-base font-bold transition-all"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">Kz</span>
              </div>
            </div>

            {/* Quick Values */}
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuickValue(val)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    parseInt(amount) === val 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {val} Kz
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit"
              disabled={isProcessing || !amount}
              className={`w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 ${isProcessing ? 'animate-subtle-pulse' : ''}`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined">sync_alt</span>
              )}
              {isProcessing ? 'Convertendo...' : 'Converter Bônus'}
            </button>
            
            <button 
              type="button"
              onClick={onBack}
              className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Centered Feedback Notification */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${
            showFeedback.type === 'success' ? 'bg-white border-2 border-green-500' : 'bg-white border-2 border-red-500'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${
               showFeedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className={`material-symbols-outlined text-4xl ${
                showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${
               showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {showFeedback.type === 'success' ? 'Sucesso!' : 'Ocorreu um Erro'}
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
