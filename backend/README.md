# AI Nutrition Assistant - Backend

This is the backend service for the AI Nutrition Assistant application. It provides speech-to-text functionality using FastAPI.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install ffmpeg (required for audio processing):
   - Windows: Download from https://ffmpeg.org/download.html and add to PATH
   - Ubuntu/Debian: `sudo apt install ffmpeg`
   - MacOS: `brew install ffmpeg`

## Running the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

## Testing

To test the speech-to-text endpoint:

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/speech/speech-to-text' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'audio_file=@path/to/your/audio.webm;type=audio/webm'
```
