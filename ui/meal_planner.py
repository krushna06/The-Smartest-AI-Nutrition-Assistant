import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
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

    def _parse_meal_plan(self, meal_plan: str) -> Dict[str, List[str]]:
        """Parse the meal plan text into a structured dictionary"""
        parsed_meals = {}
        current_meal = None
        
        for line in meal_plan.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            line_upper = line.upper()
            if any(meal in line_upper for meal in ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']):
                meal_name = line.split(':')[0].strip() if ':' in line else line
                current_meal = meal_name.upper()
                parsed_meals[current_meal] = []
            elif current_meal and (line.startswith('•') or line.startswith('-')):
                item = line[1:].strip() if line.startswith('•') else line[1:].strip()
                if item:
                    parsed_meals[current_meal].append(item)
                
        return parsed_meals
    
    def _extract_calories_from_response(self, response: str) -> Dict[str, int]:
        """Extract calorie information from the AI response"""
        calories = {}
        for line in response.split('\n'):
            line = line.strip()
            if ':' in line:
                meal_part, cal_part = line.split(':', 1)
                meal = meal_part.strip().upper()
                if 'calories' in cal_part.lower():
                    try:
                        cal_value = int(''.join(filter(str.isdigit, cal_part)))
                        calories[meal] = cal_value
                    except (ValueError, IndexError):
                        continue
        return calories
    
    def _generate_nutrition_data(self, meal_plan: Dict[str, List[str]]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Generate nutrition data by querying Ollama for calorie information"""
        if not meal_plan:
            st.warning("No meal plan data available for analysis.")
            return pd.DataFrame(), pd.DataFrame()
        meal_plan_text = '\n'.join(
            f"{meal}:\n" + '\n'.join(f"- {item}" for item in items)
            for meal, items in meal_plan.items()
        )
        
        prompt = f"""{meal_plan_text}
        
        Analyze the above meal plan and provide the estimated calories for each meal time in the exact format below:
        
        Breakfast: X calories
        Lunch: X calories
        Dinner: X calories
        
        Only respond with the calorie information in the exact format above, with one meal per line.
        """
        
        try:
            model = st.session_state.get("selected_model", settings.DEFAULT_MODEL)
            response = self.ai_service.generate_response(
                [{"role": "user", "content": prompt}],
                model=model,
                max_tokens=200
            )
        except Exception as e:
            st.error("Error analyzing meal nutrition. Please try again.")
            response = None
        
        meal_calories = self._extract_calories_from_response(response or '')
        
        default_calories = {
            'BREAKFAST': 500,
            'LUNCH': 700,
            'DINNER': 600,
            'SNACKS': 200
        }
        
        calories_data = {}
        for meal in ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']:
            calories = meal_calories.get(meal, default_calories.get(meal, 0))
            calories_data[meal] = {
                'calories': calories,
                'carbs': int(calories * 0.4 / 4),
                'protein': int(calories * 0.3 / 4),
                'fat': int(calories * 0.3 / 9)
            }
        
        macros = []
        for meal, data in calories_data.items():
            if meal in meal_plan:
                macros.extend([
                    {'meal': meal, 'nutrient': 'Carbs', 'value': data['carbs']},
                    {'meal': meal, 'nutrient': 'Protein', 'value': data['protein']},
                    {'meal': meal, 'nutrient': 'Fat', 'value': data['fat']}
                ])
        
        meals = []
        for meal, items in meal_plan.items():
            if meal in calories_data:
                meals.append({
                    'Meal': meal,
                    'Calories': calories_data[meal]['calories'],
                    'Color': '#636EFA' if meal == 'BREAKFAST' else 
                            '#EF553B' if meal == 'LUNCH' else 
                            '#00CC96' if meal == 'DINNER' else '#AB63FA'
                })
        
        return pd.DataFrame(macros), pd.DataFrame(meals)
    
    def _display_visualizations(self, meal_plan: Dict[str, List[str]]):
        """Display data visualizations for the meal plan"""
        st.markdown("---")
        st.subheader("📊 Nutrition Insights")
        
        with st.spinner("Analyzing meal nutrition..."):
            try:
                macros_df, meals_df = self._generate_nutrition_data(meal_plan)
                
                if macros_df.empty or meals_df.empty:
                    st.warning("Unable to generate nutrition data for this meal plan.")
                    return
                
                st.markdown("##### Nutrition Summary")
                
                summary_data = []
                for meal in ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']:
                    if meal in [m.upper() for m in meal_plan.keys()]:
                        meal_data = macros_df[macros_df['meal'] == meal]
                        if not meal_data.empty:
                            carbs = int(meal_data[meal_data['nutrient'] == 'Carbs']['value'].sum())
                            protein = int(meal_data[meal_data['nutrient'] == 'Protein']['value'].sum())
                            fat = int(meal_data[meal_data['nutrient'] == 'Fat']['value'].sum())
                            calories = int(meals_df[meals_df['Meal'] == meal]['Calories'].sum())
                            
                            summary_data.append({
                                'Meal': meal.title(),
                                'Calories': f"{calories} kcal",
                                'Carbs': f"{carbs}g",
                                'Protein': f"{protein}g",
                                'Fat': f"{fat}g"
                            })
                
                if summary_data:
                    st.table(summary_data)
                    st.write("")
                
            except Exception as e:
                st.error("Error analyzing meal nutrition. Please try again.")
                return
            st.markdown("##### Macro-nutrient Distribution")
            fig_macros = px.pie(
                macros_df.groupby('nutrient')['value'].sum().reset_index(),
                values='value',
                names='nutrient',
                color='nutrient',
                color_discrete_map={
                    'Carbs': '#636EFA',
                    'Protein': '#EF553B',
                    'Fat': '#00CC96'
                },
                hole=0.4
            )
            fig_macros.update_traces(textposition='inside', textinfo='percent+label')
            fig_macros.update_layout(showlegend=False, height=300, margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_macros, use_container_width=True)
            
            st.markdown("##### Calorie Distribution by Meal")
            fig_meals = px.bar(
                meals_df,
                x='Meal',
                y='Calories',
                color='Meal',
                color_discrete_map={
                    'BREAKFAST': '#636EFA',
                    'LUNCH': '#EF553B',
                    'DINNER': '#00CC96',
                    'SNACKS': '#AB63FA'
                },
                text_auto=True
            )
            fig_meals.update_layout(
                xaxis_title="",
                yaxis_title="Calories",
                showlegend=False,
                height=400,
                margin=dict(t=30, b=0, l=0, r=0)
            )
            st.plotly_chart(fig_meals, use_container_width=True)
    
    def _display_meal_plan(self, meal_plan: str):
        """Display the generated meal plan with visualizations"""
        st.subheader("🍽️ Your Personalized Meal Plan")
        st.markdown("---")
        
        parsed_meals = self._parse_meal_plan(meal_plan)
        
        if not parsed_meals or all(not items for items in parsed_meals.values()):
            parsed_meals = self._extract_meals_from_text(meal_plan)
        
        if parsed_meals and any(items for items in parsed_meals.values()):
            for meal, items in parsed_meals.items():
                if items:
                    st.markdown(f"### {meal.title()}")
                    for item in items:
                        st.markdown(f"- {item}")
                    st.write("")
            
            self._display_visualizations(parsed_meals)
        else:
            st.warning("Here's your meal plan:")
            st.text(meal_plan)
    
    def _extract_meals_from_text(self, text: str) -> Dict[str, List[str]]:
        """Fallback method to extract meals from unstructured text"""
        parsed_meals = {}
        current_meal = None
        
        meal_indicators = {
            'breakfast': 'BREAKFAST',
            'lunch': 'LUNCH',
            'dinner': 'DINNER',
            'snack': 'SNACKS',
            'meal': 'MEAL'
        }
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        for line in lines:
            line_lower = line.lower()
            
            found_meal = False
            for indicator, meal_name in meal_indicators.items():
                if indicator in line_lower and len(line) < 30:
                    current_meal = meal_name
                    parsed_meals[current_meal] = []
                    found_meal = True
                    break
            
            if not found_meal and current_meal and len(line) > 3:
                item = line.strip('•- ').split(':', 1)[0].strip()
                if item and item.lower() not in meal_indicators:
                    parsed_meals[current_meal].append(item)
        
        return parsed_meals
        
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
