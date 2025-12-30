
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { RegisterScreen } from './components/RegisterScreen';
import { Language, Theme } from './types';
import { LoadingProvider } from './components/LoadingContext';
import { Loading } from './components/Loading';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persisted settings
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('db_lang') as Language) || 'pt';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('db_theme') as Theme) || 'light';
  });

  // Apply theme to HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('db_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('db_lang', language);
  }, [language]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setShowRegister(false);
  };

  return (
    <LoadingProvider>
      <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark text-primary font-bold">Iniciando DeepBank...</div>}>
          {isLoggedIn ? (
            <Dashboard
              onLogout={handleLogout}
              appLanguage={language}
              appTheme={theme}
              setAppLanguage={setLanguage}
              setAppTheme={setTheme}
            />
          ) : (
            showRegister ? (
              <RegisterScreen onBackToLogin={() => setShowRegister(false)} />
            ) : (
              <LoginScreen
                onLogin={handleLogin}
                onGoToRegister={() => setShowRegister(true)}
              />
            )
          )}
        </React.Suspense>
      </div>
      <Loading />
    </LoadingProvider>
  );
};

export default App;
