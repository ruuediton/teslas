
import React, { useState, useEffect } from 'react';
import { View, Language, Theme } from '../types';
import { BottomNav } from './BottomNav';
import { ProductListPage } from './ProductListPage';
import { PurchasedPackagesPage } from './PurchasedPackagesPage';
import { InvitationGenerator } from './InvitationGenerator';
import { ProfilePage } from './ProfilePage';
import { AddBankPage } from './AddBankPage';
import { ChangePasswordPage } from './ChangePasswordPage';
import { RechargeFlow } from './RechargeFlow';
import { WithdrawalPage } from './WithdrawalPage';
import { CompanyIntro } from './CompanyIntro';
import { ConvertBonusPage } from './ConvertBonusPage';
import { ChatBot } from './ChatBot';
import { NotificationsPage } from './NotificationsPage';
import { DownloadAppPage } from './DownloadAppPage';
import { AboutUsPage } from './AboutUsPage';
import { FAQPage } from './FAQPage';
import { CustomerServicePage } from './CustomerServicePage';
import { TransactionHistoryPage } from './TransactionHistoryPage';
import { SettingsPage } from './SettingsPage';
import { UserProfileDetailPage } from './UserProfileDetailPage';
import { GiftPage } from './GiftPage';
import { TasksPage } from './TasksPage';
import { SocialProofPage } from './SocialProofPage';
import { WelcomePopup } from './WelcomePopup';
import { translations } from '../translations';

