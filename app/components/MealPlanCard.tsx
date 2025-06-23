'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export type Meal = {
  name: string;
  items: string[];
};

interface MealPlanCardProps {
  onSelect?: (mealPlan: string | undefined) => void;
}

export default function MealPlanCard({ onSelect }: MealPlanCardProps) {
  const [selectedMealPlan, setSelectedMealPlan] = useState<boolean>(false);
  const meals: Meal[] = [
    {
      name: 'Breakfast',
      items: [
        'Oatmeal with berries and nuts',
        'Greek yogurt with honey',
        'Green smoothie'
      ]
    },
    {
      name: 'Lunch',
      items: [
        'Grilled chicken salad',
        'Quinoa and roasted vegetables',
        'Fruit for dessert'
      ]
    },
    {
      name: 'Dinner',
      items: [
        'Baked salmon with sweet potato',
        'Steamed broccoli',
        'Mixed green salad'
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-4 right-4 w-80 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden z-40 cursor-pointer transition-all hover:bg-[#2a2a2a]"
      onClick={() => {
        const newSelected = !selectedMealPlan;
        setSelectedMealPlan(newSelected);
        onSelect?.(newSelected ? JSON.stringify(meals) : undefined);
      }}
    >
      <div className={`p-4 ${!selectedMealPlan ? 'bg-[#1e1e1e]' : 'bg-[#2a2a2a]'}`} style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <h3 className="text-lg font-medium text-white flex items-center">
          <span>Meal Plan</span>
          {selectedMealPlan && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Selected</span>}
        </h3>
      </div>
      <div className="divide-y divide-[#333333]">
        {meals.map((meal, index) => (
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
    </motion.div>
  );
}
