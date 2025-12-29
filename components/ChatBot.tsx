
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, Language, View } from '../types';
import { translations } from '../translations';

interface ChatBotProps {
  onBack: () => void;
  onNavigateToSupport: () => void;
  lang: Language;
}

const OFFENSIVE_WORDS = ['palavrao1', 'ofensa2', 'merda', 'caralho', 'porra', 'idiota', 'burro']; // Exemplo simplificado

export const ChatBot: React.FC<ChatBotProps> = ({ onBack, onNavigateToSupport, lang }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: t.aiGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  const isOffensive = (text: string) => {
    const lowerText = text.toLowerCase();
    return OFFENSIVE_WORDS.some(word => lowerText.includes(word));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    if (isOffensive(input)) {
      setMessages(prev => [...prev, { role: 'model', text: t.offensiveWarning }]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', text: input, imageUrl: selectedImage || undefined };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = imageFile;
    
    setInput('');
    removeImage();
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts: any[] = [{ text: currentInput || "Interprete esta imagem no contexto do DeepBank." }];
      
      if (currentImage) {
        const base64 = await fileToBase64(currentImage);
        parts.push({
          inlineData: {
            mimeType: currentImage.type,
            data: base64
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: `Você é o Assistente IA do DeepBank. 
          Sua personalidade: Educada, profissional, empática e prestativa. 
          Suas diretrizes:
          1. Se o usuário estiver feliz ou te saudar, responda cordialmente.
          2. Se o usuário tiver dúvidas financeiras, explique de forma simples e educativa.
          3. IMPORTANTE: Se o usuário pedir algo que você não sabe ou for um problema técnico complexo que exija intervenção humana, sua resposta DEVE conter a frase exata: "Lamento, mas não possuo a informação completa para te responder sobre isso no momento." para que possamos mostrar o botão de suporte.
          4. Nunca use linguagem ofensiva.
          5. Responda no idioma: ${lang === 'pt' ? 'Português' : 'English'}.`,
          temperature: 0.7,
        },
      });

      const aiText = response.text || '';
      const isFallback = aiText.includes("não possuo a informação completa") || aiText.includes("don't have the complete information");
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: aiText,
        isFallback: isFallback
      }]);

    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Ocorreu um erro ao conectar com a IA. Tente novamente mais tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-white/5 flex items-center gap-3 sticky top-0 z-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-accent">smart_toy</span>
        </div>
        <div>
          <h2 className="font-bold text-dark dark:text-white">{t.aiAssistant}</h2>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {t.online}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {m.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm max-w-[200px]">
                  <img src={m.imageUrl} alt="Attached" className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                </div>
              )}

              <div className={`p-4 rounded-[24px] shadow-sm leading-relaxed text-sm font-medium ${
                m.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white dark:bg-dark-card text-dark dark:text-white rounded-tl-none border border-gray-100 dark:border-white/5'
              }`}>
                <p>{m.text}</p>
                
                {m.isFallback && (
                  <button 
                    onClick={onNavigateToSupport}
                    className="mt-4 w-full py-3 bg-accent text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    {t.talkToSupport}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-dark-card p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-white/5 sticky bottom-0">
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 relative inline-block">
             <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
             </div>
             <button 
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
             >
                <span className="material-symbols-outlined text-xs">close</span>
             </button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <label className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-all active:scale-90">
             <span className="material-symbols-outlined">add_a_photo</span>
             <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatInputPlaceholder}
            className="flex-1 py-3 px-4 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm dark:text-white transition-all"
          />
          
          <button 
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-90"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
