from fastapi import APIRouter
from app.api.v1.endpoints import speech_to_text
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(
    speech_to_text.router,
    prefix="/speech",
    tags=["speech"]
)
