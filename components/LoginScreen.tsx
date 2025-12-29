
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleDisplayError = (msg: string) => {
    setErrorInfo(msg);
    setTimeout(() => setErrorInfo(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      handleDisplayError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const email = `${phone}@deepbank.user`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          handleDisplayError('Telefone ou senha incorretos.');
        } else {
          handleDisplayError('Erro ao entrar: ' + error.message);
        }
      } else {
        onLogin();
      }
    } catch (err) {
      handleDisplayError('Ocorreu um erro inesperado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-white animate-in fade-in duration-500">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center px-8 py-12 lg:w-[40%] xl:w-[35%] lg:px-20 z-10 bg-white">
        <div className="mb-12 flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-symbols-outlined text-white">account_balance</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-dark">DeepBank</span>
        </div>

        <div className="max-w-md w-full">
          <h1 className="text-4xl font-extrabold text-dark mb-4">Bem-vindo de volta</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Acesse sua conta para gerenciar seus investimentos de forma estruturada e transparente.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Número de Telefone</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">call</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9XX XXX XXX"
                  pattern="9[0-9]{8}"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Use um número válido de Angola (9 dígitos).</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-dark">Senha</label>
                <a href="#" className="text-sm font-semibold text-accent hover:underline">Esqueci minha senha</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {errorInfo && (
              <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-lg border border-red-100 animate-pulse">
                {errorInfo}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative px-4 bg-white text-gray-400 text-sm">ou</span>
          </div>

          <button
            type="button"
            onClick={onGoToRegister}
            className="w-full border border-gray-200 py-4 rounded-xl font-bold text-dark hover:bg-gray-50 transition-all"
          >
            Criar nova conta
          </button>

          <div className="mt-12 flex items-center justify-center gap-6 text-gray-400 text-xs font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-sm">verified_user</span> Segurança SSL
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-sm">gavel</span> Regulado
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
            Simplicidade, velocidade e <span className="text-accent">histórico transparente</span>.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            A plataforma digital para investimentos estruturados que potencializa seu futuro financeiro com confiança em Angola.
          </p>
        </div>
      </div>
    </div>
  );
};


