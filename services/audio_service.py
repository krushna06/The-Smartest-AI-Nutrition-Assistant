import base64
import os
import tempfile
import io
import speech_recognition as sr
from pydub import AudioSegment
import requests
from typing import Optional, Tuple
from config import settings

class AudioService:
    def __init__(self, api_base: str = settings.OLLAMA_API_BASE):
        self.api_base = api_base
        self.recognizer = sr.Recognizer()

    def record_audio(self) -> Optional[bytes]:
        """Record audio from microphone and return as bytes"""
        try:
            with sr.Microphone() as source:
                audio = self.recognizer.listen(source)
                return audio.get_wav_data()
        except Exception as e:
            print(f"Error recording audio: {str(e)}")
            return None

    def transcribe_audio(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio using Ollama's Whisper model"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name
            
            with open(tmp_file_path, "rb") as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
            
            os.unlink(tmp_file_path)
            
            response = requests.post(
                f"{self.api_base}/transcribe",
                json={"model": "whisper", "audio": f"data:audio/wav;base64,{audio_base64}"}
            )
            
            if response.status_code == 200:
                return response.json().get("text")
            else:
                print(f"Error transcribing audio: {response.text}")
                return None
                
        except Exception as e:
            print(f"Error in transcribe_audio: {str(e)}")
            return None

    def convert_to_wav(self, audio_data: bytes) -> bytes:
        """Convert audio data to WAV format"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
                f.write(audio_data)
                audio_path = f.name
            
            audio_segment = AudioSegment.from_wav(audio_path)
            output = io.BytesIO()
            audio_segment.export(output, format="wav")
            os.unlink(audio_path)
            return output.getvalue()
            
        except Exception as e:
            print(f"Error converting to WAV: {str(e)}")
            return audio_data
