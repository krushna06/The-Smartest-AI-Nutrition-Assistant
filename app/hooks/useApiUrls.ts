import { useEffect, useState } from 'react';

export interface ApiUrls {
  backendUrl: string;
  ollamaApiUrl: string;
}

export const DEFAULT_API_URLS: ApiUrls = {
  backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ollamaApiUrl: 'http://localhost:11434'
};

export const useApiUrls = (): [ApiUrls, (urls: Partial<ApiUrls>) => void] => {
  const [apiUrls, setApiUrls] = useState<ApiUrls>(DEFAULT_API_URLS);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setApiUrls(prev => ({
            ...prev,
            ...(settings.backendUrl && { backendUrl: settings.backendUrl }),
            ...(settings.ollamaApiUrl && { ollamaApiUrl: settings.ollamaApiUrl })
          }));
        }
      } catch (error) {
        console.error('Failed to load API URL settings:', error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          setApiUrls(prev => ({
            ...prev,
            ...(settings.backendUrl && { backendUrl: settings.backendUrl }),
            ...(settings.ollamaApiUrl && { ollamaApiUrl: settings.ollamaApiUrl })
          }));
        } catch (error) {
          console.error('Failed to parse updated settings:', error);
        }
      }
    };

    loadSettings();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateApiUrls = (updates: Partial<ApiUrls>) => {
    setApiUrls(prev => ({
      ...prev,
      ...updates
    }));
  };

  return [apiUrls, updateApiUrls];
};
