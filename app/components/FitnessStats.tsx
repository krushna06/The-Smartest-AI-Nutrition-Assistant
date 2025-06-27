'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiTrendingUp, 
  FiClock, 
  FiZap, 
  FiNavigation2, 
  FiActivity, 
  FiMoon 
} from 'react-icons/fi';
import { FaHeartbeat, FaWalking } from 'react-icons/fa';

import { FitnessData } from '../services/googleFitService';

interface FitnessStatsData extends Omit<FitnessData, 'metrics'> {
  metrics: {
    steps: { value: number; success: boolean };
    activeMinutes: { value: number; success: boolean };
    calories: { value: number; success: boolean };
    distance: { value: number; success: boolean };
    heartRate: { value: number | null; success: boolean };
    sleepDuration: { value: number | null; success: boolean };
  };
  isLoading: boolean;
  isConnected: boolean;
  error?: string;
}

interface FitnessStatsProps {
  isCollapsed: boolean;
  onDisconnect?: () => void;
}

export default function FitnessStats({ isCollapsed, onDisconnect }: FitnessStatsProps) {
  const [fitnessData, setFitnessData] = useState<FitnessStatsData>({
    steps: 0,
    heartRate: null,
    activeMinutes: 0,
    calories: 0,
    distance: 0,
    sleepDuration: null,
    lastUpdated: '',
    isLoading: false,
    isConnected: false,
    metrics: {
      steps: { value: 0, success: false },
      activeMinutes: { value: 0, success: false },
      calories: { value: 0, success: false },
      distance: { value: 0, success: false },
      heartRate: { value: null, success: false },
      sleepDuration: { value: null, success: false },
    },
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
        activeMinutes: data.activeMinutes,
        calories: data.calories,
        distance: data.distance,
        sleepDuration: data.sleepDuration,
        lastUpdated: data.lastUpdated,
        isLoading: false,
        isConnected: true,
        metrics: {
          steps: { value: data.steps, success: data.metrics.steps.success },
          activeMinutes: { value: data.activeMinutes, success: data.metrics.activeMinutes.success },
          calories: { value: data.calories, success: data.metrics.calories.success },
          distance: { value: data.distance, success: data.metrics.distance.success },
          heartRate: { value: data.heartRate, success: data.metrics.heartRate.success },
          sleepDuration: { value: data.sleepDuration, success: data.metrics.sleepDuration.success },
        },
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed top-80 right-4 w-80 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden z-30 transition-all hover:bg-[#2a2a2a] mt-4"
    >
      <div className="p-4 bg-[#1e1e1e] border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-white">Fitness Stats</h3>
            <span className="ml-2 flex items-center text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchFitnessData}
              disabled={fitnessData.isLoading}
              className={`p-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors ${fitnessData.isLoading ? 'animate-spin' : ''}`}
              title="Refresh stats"
            >
              <FiRefreshCw className="w-4 h-4 text-[#8f8f8f]" />
            </button>
            <button
              onClick={onDisconnect}
              className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
              title="Disconnect"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
            <div className="grid grid-cols-2 gap-3">
              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.steps.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiTrendingUp className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.steps.success ? 'text-gray-500' : ''}`} />
                  <span className="text-xs font-medium">STEPS</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.steps.success 
                    ? fitnessData.steps.toLocaleString() 
                    : '--'}
                </p>
              </div>

              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.activeMinutes.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiClock className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.activeMinutes.success ? 'text-gray-500' : ''}`} />
                  <span className="text-xs font-medium">ACTIVE MIN</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.activeMinutes.success 
                    ? `${fitnessData.activeMinutes} min` 
                    : '--'}
                </p>
              </div>

              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.calories.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiZap className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.calories.success ? 'text-gray-500' : 'text-yellow-400'}`} />
                  <span className="text-xs font-medium">CALORIES</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.calories.success 
                    ? `${fitnessData.calories.toLocaleString()} kcal` 
                    : '--'}
                </p>
              </div>

              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.distance.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiNavigation2 className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.distance.success ? 'text-gray-500' : 'text-blue-400'}`} />
                  <span className="text-xs font-medium">DISTANCE</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.distance.success 
                    ? `${(fitnessData.distance / 1000).toFixed(1)} km` 
                    : '--'}
                </p>
              </div>

              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.heartRate.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiActivity className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.heartRate.success ? 'text-gray-500' : 'text-red-400'}`} />
                  <span className="text-xs font-medium">HEART RATE</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.heartRate.success && fitnessData.heartRate 
                    ? `${fitnessData.heartRate} bpm` 
                    : '--'}
                </p>
              </div>

              <div className={`bg-[#2a2a2a] p-3 rounded-lg ${!fitnessData.metrics.sleepDuration.success ? 'opacity-60' : ''}`}>
                <div className="flex items-center text-[#8f8f8f] mb-1">
                  <FiMoon className={`w-3.5 h-3.5 mr-1.5 ${!fitnessData.metrics.sleepDuration.success ? 'text-gray-500' : 'text-blue-400'}`} />
                  <span className="text-xs font-medium">SLEEP</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {fitnessData.metrics.sleepDuration.success && fitnessData.sleepDuration
                    ? `${Math.floor(fitnessData.sleepDuration / 60)}h ${fitnessData.sleepDuration % 60}m`
                    : '--'}
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#8f8f8f] text-right">
              Last updated: {new Date(fitnessData.lastUpdated).toLocaleTimeString()}
            </div>
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
