
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { View as AppView, Language } from '../types';

interface InvitationGeneratorProps {
  onBack: () => void;
  lang: Language;
  onNavigateToTeam: () => void;
}

export const InvitationGenerator: React.FC<InvitationGeneratorProps> = ({ onBack, lang, onNavigateToTeam }) => {
  const [inviteCode, setInviteCode] = useState("...");
  const [inviteUrl, setInviteUrl] = useState("...");
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [totalDirects, setTotalDirects] = useState(0);

  useEffect(() => {
    fetchInviteInfo();
  }, []);

  const fetchInviteInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code')
        .eq('id', user.id)
        .single();

      if (profile?.invite_code) {
        setInviteCode(profile.invite_code);
        setInviteUrl(`https://deepbank-eight.vercel.app/register?ref=${profile.invite_code}`);

        // Fetch count of direct subordinates
        const { count } = await supabase
          .from('red_equipe')
          .select('*', { count: 'exact', head: true })
          .eq('user_id_convidador', user.id)
          .eq('codigo_convite', profile.invite_code);

        setTotalDirects(count || 0);
      }
    } catch (error) {
      console.error('Error fetching invite info:', error);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setShowFeedback(`${label} ${lang === 'pt' ? 'copiado com sucesso!' : 'copied successfully!'}`);
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const rewardsData = [
    { level: '1', value: 'Variável', percentage: '15%' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative pb-24 overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white dark:bg-dark-card h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4 shadow-sm">
        <div className="w-10 flex items-center justify-center">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {lang === 'pt' ? 'Convites' : 'Invitations'}
        </h1>

        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1 animate-in fade-in duration-500">
        {/* Banner Motivacional */}
        <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-primary/20">
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-2">{lang === 'pt' ? 'Convide e Ganhe' : 'Invite & Earn'}</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-[200px]">
              {lang === 'pt'
                ? 'Expanda sua rede e receba recompensas diretas por cada novo membro.'
                : 'Expand your network and receive direct rewards for each new member.'}
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">share_reviews</span>
        </div>

        {/* Botão Ver Minha Equipe */}
        <button
          onClick={onNavigateToTeam}
          className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 p-6 rounded-[32px] shadow-xl flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-dark dark:text-white uppercase tracking-tighter">
                {lang === 'pt' ? 'Minha Equipe' : 'My Team'}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                {totalDirects} {lang === 'pt' ? 'Subordinados diretos' : 'Direct subordinates'}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-all">chevron_right</span>
        </button>

        {/* Link de Convite Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            {lang === 'pt' ? 'Link de Convite Personalizado' : 'Personalized Invite Link'}
          </label>
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all leading-relaxed text-center">
                {inviteUrl}
              </p>
            </div>
            <button
              onClick={() => handleCopy(inviteUrl, 'Link')}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              {lang === 'pt' ? 'Copiar link de convite' : 'Copy invite link'}
            </button>
          </div>
        </div>

        {/* Código de Convite Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            {lang === 'pt' ? 'Código de Referência' : 'Reference Code'}
          </label>
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center gap-4">
            <div className="text-3xl font-black tracking-[0.3em] text-dark dark:text-white bg-accent/5 px-8 py-3 rounded-2xl border border-accent/20">
              {inviteCode}
            </div>
            <button
              onClick={() => handleCopy(inviteCode, lang === 'pt' ? 'Código' : 'Code')}
              className="w-full bg-dark dark:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-white/20 transition-all active:scale-95 shadow-lg shadow-dark/10"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              {lang === 'pt' ? 'Copiar código de convite' : 'Copy invite code'}
            </button>
          </div>
        </div>

        {/* Tabela de Recompensas */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-dark dark:text-white uppercase tracking-widest pl-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 text-lg">military_tech</span>
            {lang === 'pt' ? 'Tabela de Ganhos' : 'Earnings Table'}
          </h3>
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Nível' : 'Level'}</th>
                  <th className="text-center py-4 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Comissão' : 'Commission'}</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Fixo' : 'Fixed'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {rewardsData.map((row, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 px-6 text-sm font-bold text-dark dark:text-white">{lang === 'pt' ? 'Lvl' : 'Lvl'} {row.level}</td>
                    <td className="py-4 px-2 text-center text-xs font-black text-primary bg-primary/5">{row.percentage}</td>
                    <td className="py-4 px-6 text-right text-sm font-black text-green-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Snackbar Feedback */}
      {showFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">done</span>
            </div>
            <p className="text-xs font-bold whitespace-nowrap">{showFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
