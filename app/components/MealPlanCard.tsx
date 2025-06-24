'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export type Meal = {
  name: string;
  items: string[];
};

interface MealPlanCardProps {
  mealPlan: Meal[] | null;
  onGenerateMealPlan: () => void;
}

export default function MealPlanCard({ mealPlan, onGenerateMealPlan }: MealPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-4 right-4 w-80 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden z-40 transition-all"
    >
      <div className="p-4 bg-[#1e1e1e]" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <h3 className="text-lg font-medium text-white flex items-center">
          <span>Meal Plan</span>
        </h3>
      </div>
      <div className="flex flex-col items-center justify-center p-8 min-h-[180px]">
        {!mealPlan ? (
          <button
            className="px-4 py-2 bg-[#232323] text-[#e0e0e0] rounded-lg shadow hover:bg-[#2a2a2a] border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#333333] focus:ring-opacity-50 transition" style={{ borderWidth: 0.5 }}
            onClick={onGenerateMealPlan}
          >
            Generate Meal Plan
          </button>
        ) : (
          <div className="w-full divide-y divide-[#333333]">
            {mealPlan.map((meal, index) => (
              <div key={index} className="p-4">
                <h4 className="text-md font-medium text-[#e0e0e0] mb-2">{meal.name}</h4>
                <ul className="space-y-1.5">
                  {meal.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-[#8f8f8f] mr-2">•</span>
                      <span className="text-sm text-[#b0b0b0]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
