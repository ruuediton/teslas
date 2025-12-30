import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean, message?: string) => void;
    message: string;
    setMessage: (msg: string) => void;
    showWithTimeout: (loading: boolean, timeout?: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const setGlobalLoading = useCallback((loading: boolean, msg: string = '') => {
        setIsLoading(loading);
        if (loading) {
            setMessage(msg || '');
        } else {
            setMessage('');
        }
    }, []);

    const showWithTimeout = useCallback((loading: boolean, timeout: number = 0) => {
        if (loading) {
            setIsLoading(true);
        } else {
            setTimeout(() => {
                setIsLoading(false);
                setMessage('');
            }, timeout);
        }
    }, []);

    const contextValue = useMemo(() => ({
        isLoading,
        setIsLoading: setGlobalLoading,
        message,
        setMessage,
        showWithTimeout
    }), [isLoading, message, setGlobalLoading, showWithTimeout]);

    return (
        <LoadingContext.Provider value={contextValue}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
