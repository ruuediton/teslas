
import React, { useState, useEffect } from 'react';
import { Product, Language, View } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';

interface ProductListPageProps {
  lang: Language;
  onNavigateToPurchased: () => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({ lang, onNavigateToPurchased }) => {
  const t = translations[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          dailyIncome: Number(item.daily_income),
          duration: item.duration_days,
          purchaseLimit: item.purchase_limit,
          emoji: item.emoji || '📦',
          description: item.description || '',
          imageUrl: item.image_url
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      triggerFeedback('error', 'Erro ao carregar produtos.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setShowFeedback({ type, message });
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        triggerFeedback('error', 'Usuário não autenticado.');
        return;
      }

      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: selectedProduct.id,
        p_user_id: user.id
      });

      if (error) throw error;

      if (data.success) {
        triggerFeedback('success', lang === 'pt' ? data.message : 'Purchase successful!');
        setSelectedProduct(null);
        // Optionally refresh user balance context if available, or just page state
      } else {
        triggerFeedback('error', data.message || 'Erro ao realizar compra.');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      triggerFeedback('error', error.message || 'Erro de conexão.');
    }
  };

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO').format(val) + ' Kz';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark relative pb-24 overflow-x-hidden">
      {/* Header Atualizado */}
      <div className="bg-white dark:bg-dark h-16 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
          </div>
          <h1 className="text-lg font-black text-dark dark:text-white">{t.packageTitle}</h1>
        </div>

        <button
          onClick={onNavigateToPurchased}
          className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">inventory</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 animate-pulse">{t.loading}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-4xl">inventory</span>
            </div>
            <p className="text-gray-500 font-bold">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-dark-card rounded-[28px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm flex flex-col transition-all active:scale-[0.99]"
              >
                {/* Visual Top */}
                <div className="h-32 bg-gray-50 dark:bg-black/20 flex items-center justify-center text-5xl border-b border-gray-50 dark:border-white/5 relative">
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-9xl">{product.emoji === '💎' ? 'diamond' : 'payments'}</span>
                  </div>
                  <span className="relative z-10">{product.emoji}</span>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-dark dark:text-white truncate">{product.name}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">{product.duration} {lang === 'pt' ? 'dias' : 'days'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{formatKz(product.price)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-gray-50 dark:border-white/5 pt-4">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{lang === 'pt' ? 'Renda Diária' : 'Daily Income'}</p>
                      <p className="text-sm font-black text-green-600 dark:text-green-400">{formatKz(product.dailyIncome)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{lang === 'pt' ? 'Limite' : 'Limit'}</p>
                      <p className="text-sm font-black text-dark dark:text-white">{product.purchaseLimit} un</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-primary text-white text-sm font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                    {lang === 'pt' ? 'Investir Agora' : 'Invest Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          ></div>
          <div className="relative bg-white dark:bg-dark-card w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/5">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-primary text-4xl">shopping_basket</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-dark dark:text-white">{lang === 'pt' ? 'Confirmar Investimento' : 'Confirm Investment'}</h3>
                <p className="text-sm font-bold text-primary">{selectedProduct.name}</p>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl text-left border border-gray-100 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preço</p>
                  <p className="text-base font-black text-dark dark:text-white">{formatKz(selectedProduct.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rendimento</p>
                  <p className="text-base font-black text-green-600 dark:text-green-400">+{formatKz(selectedProduct.dailyIncome)}/dia</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleConfirmPurchase}
                  className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                >
                  {lang === 'pt' ? 'Confirmar Compra' : 'Confirm Purchase'}
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full bg-white dark:bg-white/5 text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Centered Feedback Notification */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 pointer-events-none">
          <div className={`p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-90 fade-in duration-300 max-w-[280px] text-center pointer-events-auto bg-white dark:bg-dark-card border-2 ${showFeedback.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${showFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <span className={`material-symbols-outlined text-4xl ${showFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <p className={`text-base font-extrabold ${showFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
              {showFeedback.type === 'success' ? t.success : t.error}
            </p>
            <p className="text-sm font-bold text-dark/70 dark:text-white/70 leading-relaxed">
              {showFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
