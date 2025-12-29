
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { View } from '../types';

interface WelcomePopupProps {
    onClose: () => void;
    onNavigate: (view: View) => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose, onNavigate }) => {
    const [notiCount, setNotiCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState<string>('Bem-vindo(a). Tens novas atualizações na tua conta.');
    const [groupUrl, setGroupUrl] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already shown in this session
        const hasShown = sessionStorage.getItem('welcome_popup_shown');
        if (hasShown) {
            onClose();
            return;
        }

        setIsVisible(true);
        fetchData();

        // Auto close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch notification count and latest message
            const { data: notis, error: notiError } = await supabase
                .from('notificacoes_usuario')
                .select('mensagem')
                .order('data_evento', { ascending: false });

            if (notiError) throw notiError;
            if (notis && notis.length > 0) {
                setNotiCount(notis.length);
                setLatestMessage(notis[0].mensagem);
            }

            // 2. Fetch group link
            const { data: links, error: linkError } = await supabase
                .from('atendimento_links')
                .select('whatsapp_grupo_vendas_url')
                .single();

            if (linkError) throw linkError;
            if (links) setGroupUrl(links.whatsapp_grupo_vendas_url);
        } catch (error) {
            console.error('Error fetching welcome popup data:', error);
        }
    };

    const handleClose = () => {
        sessionStorage.setItem('welcome_popup_shown', 'true');
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
    };

    const handleJoinGroup = () => {
        if (!groupUrl || groupUrl.trim() === '') {
            setShowFeedback('Prezado cliente, lamentamos por não conseguir entrar em contato com o grupo de vendas no momento. Por favor, aguarde ou tente mais tarde.');
            setTimeout(() => setShowFeedback(null), 4000);
            return;
        }
        window.open(groupUrl, '_blank');
        handleClose();
    };

    if (!isVisible && !showFeedback) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-dark dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="p-8 pt-12 text-center space-y-6">
                    {/* Header Icon */}
                    <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-4xl">waving_hand</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-dark dark:text-white tracking-tight">Mensagem de boas-vindas</h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Tens {notiCount} notificações</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                            "{latestMessage}"
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={() => {
                                onNavigate(View.NOTIFICATIONS);
                                handleClose();
                            }}
                            className="w-full py-4 bg-dark dark:bg-primary text-white font-bold rounded-2xl shadow-xl shadow-dark/10 dark:shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Ir para notificações
                            <span className="material-symbols-outlined text-sm">notifications</span>
                        </button>
                        <button
                            onClick={handleJoinGroup}
                            className="w-full py-4 bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 font-bold rounded-2xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                            Entrar no grupo de vendas
                            <span className="material-symbols-outlined text-sm">groups</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Snackbar for URL validation */}
            {showFeedback && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-dark/95 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 max-w-[90vw]">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <p className="text-xs font-bold leading-relaxed">{showFeedback}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
