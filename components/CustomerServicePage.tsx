
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface CustomerServicePageProps {
  onBack: () => void;
  onOpenChat: () => void;
}

export const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ onBack, onOpenChat }) => {
  const [isSending, setIsSending] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [contactLinks, setContactLinks] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  useEffect(() => {
    loadContactLinks();
  }, []);

  const loadContactLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('atendimento_links')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setContactLinks(data);
    } catch (error) {
      console.error('Error loading contact links:', error);
    }
  };

  const triggerFeedback = (type: 'error' | 'success', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 4000);
  };

  const handleChannelClick = (url: string | null, channelName: string) => {
    if (!url || url.trim() === '') {
      const messages: Record<string, string> = {
        'WhatsApp Gerente': 'Prezado cliente, lamentamos por não conseguir entrar em contato com o gerente no momento. Por favor, aguarde ou tente mais tarde.',
        'Grupo de Vendas': 'Prezado cliente, lamentamos por não conseguir entrar em contato com o grupo de vendas no momento. Por favor, aguarde ou tente mais tarde.',
        'Canal Telegram': 'Prezado cliente, lamentamos por não conseguir acessar o canal do Telegram no momento. Por favor, aguarde ou tente mais tarde.',
        'Atendimento': 'Prezado cliente, lamentamos por não conseguir entrar em contato com o atendimento no momento. Por favor, aguarde ou tente mais tarde.'
      };
      triggerFeedback('error', messages[channelName] || 'Serviço temporariamente indisponível.');
      return;
    }
    window.open(url, '_blank');
  };

  const contactChannels = [
    {
      id: 'wa_manager',
      name: 'WhatsApp Gerente',
      desc: 'Suporte VIP e conta personalizada',
      icon: 'person_search',
      color: 'bg-[#25D366]',
      urlKey: 'whatsapp_gerente_url'
    },
    {
      id: 'wa_group',
      name: 'Grupo de Vendas',
      desc: 'Novidades e promoções exclusivas',
      icon: 'groups',
      color: 'bg-[#128C7E]',
      urlKey: 'whatsapp_grupo_vendas_url'
    },
    {
      id: 'telegram',
      name: 'Canal Telegram',
      desc: 'Comunidade oficial DeepBank',
      icon: 'send',
      color: 'bg-[#0088cc]',
      urlKey: 'telegram_canal_url'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setFormSent(true);
      setTimeout(() => setFormSent(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 px-4">
        <div className="w-10">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-dark hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <h1 className="font-extrabold text-dark text-lg">Atendimento</h1>

        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-accent/10 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <span className="material-symbols-outlined text-accent text-4xl">support_agent</span>
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight">Estamos aqui para ajudar</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
            Escolha o canal de sua preferência ou envie uma mensagem direta para nossa equipe.
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={onOpenChat}
            className="w-full flex items-center gap-4 p-5 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Chat em Tempo Real</p>
              <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Atendimento IA 24/7</p>
            </div>
          </button>

          <div className="grid grid-cols-1 gap-3">
            {contactChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(contactLinks?.[channel.urlKey], channel.name)}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all text-left"
              >
                <div className={`w-12 h-12 ${channel.color} text-white rounded-2xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{channel.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark text-sm truncate">{channel.name}</h3>
                  <p className="text-xs text-gray-400 truncate">{channel.desc}</p>
                </div>
                <span className="material-symbols-outlined text-gray-200">open_in_new</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">mail</span>
            <h3 className="text-sm font-black text-dark uppercase tracking-widest">Envie uma mensagem</h3>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Assunto</label>
              <input
                type="text"
                placeholder="Ex: Dúvida sobre saque"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sua Mensagem</label>
              <textarea
                placeholder="Descreva seu problema ou dúvida..."
                className="w-full h-32 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending || formSent}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${formSent
                  ? 'bg-green-500 text-white'
                  : 'bg-dark text-white hover:bg-black shadow-lg shadow-dark/10'
                }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : formSent ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Mensagem Enviada
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hours */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Horário de Atendimento Humano</p>
          <p className="text-xs text-dark font-bold mt-1">Segunda a Sexta • 08h às 18h</p>
        </div>
      </div>
    </div>
  );
};
