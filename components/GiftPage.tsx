
import React, { useState, useEffect } from 'react';

interface Gift {
  id: string;
  code: string;
  type: 'Saldo' | 'Bônus' | 'Rendimento Extra' | 'Desconto';
  value: string;
  expiry: string;
  status: 'available' | 'used' | 'expired';
  description: string;
}

interface GiftPageProps {
  onBack: () => void;
}

export const GiftPage: React.FC<GiftPageProps> = ({ onBack }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [availableGifts, setAvailableGifts] = useState<Gift[]>([
    {
      id: 'G1',
      code: 'DEEP-NEW-2025',
      type: 'Bônus',
      value: '2.500 Kz',
      expiry: '31/12/2025',
      status: 'available',
      description: 'Bônus especial para novos investidores usarem em qualquer fundo.'
    },
    {
      id: 'G2',
      code: 'CASHBACK-10',
      type: 'Saldo',
      value: '500 Kz',
      expiry: '15/11/2025',
      status: 'available',
      description: 'Crédito direto em conta para retirada ou reinvestimento.'
    }
  ]);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleRedeem = (codeToRedeem?: string) => {
    const code = codeToRedeem || couponCode;
    if (!code.trim()) {
      triggerFeedback('error', 'Por favor, insira um código de cupom.');
      return;
    }

    setIsRedeeming(true);
    
    // Simulação de validação no backend
    setTimeout(() => {
      setIsRedeeming(false);
      
      const foundGift = availableGifts.find(g => g.code.toUpperCase() === code.toUpperCase());
      
      if (foundGift) {
        if (foundGift.status === 'available') {
          triggerFeedback('success', `Sucesso! Você resgatou ${foundGift.value} em ${foundGift.type}.`);
          setAvailableGifts(prev => prev.map(g => g.id === foundGift.id ? { ...g, status: 'used' as const } : g));
          setCouponCode('');
        } else {
          triggerFeedback('error', 'Este cupom já foi utilizado ou está expirado.');
        }
      } else {
        triggerFeedback('error', 'Código de cupom inválido. Verifique se digitou corretamente.');
      }
    }, 1500);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    triggerFeedback('success', 'Código copiado!');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 px-4">
        <div className="w-10">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Presente
        </h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Banner Ilustrativo */}
        <div className="bg-accent rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-accent/20">
          <div className="relative z-10 space-y-2">
            <h2 className="text-xl font-black">Central de Cupons</h2>
            <p className="text-white/70 text-xs font-medium max-w-[200px] leading-relaxed">
              Resgate seus presentes e turbine seus rendimentos no DeepBank.
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-white/10 rotate-12">redeem</span>
        </div>

        {/* Campo de Resgate Direto */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Tem um código?</label>
          <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xl">confirmation_number</span>
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Insira o código aqui"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-black tracking-widest placeholder:font-bold"
              />
            </div>
            <button 
              onClick={() => handleRedeem()}
              disabled={isRedeeming || !couponCode}
              className="bg-primary text-white px-6 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isRedeeming ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Resgatar'}
            </button>
          </div>
        </div>

        {/* Lista de Presentes */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Meus Presentes Disponíveis</h3>
          
          {availableGifts.filter(g => g.status === 'available').length > 0 ? (
            availableGifts.filter(g => g.status === 'available').map((gift) => (
              <div 
                key={gift.id}
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="p-6 flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    gift.type === 'Saldo' ? 'bg-green-50 text-green-500' : 'bg-primary/5 text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-3xl">
                      {gift.type === 'Saldo' ? 'payments' : 'card_giftcard'}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{gift.type}</span>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Expira: {gift.expiry}</span>
                    </div>
                    <h4 className="text-xl font-black text-dark">{gift.value}</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{gift.description}</p>
                  </div>
                </div>
                
                <div className="px-6 pb-6 pt-2 flex gap-2">
                  <button 
                    onClick={() => handleRedeem(gift.code)}
                    disabled={isRedeeming}
                    className="flex-1 bg-dark text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-all shadow-lg shadow-dark/10"
                  >
                    Resgatar Presente
                  </button>
                  <button 
                    onClick={() => copyCode(gift.code)}
                    className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100"
                    title="Copiar Código"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <span className="material-symbols-outlined text-5xl">inventory_2</span>
              </div>
              <div className="space-y-1">
                <p className="text-dark font-extrabold">Nenhum presente disponível</p>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Fique atento às nossas notificações para receber novos cupons.</p>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex gap-4">
          <span className="material-symbols-outlined text-orange-500 text-xl shrink-0">security_update_good</span>
          <p className="text-[10px] text-orange-600 font-bold leading-relaxed">
            Cada código é único e pessoal. Nunca compartilhe seus cupons resgatados com terceiros. Em caso de dúvidas, contate o suporte.
          </p>
        </div>
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
