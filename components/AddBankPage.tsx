
import { Language } from '../types';
import { translations } from '../translations';

interface AddBankPageProps {
  onBack: () => void;
  lang: Language;
}

const AVAILABLE_BANKS = ['Banco BAI', 'Banco BFA', 'Banco ATLANTICO', 'Banco BIC'];

export const AddBankPage: React.FC<AddBankPageProps> = ({ onBack, lang }) => {
  const t = translations[lang];
  const { setIsLoading: setGlobalLoading } = useLoading();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [ibanInlineError, setIbanInlineError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    bankName: '',
    iban: ''
  });

  // Debounced IBAN validation
  useEffect(() => {
    if (formData.iban.length === 0) {
      setIbanInlineError(null);
      return;
    }

    const timer = setTimeout(() => {
      const cleanIban = formData.iban.replace(/\s/g, '');
      if (cleanIban.length > 0 && cleanIban.length < 21) {
        setIbanInlineError(lang === 'pt' ? 'O IBAN deve conter exatamente 21 dígitos.' : 'IBAN must contain exactly 21 digits.');
      } else {
        setIbanInlineError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.iban]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.fullName.trim()) {
      triggerFeedback('error', lang === 'pt' ? 'Por favor, insira seu nome completo.' : 'Please enter your full name.');
      return;
    }
    if (!formData.bankName) {
      triggerFeedback('error', lang === 'pt' ? 'Selecione um banco da lista.' : 'Select a bank from the list.');
      return;
    }

    const cleanIban = formData.iban.replace(/\s/g, '');
    if (cleanIban.length !== 21) {
      triggerFeedback('error', lang === 'pt' ? 'O IBAN deve conter exatamente 21 dígitos.' : 'IBAN must contain exactly 21 digits.');
      return;
    }

    setIsSaving(true);
    setGlobalLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        triggerFeedback('error', lang === 'pt' ? 'Usuário não autenticado.' : 'User not authenticated.');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('bancos_clientes')
        .insert([
          {
            user_id: user.id,
            nome_completo: formData.fullName,
            nome_do_banco: formData.bankName,
            iban: cleanIban,
          }
        ]);

      if (error) throw error;

      triggerFeedback('success', lang === 'pt' ? 'Conta bancária adicionada com sucesso.' : 'Bank account added successfully.');
      setTimeout(() => {
        setIsFormVisible(false);
        setFormData({ fullName: '', bankName: '', iban: '' });
      }, 2000);

    } catch (error: any) {
      console.error('Error saving bank account:', error);
      if (error.code === '23505') { // Postgres unique_violation code
        triggerFeedback('error', lang === 'pt' ? 'Conta bancária activa' : 'Bank account active');
      } else {
        triggerFeedback('error', lang === 'pt' ? 'Erro ao salvar conta bancária.' : 'Error saving bank account.');
      }
    } finally {
      setIsSaving(false);
      setGlobalLoading(false);
    }
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const selectBank = (bank: string) => {
    setFormData({ ...formData, bankName: bank });
    setShowBankPicker(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative">
      {/* Header */}
      <div className="bg-white dark:bg-dark px-6 py-4 flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-bold text-dark dark:text-white pr-10">{t.addBankTitle}</h1>
      </div>

      <div className="p-6 flex-1">
        {/* Initial State */}
        {!isFormVisible && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 mt-12 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-primary/5 dark:bg-primary/20 rounded-full flex items-center justify-center border border-primary/10 dark:border-white/10">
              <span className="material-symbols-outlined text-primary text-5xl">account_balance</span>
            </div>

            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[240px] leading-relaxed">
                {lang === 'pt' ? 'Adicione uma conta bancária para receber seus saques com segurança.' : 'Add a bank account to receive your withdrawals securely.'}
              </p>
            </div>

            <button
              onClick={() => setIsFormVisible(true)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              {t.addBankTitle}
            </button>
          </div>
        )}

        {/* Form State */}
        {isFormVisible && (
          <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-5">

              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{t.fullName}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">person</span>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={lang === 'pt' ? 'Insira seu nome completo' : 'Enter your full name'}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white"
                  />
                </div>
              </div>

              {/* Bank Name Field (Selectable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{t.bankName}</label>
                <div className="relative cursor-pointer" onClick={() => setShowBankPicker(true)}>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">account_balance</span>
                  <div className={`w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm min-h-[48px] flex items-center ${formData.bankName ? 'text-dark dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {formData.bankName || (lang === 'pt' ? 'Selecione seu banco' : 'Select your bank')}
                  </div>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">expand_more</span>
                </div>
              </div>

              {/* IBAN Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{t.ibanLabel}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xl">identity_platform</span>
                  <input
                    type="text"
                    maxLength={21}
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                    placeholder={lang === 'pt' ? 'Digite os 21 dígitos do seu IBAN' : 'Enter the 21 digits of your IBAN'}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 outline-none text-sm font-mono text-dark dark:text-white transition-all ${ibanInlineError ? 'ring-2 ring-red-100 dark:ring-red-900/30 bg-red-50/30' : 'focus:ring-primary/20'
                      }`}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <p className={`text-[10px] font-bold ${ibanInlineError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {ibanInlineError || `${formData.iban.length}/21 ${lang === 'pt' ? 'caracteres' : 'characters'}`}
                  </p>
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
                {isSaving ? (lang === 'pt' ? 'Salvando conta...' : 'Saving account...') : t.saveBank}
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

      {/* Bank Picker Modal/Overlay */}
      {showBankPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowBankPicker(false)}></div>
          <div className="relative bg-white dark:bg-dark-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/5">
            <div className="p-5 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <h3 className="font-extrabold text-dark dark:text-white">{lang === 'pt' ? 'Escolha seu Banco' : 'Choose your Bank'}</h3>
              <button onClick={() => setShowBankPicker(false)} className="text-gray-300 dark:text-gray-600 hover:text-dark dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-2">
              {AVAILABLE_BANKS.map((bank) => (
                <button
                  key={bank}
                  onClick={() => selectBank(bank)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all rounded-2xl group"
                >
                  <div className="w-10 h-10 bg-primary/5 dark:bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                  </div>
                  <span className="font-bold text-dark dark:text-white text-sm">{bank}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
