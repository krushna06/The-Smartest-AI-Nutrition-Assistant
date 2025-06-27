import streamlit as st
from config import settings
from services.ai_service import AIService
from services.audio_service import AudioService
from services.image_service import ImageService
from ui.sidebar import Sidebar
from ui.chat_interface import ChatInterface
from ui.meal_planner import MealPlanner
from utils.helpers import init_session_state

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
    main()
