from typing import Any, Dict, List, Optional
import streamlit as st

def init_session_state():
    """Initialize session state variables if they don't exist"""
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "Hello! I'm your AI Nutrition Assistant. How can I help you with your nutrition and diet today?",
            }
        ]

    if "selected_model" not in st.session_state:
        from config import settings
        st.session_state.selected_model = settings.DEFAULT_MODEL

def display_messages():
    """Display chat messages"""
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

def add_message(role: str, content: str):
    """Add a message to the chat"""
    st.session_state.messages.append({"role": role, "content": content})

def get_chat_history() -> List[Dict[str, str]]:
    """Get the current chat history"""
    return [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages]
