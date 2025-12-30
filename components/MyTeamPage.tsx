
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Language } from '../types';

interface MyTeamPageProps {
    onBack: () => void;
    lang: Language;
}

interface Subordinate {
    telefone_subordinado: string;
    data_convite: string;
    valor: number;
}

export const MyTeamPage: React.FC<MyTeamPageProps> = ({ onBack, lang }) => {
    const [loading, setLoading] = useState(true);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [totalSubordinates, setTotalSubordinates] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch user's invite code from profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('invite_code')
                .eq('id', user.id)
                .single();

            if (!profile) return;

            // 2. Fetch subordinates from red_equipe
            // Filtering by both user_id_convidador and invite_code as requested (optional but safer)
            const { data, error, count } = await supabase
                .from('red_equipe')
                .select('telefone_subordinado, data_convite, valor', { count: 'exact' })
                .eq('user_id_convidador', user.id)
                .eq('codigo_convite', profile.invite_code);

            if (error) throw error;

            if (data) {
                setSubordinates(data as Subordinate[]);
                setTotalSubordinates(count || 0);
                const total = data.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
                setTotalRewards(total);
            }
        } catch (error) {
            console.error('Error fetching team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value) + ' Kz';
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative pb-24 overflow-hidden">
            {/* Header Centralizado */}
            <div className="bg-white dark:bg-dark-card h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4 shadow-sm">
                <div className="w-10 flex items-center justify-center">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>

                <h1 className="font-extrabold text-dark dark:text-white text-lg absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    {lang === 'pt' ? 'Minha Equipe' : 'My Team'}
                </h1>

                <div className="w-10"></div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Totals Section */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                                    {lang === 'pt' ? 'Total de Subordinados' : 'Total Subordinates'}
                                </p>
                                <h2 className="text-4xl font-black">{totalSubordinates}</h2>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">groups</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl text-white/10 rotate-12">group_add</span>
                    </div>

                    <div className="bg-dark rounded-3xl p-6 text-white shadow-xl shadow-dark/20 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                                    {lang === 'pt' ? 'Recompensa Total da Equipe' : 'Total Team Reward'}
                                </p>
                                <h2 className="text-4xl font-black">{formatCurrency(totalRewards)}</h2>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl text-white/5 rotate-12">payments</span>
                    </div>
                </div>

                {/* List Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-dark dark:text-white uppercase tracking-widest pl-1">
                        {lang === 'pt' ? 'Lista de Subordinados' : 'Subordinates List'}
                    </h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando...</p>
                        </div>
                    ) : subordinates.length > 0 ? (
                        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-8">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Telefone' : 'Phone'}</th>
                                        <th className="text-center py-4 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Data' : 'Date'}</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{lang === 'pt' ? 'Recompensa' : 'Reward'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {subordinates.map((sub, i) => (
                                        <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-dark dark:text-white">
                                                {sub.telefone_subordinado}
                                            </td>
                                            <td className="py-4 px-2 text-center text-xs font-bold text-gray-400 dark:text-gray-500">
                                                {formatDate(sub.data_convite)}
                                            </td>
                                            <td className="py-4 px-6 text-right text-sm font-black text-primary">
                                                {formatCurrency(sub.valor)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-card p-12 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-3xl">sentiment_dissatisfied</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-dark dark:text-white">Nenhum subordinado encontrado</p>
                                <p className="text-xs text-gray-400 mt-1">Sua rede ainda está crescendo!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
