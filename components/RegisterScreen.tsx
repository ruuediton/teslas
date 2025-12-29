
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface RegisterScreenProps {
  onBackToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.password || !formData.confirmPassword || !formData.inviteCode) {
      triggerFeedback('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const phoneRegex = /^9[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      triggerFeedback('error', 'Por favor, insira um número de telefone válido de Angola.');
      return;
    }

    if (formData.password.length < 8) {
      triggerFeedback('error', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      triggerFeedback('error', 'As senhas não coincidem.');
      return;
    }

    // Validação estrita do Código de Convite (OBRIGATÓRIO)
    if (formData.inviteCode.trim() === '') {
      triggerFeedback('error', 'O código de convite é obrigatório para novos registros.');
      return;
    }

    const inviteRegex = /^[a-zA-Z0-9]{6,}$/;
    if (!inviteRegex.test(formData.inviteCode)) {
      triggerFeedback('error', 'Código de convite inválido. Deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsRegistering(true);

    setIsRegistering(true);

    try {
      const email = `${formData.phone}@deepbank.user`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      });

      if (authError) {
        console.error('Auth Error:', authError);
        if (authError.message.includes('already registered')) {
          triggerFeedback('error', 'Este número de telefone já está registrado.');
        } else {
          triggerFeedback('error', 'Erro ao criar conta: ' + authError.message);
        }
        setIsRegistering(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              phone: formData.phone,
              invite_code: formData.inviteCode,
              balance: 0,
              reloaded_amount: 0,
              income: 0,
              state: 'active'
            }
          ]);

        if (profileError) {
          console.error('Profile Error:', profileError);
          triggerFeedback('error', 'Erro ao salvar perfil: ' + profileError.message);
          setIsRegistering(false);
          return;
        }

        triggerFeedback('success', 'Cadastro realizado com sucesso!');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Catch Error:', err);
      triggerFeedback('error', 'Ocorreu um erro inesperado.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isInviteCodeInvalid = formData.inviteCode.trim() !== '' && !/^[a-zA-Z0-9]{6,}$/.test(formData.inviteCode);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-white animate-in slide-in-from-right duration-500">
      {/* Coluna Esquerda: Formulário */}
      <div className="flex flex-col justify-center px-8 py-12 lg:w-[40%] xl:w-[35%] lg:px-20 z-10 bg-white">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-white">account_balance</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-dark">DeepBank</span>
          </div>
          <button
            onClick={onBackToLogin}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-dark rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <div className="max-w-md w-full">
          <h1 className="text-4xl font-extrabold text-dark mb-4">Criar conta</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Junte-se ao DeepBank e comece a gerenciar seu futuro financeiro hoje mesmo em Angola.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Número de Telefone</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">call</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9XX XXX XXX"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Confirmar Senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock_clock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repita sua senha"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Código de Convite (Obrigatório)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">card_membership</span>
                <input
                  type="text"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                  placeholder="Ex: VIP2025"
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none bg-primary/5 ${isInviteCodeInvalid ? 'border-red-300 ring-2 ring-red-50' : 'border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                />
              </div>
              {isInviteCodeInvalid ? (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  O código deve ter pelo menos 6 caracteres alfanuméricos.
                </p>
              ) : (
                <p className="text-[10px] text-primary font-bold mt-1 ml-1">
                  Campo obrigatório. Peça seu código a um membro oficial.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-50"
            >
              {isRegistering ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Registrar-se
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">rocket_launch</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onBackToLogin}
              className="text-primary font-bold hover:underline"
            >
              Entrar aqui
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
            Sua rede é sua <span className="text-accent">maior riqueza</span>.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Convide amigos, suba de nível e ganhe comissões recorrentes com o sistema de indicação exclusivo DeepBank.
          </p>
        </div>
      </div>

      {/* Notificação de Feedback Centralizada */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${showFeedback.type === 'success' ? 'bg-white border-2 border-green-500' : 'bg-white border-2 border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? 'Sucesso!' : 'Ocorreu um Erro'}
            </p>
            <p className="text-sm font-bold text-dark/70 leading-relaxed">
              {showFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
