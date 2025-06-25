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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

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
    if (!input.trim() && !selectedFile) return;
    
    const chatId = crypto.randomUUID();
    let chatTitle = '';
    
    if (selectedFile) {
      chatTitle = `Image: ${selectedFile.name}`;
    } else if (input) {
      chatTitle = input.length > 30 ? `${input.substring(0, 30)}...` : input;
    } else {
      chatTitle = 'New Chat';
    }
    
    const formattedMealPlan = selectedMealPlan ? {
      id: `mealplan-${Date.now()}`,
      meals: selectedMealPlan.map(meal => ({
        name: meal.name,
        description: meal.items.join(', '),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }))
    } : undefined;
    
    saveChat({
      id: chatId,
      title: chatTitle,
      mealPlan: formattedMealPlan,
    });
    
    const params = new URLSearchParams({
      message: input || `[Image: ${selectedFile?.name || ''}]`,
      ...(selectedMealPlan && { 
        mealPlan: JSON.stringify(selectedMealPlan) 
      })
    });
    
    router.push(`/chat/${chatId}?${params.toString()}`);
    
    // Clean up
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
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
              {selectedFile && (
                <div className="mb-3">
                  <div className="group inline-flex items-center">
                    <div className="inline-flex items-center bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm max-w-full hover:border-[#4a4a4a] transition-colors relative">
                      <span className="text-gray-300 truncate">📎 {selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="ml-2 text-gray-400 hover:text-white flex-shrink-0"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                      {previewUrl && (
                        <div className="absolute bottom-full left-0 mb-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                          <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-1 shadow-xl transform transition-all duration-200 ease-out scale-95 group-hover:scale-100">
                            <div className="relative">
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-40 h-40 object-cover rounded-md"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedFile ? "Add a message (optional)" : "Ask Anything"}
                  className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-gray-300 p-1 transition-colors"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      aria-label="Attach file"
                    >
                      <Paperclip size={20} />
                    </button>
                  </div>

                  <button type="button" className="text-gray-400 hover:text-gray-300 p-1 transition-colors" aria-label="Voice input">
                    <Mic size={20} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
