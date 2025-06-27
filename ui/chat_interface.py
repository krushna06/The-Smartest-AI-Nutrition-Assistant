import streamlit as st
import time
from typing import List, Dict, Optional
from config import settings
from services.ai_service import AIService
from utils.helpers import display_messages, add_message, get_chat_history

class ChatInterface:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    def render(self):
        """Render the main chat interface"""
        st.title("🍎 AI Nutrition Assistant")
        
        display_messages()
        
        self._render_chat_input()

    def _render_chat_input(self):
        """Render the chat input and handle user messages"""
        if prompt := st.chat_input("Ask me anything about nutrition..."):
            add_message("user", prompt)
            
            with st.chat_message("user"):
                st.markdown(prompt)
            
            self._generate_and_display_response()

    def _generate_and_display_response(self):
        """Generate and display AI response"""
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            model = st.session_state.get("selected_model", settings.DEFAULT_MODEL)
            
            response = self.ai_service.generate_response(
                get_chat_history(),
                model=model
            )
            
            if response:
                for chunk in response.split():
                    full_response += chunk + " "
                    time.sleep(0.05)
                    message_placeholder.markdown(full_response + "▌")
                
                message_placeholder.markdown(full_response)
                add_message("assistant", full_response)
            else:
                st.error("Failed to generate response. Please try again.")
