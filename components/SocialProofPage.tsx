
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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

interface Stats {
  requestedToday: number;
  paidToday: number;
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
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [stats, setStats] = useState<Stats>({ requestedToday: 0, paidToday: 0 });
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    setupRealtime();
  }, []);

  const loadData = async () => {
    try {
      // Load posts
      const { data: posts, error: postsError } = await supabase
        .from('prova_social')
        .select('*')
        .order('data_publicacao', { ascending: false });

      if (postsError) throw postsError;

      if (posts) {
        setProofs(posts.map(p => ({
          id: p.id,
          userName: 'Usuário',
          amount: '---',
          date: new Date(p.data_publicacao).toLocaleString('pt-AO'),
          comment: p.comentario,
          imageUrl: p.url_imagem_1,
          status: 'verified'
        })));
      }

      // Load stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_daily_withdrawal_stats');
      if (!statsError && statsData) {
        setStats({
          requestedToday: statsData.requested_today || 0,
          paidToday: statsData.paid_today || 0
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('prova_social_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'prova_social'
      }, (payload) => {
        const newPost = payload.new;
        setProofs(prev => [{
          id: newPost.id,
          userName: 'Usuário',
          amount: '---',
          date: new Date(newPost.data_publicacao).toLocaleString('pt-AO'),
          comment: newPost.comentario,
          imageUrl: newPost.url_imagem_1,
          status: 'verified'
        }, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      triggerFeedback('error', 'Selecione uma imagem do comprovante.');
      return;
    }

    if (!comment.trim()) {
      triggerFeedback('error', 'Escreva um comentário.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        triggerFeedback('error', 'Usuário não autenticado.');
        setIsSubmitting(false);
        return;
      }

      // Upload image
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovativos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('comprovativos')
        .getPublicUrl(fileName);

      // Insert post
      const { error: insertError } = await supabase
        .from('prova_social')
        .insert({
          user_id: user.id,
          url_imagem_1: publicUrl,
          comentario: comment
        });

      if (insertError) throw insertError;

      triggerFeedback('success', 'Publicado com sucesso!');
      setSelectedFile(null);
      setComment('');

    } catch (error: any) {
      console.error('Submit error:', error);
      triggerFeedback('error', error.message || 'Erro ao publicar.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Seção 1: Enviar Comprovante */}
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
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-contain bg-gray-100 dark:bg-gray-900" />
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
                  <div className="relative h-56 bg-white dark:bg-dark/50 overflow-hidden cursor-pointer" onClick={() => setFullscreenImage(p.imageUrl)}>
                    <img src={p.imageUrl} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="eager" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
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
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1 ${p.status === 'verified' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
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
          <div className={`px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-dark/10 ${showFeedback.type === 'success' ? 'bg-dark dark:bg-white text-white dark:text-dark' : 'bg-red-500 text-white'
            }`}>
            <span className="material-symbols-outlined text-green-500 text-sm">{showFeedback.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
