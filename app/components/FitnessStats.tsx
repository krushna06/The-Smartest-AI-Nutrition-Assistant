'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity,
  FiClock, 
  FiHeart, 
  FiNavigation2, 
  FiTrendingUp, 
  FiZap,
  FiActivity as FiActivityIcon
} from 'react-icons/fi';
import { FaHeartbeat, FaWalking } from 'react-icons/fa';

import { FitnessData } from '../services/googleFitService';
import FitnessModal from './FitnessModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-[#2a2a2a]/90 hover:bg-[#333333] backdrop-blur-sm rounded-full shadow-lg p-4 z-30 transition-all flex items-center space-x-3 hover:shadow-xl hover:scale-105"
      >
        <div className="relative">
          <FiActivity className="w-5 h-5 text-blue-400" />
          {fitnessData.isConnected && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
          )}
        </div>
        <span className="text-white font-medium hidden sm:inline">Fitness Stats</span>
      </motion.button>

      <FitnessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fitnessData={fitnessData}
        onRefresh={fetchFitnessData}
        onDisconnect={onDisconnect || (() => {})}
      />
    </>
  );
}
