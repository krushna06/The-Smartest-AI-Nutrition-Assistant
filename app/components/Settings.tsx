"use client";

import { useState, memo, useEffect } from 'react';
import { Settings as SettingsIcon, ChevronDown, ChevronRight, Check, Save } from 'lucide-react';
import { useApiUrls, DEFAULT_API_URLS } from '@/app/hooks/useApiUrls';

export interface SettingsData {
  backendUrl: string;
  ollamaApiUrl: string;
  ollamaApiKey?: string;
}

interface SettingsProps {
  isCollapsed: boolean;
}

const Settings = ({ isCollapsed }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_API_URLS);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<SettingsData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [, updateApiUrls] = useApiUrls();

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      const savedApiKey = localStorage.getItem('ollama_api_key');
      
      const loadedSettings = { ...DEFAULT_API_URLS };
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        loadedSettings.backendUrl = parsedSettings.backendUrl || DEFAULT_API_URLS.backendUrl;
        loadedSettings.ollamaApiUrl = parsedSettings.ollamaApiUrl || DEFAULT_API_URLS.ollamaApiUrl;
      }
      
      if (savedApiKey) {
        loadedSettings.ollamaApiKey = savedApiKey;
      }
      
      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setInitialSettings({ ...DEFAULT_API_URLS });
    }
  }, []);

  useEffect(() => {
    if (initialSettings) {
      const hasChanges = 
        settings.backendUrl !== initialSettings.backendUrl ||
        settings.ollamaApiUrl !== initialSettings.ollamaApiUrl;
      setHasUnsavedChanges(hasChanges);
    }
  }, [settings, initialSettings]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = {
        backendUrl: settings.backendUrl,
        ollamaApiUrl: settings.ollamaApiUrl
      };
      
      localStorage.setItem('app_settings', JSON.stringify(settingsToSave));
      
      if (settings.ollamaApiKey) {
        localStorage.setItem('ollama_api_key', settings.ollamaApiKey);
      } else {
        localStorage.removeItem('ollama_api_key');
      }
      
      updateApiUrls(settingsToSave);
      
      setShowSaved(true);
      setInitialSettings({ ...settings });
      setHasUnsavedChanges(false);
      
      setTimeout(() => {
        setShowSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={toggleSettings}
          className="w-full flex items-center justify-center text-gray-400"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={toggleSettings}
        className="w-full flex items-center justify-between p-4 text-gray-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <SettingsIcon size={20} className="text-gray-400" />
          <span className="ml-3">Settings</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 bg-[#1e1e1e]">
          <div className="space-y-4">
            <div>
              <br></br>
              <label className="block text-sm font-medium text-gray-300 mb-1">Backend URL</label>
              <input
                type="url"
                name="backendUrl"
                value={settings.backendUrl}
                onChange={handleChange}
                placeholder="http://localhost:8000"
                className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ollama API URL</label>
              <input
                type="url"
                name="ollamaApiUrl"
                value={settings.ollamaApiUrl}
                onChange={handleChange}
                placeholder="http://localhost:11434"
                className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ollama API Key (if required)
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="ml-2 text-xs text-blue-400 hover:text-blue-300 focus:outline-none"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  name="ollamaApiKey"
                  value={settings.ollamaApiKey || ''}
                  onChange={handleChange}
                  placeholder="Enter your Ollama API key"
                  className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                {settings.ollamaApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({ ...prev, ollamaApiKey: '' }));
                      setHasUnsavedChanges(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 focus:outline-none"
                    title="Clear API key"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Only required if your Ollama instance requires authentication
              </p>
            </div>
            
            <div className="pt-2 flex justify-between items-center">
              <div className="flex items-center">
                {showSaved && (
                  <div className="flex items-center text-green-400 text-sm">
                    <Check size={16} className="mr-1" />
                    Settings saved
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1.5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MemoizedSettings = memo(Settings);
MemoizedSettings.displayName = 'Settings';

export { MemoizedSettings as Settings };
export type { SettingsProps };
