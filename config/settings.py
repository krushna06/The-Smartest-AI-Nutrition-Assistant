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
