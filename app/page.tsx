"use client";

import { useState } from "react";
import { Paperclip, Mic } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { Meal } from "./components/MealPlanCard";

const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const MealPlanCard = dynamic(() => import("./components/MealPlanCard"), {
  ssr: false,
});

export default function Home() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<Meal[] | null>(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [formValue, setFormValue] = useState("");

  const handleOpenMealPlanModal = () => setShowMealPlanModal(true);

  const handleModalClose = () => {
    setShowMealPlanModal(false);
    setFormValue("");
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedMealPlan([
      {
        name: "Breakfast",
        items: [
          "Oatmeal with berries and nuts",
          "Greek yogurt with honey",
          "Green smoothie",
        ],
      },
      {
        name: "Lunch",
        items: [
          "Grilled chicken salad",
          "Quinoa and roasted vegetables",
          "Fruit for dessert",
        ],
      },
      {
        name: "Dinner",
        items: [
          "Baked salmon with sweet potato",
          "Steamed broccoli",
          "Mixed green salad",
        ],
      },
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
            <div className="relative">
              <input
                type="text"
                placeholder="Ask Anything"
                className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
              />

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <button className="text-gray-400 p-1" aria-label="Attach file">
                  <Paperclip size={20} />
                </button>

                <button className="text-gray-400 p-1" aria-label="Voice input">
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
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
                mass: 0.8,
              }}
              className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-[#333333] flex flex-col"
              style={{ borderWidth: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={handleModalSubmit}
                className="flex flex-col px-8 py-8 bg-[#1a1a1a]"
              >
                <label className="text-[#e0e0e0] mb-2 text-base font-medium">
                  Additional Info
                </label>
                <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Section 1: Additional Info */}
                  <div className="rounded-xl bg-[#23232b] border border-[#2a2a2a] shadow-sm p-4 mb-2">
                    <div className="font-semibold text-[#c4b5fd] text-base mb-2 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#a78bfa] rounded-full inline-block"></span>
                      Additional Info
                    </div>
                    <div className="mb-4">
                      <label className="text-[#f3e8ff] mb-1 font-medium block">
                        Your Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        min="1"
                        max="120"
                        placeholder="Enter your age"
                        required
                        className="w-48 bg-[#181824] border border-[#333343] rounded px-3 py-2 text-[#e0e0e0] placeholder-[#8f8f8f] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition no-spinner"
                      />
                    </div>
                    <div>
                      <div className="text-[#f3e8ff] mb-1 font-medium">
                        Gender
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Male", "Female", "Other", "Prefer not to say"].map(
                          (gender) => (
                            <label
                              key={gender}
                              className="inline-flex items-center gap-2 text-[#e0e0e0] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#28283a] transition"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={gender}
                                className="accent-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]"
                                required={true}
                              />{" "}
                              {gender}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Section 2: Health Goals */}
                  <div className="rounded-xl bg-[#23232b] border border-[#2a2a2a] shadow-sm p-4 mb-2">
                    <div className="font-semibold text-[#c4b5fd] text-base mb-2 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#a78bfa] rounded-full inline-block"></span>
                      Health Goals
                    </div>
                    <div className="text-[#f3e8ff] mb-1 font-medium">
                      What is your primary health goal?{" "}
                      <span className="text-xs text-[#c4b5fd]">
                        (Select one or more)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Lose weight",
                        "Gain muscle",
                        "Improve overall fitness",
                        "Improve energy levels",
                        "Manage stress",
                        "Better sleep",
                        "Improve digestion",
                        "Maintain current health",
                      ].map((goal) => (
                        <label
                          key={goal}
                          className="inline-flex items-center gap-2 text-[#e0e0e0] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#28283a] transition"
                        >
                          <input
                            type="checkbox"
                            name="healthGoals"
                            value={goal}
                            className="accent-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]"
                          />{" "}
                          {goal}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Section 3: Medical Conditions */}
                  <div className="rounded-xl bg-[#23232b] border border-[#2a2a2a] shadow-sm p-4 mb-2">
                    <div className="font-semibold text-[#c4b5fd] text-base mb-2 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#a78bfa] rounded-full inline-block"></span>
                      Medical Conditions
                    </div>
                    <div className="text-[#f3e8ff] mb-1 font-medium">
                      Do you have any of the following medical conditions?{" "}
                      <span className="text-xs text-[#c4b5fd]">
                        (Select all that apply)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Diabetes (Type 1 or Type 2)",
                        "High blood pressure (Hypertension)",
                        "High cholesterol",
                        "PCOS/PCOD",
                        "Thyroid disorder (Hyper/Hypo)",
                        "Heart disease",
                        "Food allergies or intolerances (specify below)",
                        "Other (please specify)",
                        "None",
                      ].map((cond) => (
                        <label
                          key={cond}
                          className="inline-flex items-center gap-2 text-[#e0e0e0] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#28283a] transition"
                        >
                          <input
                            type="checkbox"
                            name="medicalConditions"
                            value={cond}
                            className="accent-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]"
                          />{" "}
                          {cond}
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="text-[#e0e0e0] text-sm font-medium">
                        If you have food allergies or intolerances, please
                        specify:
                      </label>
                      <input
                        type="text"
                        name="allergyDetails"
                        className="w-full bg-[#181824] border border-[#333343] rounded px-3 py-2 text-[#e0e0e0] placeholder-[#8f8f8f] mt-1 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition"
                        placeholder="List allergies or intolerances"
                      />
                    </div>
                  </div>
                  {/* Section 4: Activity Level & Lifestyle */}
                  <div className="rounded-xl bg-[#23232b] border border-[#2a2a2a] shadow-sm p-4 mb-2">
                    <div className="font-semibold text-[#c4b5fd] text-base mb-2 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#a78bfa] rounded-full inline-block"></span>
                      Activity Level & Lifestyle
                    </div>
                    <div className="text-[#f3e8ff] mb-1 font-medium">
                      What best describes your daily activity level?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Sedentary (little or no exercise)",
                        "Lightly active (light exercise 1–3 days/week)",
                        "Moderately active (moderate exercise 3–5 days/week)",
                        "Very active (hard exercise 6–7 days/week)",
                        "Extra active (physical job or athlete)",
                      ].map((activity) => (
                        <label
                          key={activity}
                          className="inline-flex items-center gap-2 text-[#e0e0e0] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#28283a] transition"
                        >
                          <input
                            type="radio"
                            name="activityLevel"
                            value={activity}
                            className="accent-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]"
                            required={true}
                          />{" "}
                          {activity}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Section 5: Food Preferences / Diet Type */}
                  <div className="rounded-xl bg-[#23232b] border border-[#2a2a2a] shadow-sm p-4">
                    <div className="font-semibold text-[#c4b5fd] text-base mb-2 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#a78bfa] rounded-full inline-block"></span>
                      Food Preferences / Diet Type
                    </div>
                    <div className="text-[#f3e8ff] mb-1 font-medium">
                      Do you follow or prefer any specific diet type?{" "}
                      <span className="text-xs text-[#c4b5fd]">
                        (Select all that apply)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Vegetarian",
                        "Vegan",
                        "Non-vegetarian",
                        "Halal",
                        "Jain",
                        "No preference",
                      ].map((diet) => (
                        <label
                          key={diet}
                          className="inline-flex items-center gap-2 text-[#e0e0e0] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#28283a] transition"
                        >
                          <input
                            type="checkbox"
                            name="dietType"
                            value={diet}
                            className="accent-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]"
                          />{" "}
                          {diet}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 bg-[#232323] text-[#e0e0e0] rounded hover:bg-[#2a2a2a] border border-[#333333]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#232323] text-[#e0e0e0] rounded hover:bg-[#2a2a2a] border border-[#333333]"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
