import { Utensils, Flame, Egg, Carrot } from "lucide-react";

type Meal = {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealPlanProps = {
  meals: Meal[];
};

export function MealPlan({ meals }: MealPlanProps) {
  if (!meals || meals.length === 0) return null;
  
  return (
    <div className="mb-6 p-6 bg-[#2a2a2a] rounded-xl shadow-lg border border-[#3a3a3a]">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <Utensils className="w-5 h-5 mr-2 text-green-400" />
        Your Meal Plan
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {meals.map((meal, index) => (
          <div key={index} className="bg-[#333] p-4 rounded-lg hover:bg-[#3a3a3a] transition-colors">
            <h4 className="font-medium text-teal-400 mb-2">
              {meal.name}
            </h4>
            <p className="text-sm text-gray-300 mb-3">{meal.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div className="flex items-center">
                <Flame className="w-3 h-3 mr-2 text-red-400" />
                <span className="text-white">{meal.calories} cal</span>
              </div>
              <div className="flex items-center">
                <Egg className="w-3 h-3 mr-2 text-blue-400" />
                <span className="text-white">{meal.protein}g protein</span>
              </div>
              <div className="flex items-center">
                <Carrot className="w-3 h-3 mr-2 text-yellow-400" />
                <span className="text-white">{meal.carbs}g carbs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-yellow-400"></div>
                <span className="text-white">{meal.fat}g fat</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
