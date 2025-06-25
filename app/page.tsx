"use client";

import { useState } from "react";
import { Paperclip, Mic } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { saveChat } from "./utils/chatStorage";
import type { Meal } from "./components/MealPlanCard";

const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const MealPlanCard = dynamic(() => import("./components/MealPlanCard"), {
  ssr: false,
});

export default function Home() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<Meal[] | null>(null);
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleMealPlanSelect = (mealPlanString?: string) => {
    if (mealPlanString) {
      const parsedMealPlan = JSON.parse(mealPlanString) as Meal[];
      setSelectedMealPlan(parsedMealPlan);
    } else {
      setSelectedMealPlan(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const chatId = crypto.randomUUID();
    saveChat({
      id: chatId,
      title: input.length > 30 ? `${input.substring(0, 30)}...` : input,
    });
    
    router.push(`/chat/${chatId}?message=${encodeURIComponent(input)}`);
  };
  
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative">
        <MealPlanCard onSelect={handleMealPlanSelect} />
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-medium text-center mb-8">
            What can I help you with?
          </h1>

          <div className="bg-[#303030] rounded-2xl p-6 shadow-lg">
            <AnimatePresence>
              {selectedMealPlan && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="text-sm text-white/80 bg-white/5 rounded-lg px-4 py-2 inline-flex items-center">
                    <span>Selected Meal Plan</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Anything"
                className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
              />

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <button type="button" className="text-gray-400 p-1" aria-label="Attach file">
                  <Paperclip size={20} />
                </button>

                <button type="button" className="text-gray-400 p-1" aria-label="Voice input">
                  <Mic size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
