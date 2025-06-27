import streamlit as st
from datetime import datetime
from typing import Dict, List, Optional
from config import settings
from services.ai_service import AIService

class MealPlanner:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
        self.config = settings.DEFAULT_MEAL_PLAN_CONFIG

    def render(self):
        """Render the meal planner section"""
        st.markdown("---")
        st.subheader("🍽️ Generate a Personalized Meal Plan")
        
        with st.expander("Customize Your Meal Plan"):
            self._render_meal_plan_form()
        
        if st.button("Generate Meal Plan"):
            self._generate_meal_plan()

    def _render_meal_plan_form(self):
        """Render the meal plan customization form"""
        col1, col2 = st.columns(2)
        
        with col1:
            self.age = st.number_input("Age", min_value=1, max_value=120, value=30, step=1)
            self.gender = st.selectbox("Gender", ["Male", "Female", "Other"])
            self.weight = st.number_input("Weight (kg)", min_value=20, max_value=300, value=70, step=1)
            
        with col2:
            self.height = st.number_input("Height (cm)", min_value=100, max_value=250, value=170, step=1)
            self.goal = st.selectbox("Goal", ["Lose Weight", "Maintain Weight", "Gain Weight"])
            self.activity_level = st.select_slider(
                "Activity Level",
                options=["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"]
            )
            
        st.markdown("---")
        st.subheader("Dietary Preferences")
        
        col3, col4 = st.columns(2)
        with col3:
            self.dietary_prefs = st.multiselect(
                "Dietary Preferences",
                ["Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Low-Carb", "Gluten-Free"],
                key="diet_prefs"
            )
            self.calories = st.slider(
                "Daily Calorie Target", 
                self.config["min_calories"], 
                self.config["max_calories"], 
                self.config["default_calories"]
            )
            
        with col4:
            self.allergies = st.multiselect(
                "Allergies/Intolerances",
                ["Peanuts", "Tree Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Fish"]
            )

    def _generate_meal_plan(self):
        """Generate and display a personalized meal plan"""
        with st.spinner("Creating a personalized meal plan..."):
            model = st.session_state.get("selected_model", settings.DEFAULT_MODEL)
            
            meal_plan_prompt = self._build_meal_plan_prompt()
            
            meal_plan_messages = [
                {
                    "role": "system",
                    "content": """You are a professional nutritionist with expertise in creating detailed, 
                    personalized meal plans. Your responses should be clear, well-structured, and follow the exact 
                    format specified by the user. Always provide specific quantities and be precise with measurements. 
                    Ensure the meals are nutritionally balanced and appropriate for the user's dietary needs."""
                },
                {"role": "user", "content": meal_plan_prompt}
            ]
            
            with st.spinner("Generating your personalized meal plan (this may take a minute)..."):
                meal_plan = self.ai_service.generate_response(
                    meal_plan_messages, 
                    model=model, 
                    max_tokens=4000
                )
            
            if meal_plan:
                self._display_meal_plan(meal_plan)
            else:
                st.error("Failed to generate meal plan. Please try again.")

    def _build_meal_plan_prompt(self) -> str:
        """Build the prompt for generating a meal plan"""
        return f"""
        Create a CONCISE meal plan with these requirements:
        - Age: {self.age}
        - Gender: {self.gender}
        - Weight: {self.weight} kg
        - Height: {self.height} cm
        - Goal: {self.goal}
        - Activity Level: {self.activity_level}
        - Target calories: {self.calories} kcal
        - Dietary preferences: {', '.join(self.dietary_prefs) if self.dietary_prefs else 'None'}
        - Allergies/Intolerances: {', '.join(self.allergies) if self.allergies else 'None'}

        RESPONSE FORMAT RULES:
        1. Use ONLY this format (NO additional text or explanations):
           
           BREAKFAST
           • [Food 1 with quantity]
           • [Food 2 with quantity]
           • [Food 3 with quantity]
           
           LUNCH
           • [Food 1 with quantity]
           • [Food 2 with quantity]
           • [Food 3 with quantity]
           
           DINNER
           • [Food 1 with quantity]
           • [Food 2 with quantity]
           • [Food 3 with quantity]
        
        2. Be SPECIFIC with quantities and preparation methods
        3. Keep each food item to ONE line only
        4. DO NOT include any other text, explanations, or summaries
        5. DO NOT include calories or nutritional information in the response
        
        Now, create a meal plan following these EXACT specifications:
        """

    def _display_meal_plan(self, meal_plan: str):
        """Display the generated meal plan"""
        st.subheader("🍽️ Your Personalized Meal Plan")
        st.markdown("---")
        
        sections = meal_plan.split('\n\n')
        
        for section in sections:
            if not section.strip():
                continue
                
            if section.upper() in ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'SNACK']:
                st.markdown(f"### {section.upper()}")
            else:
                lines = section.split('\n')
                for line in lines:
                    if not line.strip():
                        st.write('')
                    elif line.strip().startswith('•'):
                        st.markdown(f"- {line[1:].strip()}")
                    elif ':' in line and len(line.split(':')) > 1 and len(line.split(':')[0]) < 30:
                        parts = line.split(':', 1)
                        st.markdown(f"**{parts[0].strip()}:** {parts[1].strip()}")
                    else:
                        st.write(line.strip())
        
        st.session_state.messages.append({
            "role": "assistant", 
            "content": f"Here's your personalized meal plan:\n\n{meal_plan}"
        })
        
        st.download_button(
            label="📥 Download Meal Plan",
            data=meal_plan,
            file_name=f"meal_plan_{datetime.now().strftime('%Y%m%d')}.txt",
            mime="text/plain"
        )
