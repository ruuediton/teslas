
import { Language } from '../types';
import { translations } from '../translations';

interface DownloadAppPageProps {
  onBack: () => void;
  lang: Language;
}

export const DownloadAppPage: React.FC<DownloadAppPageProps> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const platforms = [
    {
      id: 'android',
      name: 'Google Play',
      icon: 'smartphone',
      desc: lang === 'pt' ? 'Versão oficial para Android' : 'Official Android version',
      color: 'bg-green-500'
    },
    {
      id: 'ios',
      name: 'App Store',
      icon: 'apple',
      desc: lang === 'pt' ? 'Versão oficial para iOS (iPhone)' : 'Official iOS version (iPhone)',
      color: 'bg-dark dark:bg-black'
    },
    {
      id: 'apk',
      name: lang === 'pt' ? 'Arquivo APK' : 'APK File',
      icon: 'download_for_offline',
      desc: lang === 'pt' ? 'Instalação direta (Android)' : 'Direct Installation (Android)',
      color: 'bg-primary'
    }
  ];

  const handleDownload = (id: string) => {
    setIsDownloading(id);

    setTimeout(() => {
      setIsDownloading(null);

      if (id === 'apk') {
        const link = document.createElement('a');
        link.href = '/deepbank.apk'; // Caminho interno para o APK
        link.download = 'deepbank.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(lang === 'pt' ? `Iniciando download da versão ${id.toUpperCase()}... (Link em breve nas lojas oficiais)` : `Starting download of ${id.toUpperCase()} version... (Link coming soon to official stores)`);
      }
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

        <h1 className="font-extrabold text-dark dark:text-white text-lg">{lang === 'pt' ? 'Baixar aplicativo' : 'Download application'}</h1>

        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-white/5">
            <span className="material-symbols-outlined text-primary text-4xl">install_mobile</span>
          </div>
          <h2 className="text-2xl font-black text-dark dark:text-white tracking-tight">{lang === 'pt' ? 'Leve o DeepBank com você' : 'Take DeepBank with you'}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto">
            {lang === 'pt' ? 'Acesse seus investimentos de qualquer lugar com nossa experiência nativa.' : 'Access your investments from anywhere with our native experience.'}
          </p>
        </div>

        {/* Platform List */}
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:shadow-md dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${platform.color} rounded-2xl flex items-center justify-center text-white`}>
                  <span className="material-symbols-outlined">{platform.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-dark dark:text-white">{platform.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{platform.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(platform.id)}
                disabled={isDownloading !== null}
                className="bg-gray-50 dark:bg-white/5 hover:bg-primary dark:hover:bg-primary hover:text-white dark:text-primary text-primary px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              >
                {isDownloading === platform.id ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <>
                    {lang === 'pt' ? 'Baixar' : 'Download'}
                    <span className="material-symbols-outlined text-sm">download</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-dark dark:text-white uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">info</span>
            {lang === 'pt' ? 'Como instalar (APK)' : 'How to install (APK)'}
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-dark dark:text-white shrink-0">1</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {lang === 'pt' ? <>Clique no botão <b>Baixar</b> na opção Arquivo APK.</> : <>Click the <b>Download</b> button on the APK File option.</>}
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-dark dark:text-white shrink-0">2</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {lang === 'pt' ? <>Após o download, abra o arquivo e permita <b>"Instalação de fontes desconhecidas"</b> em suas configurações.</> : <>After downloading, open the file and allow <b>"Installation from unknown sources"</b> in your settings.</>}
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-dark dark:text-white shrink-0">3</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {lang === 'pt' ? <>Siga as instruções na tela e faça login com sua conta DeepBank.</> : <>Follow the on-screen instructions and log in with your DeepBank account.</>}
              </p>
            </li>
          </ul>
        </div>

        {/* Support Link */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {lang === 'pt' ? 'Problemas com o download?' : 'Problems with the download?'} <button className="text-primary font-bold">{lang === 'pt' ? 'Fale com o suporte' : 'Talk to support'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};
