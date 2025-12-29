
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface Proof {
  id: string;
  userName: string;
  amount: string;
  date: string;
  comment?: string;
  imageUrl: string;
  status: 'verified' | 'pending';
}

interface SocialProofPageProps {
  onBack: () => void;
  lang: Language;
}

export const SocialProofPage: React.FC<SocialProofPageProps> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');

  const [proofs, setProofs] = useState<Proof[]>([
    {
      id: 'P1',
      userName: 'Mateus K.',
      amount: '50.000 Kz',
      date: 'Hoje, 10:45',
      comment: 'Caiu em menos de 2 horas! Top demais.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=400&auto=format&fit=crop',
      status: 'verified'
    },
    {
      id: 'P2',
      userName: 'Ana Maria L.',
      amount: '120.000 Kz',
      date: 'Ontem, 21:30',
      comment: 'Segundo saque realizado com sucesso.',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=400&auto=format&fit=crop',
      status: 'verified'
    },
    {
      id: 'P3',
      userName: 'Domingos J.',
      amount: '5.000 Kz',
      date: 'Ontem, 15:10',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?q=80&w=400&auto=format&fit=crop',
      status: 'verified'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      triggerFeedback('error', 'Selecione uma imagem do comprovante.');
      return;
    }

    setIsSubmitting(true);

    // Simulação de upload para o backend
    setTimeout(() => {
      setIsSubmitting(false);
      triggerFeedback('success', t.proofSuccess);
      setSelectedFile(null);
      setComment('');
      
      // Adiciona simuladamente ao feed como pendente
      const newProof: Proof = {
        id: 'P_TEMP_' + Date.now(),
        userName: 'Você',
        amount: '---',
        date: 'Agora',
        comment: comment,
        imageUrl: URL.createObjectURL(selectedFile),
        status: 'pending'
      };
      setProofs([newProof, ...proofs]);
    }, 2000);
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
        
        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {t.socialProof}
        </h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Seção 1: Estatísticas */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">
            {t.statsTitle}
          </h3>
          <div className="bg-primary rounded-[32px] p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{t.activeUsers}</p>
                <h4 className="text-2xl font-black">52.480</h4>
              </div>
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{t.totalPaid}</p>
                <h4 className="text-2xl font-black">285M Kz</h4>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-white/5 rotate-12">monitoring</span>
          </div>
        </section>

        {/* Seção 3: Enviar Comprovante */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">
            {t.sendProof}
          </h3>
          <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{t.uploadImage}</label>
                <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all overflow-hidden relative">
                  {selectedFile ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-3xl">add_a_photo</span>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">PNG, JPG (Max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{t.commentLabel}</label>
                <input 
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Pagamento recebido!"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold dark:text-white"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="w-full bg-dark dark:bg-primary text-white py-4 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-sm">publish</span>
                )}
                {t.submitProof}
              </button>
            </form>
          </div>
        </section>

        {/* Seção 2: Feed Público */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-2">
            {t.publicFeed}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-card p-5 rounded-[28px] border border-gray-100 dark:border-white/5 animate-pulse h-48"></div>
              ))
            ) : (
              proofs.map((p) => (
                <div key={p.id} className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col group">
                  <div className="relative h-48 bg-gray-100 dark:bg-dark/50 overflow-hidden">
                    <img src={p.imageUrl} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{p.date}</p>
                         <h4 className="text-white font-black text-lg">{p.userName}</h4>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                        <p className="text-white font-black text-sm">{p.amount}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1 ${
                        p.status === 'verified' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">{p.status === 'verified' ? 'verified' : 'pending'}</span>
                        {p.status === 'verified' ? t.verifiedStatus : t.pendingStatus}
                      </span>
                    </div>
                  </div>
                  {p.comment && (
                    <div className="p-6">
                      <p className="text-sm text-dark/70 dark:text-white/70 italic font-medium">"{p.comment}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Global Toast Feedback */}
      {showFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-dark/10 ${
            showFeedback.type === 'success' ? 'bg-dark dark:bg-white text-white dark:text-dark' : 'bg-red-500 text-white'
          }`}>
            <span className="material-symbols-outlined text-green-500 text-sm">{showFeedback.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
