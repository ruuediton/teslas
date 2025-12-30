import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    message: string;
    setMessage: (msg: string) => void;
    showWithTimeout: (loading: boolean, timeout?: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const showWithTimeout = (loading: boolean, timeout: number = 0) => {
        if (loading) {
            setIsLoading(true);
        } else {
            setTimeout(() => setIsLoading(false), timeout);
        }
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading, message, setMessage, showWithTimeout }}>
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
