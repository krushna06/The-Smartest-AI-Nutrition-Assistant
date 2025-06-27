'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import { FaHeartbeat, FaWalking } from 'react-icons/fa';

interface FitnessStatsProps {
  isCollapsed: boolean;
}

export default function FitnessStats({ isCollapsed }: FitnessStatsProps) {
  const [fitnessData, setFitnessData] = useState<{
    steps: number;
    heartRate: number | null;
    lastUpdated: string;
    isLoading: boolean;
    isConnected: boolean;
  }>({
    steps: 0,
    heartRate: null,
    lastUpdated: '',
    isLoading: false,
    isConnected: false,
  });

  const fetchFitnessData = async () => {
    try {
      setFitnessData(prev => ({ ...prev, isLoading: true }));
      const response = await fetch('/api/fitness');
      
      if (!response.ok) {
        throw new Error('Failed to fetch fitness data');
      }
      
      const data = await response.json();
      setFitnessData({
        steps: data.steps,
        heartRate: data.heartRate,
        lastUpdated: data.lastUpdated,
        isLoading: false,
        isConnected: true,
      });
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      setFitnessData(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
      }));
    }
  };

  useEffect(() => {
    fetchFitnessData();
    const interval = setInterval(fetchFitnessData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isCollapsed) {
    return null;
  }

  const formatUpdateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed top-80 right-4 w-80 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden z-30 transition-all hover:bg-[#2a2a2a] mt-4"
    >
      <div className="p-4 bg-[#1e1e1e] border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Fitness Stats</h3>
          <button
            onClick={fetchFitnessData}
            disabled={fitnessData.isLoading}
            className={`p-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors ${fitnessData.isLoading ? 'animate-spin' : ''}`}
            title="Refresh stats"
          >
            <FiRefreshCw className="w-4 h-4 text-[#8f8f8f]" />
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-[#333333]">
        {fitnessData.isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[#3a3a3a] rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-[#3a3a3a] rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : fitnessData.isConnected ? (
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaWalking className="text-blue-400 mr-3 text-lg" />
                  <div>
                    <p className="text-[#e0e0e0] text-sm">Steps Today</p>
                    <p className="text-white font-medium">{fitnessData.steps.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {fitnessData.heartRate !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaHeartbeat className="text-red-400 mr-3 text-lg" />
                    <div>
                      <p className="text-[#e0e0e0] text-sm">Heart Rate</p>
                      <p className="text-white font-medium">{fitnessData.heartRate} bpm</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {fitnessData.lastUpdated && (
              <div className="text-xs text-[#8f8f8f] mt-4 pt-3 border-t border-[#333333]">
                Updated: {formatUpdateTime(fitnessData.lastUpdated)}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-[#8f8f8f] mb-4">
              <FaHeartbeat className="h-8 w-8 mx-auto opacity-50" />
            </div>
            <p className="text-[#b0b0b0] mb-2">No fitness data available</p>
            <p className="text-sm text-[#8f8f8f]">Connect your fitness tracker to see your stats</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
