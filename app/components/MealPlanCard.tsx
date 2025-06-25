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
  const [meals, setMeals] = useState<Meal[]>([]);

  const handleMealGenerated = (newMeals: Meal[]) => {
    if (newMeals && newMeals.length > 0) {
      setMeals(newMeals);
      // setSelectedMealPlan(true);
      // onSelect?.(JSON.stringify(newMeals));
    }
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
              {selectedMealPlan && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                  Selected
                </span>
              )}
            </h3>
            
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
        <div className="divide-y divide-[#333333]">
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <div 
                key={index} 
                className="p-4 cursor-pointer"
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
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="text-[#8f8f8f] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-[#b0b0b0] mb-2">No meal plan generated yet</p>
              <p className="text-sm text-[#8f8f8f] mb-4">Click the button above to create your personalized meal plan</p>
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
