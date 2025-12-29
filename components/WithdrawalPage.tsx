
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface WithdrawalPageProps {
  onBack: () => void;
  onRedirectDeposit: () => void;
  onRedirectAddBank: () => void;
  lang: Language;
}

interface WithdrawalRecord {
  id: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  requestedAmount: number;
  feePercent: number;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado';
  timestamp: string;
}

const MOCK_WITHDRAWAL_HISTORY: WithdrawalRecord[] = [
  {
    id: 'W1',
    recipientName: 'Investidor DeepBank',
    bankName: 'Banco BAI',
    accountNumber: 'AO06 0040 ... 9012 3',
    requestedAmount: 25000,
    feePercent: 10,
    status: 'Aprovado',
    timestamp: '14:30:15 25/12/2025'
  }
];

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ 
  onBack, 
  onRedirectDeposit, 
  onRedirectAddBank,
  lang
}) => {
  const t = translations[lang];
  const userBalance = 45230.80;
  const userBankAccounts = [
    { id: '1', bank: 'Banco BAI', iban: 'AO06 0040 0000 1234 5678 9012 3' }
  ];

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    selectedBankId: userBankAccounts[0]?.id || ''
  });

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const formatKz = (val: number | string) => {
    const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, '')) : val;
    if (isNaN(num)) return '0 Kz';
    return new Intl.NumberFormat('pt-AO').format(num) + ' Kz';
  };

  const handleInitialRetirarClick = () => {
    if (userBalance < 100) {
      triggerFeedback('error', t.error);
      setTimeout(() => onRedirectDeposit(), 1500);
      return;
    }
    if (userBankAccounts.length === 0) {
      triggerFeedback('error', t.addBank);
      setTimeout(() => onRedirectAddBank(), 1500);
      return;
    }
    setIsFormVisible(true);
  };

  const handleConfirmWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(formData.amount.replace(/\D/g, ''));

    if (!formData.amount || isNaN(cleanAmount)) {
      triggerFeedback('error', t.error);
      return;
    }
    if (cleanAmount < 500) {
      triggerFeedback('error', t.minWithdrawal);
      return;
    }
    if (cleanAmount > userBalance) {
      triggerFeedback('error', t.error);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      triggerFeedback('success', t.success);
      setTimeout(() => {
        setIsFormVisible(false);
        setFormData({ amount: '', selectedBankId: userBankAccounts[0]?.id || '' });
      }, 2000);
    }, 2000);
  };

  const renderHistory = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-2 mb-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t.transactionHistory}</p>
      </div>
      
      {MOCK_WITHDRAWAL_HISTORY.map((item) => {
        const fee = (item.requestedAmount * item.feePercent) / 100;
        const netAmount = item.requestedAmount - fee;
        
        return (
          <div key={item.id} className="bg-white dark:bg-dark-card rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-50 dark:border-white/5 pb-4">
              <div>
                <h4 className="font-black text-sm text-dark dark:text-white">{t.withdrawalTitle} #{item.id}</h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{item.timestamp}</p>
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                item.status === 'Aprovado' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 
                'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">{t.bankName}</span>
                <span className="text-xs font-black text-dark dark:text-white">{item.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">IBAN</span>
                <span className="text-[10px] font-mono text-dark dark:text-white">{item.accountNumber}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400">Total</span>
                  <span className="text-xs font-bold text-dark dark:text-white">{formatKz(item.requestedAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-red-500">
                  <span className="text-[10px] font-bold">{t.feeNote}</span>
                  <span className="text-xs font-bold">- {formatKz(fee)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50 dark:border-white/5">
                  <span className="text-[10px] font-black text-primary uppercase">Recebido</span>
                  <span className="text-base font-black text-primary">{formatKz(netAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative pb-24">
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <button onClick={showHistory ? () => setShowHistory(false) : onBack} className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2">{showHistory ? t.transactionHistory : t.withdrawalTitle}</h1>
        {!showHistory && (
          <button onClick={() => setShowHistory(true)} className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full">
            <span className="material-symbols-outlined">history</span>
          </button>
        )}
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {showHistory ? renderHistory() : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.availableBalance}</p>
                <h2 className="text-5xl font-black text-dark dark:text-white">
                  {new Intl.NumberFormat('pt-AO').format(userBalance)} 
                  <span className="text-xl font-bold text-primary ml-2">Kz</span>
                </h2>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[32px] flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">info</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {t.feeNote} {t.minWithdrawal}
                </p>
              </div>

              {!isFormVisible && (
                <button 
                  onClick={handleInitialRetirarClick}
                  className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-3 hover:bg-primary-dark active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  {t.withdrawNow}
                </button>
              )}
            </div>

            {isFormVisible && (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-2xl space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">{t.withdrawAmount}</label>
                    <div className="relative">
                       <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">monetization_on</span>
                       <input 
                        type="text" 
                        value={formData.amount ? formatKz(formData.amount).replace(' Kz', '') : ''}
                        onChange={(e) => setFormData({...formData, amount: e.target.value.replace(/\D/g, '')})}
                        placeholder="Ex: 10.000"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-dark/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-base font-black dark:text-white"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase">Kz</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">{t.receivingAccount}</label>
                    <div className="p-5 rounded-2xl bg-primary/5 dark:bg-primary/20 border border-primary/20 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">account_balance</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-primary dark:text-white">{userBankAccounts[0].bank}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{userBankAccounts[0].iban}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary">verified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-2">
                    {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : t.confirmWithdrawal}
                  </button>
                  <button type="button" onClick={() => setIsFormVisible(false)} className="w-full bg-white dark:bg-white/5 text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 dark:border-white/5">{t.cancel}</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-90 fade-in duration-300 bg-white dark:bg-dark-card border-2 ${showFeedback.type === 'success' ? 'border-green-500' : 'border-red-500'} pointer-events-auto`}>
            <span className={`material-symbols-outlined text-5xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {showFeedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-black text-dark dark:text-white">{showFeedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
