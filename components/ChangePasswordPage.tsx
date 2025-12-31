
import { Language } from '../types';
import { translations } from '../translations';

interface ChangePasswordPageProps {
  onBack: () => void;
  onLogout: () => void;
  lang: Language;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onBack, onLogout, lang }) => {
  const t = translations[lang];
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Validation rules
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerFeedback('error', lang === 'pt' ? 'Por favor, preencha todos os campos.' : 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      triggerFeedback('error', lang === 'pt' ? 'A nova senha deve ter no mínimo 8 caracteres.' : 'New password must be at least 8 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      triggerFeedback('error', lang === 'pt' ? 'A nova senha deve ser diferente da atual.' : 'New password must be different from the current one.');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerFeedback('error', lang === 'pt' ? 'As senhas não coincidem.' : 'Passwords do not match.');
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Re-authenticate with current password to verify
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        triggerFeedback('error', lang === 'pt' ? 'Usuário não autenticado.' : 'User not authenticated.');
        setIsSaving(false);
        return;
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        triggerFeedback('error', lang === 'pt' ? 'Senha atual incorreta.' : 'Incorrect current password.');
        setIsSaving(false);
        return;
      }

      // Step 2: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Step 3: Success - show message and logout
      triggerFeedback('success', lang === 'pt' ? 'Senha alterada com sucesso. Você será deslogado.' : 'Password changed successfully. You will be logged out.');

      setTimeout(async () => {
        // Logout user
        await supabase.auth.signOut();
        // Redirect to login
        onLogout();
      }, 2000);

    } catch (error: any) {
      console.error('Password change error:', error);
      triggerFeedback('error', lang === 'pt' ? 'Ocorreu um erro ao alterar a senha.' : 'An error occurred while changing the password.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative">
      {/* Header */}
      <div className="bg-white dark:bg-dark px-6 py-4 flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-bold text-dark dark:text-white pr-10">{t.changePassword}</h1>
      </div>

      <div className="p-6 flex-1">
        {/* Initial State */}
        {!isFormVisible && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 mt-12 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center border border-orange-100 dark:border-white/5">
              <span className="material-symbols-outlined text-orange-500 text-5xl">lock_reset</span>
            </div>

            <div className="space-y-2 px-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {lang === 'pt' ? 'Para sua segurança, altere sua senha periodicamente. Recomendamos o uso de senhas fortes com números e símbolos.' : 'For your security, change your password periodically. We recommend using strong passwords with numbers and symbols.'}
              </p>
            </div>

            <button
              onClick={() => setIsFormVisible(true)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
            >
              <span className="material-symbols-outlined">lock</span>
              {t.changePassword}
            </button>
          </div>
        )}

        {/* Form State */}
        {isFormVisible && (
          <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-5">

              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{lang === 'pt' ? 'Senha Atual' : 'Current Password'}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">key</span>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder={lang === 'pt' ? 'Sua senha atual' : 'Your current password'}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  >
                    <span className="material-symbols-outlined text-lg">{showCurrentPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{lang === 'pt' ? 'Nova Senha' : 'New Password'}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">lock</span>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder={lang === 'pt' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters'}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  >
                    <span className="material-symbols-outlined text-lg">{showNewPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{lang === 'pt' ? 'Confirmar Nova Senha' : 'Confirm New Password'}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">lock_clock</span>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={lang === 'pt' ? 'Repita a nova senha' : 'Repeat the new password'}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  >
                    <span className="material-symbols-outlined text-lg">{showConfirmPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-80 ${isSaving ? 'animate-subtle-pulse' : ''}`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">save</span>
                )}
                {isSaving ? (lang === 'pt' ? 'Atualizando...' : 'Updating...') : (lang === 'pt' ? 'Salvar nova senha' : 'Save new password')}
              </button>

              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="w-full bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Centered Feedback Notification */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${showFeedback.type === 'success' ? 'bg-white dark:bg-dark-card border-2 border-green-500' : 'bg-white dark:bg-dark-card border-2 border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
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
