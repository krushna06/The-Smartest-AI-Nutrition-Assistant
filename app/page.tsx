'use client';

import { useState } from 'react';
import { Paperclip, Mic } from "lucide-react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import type { Meal } from './components/MealPlanCard';

const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });
const MealPlanCard = dynamic(() => import('./components/MealPlanCard'), { ssr: false });

export default function Home() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<Meal[] | null>(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [formValue, setFormValue] = useState('');

  const handleOpenMealPlanModal = () => setShowMealPlanModal(true);

  const handleModalClose = () => {
    setShowMealPlanModal(false);
    setFormValue('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedMealPlan([
      {
        name: 'Breakfast',
        items: ['Oatmeal with berries and nuts', 'Greek yogurt with honey', 'Green smoothie']
      },
      {
        name: 'Lunch',
        items: ['Grilled chicken salad', 'Quinoa and roasted vegetables', 'Fruit for dessert']
      },
      {
        name: 'Dinner',
        items: ['Baked salmon with sweet potato', 'Steamed broccoli', 'Mixed green salad']
      }
    ]);
    setShowMealPlanModal(false);
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative">
        <MealPlanCard
          mealPlan={selectedMealPlan}
          onGenerateMealPlan={handleOpenMealPlanModal}
        />
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-medium text-center mb-8">What can I help you with?</h1>

          <div className="bg-[#303030] rounded-2xl p-6 shadow-lg">
            <AnimatePresence>
              {selectedMealPlan && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="text-sm text-white/80 bg-white/5 rounded-lg px-4 py-2 inline-flex items-center">
                    <span>Selected Meal Plan</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask Anything"
                className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
              />

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <button 
                  className="text-gray-400 p-1"
                  aria-label="Attach file"
                >
                  <Paperclip size={20} />
                </button>

                <button 
                  className="text-gray-400 p-1"
                  aria-label="Voice input"
                >
                  <Mic size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AnimatePresence>
        {showMealPlanModal && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
              className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-[#333333] flex flex-col" style={{ borderWidth: 0.5 }}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleModalSubmit} className="flex flex-col px-8 py-8 bg-[#1a1a1a]">
                <label className="text-[#e0e0e0] mb-2 text-base font-medium">Meal Plan Preferences</label>
                <input
                  type="text"
                  className="w-full bg-transparent border border-[#333333] rounded px-3 py-2 text-[#e0e0e0] placeholder-[#8f8f8f] mb-4 focus:outline-none focus:ring-2 focus:ring-[#333333]"
                  placeholder="e.g. vegetarian, high protein, etc."
                  value={formValue}
                  onChange={e => setFormValue(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 bg-[#232323] text-[#e0e0e0] rounded hover:bg-[#2a2a2a] border border-[#333333]">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#232323] text-[#e0e0e0] rounded hover:bg-[#2a2a2a] border border-[#333333]">Generate</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
