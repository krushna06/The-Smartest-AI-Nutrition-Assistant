"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import MealGenerator from "./MealGenerator";

export type Meal = {
  name: string;
  items: string[];
};

interface MealPlanCardProps {
  onSelect?: (mealPlan: string | undefined) => void;
}

export default function MealPlanCard({ onSelect }: MealPlanCardProps) {
  const [selectedMealPlan, setSelectedMealPlan] = useState<boolean>(false);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [meals, setMeals] = useState<Meal[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMeals = localStorage.getItem('savedMealPlan');
      return savedMeals ? JSON.parse(savedMeals) : [];
    }
    return [];
  });

  const handleMealGenerated = (newMeals: Meal[]) => {
    if (newMeals && newMeals.length > 0) {
      setMeals(newMeals);
      localStorage.setItem('savedMealPlan', JSON.stringify(newMeals));
      // setSelectedMealPlan(true);
      // onSelect?.(JSON.stringify(newMeals));
    }
  };

  const clearMealPlan = () => {
    setMeals([]);
    localStorage.removeItem('savedMealPlan');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-4 right-4 w-80 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden z-40 transition-all hover:bg-[#2a2a2a]"
      >
        <div
          className={`p-4 ${!selectedMealPlan ? "bg-[#1e1e1e]" : "bg-[#2a2a2a]"}`}
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 
                className="text-lg font-medium text-white flex items-center cursor-pointer"
                onClick={() => {
                  const newSelected = !selectedMealPlan;
                  setSelectedMealPlan(newSelected);
                  onSelect?.(newSelected ? JSON.stringify(meals) : undefined);
                }}
              >
                <span>Meal Plan</span>
              </h3>
              
              <div className="flex gap-2">
                {meals.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearMealPlan();
                    }}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGenerator(true);
                  }}
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Generate
                </button>
              </div>
            </div>
            
            {selectedMealPlan && (
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full w-fit">
                  Selected
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="divide-y divide-[#333333]">
          {meals.length > 0 ? (
            <div className="overflow-y-auto max-h-96">
              {meals.map((meal, index) => (
                <div 
                  key={index} 
                  className="p-4 cursor-pointer hover:bg-[#333333]/50 transition-colors"
                  onClick={() => {
                    const newSelected = !selectedMealPlan;
                    setSelectedMealPlan(newSelected);
                    onSelect?.(newSelected ? JSON.stringify(meals) : undefined);
                  }}
                >
                  <h4 className="text-md font-medium text-[#e0e0e0] mb-2">
                    {meal.name}
                  </h4>
                  <ul className="space-y-1.5">
                    {meal.items.slice(0, 3).map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="text-[#8f8f8f] mr-2">•</span>
                        <span className="text-sm text-[#b0b0b0]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              {meals.length === 0 ? (
                <>
                  <div className="text-[#8f8f8f] mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-[#b0b0b0] mb-2">No meal plan generated yet</p>
                  <p className="text-sm text-[#8f8f8f] mb-4">Click the button above to create your personalized meal plan</p>
                </>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>

      <MealGenerator 
        isOpen={showGenerator} 
        onClose={() => setShowGenerator(false)}
        onMealGenerated={handleMealGenerated}
      />
    </>
  );
}
