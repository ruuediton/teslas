
import { Language, Theme } from '../types';
import { translations } from '../translations';

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
  lang: Language;
  theme: Theme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister, lang, theme }) => {
  const t = translations[lang];
  const { setIsLoading, showWithTimeout } = useLoading();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleDisplayError = (msg: string) => {
    setErrorInfo(msg);
    setTimeout(() => setErrorInfo(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const amountNumber = Number(password);

    if (!phone || !password) {
      handleDisplayError(lang === 'pt' ? 'Preencha todos os campos.' : 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const email = `${phone}@deepbank.user`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          handleDisplayError(lang === 'pt' ? 'Telefone ou senha incorretos.' : 'Incorrect phone or password.');
        } else {
          handleDisplayError((lang === 'pt' ? 'Erro ao entrar: ' : 'Error logging in: ') + error.message);
        }
        setIsLoading(false);
      } else {
        onLogin();
      }
    } catch (err) {
      handleDisplayError(lang === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-white dark:bg-dark animate-in fade-in duration-500">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center px-8 py-12 lg:w-[40%] xl:w-[35%] lg:px-20 z-10 bg-white dark:bg-dark">
        <div className="mb-12 flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-symbols-outlined text-white">account_balance</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-dark dark:text-white">DeepBank</span>
        </div>

        <div className="max-w-md w-full">
          <h1 className="text-4xl font-extrabold text-dark dark:text-white mb-4">
            {lang === 'pt' ? 'Bem-vindo de volta' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            {lang === 'pt' ? 'Acesse sua conta para gerenciar seus investimentos de forma estruturada e transparente.' : 'Log in to your account to manage your investments in a structured and transparent way.'}
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-dark dark:text-white mb-2">{lang === 'pt' ? 'Número de Telefone' : 'Phone Number'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xl">call</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9XX XXX XXX"
                  pattern="9[0-9]{8}"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark dark:text-white"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{lang === 'pt' ? 'Use um número válido de Angola (9 dígitos).' : 'Use a valid Angola number (9 digits).'}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-dark dark:text-white">{lang === 'pt' ? 'Senha' : 'Password'}</label>
                <a href="#" className="text-sm font-semibold text-accent hover:underline">{lang === 'pt' ? 'Esqueci minha senha' : 'Forgot my password'}</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-dark dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {errorInfo && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-bold rounded-lg border border-red-100 dark:border-red-900/30 animate-pulse">
                {errorInfo}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
            >
              {lang === 'pt' ? 'Entrar' : 'Login'}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/10"></div></div>
            <span className="relative px-4 bg-white dark:bg-dark text-gray-400 dark:text-gray-500 text-sm">{lang === 'pt' ? 'ou' : 'or'}</span>
          </div>

          <button
            type="button"
            onClick={onGoToRegister}
            className="w-full border border-gray-200 dark:border-white/10 py-4 rounded-xl font-bold text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            {lang === 'pt' ? 'Criar nova conta' : 'Create new account'}
          </button>

          <div className="mt-12 flex items-center justify-center gap-6 text-gray-400 dark:text-gray-500 text-xs font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-sm">verified_user</span> {lang === 'pt' ? 'Segurança SSL' : 'SSL Security'}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-sm">gavel</span> {lang === 'pt' ? 'Regulado' : 'Regulated'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Branding */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-dark/90 mix-blend-multiply" />

        <div className="relative z-10 text-center px-12 max-w-2xl">
          <div className="inline-flex glass p-4 rounded-2xl mb-8 shadow-2xl">
            <span className="material-symbols-outlined text-accent text-4xl">trending_up</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            {lang === 'pt' ? 'Simplicidade, velocidade e ' : 'Simplicity, speed and '} <span className="text-accent">{lang === 'pt' ? 'histórico transparente' : 'transparent history'}</span>.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            {lang === 'pt'
              ? 'A plataforma digital para investimentos estruturados que potencializa seu futuro financeiro com confiança em Angola.'
              : 'The digital platform for structured investments that empowers your financial future with confidence in Angola.'}
          </p>
        </div>
      </div>
    </div>
  );
};


