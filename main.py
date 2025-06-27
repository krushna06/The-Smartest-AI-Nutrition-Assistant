import streamlit as st

st.set_page_config(
    page_title="AI Nutrition Assistant",
    page_icon="🍎",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
    <style>
        .main .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
            max-width: 95% !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
        }
        .stTextInput, .stTextArea, .stSelectbox, .stSlider, .stFileUploader {
            width: 100% !important;
        }
        .stButton>button {
            width: 100%;
        }
        .stChat {
            max-width: 100% !important;
        }
        .stChat > div {
            max-width: 100% !important;
        }
        section[data-testid="stSidebar"] {
            width: 300px !important;
        }
    </style>
""", unsafe_allow_html=True)

import os
import base64
import time
import io
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import json
from typing import List, Dict, Optional, Union
import requests
from datetime import datetime

OLLAMA_API_BASE = "http://localhost:11434/api"
DEFAULT_MODEL = "qwen2.5:0.5b"

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hello! I'm your AI Nutrition Assistant. How can I help you with your nutrition and diet today?",
        }
    ]

if "selected_model" not in st.session_state:
    st.session_state.selected_model = DEFAULT_MODEL

def transcribe_audio(audio_data):
    """Transcribe audio using Ollama's Whisper model"""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            tmp_file.write(audio_data.read())
            tmp_file_path = tmp_file.name
        
        with open(tmp_file_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
        
        os.unlink(tmp_file_path)
        
        response = requests.post(
            f"{OLLAMA_API_BASE}/transcribe",
            json={"model": "whisper", "audio": f"data:audio/wav;base64,{audio_base64}"}
        )
        
        if response.status_code == 200:
            return response.json().get("text", "")
        else:
            st.error(f"Error transcribing audio: {response.text}")
            return None
            
    except Exception as e:
        st.error(f"Error in transcribe_audio: {str(e)}")
        return None

def generate_response(messages, model: str = DEFAULT_MODEL, max_tokens: int = 4000):
    """Generate response using Ollama's API with configurable token limit"""
    try:
        prompt = ""
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt += f"SYSTEM: {content}\n\n"
            elif role == "user":
                prompt += f"USER: {content}\n\n"
            elif role == "assistant":
                prompt += f"ASSISTANT: {content}\n\n"
        
        prompt += "ASSISTANT: "
        
        response = requests.post(
            f"{OLLAMA_API_BASE}/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": max_tokens,
                    "repeat_last_n": 0,
                    "repeat_penalty": 1.1,
                    "top_k": 40,
                    "top_p": 0.9,
                    "tfs_z": 1.0,
                    "num_ctx": 4096,
                }
            },
            timeout=120
        )
        
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            st.error(f"Error from Ollama API: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        st.error("The request to Ollama API timed out. Please try again.")
        return None
    except Exception as e:
        st.error(f"Error in generate_response: {str(e)}")
        return None

def analyze_image(image_file):
    """Analyze food image using Ollama's vision capabilities"""
    try:
        image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
        
        response = requests.post(
            f"{OLLAMA_API_BASE}/generate",
            json={
                "model": "llava",
                "prompt": "Describe this food item in detail, including estimated calories and nutritional information:",
                "images": [image_base64],
                "stream": False
            }
        )
        
        if response.status_code == 200:
            return response.json().get("response", "I couldn't analyze the image.")
        else:
            return f"Error analyzing image: {response.text}"
            
    except Exception as e:
        return f"Error in analyze_image: {str(e)}"

with st.sidebar:
    st.title("🍎 AI Nutrition Assistant")
    
    available_models = ["qwen2.5:0.5b"]
    
    if "selected_model" not in st.session_state or st.session_state.selected_model not in available_models:
        st.session_state.selected_model = DEFAULT_MODEL
    
    selected_model = st.selectbox(
        "Select Model",
        available_models,
        index=available_models.index(st.session_state.selected_model),
        key="model_selector"
    )
    
    st.session_state.selected_model = selected_model
    
    st.markdown("---")
    
    if st.button("🎤 Start Voice Input"):
        st.session_state.recording = True
        st.session_state.audio_data = None
        
    if st.session_state.get("recording"):
        with st.spinner("Listening... (Click to stop)"):
            r = sr.Recognizer()
            with sr.Microphone() as source:
                audio = r.listen(source)
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
                    f.write(audio.get_wav_data())
                    audio_path = f.name
                
                audio_segment = AudioSegment.from_wav(audio_path)
                audio_bytes = io.BytesIO()
                audio_segment.export(audio_bytes, format="wav")
                st.session_state.audio_data = audio_bytes.getvalue()
                os.unlink(audio_path)  
                
        st.session_state.recording = False
        
        if st.session_state.audio_data:
            with st.spinner("Transcribing..."):
                audio_bytes = io.BytesIO(st.session_state.audio_data)
                transcription = transcribe_audio(audio_bytes)
                
                if transcription:
                    st.session_state.messages.append({"role": "user", "content": transcription})
                    st.session_state.audio_data = None  
                    st.rerun()
    
    st.markdown("---")
    
    uploaded_file = st.file_uploader("Upload Food Image", type=["jpg", "jpeg", "png"])
    if uploaded_file is not None:
        with st.spinner("Analyzing image..."):
            st.image(uploaded_file, caption="Uploaded Food Image", use_column_width=True)
            
            analysis = analyze_image(uploaded_file)
            
            st.session_state.messages.append({
                "role": "user", 
                "content": f"[Image analysis request] {analysis}"
            })
            st.rerun()
    
    st.markdown("---")
    st.markdown("### About")
    st.markdown("This is an AI Nutrition Assistant that helps you with your diet and nutrition.")

st.title("🍎 AI Nutrition Assistant")

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Ask me anything about nutrition..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    with st.chat_message("user"):
        st.markdown(prompt)
    
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        model = st.session_state.get("selected_model", DEFAULT_MODEL)
        
        response = generate_response(
            [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages],
            model=model
        )
        
        if response:
            for chunk in response.split():
                full_response += chunk + " "
                time.sleep(0.05)
                message_placeholder.markdown(full_response + "▌")
            
            message_placeholder.markdown(full_response)
            
            st.session_state.messages.append({"role": "assistant", "content": full_response})
        else:
            st.error("Failed to generate response. Please try again.")

st.markdown("---")
st.subheader("🍽️ Generate a Personalized Meal Plan")

with st.expander("Customize Your Meal Plan"):
    col1, col2 = st.columns(2)
    with col1:
        dietary_preferences = st.multiselect(
            "Dietary Preferences",
            ["Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Low-Carb", "Gluten-Free"],
            key="diet_prefs"
        )
        calories = st.slider("Daily Calorie Target", 1200, 3000, 2000)
    with col2:
        allergies = st.multiselect(
            "Allergies/Intolerances",
            ["Peanuts", "Tree Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Fish"]
        )
        meals_per_day = st.slider("Meals per Day", 3, 6, 3)

if st.button("Generate Meal Plan"):
    with st.spinner("Creating a personalized meal plan..."):
        model = st.session_state.get("selected_model", DEFAULT_MODEL)
        
        meal_plan_prompt = f"""
        Create a CONCISE meal plan with these requirements:
        - Target calories: {calories} kcal
        - Meals per day: {meals_per_day}
        - Dietary preferences: {', '.join(dietary_preferences) if dietary_preferences else 'None'}
        - Allergies/Intolerances: {', '.join(allergies) if allergies else 'None'}

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
        
        Here's an example of the EXACT format to follow:
        
        BREAKFAST
        • 1/2 cup Oatmeal with 1/2 cup Mixed berries
        • 150g Greek yogurt with 1 tbsp Honey
        • 1 Boiled egg
        
        LUNCH
        • 150g Grilled chicken breast with 1/2 cup Quinoa
        • 1 cup Steamed broccoli with 1 tsp Olive oil
        • 1 Small apple
        
        DINNER
        • 200g Baked salmon with 1/2 cup Wild rice
        • 1 cup Roasted asparagus with 1 tsp Olive oil
        • 1/2 cup Steamed green beans
        
        Now, create a meal plan following these EXACT specifications:
        """
        
        meal_plan_messages = [
            {
                "role": "system",
                "content": """You are a professional nutritionist with expertise in creating detailed, personalized meal plans. 
                Your responses should be clear, well-structured, and follow the exact format specified by the user. 
                Always provide specific quantities and be precise with measurements. 
                Ensure the meals are nutritionally balanced and appropriate for the user's dietary needs."""
            },
            {"role": "user", "content": meal_plan_prompt}
        ]
        
        with st.spinner("Generating your personalized meal plan (this may take a minute)..."):
            meal_plan = generate_response(meal_plan_messages, model, max_tokens=4000)
        
        if meal_plan:
            st.subheader("🍽️ Your Personalized Meal Plan")
            st.markdown("---")
            
            sections = meal_plan.split('\n\n')
            
            for section in sections:
                if section.strip() == '':
                    continue
                    
                if section.upper() in ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'SNACK']:
                    st.markdown(f"### {section.upper()}")
                else:
                    lines = section.split('\n')
                    for line in lines:
                        if line.strip() == '':
                            st.write('')
                        elif line.strip().startswith('•'):
                            st.markdown(f"- {line[1:].strip()}")
                        elif ':' in line and len(line.split(':')) > 1 and len(line.split(':')[0]) < 30:  # Likely a label
                            parts = line.split(':', 1)
                            st.markdown(f"**{parts[0].strip()}:** {parts[1].strip()}")
                        else:
                            st.write(line.strip())
            
            st.session_state.messages.append({"role": "assistant", "content": f"Here's your personalized meal plan:\n\n{meal_plan}"})
            
            st.download_button(
                label="📥 Download Meal Plan",
                data=meal_plan,
                file_name=f"meal_plan_{datetime.now().strftime('%Y%m%d')}.txt",
                mime="text/plain"
            )
        else:
            st.error("Failed to generate meal plan. Please try again.")

st.markdown("<br><br>", unsafe_allow_html=True)
