
import React, { useState } from 'react';

interface UserProfileDetailPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export const UserProfileDetailPage: React.FC<UserProfileDetailPageProps> = ({ onBack, onLogout }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  
  const userData = {
    name: "Investidor DeepBank",
    email: "usuario.exemplo@deepbank.app",
    phone: "+244 923 000 000",
    id: "DB-77721-XPT"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header Centralizado */}
      <div className="bg-white h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 px-4">
        <div className="w-10">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        
        <h1 className="font-extrabold text-dark text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Perfil do Usuário
        </h1>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Avatar & Header Section */}
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto border-4 border-white shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-white text-5xl">person</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px] font-black">verified</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-dark tracking-tight">{userData.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Status: Investidor Prata</p>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Informações Pessoais</h3>
          
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {/* ID do Usuário - Funcionalidade de Cópia */}
            <div className="p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID do Usuário</p>
                  <p className="text-sm font-black text-dark font-mono">{userData.id}</p>
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(userData.id)}
                className="w-10 h-10 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
                title="Copiar ID"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>

            {/* Email */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</p>
                <p className="text-sm font-bold text-dark">{userData.email}</p>
              </div>
            </div>

            {/* Telefone */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</p>
                <p className="text-sm font-bold text-dark">{userData.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500 delay-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sessão e Segurança</h3>
          
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
             <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">logout</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-red-600">Desconectar-se</p>
                <p className="text-[10px] text-red-400 font-bold uppercase">Encerrar acesso atual</p>
              </div>
              <span className="material-symbols-outlined text-red-200">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50 flex gap-4">
          <span className="material-symbols-outlined text-blue-500 text-xl shrink-0">info</span>
          <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
            Seus dados são protegidos por criptografia de ponta a ponta. Para alterar seu e-mail ou telefone, entre em contato com o suporte especializado.
          </p>
        </div>
      </div>

      {/* Copy Feedback Snackbar */}
      {showCopyFeedback && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px] font-black">done</span>
            </div>
            <p className="text-xs font-bold whitespace-nowrap">ID copiado com sucesso!</p>
          </div>
        </div>
      )}
    </div>
  );
};
