
import React, { useState } from 'react';

interface ChangePasswordPageProps {
  onBack: () => void;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onBack }) => {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Validation rules
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerFeedback('error', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 8) {
      triggerFeedback('error', 'A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword === currentPassword) {
      triggerFeedback('error', 'A nova senha deve ser diferente da atual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerFeedback('error', 'As senhas não coincidem.');
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      triggerFeedback('success', 'Senha alterada com sucesso.');
      setTimeout(() => {
        setIsFormVisible(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-bold text-dark pr-10">Alterar Senha</h1>
      </div>

      <div className="p-6 flex-1">
        {/* Initial State */}
        {!isFormVisible && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 mt-12 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
              <span className="material-symbols-outlined text-orange-500 text-5xl">lock_reset</span>
            </div>
            
            <div className="space-y-2 px-4">
              <p className="text-gray-500 text-sm leading-relaxed">
                Para sua segurança, altere sua senha periodicamente. Recomendamos o uso de senhas fortes com números e símbolos.
              </p>
            </div>

            <button 
              onClick={() => setIsFormVisible(true)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
            >
              <span className="material-symbols-outlined">lock</span>
              Alterar senha
            </button>
          </div>
        )}

        {/* Form State */}
        {isFormVisible && (
          <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Senha Atual</label>
                <div className="relative">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">key</span>
                   <input 
                    type={showCurrentPass ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder="Sua senha atual"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                   />
                   <button 
                     type="button" 
                     onClick={() => setShowCurrentPass(!showCurrentPass)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                     <span className="material-symbols-outlined text-lg">{showCurrentPass ? 'visibility_off' : 'visibility'}</span>
                   </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Nova Senha</label>
                <div className="relative">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">lock</span>
                   <input 
                    type={showNewPass ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                   />
                   <button 
                     type="button" 
                     onClick={() => setShowNewPass(!showNewPass)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                     <span className="material-symbols-outlined text-lg">{showNewPass ? 'visibility_off' : 'visibility'}</span>
                   </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Confirmar Nova Senha</label>
                <div className="relative">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl">lock_clock</span>
                   <input 
                    type={showConfirmPass ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Repita a nova senha"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                   />
                   <button 
                     type="button" 
                     onClick={() => setShowConfirmPass(!showConfirmPass)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                {isSaving ? 'Atualizando...' : 'Salvar nova senha'}
              </button>
              
              <button 
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Centered Feedback Notification */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto ${
            showFeedback.type === 'success' ? 'bg-white border-2 border-green-500' : 'bg-white border-2 border-red-500'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${
               showFeedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className={`material-symbols-outlined text-4xl ${
                showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${
               showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
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
