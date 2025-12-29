
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface UserProfileDetailPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export const UserProfileDetailPage: React.FC<UserProfileDetailPageProps> = ({ onBack, onLogout }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestor, setIsInvestor] = useState(false);
  const [bankData, setBankData] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: "...",
    id: "...",
    invite_code: "..."
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfileData({
          phone: profile.phone || "...",
          id: profile.id,
          invite_code: profile.invite_code || "..."
        });
      }

      // 2. Check Investor Status
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setIsInvestor(purchases && purchases.length > 0);

      // 3. Fetch Bank Info
      const { data: bank } = await supabase
        .from('bancos_clientes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setBankData(bank);

    } catch (error) {
      console.error('Error fetching user profile detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBank = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('bancos_clientes')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setBankData(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting bank info:', error);
      alert('Erro ao deletar conta bancária.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const displayId = `DB-${profileData.id.substring(0, 8).toUpperCase()}`;

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
          Perfil do Usuário
        </h1>

        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Avatar & Header Section */}
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto border-4 border-white dark:border-white/10 shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-white text-5xl">person</span>
            </div>
            {isInvestor && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px] font-black">verified</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-dark dark:text-white tracking-tight">
              {isInvestor ? 'Investidor DeepBank' : 'Usuário Normal DeepBank'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
              STATUS: {isInvestor ? 'CONTA ATIVA' : 'AGUARDANDO INVESTIMENTO'}
            </p>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Informações Pessoais</h3>

          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            {/* ID do Usuário */}
            <div className="p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID do Usuário</p>
                  <p className="text-sm font-black text-dark dark:text-white font-mono">{displayId}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(displayId)}
                className="w-10 h-10 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
                title="Copiar ID"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>

            {/* Invite Code */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-xl">share</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código de Convite</p>
                  <p className="text-sm font-black text-dark dark:text-white">{profileData.invite_code}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(profileData.invite_code)}
                className="w-10 h-10 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>

            {/* Telefone */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</p>
                <p className="text-sm font-bold text-dark dark:text-white">{profileData.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Information Section */}
        {bankData && (
          <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Informações Bancárias</h3>
            <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titular</p>
                <p className="text-sm font-black text-dark dark:text-white">{bankData.nome_completo}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Banco</p>
                <p className="text-sm font-black text-primary uppercase">{bankData.nome_do_banco}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IBAN</p>
                <p className="text-xs font-black text-dark dark:text-white font-mono">{bankData.iban}</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500 delay-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sessão e Segurança</h3>

          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            {bankData && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-4 p-5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">no_accounts</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-red-600">Deletar Conta Bancária</p>
                  <p className="text-[10px] text-red-400 font-bold uppercase">Remover seus dados bancários</p>
                </div>
                <span className="material-symbols-outlined text-red-200">chevron_right</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">logout</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-dark dark:text-white">Desconectar-se</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Encerrar acesso atual</p>
              </div>
              <span className="material-symbols-outlined text-gray-200">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100/50 dark:border-blue-900/20 flex gap-4">
          <span className="material-symbols-outlined text-blue-500 text-xl shrink-0">info</span>
          <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed font-medium">
            Seus dados são protegidos por criptografia de ponta a ponta. Para alterar seu telefone ou dados de convite, entre em contato com o suporte especializado.
          </p>
        </div>
      </div>

      {/* Confirmation Modal for Bank Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-[32px] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-dark dark:text-white">Deseja deletar a sua conta bancária?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Esta ação não pode ser desfeita.</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleDeleteBank}
                className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                Confirmar Exclusão
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Feedback Snackbar */}
      {showCopyFeedback && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px] font-black">done</span>
            </div>
            <p className="text-xs font-bold whitespace-nowrap">Copiado com sucesso!</p>
          </div>
        </div>
      )}
    </div>
  );
};

