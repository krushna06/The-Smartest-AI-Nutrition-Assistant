"use client";

import { useState, memo } from 'react';
import { Settings as SettingsIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { useApiUrls, DEFAULT_API_URLS } from '@/app/hooks/useApiUrls';

export interface SettingsData {
  backendUrl: string;
  ollamaApiUrl: string;
}

interface SettingsProps {
  isCollapsed: boolean;
}

const Settings = ({ isCollapsed }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_API_URLS);
  const [, updateApiUrls] = useApiUrls();

  useState(() => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          backendUrl: parsedSettings.backendUrl || DEFAULT_API_URLS.backendUrl,
          ollamaApiUrl: parsedSettings.ollamaApiUrl || DEFAULT_API_URLS.ollamaApiUrl
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSettings = {
      ...settings,
      [name]: value
    };
    setSettings(newSettings);
    updateApiUrls(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    const newSettings = {
      ...settings,
      [name]: newValue
    };
    
    setSettings(newSettings);
    updateApiUrls(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
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
                className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
