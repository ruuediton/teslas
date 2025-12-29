
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setVideoUrl(null);
    setStatus('Iniciando geração com Veo 3.1...');

    try {
      // Mandatoty check for AI Studio API Key Selection for Veo
      if (typeof window !== 'undefined' && (window as any).aistudio) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (!hasKey) {
              setStatus('Por favor, selecione sua API Key do Google AI Studio...');
              await (window as any).aistudio.openSelectKey();
          }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Financeiro DeepBank style: ${prompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      setStatus('Gerando frames (isso pode levar alguns minutos)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Fazendo download do vídeo...');
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('');
      } else {
        throw new Error('Falha ao obter link do vídeo');
      }
    } catch (error: any) {
      console.error('Video gen error:', error);
      setStatus(`Erro: ${error.message || 'Falha na geração'}`);
      if (error.message?.includes("Requested entity was not found")) {
          // Trigger re-selection if key is invalid
          (window as any).aistudio?.openSelectKey();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">video_stable</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-dark">Gerador de Vídeos</h1>
          <p className="text-sm text-gray-500">Crie apresentações financeiras dinâmicas.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-dark mb-2">O que você deseja ver?</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Um gráfico 3D crescendo em uma cidade moderna com tons de azul e dourado..."
            className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-dark mb-2">Formato</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setAspectRatio('16:9')}
              className={`py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                aspectRatio === '16:9' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined">rectangle</span> 16:9
            </button>
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                aspectRatio === '9:16' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-rotate-90">rectangle</span> 9:16
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined">auto_awesome</span>
          )}
          {isLoading ? 'Gerando...' : 'Gerar Vídeo'}
        </button>

        {status && <p className="text-xs text-center text-primary font-medium animate-pulse">{status}</p>}
      </div>

      {videoUrl && (
        <div className="space-y-4">
          <h3 className="font-bold text-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">check_circle</span> Resultado:
          </h3>
          <div className="rounded-3xl overflow-hidden bg-black shadow-2xl">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop
              className="w-full h-auto"
            />
          </div>
          <a 
            href={videoUrl} 
            download="deepbank-video.mp4"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-dark font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            <span className="material-symbols-outlined">download</span> Baixar Vídeo
          </a>
        </div>
      )}

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-3">
        <span className="material-symbols-outlined text-accent text-xl">info</span>
        <p className="text-xs text-accent-dark leading-relaxed">
          A geração de vídeo utiliza o modelo <b>Veo 3.1</b>. Certifique-se de que sua conta possui faturamento ativo para o Google AI Studio. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold">Saiba mais.</a>
        </p>
      </div>
    </div>
  );
};
