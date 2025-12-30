
import React from 'react';
import { View, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import { useLoading } from './LoadingContext';

interface ProfilePageProps {
  onLogout: () => void;
  setView: (view: View) => void;
  lang: Language;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, setView, lang }) => {
  const { setIsLoading: setGlobalLoading } = useLoading();
  const t = translations[lang];

  const [userData, setUserData] = React.useState<UserProfile | any>({
    phone: "...",
    id: "...",
    balance: "0,00",
    totalRecharge: "0,00",
    totalDeposit: "0,00",
    totalIncome: "0,00",
    totalWithdrawal: "0,00",
  });

  React.useEffect(() => {
    fetchProfile();

    // Configurar Realtime
    const channel = supabase
      .channel('profile_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchProfile())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'depositos_clientes' }, () => fetchProfile())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retirada_clientes' }, () => fetchProfile())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas_diarias' }, () => fetchProfile())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfile = async () => {
    setGlobalLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGlobalLoading(false);
        return;
      }

      // 1. Fetch Profile (Balance & Recharge)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. Fetch Total Approved Deposits
      const { data: deposits } = await supabase
        .from('depositos_clientes')
        .select('valor_deposito')
        .eq('user_id', user.id)
        .eq('estado_de_pagamento', 'recarregado');

      const totalDep = deposits?.reduce((acc, curr) => acc + Number(curr.valor_deposito), 0) || 0;

      // 3. Fetch Total Withdrawals
      const { data: withdrawals } = await supabase
        .from('retirada_clientes')
        .select('valor_solicitado')
        .eq('user_id', user.id);

      const totalWith = withdrawals?.reduce((acc, curr) => acc + Number(curr.valor_solicitado), 0) || 0;

      // 4. Fetch Total Daily Income (from tasks history)
      const { data: incomeTasks } = await supabase
        .from('tarefas_diarias')
        .select('valor_renda')
        .eq('user_id', user.id);

      const totalInc = incomeTasks?.reduce((acc, curr) => acc + Number(curr.valor_renda), 0) || 0;

      if (profile) {
        setUserData({
          phone: profile.phone || user.email || "User",
          id: `DB-${profile.id.substring(0, 5).toUpperCase()}`,
          balance: new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(profile.balance || 0),
          totalRecharge: new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(profile.reloaded_amount || 0),
          totalDeposit: new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(totalDep),
          totalIncome: new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(totalInc),
          totalWithdrawal: new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(totalWith),
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const actionButtons = [
    { icon: 'payments', label: t.withdrawBalance, color: 'text-red-500', action: () => setView(View.WITHDRAWAL) },
    { icon: 'account_balance_wallet', label: t.depositBalance, color: 'text-green-500', action: () => setView(View.RECHARGE) },
    { icon: 'account_balance', label: t.addBank, color: 'text-blue-500', action: () => setView(View.ADD_BANK) },
    { icon: 'group_add', label: t.inviteFriends, color: 'text-purple-500', action: () => setView(View.INVITATION) },
    { icon: 'currency_exchange', label: t.convertBonus, color: 'text-orange-500', action: () => setView(View.CONVERT_BONUS) },
    { icon: 'lock_reset', label: t.changePassword, color: 'text-orange-600', action: () => setView(View.CHANGE_PASSWORD) },
    { icon: 'get_app', label: t.downloadApp, color: 'text-primary', action: () => setView(View.DOWNLOAD_APP) },
    { icon: 'verified', label: t.socialProof, color: 'text-green-500', action: () => setView(View.SOCIAL_PROOF) },
    { icon: 'business', label: t.companyIntro, color: 'text-indigo-600', action: () => setView(View.COMPANY_INTRO) },
    { icon: 'info', label: t.aboutUs, color: 'text-gray-600', action: () => setView(View.ABOUT_US) },
    { icon: 'help_outline', label: t.faq, color: 'text-gray-600', action: () => setView(View.FAQ) },
    { icon: 'support_agent', label: t.customerService, color: 'text-accent', action: () => setView(View.CUSTOMER_SERVICE) },
    { icon: 'history', label: t.transactionHistory, color: 'text-gray-500', action: () => setView(View.TRANSACTION_HISTORY) },
    { icon: 'settings', label: t.settings, color: 'text-gray-400', action: () => setView(View.SETTINGS) },
    { icon: 'notifications', label: t.notifications, color: 'text-primary', action: () => setView(View.NOTIFICATIONS) },
    { icon: 'manage_accounts', label: t.userProfile, color: 'text-dark dark:text-white', action: () => setView(View.USER_PROFILE_DETAIL) },
  ];

  return (
    <div className="pb-28 bg-gray-50 dark:bg-dark min-h-full">
      {/* User Header */}
      <div className="bg-white dark:bg-dark-card px-8 pt-12 pb-10 rounded-b-[50px] shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center border border-primary/20 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-primary">person</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-dark dark:text-white tracking-tight">{userData.phone}</h2>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">ID: {userData.id}</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 -mt-8">
        <div className="bg-dark dark:bg-black/60 rounded-[40px] p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="mb-8 relative z-10">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{t.totalBalance}</p>
            <h3 className="text-4xl font-black">{userData.balance} <span className="text-lg text-primary">Kz</span></h3>
          </div>

          <div className="grid grid-cols-2 gap-y-8 gap-x-4 border-t border-white/10 pt-8 relative z-10">
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase mb-1">Recarga</p>
              <p className="font-black text-sm">{userData.totalRecharge} Kz</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase mb-1">Depósito</p>
              <p className="font-black text-sm">{userData.totalDeposit} Kz</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase mb-1">{t.income}</p>
              <p className="font-black text-sm text-green-400">+{userData.totalIncome} Kz</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase mb-1">{t.withdraw}</p>
              <p className="font-black text-sm text-red-400">-{userData.totalWithdrawal} Kz</p>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-8 -top-8 text-[200px] text-white/5">account_balance</span>
        </div>
      </div>

      {/* REWARDS SECTION */}
      <div className="px-6 mt-10 space-y-6">
        <h4 className="px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t.rewardsCenter}</h4>
        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => setView(View.TASKS)}
            className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-dark dark:text-white uppercase tracking-tighter">{t.tasks}</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">{t.tasksSubtitle}</p>
            </div>
          </button>

          <button
            onClick={() => setView(View.GIFT)}
            className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all group"
          >
            <div className="w-14 h-14 bg-accent/10 dark:bg-accent/20 text-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">redeem</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-dark dark:text-white uppercase tracking-tighter">{t.gift}</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">{t.giftSubtitle}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Actions List */}
      <div className="px-6 mt-10 space-y-4">
        <h4 className="px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">{t.mgmtSupport}</h4>

        <div className="bg-white dark:bg-dark-card rounded-[40px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
          {actionButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className="w-full flex items-center gap-5 px-8 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0 group"
            >
              <span className={`material-symbols-outlined ${btn.color} text-2xl`}>{btn.icon}</span>
              <span className="text-sm font-bold text-dark dark:text-white flex-1 text-left">{btn.label}</span>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 group-hover:text-primary transition-all">chevron_right</span>
            </button>
          ))}
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-10 flex items-center justify-center gap-3 py-5 bg-red-50 dark:bg-red-900/10 text-red-500 font-black rounded-3xl hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/20 shadow-xl shadow-red-500/10"
        >
          <span className="material-symbols-outlined">logout</span>
          {t.logout}
        </button>
      </div>
    </div>
  );
};
