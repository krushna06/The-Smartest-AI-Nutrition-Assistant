import { useEffect, useState } from 'react';

export interface ApiUrls {
  backendUrl: string;
  ollamaApiUrl: string;
  ollamaApiKey?: string;
}

export const DEFAULT_API_URLS: ApiUrls = {
  backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ollamaApiUrl: 'http://localhost:11434',
  ollamaApiKey: ''
};

export const useApiUrls = (): [ApiUrls, (urls: Partial<ApiUrls>) => void] => {
  const [apiUrls, setApiUrls] = useState<ApiUrls>(() => {
    const defaultUrls = { ...DEFAULT_API_URLS };
    
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          return {
            backendUrl: settings.backendUrl || defaultUrls.backendUrl,
            ollamaApiUrl: settings.ollamaApiUrl || defaultUrls.ollamaApiUrl
          };
        }
      } catch (error) {
        console.error('Failed to load API URL settings:', error);
      }
    }
    
    return defaultUrls;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_settings') {
        try {
          const settings = e.newValue ? JSON.parse(e.newValue) : null;
          if (settings) {
            setApiUrls(prev => ({
              ...prev,
              backendUrl: settings.backendUrl || DEFAULT_API_URLS.backendUrl,
              ollamaApiUrl: settings.ollamaApiUrl || DEFAULT_API_URLS.ollamaApiUrl
            }));
          }
        } catch (error) {
          console.error('Failed to parse updated settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateApiUrls = (updates: Partial<ApiUrls>) => {
    const newUrls = {
      ...apiUrls,
      ...updates
    };
    
    setApiUrls(newUrls);
    
    try {
      const currentSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
      localStorage.setItem('app_settings', JSON.stringify({
        ...currentSettings,
        ...updates
      }));
    } catch (error) {
      console.error('Failed to update API URLs in localStorage:', error);
    }
  };

  return [apiUrls, updateApiUrls];
};
