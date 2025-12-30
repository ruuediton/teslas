import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean, message?: string) => void;
    message: string;
    setMessage: (msg: string) => void;
    showWithTimeout: (loading: boolean, timeout?: number) => void;
    showTimeoutError: boolean;
    setShowTimeoutError: (show: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showTimeoutError, setShowTimeoutError] = useState(false);

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

    // Global Timeout: 10 seconds of consecutive loading
    useEffect(() => {
        let timer: any;
        if (isLoading) {
            timer = setTimeout(() => {
                setIsLoading(false);
                setMessage('');
                setShowTimeoutError(true);
                // Close automatically after 8 seconds (Portuguese text is longer)
                setTimeout(() => setShowTimeoutError(false), 8000);
            }, 10000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

    const contextValue = useMemo(() => ({
        isLoading,
        setIsLoading: setGlobalLoading,
        message,
        setMessage,
        showWithTimeout,
        showTimeoutError,
        setShowTimeoutError
    }), [isLoading, message, setGlobalLoading, showWithTimeout, showTimeoutError]);

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
