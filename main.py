import streamlit as st
from config import settings
from services.ai_service import AIService
from services.audio_service import AudioService
from services.image_service import ImageService
from ui.sidebar import Sidebar
from ui.chat_interface import ChatInterface
from ui.meal_planner import MealPlanner
from utils.helpers import init_session_state
import threading
from flask import Flask, request, redirect
import requests as pyrequests
import os
import json

flask_app = Flask(__name__)

google_fit_tokens = {}

@flask_app.route('/oauth2callback')
def oauth2callback():
    code = request.args.get('code')
    if not code:
        return 'No code provided', 400
    token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'code': code,
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'redirect_uri': settings.GOOGLE_FIT_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    resp = pyrequests.post(token_url, data=data)
    if resp.status_code == 200:
        tokens = resp.json()
        with open('google_fit_tokens.json', 'w') as f:
            json.dump(tokens, f)
        return redirect('http://localhost:8501')
    else:
        return f'Failed to get tokens: {resp.text}', 400

def run_flask():
    flask_app.run(port=5000)

def setup_page():
    """Set up the Streamlit page configuration"""
    st.set_page_config(**settings.PAGE_CONFIG)
    
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

def main():
    """Main application entry point"""
    setup_page()
    
    init_session_state()
    
    ai_service = AIService()
    audio_service = AudioService()
    image_service = ImageService()
    
    sidebar = Sidebar(ai_service, audio_service, image_service)
    chat_interface = ChatInterface(ai_service)
    meal_planner = MealPlanner(ai_service)
    
    sidebar.render()
    
    chat_interface.render()
    
    meal_planner.render()

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    main()
