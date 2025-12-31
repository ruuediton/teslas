
import { Language, Theme } from '../types';
import { translations } from '../translations';

interface RegisterScreenProps {
  onBackToLogin: () => void;
  lang: Language;
  theme: Theme;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin, lang, theme }) => {
  const t = translations[lang];
  const { setIsLoading } = useLoading();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, inviteCode: ref.toUpperCase() }));
    }
  }, []);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.password || !formData.confirmPassword || !formData.inviteCode) {
      triggerFeedback('error', lang === 'pt' ? 'Por favor, preencha todos os campos obrigatórios.' : 'Please fill in all required fields.');
      return;
    }

    const phoneRegex = /^9[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      triggerFeedback('error', lang === 'pt' ? 'Por favor, insira um número de telefone válido de Angola.' : 'Please enter a valid Angola phone number.');
      return;
    }

    if (formData.password.length < 8) {
      triggerFeedback('error', lang === 'pt' ? 'A senha deve ter no mínimo 8 caracteres.' : 'Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      triggerFeedback('error', lang === 'pt' ? 'As senhas não coincidem.' : 'Passwords do not match.');
      return;
    }

    // Validação estrita do Código de Convite (OBRIGATÓRIO)
    if (formData.inviteCode.trim() === '') {
      triggerFeedback('error', lang === 'pt' ? 'O código de convite é obrigatório para novos registros.' : 'Invitation code is required for new registrations.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Validar se o código de convite existe e capturar o ID do convidador
      const { data: convidador, error: inviteError } = await supabase
        .from('profiles')
        .select('id, invite_code')
        .eq('invite_code', formData.inviteCode)
        .single();

      if (inviteError || !convidador) {
        triggerFeedback('error', lang === 'pt' ? 'Código de convite inválido ou não encontrado.' : 'Invalid or not found invitation code.');
        setIsLoading(false);
        return;
      }

      const email = `${formData.phone}@deepbank.user`;

      // 2. Criar conta de autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          triggerFeedback('error', lang === 'pt' ? 'Este número de telefone já está registrado.' : 'This phone number is already registered.');
        } else {
          triggerFeedback('error', (lang === 'pt' ? 'Erro ao criar conta: ' : 'Error creating account: ') + authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // 3. Salvar Perfil do novo usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id,
              phone: formData.phone,
              invite_code: Math.random().toString(36).substring(2, 9).toUpperCase(), // Gera código único para o novo user
              balance: 0,
              reloaded_amount: 0,
              income: 0,
              state: 'active'
            }
          ]);

        if (profileError) {
          triggerFeedback('error', (lang === 'pt' ? 'Erro ao salvar perfil: ' : 'Error saving profile: ') + profileError.message);
          setIsLoading(false);
          return;
        }

        // 4. Criar vínculo na red_equipe (Nível 1)
        const { error: teamError } = await supabase
          .from('red_equipe')
          .insert([
            {
              user_id_convidador: convidador.id,
              telefone_subordinado: formData.phone,
              codigo_convite: formData.inviteCode,
              valor: 0,
              investimento_valido: false,
              data_convite: new Date().toISOString()
            }
          ]);

        if (teamError) {
          console.error('Erro ao criar vínculo de equipe:', teamError);
          // Não bloqueamos o sucesso do cadastro se apenas o vínculo falhar, 
          // mas logamos o erro para auditoria.
        }

        triggerFeedback('success', lang === 'pt' ? 'Cadastro realizado com sucesso!' : 'Registration successful!');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Catch Error:', err);
      triggerFeedback('error', lang === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isInviteCodeInvalid = formData.inviteCode.trim() !== '' && !/^[a-zA-Z0-9]{6,}$/.test(formData.inviteCode);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-white dark:bg-dark animate-in slide-in-from-right duration-500">
      {/* Coluna Esquerda: Formulário */}
      <div className="flex flex-col justify-center px-8 py-12 lg:w-[40%] xl:w-[35%] lg:px-20 z-10 bg-white dark:bg-dark">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-white">account_balance</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-dark dark:text-white">DeepBank</span>
          </div>
          <button
            onClick={onBackToLogin}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-dark dark:hover:text-white rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <div className="max-w-md w-full">
          <h1 className="text-4xl font-extrabold text-dark dark:text-white mb-4">{lang === 'pt' ? 'Criar conta' : 'Create account'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            {lang === 'pt' ? 'Junte-se ao DeepBank e comece a gerenciar seu futuro financeiro hoje mesmo em Angola.' : 'Join DeepBank and start managing your financial future today in Angola.'}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-dark dark:text-white mb-2">{lang === 'pt' ? 'Número de Telefone' : 'Phone Number'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xl">call</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9XX XXX XXX"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark dark:text-white mb-2">{lang === 'pt' ? 'Senha' : 'Password'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={lang === 'pt' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters'}
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-dark dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark dark:text-white mb-2">{lang === 'pt' ? 'Confirmar Senha' : 'Confirm Password'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xl">lock_clock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={lang === 'pt' ? 'Repita sua senha' : 'Repeat your password'}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark dark:text-white mb-2">{lang === 'pt' ? 'Código de Convite (Obrigatório)' : 'Invitation Code (Required)'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">card_membership</span>
                <input
                  type="text"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                  placeholder="Ex: VIP2025"
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none bg-primary/5 dark:bg-primary/10 ${isInviteCodeInvalid ? 'border-red-300 ring-2 ring-red-50 dark:ring-red-900/20' : 'border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white'}`}
                />
              </div>
              {isInviteCodeInvalid ? (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {lang === 'pt' ? 'O código deve ter pelo menos 6 caracteres alfanuméricos.' : 'The code must have at least 6 alphanumeric characters.'}
                </p>
              ) : (
                <p className="text-[10px] text-primary font-bold mt-1 ml-1">
                  {lang === 'pt' ? 'Campo obrigatório. Peça seu código a um membro oficial.' : 'Required field. Ask an official member for your code.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {lang === 'pt' ? 'Registrar-se' : 'Sign up'}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">rocket_launch</span>
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            {lang === 'pt' ? 'Já tem uma conta?' : 'Already have an account?'} {' '}
            <button
              onClick={onBackToLogin}
              className="text-primary font-bold hover:underline"
            >
              {lang === 'pt' ? 'Entrar aqui' : 'Login here'}
            </button>
          </p>
        </div>
      </div>

      {/* Coluna Direita: Branding Visual */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-dark/95 via-primary/40 to-accent/20 mix-blend-multiply" />

        <div className="relative z-10 text-center px-12 max-w-2xl">
          <div className="inline-flex glass p-4 rounded-3xl mb-8 shadow-2xl">
            <span className="material-symbols-outlined text-accent text-5xl">auto_awesome</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            {lang === 'pt' ? 'Sua rede é sua ' : 'Your network is your '} <span className="text-accent">{lang === 'pt' ? 'maior riqueza' : 'greatest wealth'}</span>.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            {lang === 'pt'
              ? 'Convide amigos, suba de nível e ganhe comissões recorrentes com o sistema de indicação exclusivo DeepBank.'
              : 'Invite friends, level up and earn recurring commissions with DeepBank\'s exclusive referral system.'}
          </p>
        </div>
      </div>

      {/* Notificação de Feedback Centralizada */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${showFeedback.type === 'success'
            ? 'bg-white dark:bg-dark-card border-2 border-green-500'
            : 'bg-white dark:bg-dark-card border-2 border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? (lang === 'pt' ? 'Sucesso!' : 'Success!') : (lang === 'pt' ? 'Ocorreu um Erro' : 'An Error Occurred')}
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
