from fastapi import APIRouter, UploadFile
import logging

from app.models.schemas import SpeechToTextResponse
from app.services.audio_service import AudioService

logger = logging.getLogger(__name__)
router = APIRouter()
audio_service = AudioService()

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(audio_file: UploadFile):
    try:
        logger.info(f"Received audio file: {audio_file.filename}, {audio_file.content_type}")
        
        contents = await audio_file.read()
        if not contents:
            return SpeechToTextResponse(
                text="",
                success=False,
                error="Empty audio file"
            )
        
        success, text, error = audio_service.process_audio(
            contents,
            content_type=audio_file.content_type or ''
        )
        
        if success:
            logger.info(f"Successfully transcribed audio: {text[:100]}...")
            return SpeechToTextResponse(
                text=text,
                success=True
            )
        else:
            logger.error(f"Audio processing failed: {error}")
            return SpeechToTextResponse(
                text="",
                success=False,
                error=error or "Audio processing failed"
            )
            
    except Exception as e:
        error_msg = f"An unexpected error occurred: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return SpeechToTextResponse(
            text="",
            success=False,
            error="An error occurred while processing the audio"
        )
