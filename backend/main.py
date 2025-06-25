from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import speech_recognition as sr
import os
from pydantic import BaseModel
from typing import Optional, Tuple, Union
import tempfile
import io
import wave
import array
import logging
import subprocess
import shutil
import time
import uuid
from pathlib import Path
import array
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
recognizer = sr.Recognizer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SpeechToTextResponse(BaseModel):
    text: str
    success: bool
    error: Optional[str] = None

def convert_webm_to_wav(webm_data: bytes) -> bytes:
    """Convert WebM/Opus audio to WAV format using ffmpeg."""
    temp_dir = tempfile.mkdtemp()
    try:
        webm_path = os.path.join(temp_dir, 'input.webm')
        wav_path = os.path.join(temp_dir, 'output.wav')
        
        with open(webm_path, 'wb') as f:
            f.write(webm_data)
        
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', webm_path,
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            '-y',
            '-loglevel', 'error',
            wav_path
        ]
        
        try:
            subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
            
            with open(wav_path, 'rb') as f:
                return f.read()
                
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr.decode('utf-8', 'ignore')}")
            raise Exception(f"Audio conversion failed: {e.stderr.decode('utf-8', 'ignore')}")
            
    except Exception as e:
        logger.error(f"Error in convert_webm_to_wav: {str(e)}")
        raise
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

def process_audio(audio_data: bytes, content_type: str = '') -> Tuple[bool, str, str]:
    """Process audio data and return (success, text, error)."""
    try:
        if 'webm' in content_type.lower() or 'opus' in content_type.lower():
            logger.info("Converting WebM/Opus audio to WAV format")
            try:
                audio_data = convert_webm_to_wav(audio_data)
            except Exception as e:
                logger.error(f"WebM to WAV conversion failed: {str(e)}")
                return False, "", f"Audio conversion failed: {str(e)}"
        
        with io.BytesIO(audio_data) as audio_io:
            try:
                with sr.AudioFile(audio_io) as source:
                    audio_data = recognizer.record(source)
                    text = recognizer.recognize_google(audio_data)
                    return True, text, ""
            except Exception as e:
                logger.warning(f"Direct audio processing failed: {str(e)}")
                
                try:
                    audio_io.seek(0)
                    with wave.open(audio_io, 'rb') as wav_file:
                        n_channels = wav_file.getnchannels()
                        sample_width = wav_file.getsampwidth()
                        frame_rate = wav_file.getframerate()
                        frames = wav_file.readframes(wav_file.getnframes())
                    
                    with io.BytesIO() as wav_io:
                        with wave.open(wav_io, 'wb') as wav_file:
                            wav_file.setnchannels(1)
                            wav_file.setsampwidth(2)
                            wav_file.setframerate(16000)
                            wav_file.writeframes(frames)
                        
                        wav_io.seek(0)
                        with sr.AudioFile(wav_io) as source:
                            audio_data = recognizer.record(source)
                            text = recognizer.recognize_google(audio_data)
                            return True, text, ""
                            
                except Exception as inner_e:
                    error_msg = f"Audio processing failed: {str(inner_e)}"
                    logger.error(error_msg)
                    return False, "", error_msg
                    
    except Exception as e:
        error_msg = f"Unexpected error in process_audio: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, "", error_msg

@app.post("/api/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(audio_file: UploadFile):
    try:
        logger.info(f"Received audio file: {audio_file.filename}, {audio_file.content_type}, {audio_file.size} bytes")
        
        contents = await audio_file.read()
        if not contents:
            return {"text": "", "success": False, "error": "Empty audio file"}
        
        debug_dir = Path("debug_audio")
        debug_dir.mkdir(exist_ok=True)
        
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        debug_path = debug_dir / f"audio_{timestamp}_{unique_id}.webm"
        
        try:
            with open(debug_path, 'wb') as f:
                f.write(contents)
            logger.info(f"Saved debug audio to: {debug_path}")
        except Exception as e:
            logger.error(f"Failed to save debug audio: {str(e)}")
        
        success, text, error = process_audio(contents, content_type=audio_file.content_type or '')
        
        if success:
            logger.info(f"Successfully transcribed audio: {text[:100]}...")
            return {"text": text, "success": True}
        else:
            logger.error(f"Audio processing failed: {error}")
            return {"text": "", "success": False, "error": error or "Audio processing failed"}
        
    except sr.UnknownValueError as e:
        error_msg = "Could not understand audio. Please speak clearly and try again."
        logger.error(error_msg)
        return {"text": "", "success": False, "error": error_msg}
    except sr.RequestError as e:
        error_msg = f"Speech recognition service unavailable. Please check your internet connection. Error: {str(e)}"
        logger.error(error_msg)
        return {"text": "", "success": False, "error": error_msg}
    except Exception as e:
        error_msg = f"An unexpected error occurred: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {"text": "", "success": False, "error": "An error occurred while processing the audio"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
