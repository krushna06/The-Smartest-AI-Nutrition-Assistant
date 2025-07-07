import base64
import os
import tempfile
import io
import numpy as np
import sounddevice as sd
import soundfile as sf
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
            duration = 5
            sample_rate = 44100
            channels = 1
            
            recording = sd.rec(int(duration * sample_rate), 
                             samplerate=sample_rate,
                             channels=channels)
            
            sd.wait()
            
            with io.BytesIO() as wav_buffer:
                sf.write(wav_buffer, recording, sample_rate, format='WAV')
                wav_buffer.seek(0)
                audio_data = wav_buffer.read()
            
            return audio_data
            
        except Exception as e:
            print(f"Error recording audio: {str(e)}")
            return None

    def transcribe_audio(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio using speech_recognition library"""
        try:
            with io.BytesIO(audio_data) as audio_file:
                audio = sr.AudioFile(audio_file)
                
                with audio as source:
                    audio_content = self.recognizer.record(source)
                    
                transcription = self.recognizer.recognize_google(audio_content)
                return transcription
                
        except sr.UnknownValueError:
            print("Speech recognition could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from speech recognition service; {str(e)}")
            return None
        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
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
