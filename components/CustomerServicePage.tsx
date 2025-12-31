
import { Language } from '../types';
import { translations } from '../translations';

interface CustomerServicePageProps {
  onBack: () => void;
  onOpenChat: () => void;
  lang: Language;
}

export const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ onBack, onOpenChat, lang }) => {
  const t = translations[lang];
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

  if (!url || url.trim() === '') {
    const messages: Record<string, string> = {
      'WhatsApp Gerente': lang === 'pt' ? 'Prezado cliente, lamentamos por não conseguir entrar em contato com o gerente no momento. Por favor, aguarde ou tente mais tarde.' : 'Dear customer, we are sorry that we are unable to contact the manager at the moment. Please wait or try again later.',
      'Grupo de Vendas': lang === 'pt' ? 'Prezado cliente, lamentamos por não conseguir entrar em contato com o grupo de vendas no momento. Por favor, aguarde ou tente mais tarde.' : 'Dear customer, we are sorry that we are unable to contact the sales group at the moment. Please wait or try again later.',
      'Canal Telegram': lang === 'pt' ? 'Prezado cliente, lamentamos por não conseguir acessar o canal do Telegram no momento. Por favor, aguarde ou tente mais tarde.' : 'Dear customer, we are sorry that we are unable to access the Telegram channel at the moment. Please wait or try again later.',
      'Atendimento': lang === 'pt' ? 'Prezado cliente, lamentamos por não conseguir entrar em contato com o atendimento no momento. Por favor, aguarde ou tente mais tarde.' : 'Dear customer, we are sorry that we are unable to contact support at the moment. Please wait or try again later.'
    };
    triggerFeedback('error', messages[channelName] || (lang === 'pt' ? 'Serviço temporariamente indisponível.' : 'Service temporarily unavailable.'));
    return;
  }
  window.open(url, '_blank');
};

const contactChannels = [
  {
    id: 'wa_manager',
    name: lang === 'pt' ? 'WhatsApp Gerente' : 'WhatsApp Manager',
    desc: lang === 'pt' ? 'Suporte VIP e conta personalizada' : 'VIP Support and personalized account',
    icon: 'person_search',
    color: 'bg-[#25D366]',
    urlKey: 'whatsapp_gerente_url'
  },
  {
    id: 'wa_group',
    name: lang === 'pt' ? 'Grupo de Vendas' : 'Sales Group',
    desc: lang === 'pt' ? 'Novidades e promoções exclusivas' : 'Exclusive news and promotions',
    icon: 'groups',
    color: 'bg-[#128C7E]',
    urlKey: 'whatsapp_grupo_vendas_url'
  },
  {
    id: 'telegram',
    name: lang === 'pt' ? 'Canal Telegram' : 'Telegram Channel',
    desc: lang === 'pt' ? 'Comunidade oficial DeepBank' : 'Official DeepBank community',
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
  <div className="flex flex-col h-full bg-gray-50 dark:bg-dark overflow-hidden">
    {/* Header */}
    <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
      <div className="w-10">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <h1 className="font-extrabold text-dark dark:text-white text-lg">{t.support}</h1>

      <div className="w-10"></div>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
      {/* Intro */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-accent/10 dark:bg-accent/20 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-accent/20 dark:border-white/5">
          <span className="material-symbols-outlined text-accent text-4xl">support_agent</span>
        </div>
        <h2 className="text-2xl font-black text-dark dark:text-white tracking-tight">{lang === 'pt' ? 'Estamos aqui para ajudar' : 'We are here to help'}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
          {lang === 'pt' ? 'Escolha o canal de sua preferência ou envie uma mensagem direta para nossa equipe.' : 'Choose your preferred channel or send a direct message to our team.'}
        </p>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-3">
          {contactChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => handleChannelClick(contactLinks?.[channel.urlKey], channel.name)}
              className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md dark:hover:bg-white/5 transition-all text-left"
            >
              <div className={`w-12 h-12 ${channel.color} text-white rounded-2xl flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined">{channel.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-dark dark:text-white text-sm truncate">{channel.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{channel.desc}</p>
              </div>
              <span className="material-symbols-outlined text-gray-200 dark:text-gray-700">open_in_new</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Form */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-xl">mail</span>
          <h3 className="text-sm font-black text-dark dark:text-white uppercase tracking-widest">{lang === 'pt' ? 'Envie uma mensagem' : 'Send a message'}</h3>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{lang === 'pt' ? 'Assunto' : 'Subject'}</label>
            <input
              type="text"
              placeholder={lang === 'pt' ? 'Ex: Dúvida sobre saque' : 'Ex: Withdrawal question'}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{lang === 'pt' ? 'Sua Mensagem' : 'Your Message'}</label>
            <textarea
              placeholder={lang === 'pt' ? 'Descreva seu problema ou dúvida...' : 'Describe your problem or question...'}
              className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-dark dark:text-white resize-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSending || formSent}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${formSent
              ? 'bg-green-500 text-white'
              : 'bg-dark dark:bg-primary text-white hover:bg-black dark:hover:bg-primary-dark shadow-lg shadow-dark/10'
              }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : formSent ? (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                {lang === 'pt' ? 'Mensagem Enviada' : 'Message Sent'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">send</span>
                {lang === 'pt' ? 'Enviar Mensagem' : 'Send Message'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Hours */}
      <div className="text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em]">{lang === 'pt' ? 'Horário de Atendimento Humano' : 'Human Support Hours'}</p>
        <p className="text-xs text-dark dark:text-white font-bold mt-1">{lang === 'pt' ? 'Segunda a Sexta • 08h às 18h' : 'Monday to Friday • 08am to 06pm'}</p>
      </div>
    </div>
  </div>
);
};
