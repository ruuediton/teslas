
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface RechargeFlowProps {
  onBack: () => void;
  lang: Language;
}

const QUICK_VALUES = [500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
const PARTNER_BANKS = [
  { id: 'bai', name: 'Banco BAI', iban: 'AO06 0040 0000 1234 5678 9012 3' },
  { id: 'bfa', name: 'Banco BFA', iban: 'AO06 0006 0000 9876 5432 1012 3' },
  { id: 'bic', name: 'Banco BIC', iban: 'AO06 0051 0000 4455 6677 8812 3' },
  { id: 'atlantico', name: 'Banco ATLANTICO', iban: 'AO06 0055 0000 1122 3344 5512 3' }
];

const MOCK_HISTORY = [
  { id: 'H1', title: 'Depósito', amount: 50000, bank: 'Banco BAI', status: 'Aprovado', date: '25/10/2025 14:30' },
  { id: 'H2', title: 'Depósito', amount: 1000, bank: 'Banco BFA', status: 'Pendente', date: '26/10/2025 09:15' },
];

export const RechargeFlow: React.FC<RechargeFlowProps> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<typeof PARTNER_BANKS[0] | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isConcluding, setIsConcluding] = useState(false);
  
  // Nova funcionalidade de comprovante
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

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

  const handleSelectBank = (bank: typeof PARTNER_BANKS[0]) => {
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

  const handleConclude = () => {
    setIsConcluding(true);
    // Simulação de envio com comprovante
    setTimeout(() => {
      setIsConcluding(false);
      triggerFeedback('success', t.rechargeSuccess);
      setTimeout(() => onBack(), 2000);
    }, 1500);
  };

  const renderHistory = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-2 mb-4">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Registros de Depósito</p>
      </div>
      
      <div className="space-y-3">
        {MOCK_HISTORY.map((item) => (
          <div key={item.id} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3 group active:scale-[0.99] transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.status === 'Aprovado' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                }`}>
                  <span className="material-symbols-outlined text-xl">{item.status === 'Aprovado' ? 'check_circle' : 'pending'}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-dark dark:text-white">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-dark dark:text-white">{formatCurrency(item.amount)} Kz</p>
              </div>
            </div>
          </div>
        ))}
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
          {QUICK_VALUES.map((val) => (
            <button 
              key={val}
              onClick={() => setAmount(val.toString())}
              className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                parseInt(amount) === val 
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-2">
        <h2 className="text-lg font-black text-dark dark:text-white mb-1">Selecione o Banco</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Escolha uma de nossas contas para depósito</p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        {PARTNER_BANKS.map((bank) => (
          <button 
            key={bank.id}
            onClick={() => handleSelectBank(bank)}
            className={`w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border-b border-gray-50 dark:border-white/5 last:border-0 group`}
          >
            <div className="w-12 h-12 bg-primary/5 dark:bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-dark dark:text-white text-sm">{bank.name}</p>
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
    </div>
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
            <span className="text-sm font-black text-dark dark:text-white">{selectedBank?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Favorecido</span>
            <span className="text-sm font-black text-dark dark:text-white">DEEPBANK LDA</span>
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
             <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                <img src={URL.createObjectURL(receiptFile)} alt="Comprovativo" className="w-full h-full object-cover" />
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
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto bg-white dark:bg-dark-card border-2 ${
            showFeedback.type === 'success' ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${
               showFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
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
