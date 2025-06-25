import io
import logging
import os
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Tuple, Optional

import speech_recognition as sr

from app.core.config import settings

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure required directories exist."""
        settings.DEBUG_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    def convert_webm_to_wav(self, webm_data: bytes) -> bytes:
        """Convert WebM/Opus audio to WAV format using ffmpeg."""
        temp_dir = tempfile.mkdtemp(dir=settings.TEMP_DIR)
        try:
            webm_path = Path(temp_dir) / 'input.webm'
            wav_path = Path(temp_dir) / 'output.wav'
            
            with open(webm_path, 'wb') as f:
                f.write(webm_data)
            
            ffmpeg_cmd = [
                'ffmpeg',
                '-i', str(webm_path),
                '-acodec', 'pcm_s16le',
                '-ar', str(settings.AUDIO_SAMPLE_RATE),
                '-ac', str(settings.AUDIO_CHANNELS),
                '-y',
                '-loglevel', 'error',
                str(wav_path)
            ]
            
            try:
                subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
                return wav_path.read_bytes()
                    
            except subprocess.CalledProcessError as e:
                logger.error(f"FFmpeg error: {e.stderr.decode('utf-8', 'ignore')}")
                raise Exception(f"Audio conversion failed: {e.stderr.decode('utf-8', 'ignore')}")
                
        except Exception as e:
            logger.error(f"Error in convert_webm_to_wav: {str(e)}")
            raise
        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    def process_audio(self, audio_data: bytes, content_type: str = '') -> Tuple[bool, str, str]:
        """Process audio data and return (success, text, error)."""
        try:
            if 'webm' in content_type.lower() or 'opus' in content_type.lower():
                logger.info("Converting WebM/Opus audio to WAV format")
                try:
                    audio_data = self.convert_webm_to_wav(audio_data)
                except Exception as e:
                    logger.error(f"WebM to WAV conversion failed: {str(e)}")
                    return False, "", f"Audio conversion failed: {str(e)}"
            
            with io.BytesIO(audio_data) as audio_io:
                try:
                    with sr.AudioFile(audio_io) as source:
                        audio_data = self.recognizer.record(source)
                        text = self.recognizer.recognize_google(audio_data)
                        return True, text, ""
                except Exception as e:
                    logger.warning(f"Direct audio processing failed: {str(e)}")
                    return self._try_alternative_processing(audio_io)
                        
        except Exception as e:
            error_msg = f"Unexpected error in process_audio: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, "", error_msg
    
    def _try_alternative_processing(self, audio_io: io.BytesIO) -> Tuple[bool, str, str]:
        """Try alternative processing method for audio."""
        try:
            audio_io.seek(0)
            with wave.open(audio_io, 'rb') as wav_file:
                frames = wav_file.readframes(wav_file.getnframes())
            
            with io.BytesIO() as wav_io:
                with wave.open(wav_io, 'wb') as wav_file:
                    wav_file.setnchannels(settings.AUDIO_CHANNELS)
                    wav_file.setsampwidth(settings.AUDIO_SAMPLE_WIDTH)
                    wav_file.setframerate(settings.AUDIO_SAMPLE_RATE)
                    wav_file.writeframes(frames)
                
                wav_io.seek(0)
                with sr.AudioFile(wav_io) as source:
                    audio_data = self.recognizer.record(source)
                    text = self.recognizer.recognize_google(audio_data)
                    return True, text, ""
                    
        except Exception as e:
            error_msg = f"Alternative audio processing failed: {str(e)}"
            logger.error(error_msg)
            return False, "", error_msg