import streamlit as st
from typing import Optional, Tuple
from config import settings
from services.audio_service import AudioService
from services.image_service import ImageService
import sys
import os
import json

class Sidebar:
    def __init__(self, ai_service, audio_service: AudioService, image_service: ImageService):
        self.ai_service = ai_service
        self.audio_service = audio_service
        self.image_service = image_service

    def render(self):
        """Render the sidebar UI components"""
        with st.sidebar:
            self._render_header()
            self._render_model_selector()
            st.markdown("---")
            self._render_connect_fit_button()
            self._render_google_fit_status()
            st.markdown("---")
            self._render_voice_input()
            st.markdown("---")
            self._render_image_upload()
            st.markdown("---")
            self._render_about_section()

    def _render_header(self):
        """Render the sidebar header"""
        st.title("🍎 AI Nutrition Assistant")

    def _render_model_selector(self):
        """Render the model selection dropdown"""
        if "selected_model" not in st.session_state or st.session_state.selected_model not in settings.AVAILABLE_MODELS:
            st.session_state.selected_model = settings.DEFAULT_MODEL
        
        selected_model = st.selectbox(
            "Select Model",
            settings.AVAILABLE_MODELS,
            index=settings.AVAILABLE_MODELS.index(st.session_state.selected_model),
            key="model_selector"
        )
        
        st.session_state.selected_model = selected_model

    def _render_connect_fit_button(self):
        """Render the Connect Fit button to match the style of Fetch Google Fit Data"""
        oauth_url = self.ai_service.get_google_fit_oauth_url()
        if st.button("Connect Fit"):
            st.markdown(f"""
                <script>
                window.open('{oauth_url}', '_blank');
                </script>
            """, unsafe_allow_html=True)

    def _render_google_fit_status(self):
        tokens = None
        if os.path.exists('google_fit_tokens.json'):
            try:
                with open('google_fit_tokens.json', 'r') as f:
                    tokens = json.load(f)
            except Exception:
                tokens = None
        if tokens:
            st.success("Google Fit Connected!")
            if st.button("Fetch Google Fit Data"):
                data = self.ai_service.fetch_google_fit_data(tokens)
                if data:
                    st.markdown("#### Today's Google Fit Stats")
                    st.metric("Steps", f"{int(data.get('steps', 0)):,}")
                    st.metric("Calories Burned", f"{int(data.get('calories', 0)):,} kcal")
                    st.metric("Avg Heart Rate", f"{data.get('heart_rate', 0)} bpm")
                else:
                    st.warning("No data available.")
        else:
            st.info("Google Fit not connected.")

    def _render_voice_input(self):
        """Render the voice input section"""
        if st.button("🎤 Start Voice Input"):
            st.session_state.recording = True
            st.session_state.audio_data = None
        
        if st.session_state.get("recording"):
            with st.spinner("Listening... (Click to stop)"):
                audio_data = self.audio_service.record_audio()
                
                if audio_data:
                    st.session_state.audio_data = audio_data
                    
                    with st.spinner("Transcribing..."):
                        audio_bytes = self.audio_service.convert_to_wav(audio_data)
                        transcription = self.audio_service.transcribe_audio(audio_bytes)
                        
                        if transcription:
                            st.session_state.messages.append({"role": "user", "content": transcription})
                            st.session_state.audio_data = None  
                            st.rerun()
            
            st.session_state.recording = False

    def _render_image_upload(self):
        """Render the image upload section"""
        uploaded_file = st.file_uploader("Upload Food Image", type=settings.ALLOWED_IMAGE_TYPES)
        if uploaded_file is not None:
            is_valid, error_msg = self.image_service.validate_image(uploaded_file)
            
            if not is_valid:
                st.error(error_msg)
                return
                
            with st.spinner("Analyzing image..."):
                st.image(uploaded_file, caption="Uploaded Food Image", use_column_width=True)
                
                image_base64 = self.image_service.image_to_base64(uploaded_file)
                if image_base64:
                    analysis = self.ai_service.analyze_image(image_base64)
                    
                    st.session_state.messages.append({
                        "role": "user", 
                        "content": f"[Image analysis request] {analysis}"
                    })
                    st.rerun()

    def _render_about_section(self):
        """Render the about section"""
        st.markdown("### About")
        st.markdown("This is an AI Nutrition Assistant that helps you with your diet and nutrition.")