interface DashboardProps {
  onLogout: () => void;
  appLanguage: Language;
  appTheme: Theme;
  setAppLanguage: (lang: Language) => void;
  setAppTheme: (theme: Theme) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  appLanguage,
  appTheme,
  setAppLanguage,
  setAppTheme
}) => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome popup only on initial home view
    const hasShown = sessionStorage.getItem('welcome_popup_shown');
    if (currentView === View.HOME && !hasShown) {
      setShowWelcome(true);
    }
  }, [currentView]);
  const t = translations[appLanguage];

  const carouselImages = [
    { url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1200&auto=format&fit=crop', title: 'DeepBank Vision' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop', title: 'Global Infrastructure' },
    { url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop', title: 'Digital Assets' }
  ];

  useEffect(() => {
    if (currentView === View.HOME) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentView, carouselImages.length]);

  const mainViews = [
    View.HOME,
    View.PRODUCTS,
    View.INVITATION,
    View.PROFILE,
    View.TRANSACTION_HISTORY,
    View.GIFT,
    View.TASKS,
    View.SOCIAL_PROOF
  ];
  const showBottomNav = mainViews.includes(currentView);

  const quickButtons = [
    { id: View.RECHARGE, label: t.btnRecharge, icon: 'payments', color: 'bg-primary/20 text-primary' },
    { id: View.WITHDRAWAL, label: t.btnWithdraw, icon: 'logout', color: 'bg-blue-600/20 text-blue-600' },
    { id: View.DOWNLOAD_APP, label: t.btnApp, icon: 'install_mobile', color: 'bg-indigo-600/20 text-indigo-600' },
    { id: View.COMPANY_INTRO, label: t.btnCompanyProfile, icon: 'description', color: 'bg-gray-400/20 text-gray-500' },
    { id: View.INVITATION, label: t.btnInvite, icon: 'group_add', color: 'bg-accent/20 text-accent' },
    { id: View.COMPANY_INTRO, label: t.btnAgency, icon: 'article', color: 'bg-teal-600/20 text-teal-600' },
    { id: View.SOCIAL_PROOF, label: t.btnSocialProof, icon: 'verified', color: 'bg-green-600/20 text-green-600' },
    { id: View.TASKS, label: t.btnTasks, icon: 'task_alt', color: 'bg-orange-600/20 text-orange-600' },
    { id: View.GIFT, label: t.btnGift, icon: 'redeem', color: 'bg-red-600/20 text-red-600' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case View.PRODUCTS:
        return <ProductListPage lang={appLanguage} onNavigateToPurchased={() => setCurrentView(View.PURCHASED_PACKAGES)} />;
      case View.PURCHASED_PACKAGES:
        return <PurchasedPackagesPage onBack={() => setCurrentView(View.PRODUCTS)} lang={appLanguage} />;
      case View.INVITATION:
        return <InvitationGenerator onBack={() => setCurrentView(View.HOME)} lang={appLanguage} />;
      case View.PROFILE:
        return <ProfilePage onLogout={onLogout} setView={setCurrentView} lang={appLanguage} />;
      case View.ADD_BANK:
        return <AddBankPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.CHANGE_PASSWORD:
        return <ChangePasswordPage onBack={() => setCurrentView(View.PROFILE)} onLogout={onLogout} lang={appLanguage} />;
      case View.RECHARGE:
        return <RechargeFlow onBack={() => setCurrentView(View.HOME)} lang={appLanguage} />;
      case View.WITHDRAWAL:
        return <WithdrawalPage
          onBack={() => setCurrentView(View.HOME)}
          onRedirectDeposit={() => setCurrentView(View.RECHARGE)}
          onRedirectAddBank={() => setCurrentView(View.ADD_BANK)}
          lang={appLanguage}
        />;
      case View.COMPANY_INTRO:
        return <CompanyIntro onFinish={() => setCurrentView(View.HOME)} lang={appLanguage} />;
      case View.CONVERT_BONUS:
        return <ConvertBonusPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.CHAT:
        return <ChatBot onBack={() => setCurrentView(View.PROFILE)} onNavigateToSupport={() => setCurrentView(View.CUSTOMER_SERVICE)} lang={appLanguage} />;
      case View.NOTIFICATIONS:
        return <NotificationsPage onBack={() => setCurrentView(View.HOME)} lang={appLanguage} />;
      case View.DOWNLOAD_APP:
        return <DownloadAppPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.ABOUT_US:
        return <AboutUsPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.FAQ:
        return <FAQPage onBack={() => setCurrentView(View.PROFILE)} onNavigateToSupport={() => setCurrentView(View.CUSTOMER_SERVICE)} lang={appLanguage} />;
      case View.CUSTOMER_SERVICE:
        return <CustomerServicePage onBack={() => setCurrentView(View.PROFILE)} onOpenChat={() => setCurrentView(View.CHAT)} lang={appLanguage} />;
      case View.TRANSACTION_HISTORY:
        return <TransactionHistoryPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.SETTINGS:
        return <SettingsPage
          onBack={() => setCurrentView(View.PROFILE)}
          setView={setCurrentView}
          currentLanguage={appLanguage}
          currentTheme={appTheme}
          setLanguage={setAppLanguage}
          setTheme={setAppTheme}
        />;
      case View.USER_PROFILE_DETAIL:
        return <UserProfileDetailPage onBack={() => setCurrentView(View.PROFILE)} onLogout={onLogout} lang={appLanguage} />;
      case View.GIFT:
        return <GiftPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.TASKS:
        return <TasksPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      case View.SOCIAL_PROOF:
        return <SocialProofPage onBack={() => setCurrentView(View.PROFILE)} lang={appLanguage} />;
      default:
        return (
          <div className="flex flex-col min-h-full pb-24 animate-in fade-in duration-500">
            {/* 1. Carrossel de Imagens */}
            <div className="relative w-full h-64 overflow-hidden rounded-b-[40px] shadow-2xl">
              <div className="absolute inset-0 flex transition-transform duration-1000 ease-out" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                {carouselImages.map((img, i) => (
                  <div key={i} className="min-w-full h-full relative">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-8 text-white">
                      <h2 className="text-2xl font-black mb-2">{img.title}</h2>
                      <div className="flex gap-2">
                        {carouselImages.map((_, dotI) => (
                          <div key={dotI} className={`h-1.5 rounded-full transition-all ${dotI === carouselIndex ? 'w-8 bg-primary' : 'w-1.5 bg-white/40'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Barra de Notificações */}
            <div className="mx-6 -mt-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 py-3 px-5 flex items-center gap-4 rounded-3xl shadow-xl z-10">
              <span className="material-symbols-outlined text-primary text-2xl">volume_up</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
                  {t.scrollingNews}
                </p>
              </div>
            </div>

            {/* 3. Área de Botões Principais */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-y-10 gap-x-2">
                {quickButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentView(btn.id)}
                    className="flex flex-col items-center gap-3 active:scale-90 transition-all group"
                  >
                    <div className={`w-16 h-16 ${btn.color} rounded-[24px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                      <span className="material-symbols-outlined text-3xl font-light">{btn.icon}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 text-center leading-tight uppercase tracking-tighter">
                      {btn.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Seção Institucional */}
            <div className="px-6 mt-4 space-y-6">
              <h3 className="text-lg font-black text-dark dark:text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                {t.instTitle}
              </h3>
              <div className="bg-white dark:bg-dark-card rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden group">
                <div className="relative h-56 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1449156001935-d28605224917?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-8">
                    <h4 className="text-white font-black text-xl">{t.instSubtitle}</h4>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-justify">
                    {t.instDescription}
                  </p>
                  <button
                    onClick={() => setCurrentView(View.COMPANY_INTRO)}
                    className="w-full py-5 bg-primary/5 dark:bg-white/5 text-primary dark:text-white font-black rounded-2xl border border-primary/10 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                  >
                    {t.learnMore}
                    <span className="material-symbols-outlined">arrow_right_alt</span>
                  </button>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${appTheme === 'dark' ? 'bg-dark' : 'bg-gray-50'}`}>
      <main className="flex-1 relative overflow-y-auto">
        {renderContent()}
      </main>
      {showBottomNav && <BottomNav currentView={currentView} setView={setCurrentView} lang={appLanguage} />}

      {showWelcome && (
        <WelcomePopup
          onClose={() => setShowWelcome(false)}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}
    </div>
  );
};
