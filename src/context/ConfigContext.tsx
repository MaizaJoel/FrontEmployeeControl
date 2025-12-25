import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface ConfigContextType {
    configs: Record<string, string>;
    loading: boolean;
    getConfig: (key: string, defaultValue?: string) => string;
    refreshConfigs: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const refreshConfigs = async () => {
        try {
            // Fetch public configs (no auth needed)
            const response = await axiosClient.get<Record<string, string>>('/Configuraciones/public');
            setConfigs(response.data);
        } catch (error) {
            console.error('Error fetching public configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshConfigs();
    }, []);

    const getConfig = (key: string, defaultValue: string = '') => {
        return configs[key] || defaultValue;
    };

    return (
        <ConfigContext.Provider value={{ configs, loading, getConfig, refreshConfigs }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
