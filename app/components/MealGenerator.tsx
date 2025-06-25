"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveMealPlanToChat } from "@/app/utils/chatStorage";
import { usePathname } from "next/navigation";

export type Meal = {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
};

interface MealGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onMealGenerated: (meals: Meal[]) => void;
}

export default function MealGenerator({ isOpen, onClose, onMealGenerated }: MealGeneratorProps) {
  const pathname = usePathname();
  const chatId = pathname.split('/').pop() || '';
  
  const [nutritionInfo, setNutritionInfo] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    goal: 'weight_loss',
    activityLevel: 'moderate',
    dietaryRestrictions: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setNutritionInfo({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });

    try {
      const prompt = `You are a nutrition expert. Create a personalized meal plan based on these details:
- Age: ${formData.age}
- Gender: ${formData.gender}
- Weight: ${formData.weight} kg
- Height: ${formData.height} cm
- Goal: ${formData.goal}
- Activity Level: ${formData.activityLevel}
- Dietary Restrictions: ${formData.dietaryRestrictions || 'None'}

IMPORTANT: Please provide a meal plan with Breakfast, Lunch, and Dinner. For EACH meal, include EXACTLY 3 food items.

Format your response like this:

Breakfast
• Item 1
• Item 2
• Item 3

Lunch
• Item 1
• Item 2
• Item 3

Dinner
• Item 1
• Item 2
• Item 3`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:0.5b',
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      
      const responseText = data.response || '';
      console.log('Raw response from Ollama:', responseText);
      
      const meals: Meal[] = [];
      const lines = responseText.split('\n').map((line: string) => line.trim()).filter(Boolean);
      
      const nutritionMatch = responseText.match(/Calories: (\d+).*?Protein: (\d+)g.*?Carbs: (\d+)g.*?Fat: (\d+)g/i);
      if (nutritionMatch) {
        setNutritionInfo({
          calories: parseInt(nutritionMatch[1]) || 0,
          protein: parseInt(nutritionMatch[2]) || 0,
          carbs: parseInt(nutritionMatch[3]) || 0,
          fat: parseInt(nutritionMatch[4]) || 0
        });
      }
      
      const tableRegex = /\|.*\|/g;
      if (responseText.match(tableRegex)) {
        console.log('Detected markdown table format');
        
        const defaultMeal: Meal = {
          name: '',
          items: [],
          description: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
        let currentMeal: Meal = { ...defaultMeal };
        
        for (const line of lines) {
          if (line.startsWith('|--') || line.startsWith('| Meal') || line === '|') continue;
          
          const mealMatch = line.match(/\|\s*\*\*(.*?)\*\*\s*\|/);
          if (mealMatch) {
            if (currentMeal && currentMeal.items.length > 0) {
              meals.push(currentMeal);
            }
            currentMeal = {
              name: mealMatch[1],
              items: [],
              description: '',
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            };
            
            const itemMatch = line.match(/\|\s*\*\*.*?\*\*\s*\|\s*(.*?)\s*\|/);
            if (itemMatch && itemMatch[1]) {
              const items = itemMatch[1].split(/<br>|,|\|/)
                .map((item: string) => item.trim())
                .filter((item: string) => item && !item.includes('---') && !item.includes('Meal') && !item.includes('Food Type'));
              
              currentMeal.items = [...new Set([...currentMeal.items, ...items])].slice(0, 3);
            }
          } else if (currentMeal) {
            const items = line.split('|')
              .map((part: string) => part.trim())
              .filter((part: string) => part && part !== '•' && !part.includes('---') && !part.includes('Meal') && !part.includes('Food Type'));
              
            items.forEach((item: string) => {
              const subItems = item.split(/<br>|,|•/)
                .map((subItem: string) => subItem.trim())
                .filter((subItem: string) => subItem);
                
currentMeal.items = [...new Set([...currentMeal.items, ...subItems])].slice(0, 3);
              currentMeal.description = currentMeal.items.join(', ');
            });
          }
        }
        
        if (currentMeal.name.trim()) {
          meals.push(currentMeal);
        }
      } else {
        console.log('Using line-based parsing');
        
      const defaultMeals: Meal[] = [
          {
            name: 'Breakfast',
            items: [],
            description: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          },
          {
            name: 'Lunch',
            items: [],
            description: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          },
          {
            name: 'Dinner',
            items: [],
            description: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        ];
        
        let currentMealIndex = -1;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          const mealMatch = trimmed.match(/\*\*(.*?)\*\*/) || trimmed.match(/^(Breakfast|Lunch|Dinner|Snack|Dessert)/i);
          if (mealMatch) {
            const mealName = mealMatch[1] || mealMatch[0];
            const foundIndex = defaultMeals.findIndex(m => 
              m.name.toLowerCase() === mealName.toLowerCase() ||
              mealName.toLowerCase().includes(m.name.toLowerCase())
            );
            currentMealIndex = foundIndex >= 0 ? foundIndex : -1;
          } else if (currentMealIndex >= 0 && defaultMeals[currentMealIndex].items.length < 3) {
            const item = line
              .replace(/^[•-]\s*/, '')
              .replace(/^\d+[.)]?\s*/, '')
              .replace(/\|/g, '')
              .trim();
              
            if (item && !item.match(/^[-=*_]+$/)) {
              const subItems = item.split(/<br>|,|•/)
                .map((part: string) => part.trim())
                .filter((part: string) => part);
                
              defaultMeals[currentMealIndex].items = [
                ...defaultMeals[currentMealIndex].items,
                ...subItems
              ].slice(0, 3);
            }
          }
        }
        
        meals.push(...defaultMeals.filter(meal => meal.items.length > 0));
      }
      
      console.log('Parsed meals:', meals);
      
      if (meals.length === 0) {
        meals.push(
          { name: 'Breakfast', items: ['Oatmeal with berries', 'Greek yogurt', 'Green smoothie'], description: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Lunch', items: ['Grilled chicken salad', 'Quinoa', 'Fruit'], description: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Dinner', items: ['Baked salmon', 'Steamed vegetables', 'Mixed salad'], description: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
      }

      const enhancedMeals = meals.map((meal, index) => ({
        ...meal,
        description: meal.items.join(', '),
        calories: Math.round(nutritionInfo.calories / meals.length),
        protein: Math.round(nutritionInfo.protein / meals.length),
        carbs: Math.round(nutritionInfo.carbs / meals.length),
        fat: Math.round(nutritionInfo.fat / meals.length)
      }));
      
      onMealGenerated(enhancedMeals);
      
      if (chatId) {
        const mealPlan = {
          meals: enhancedMeals.map(meal => ({
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
          }))
        };
        
        await saveMealPlanToChat(chatId, mealPlan);
      }
      onClose();
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 400,
            mass: 0.8,
          }}
          className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-[#333333] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Generate Meal Plan</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="30"
                    max="300"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="100"
                    max="250"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="improve_health">Improve Health</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (hard exercise daily)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dietary Restrictions (optional)</label>
                <textarea
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                  placeholder="E.g., Vegetarian, Gluten-free, Nut allergies, etc."
                  className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Generating...' : 'Generate Meal Plan'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
