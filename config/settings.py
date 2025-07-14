import os

OLLAMA_API_BASE = "http://localhost:11434/api"
DEFAULT_MODEL = "qwen2.5:0.5b"

PAGE_CONFIG = {
    "page_title": "AI Nutrition Assistant",
    "page_icon": "🍎",
    "layout": "wide",
    "initial_sidebar_state": "expanded"
}

AVAILABLE_MODELS = ["qwen2.5:0.5b"]

DEFAULT_MEAL_PLAN_CONFIG = {
    "min_calories": 1200,
    "max_calories": 3000,
    "default_calories": 2000,
    "min_meals_per_day": 3,
    "max_meals_per_day": 6,
    "default_meals_per_day": 3
}

ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png"]

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_FIT_REDIRECT_URI = "http://localhost:5000/oauth2callback"

GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
]
