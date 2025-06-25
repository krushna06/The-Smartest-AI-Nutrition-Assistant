from pydantic import BaseSettings
from pathlib import Path
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Nutrition Assistant API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_CHANNELS: int = 1
    AUDIO_SAMPLE_WIDTH: int = 2
    TEMP_DIR: Path = Path("temp")
    
    class Config:
        case_sensitive = True

settings = Settings()
