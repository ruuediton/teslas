
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQPageProps {
  onBack: () => void;
  onNavigateToSupport: () => void;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Conta',
    question: 'Como altero minha senha de acesso?',
    answer: 'Você pode alterar sua senha indo no menu Perfil > Segurança > Alterar Senha. Recomendamos trocar sua senha a cada 90 dias para manter sua conta segura.'
  },
  {
    category: 'Investimentos',
    question: 'Qual o rendimento diário dos pacotes?',
    answer: 'Cada pacote possui um rendimento específico. Por exemplo, o Fundo Safira rende aproximadamente 0,5% ao dia. Você pode conferir os detalhes de cada um na aba "Pacotes".'
  },
  {
    category: 'Saques',
    question: 'Quanto tempo leva para cair o saque?',
    answer: 'O processamento de saques leva em média de 2 a 24 horas úteis, dependendo da análise de segurança e do horário da solicitação.'
  },
  {
    category: 'Saques',
    question: 'Qual o valor mínimo para retirada?',
    answer: 'O valor mínimo para realizar uma retirada no DeepBank é de 500 Kz. Lembre-se que há uma taxa de processamento de 10%.'
  },
  {
    category: 'Recargas',
    question: 'Fiz uma transferência mas o saldo não caiu, o que fazer?',
    answer: 'Certifique-se de ter enviado o comprovante no nosso canal de suporte ou chat. O prazo de compensação manual é de até 2 horas dentro do horário comercial.'
  },
  {
    category: 'Segurança',
    question: 'O DeepBank é seguro?',
    answer: 'Sim, utilizamos criptografia de nível bancário e autenticação em dois fatores para proteger seus dados e investimentos. Todos os fundos são auditados periodicamente.'
  }
];

export const FAQPage: React.FC<FAQPageProps> = ({ onBack, onNavigateToSupport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaq = FAQ_DATA.filter(
    item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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

        <h1 className="font-extrabold text-dark text-lg">Problemas comuns</h1>

        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                    <h3 className={`text-sm font-bold transition-colors ${expandedIndex === index ? 'text-primary' : 'text-dark'}`}>
                      {item.question}
                    </h3>
                  </div>
                  <span className={`material-symbols-outlined text-gray-300 transition-transform duration-300 ${expandedIndex === index ? 'rotate-180 text-primary' : ''}`}>
                    expand_more
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="p-5 pt-0 border-t border-gray-50">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.answer}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                      <button
                        onClick={onNavigateToSupport}
                        className="text-[10px] font-bold text-primary uppercase flex items-center gap-1 hover:underline"
                      >
                        Ainda com dúvida? Fale conosco
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <span className="material-symbols-outlined text-4xl">search_off</span>
              </div>
              <div>
                <p className="text-dark font-bold">Nenhum resultado encontrado</p>
                <p className="text-xs text-gray-400">Tente usar palavras-chave diferentes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Support CTA */}
        <div className="bg-primary p-6 rounded-[32px] text-white flex items-center gap-4 shadow-xl shadow-primary/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">support_agent</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black">Precisa de ajuda humana?</p>
            <p className="text-[10px] text-white/70">Nosso time está disponível 24/7 para você.</p>
          </div>
          <button
            onClick={onNavigateToSupport}
            className="bg-white text-primary p-2 rounded-xl hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
        </div>
      </div>
    </div>
  );
};
