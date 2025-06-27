'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiClock, 
  FiZap, 
  FiNavigation2, 
  FiActivity, 
  FiMoon,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import { FitnessData } from '../services/googleFitService';

interface FitnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitnessData: FitnessData & {
    isLoading: boolean;
    isConnected: boolean;
    metrics: {
      steps: { value: number; success: boolean };
      activeMinutes: { value: number; success: boolean };
      calories: { value: number; success: boolean };
      distance: { value: number; success: boolean };
      heartRate: { value: number | null; success: boolean };
      sleepDuration: { value: number | null; success: boolean };
    };
  };
  onRefresh: () => void;
  onDisconnect: () => void;
}

export default function FitnessModal({ 
  isOpen, 
  onClose, 
  fitnessData, 
  onRefresh,
  onDisconnect 
}: FitnessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 400,
            mass: 0.8,
          }}
          className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-[#333333] max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-4 border-b border-[#333333] bg-[#1e1e1e]">
            <h2 className="text-xl font-semibold text-white">Fitness Stats</h2>
            <div className="absolute right-4 top-4 flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                disabled={fitnessData.isLoading}
                className={`p-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors ${
                  fitnessData.isLoading ? 'animate-spin' : ''
                }`}
                title="Refresh stats"
              >
                <FiRefreshCw className="w-4 h-4 text-[#8f8f8f]" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors text-[#8f8f8f] hover:text-white"
                title="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto p-6">
            {fitnessData.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : fitnessData.isConnected ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`bg-[#2a2a2a] p-4 rounded-lg ${!fitnessData.metrics.steps.success ? 'opacity-60' : ''}`}>
                    <div className="flex items-center text-[#8f8f8f] mb-2">
                      <FiTrendingUp className={`w-4 h-4 mr-2 ${!fitnessData.metrics.steps.success ? 'text-gray-500' : ''}`} />
                      <span className="text-sm font-medium">STEPS</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">
                      {fitnessData.metrics.steps.success 
                        ? fitnessData.steps.toLocaleString() 
                        : '--'}
                    </p>
                  </div>

                  <div className={`bg-[#2a2a2a] p-4 rounded-lg ${!fitnessData.metrics.activeMinutes.success ? 'opacity-60' : ''}`}>
                    <div className="flex items-center text-[#8f8f8f] mb-2">
                      <FiClock className={`w-4 h-4 mr-2 ${!fitnessData.metrics.activeMinutes.success ? 'text-gray-500' : ''}`} />
                      <span className="text-sm font-medium">ACTIVE MIN</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">
                      {fitnessData.metrics.activeMinutes.success 
                        ? `${fitnessData.activeMinutes} min` 
                        : '--'}
                    </p>
                  </div>

                  <div className={`bg-[#2a2a2a] p-4 rounded-lg ${!fitnessData.metrics.calories.success ? 'opacity-60' : ''}`}>
                    <div className="flex items-center text-[#8f8f8f] mb-2">
                      <FiZap className={`w-4 h-4 mr-2 ${!fitnessData.metrics.calories.success ? 'text-gray-500' : 'text-yellow-400'}`} />
                      <span className="text-sm font-medium">CALORIES</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">
                      {fitnessData.metrics.calories.success 
                        ? `${fitnessData.calories.toLocaleString()} kcal` 
                        : '--'}
                    </p>
                  </div>

                  <div className={`bg-[#2a2a2a] p-4 rounded-lg ${!fitnessData.metrics.distance.success ? 'opacity-60' : ''}`}>
                    <div className="flex items-center text-[#8f8f8f] mb-2">
                      <FiNavigation2 className={`w-4 h-4 mr-2 ${!fitnessData.metrics.distance.success ? 'text-gray-500' : 'text-blue-400'}`} />
                      <span className="text-sm font-medium">DISTANCE</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">
                      {fitnessData.metrics.distance.success 
                        ? `${(fitnessData.distance / 1000).toFixed(1)} km` 
                        : '--'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded-lg p-5">
                  <h3 className="text-lg font-medium text-white mb-4">Activity Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                      <span className="text-sm text-[#b0b0b0]">Daily Steps Goal</span>
                      <span className="text-sm font-medium text-white">
                        {fitnessData.metrics.steps.success ? `${Math.round((fitnessData.steps / 10000) * 100)}%` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                      <span className="text-sm text-[#b0b0b0]">Calories Burned</span>
                      <span className="text-sm font-medium text-white">
                        {fitnessData.metrics.calories.success ? `${fitnessData.calories.toLocaleString()} kcal` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                      <span className="text-sm text-[#b0b0b0]">Active Time</span>
                      <span className="text-sm font-medium text-white">
                        {fitnessData.metrics.activeMinutes.success ? `${fitnessData.activeMinutes} min` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                      <span className="text-sm text-[#b0b0b0]">Distance</span>
                      <span className="text-sm font-medium text-white">
                        {fitnessData.metrics.distance.success ? `${(fitnessData.distance / 1000).toFixed(1)} km` : '--'}
                      </span>
                    </div>
                    {fitnessData.metrics.heartRate.success && fitnessData.heartRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#b0b0b0]">Heart Rate</span>
                        <span className="text-sm font-medium text-white">
                          {fitnessData.heartRate} bpm
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-xs text-[#8f8f8f]">
                    Last updated: {new Date(fitnessData.lastUpdated).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDisconnect();
                      onClose();
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="text-[#8f8f8f] mb-4">
                  <FiActivity className="h-10 w-10 mx-auto opacity-50" />
                </div>
                <p className="text-[#b0b0b0] mb-2">No fitness data available</p>
                <p className="text-sm text-[#8f8f8f]">Connect your fitness tracker to see your stats</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
