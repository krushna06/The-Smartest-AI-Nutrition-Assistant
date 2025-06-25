from pydantic import BaseModel
from typing import Optional

class SpeechToTextResponse(BaseModel):
    text: str
    success: bool
    error: Optional[str] = None
