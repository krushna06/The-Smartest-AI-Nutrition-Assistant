import requests
from typing import List, Dict, Optional
from config import settings

class AIService:
    def __init__(self, api_base: str = settings.OLLAMA_API_BASE):
        self.api_base = api_base

    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model: str = settings.DEFAULT_MODEL, 
        max_tokens: int = 4000
    ) -> Optional[str]:
        """Generate response using Ollama's API with configurable token limit"""
        try:
            prompt = self._format_messages(messages)
            
            response = requests.post(
                f"{self.api_base}/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": max_tokens,
                        "repeat_last_n": 0,
                        "repeat_penalty": 1.1,
                        "top_k": 40,
                        "top_p": 0.9,
                        "tfs_z": 1.0,
                        "num_ctx": 4096,
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                return response.json().get("response")
            else:
                print(f"Error from Ollama API: {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("The request to Ollama API timed out.")
            return None
        except Exception as e:
            print(f"Error in generate_response: {str(e)}")
            return None

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """Format messages into a single prompt string"""
        prompt = ""
        for msg in messages:
            role = msg["role"].upper()
            content = msg["content"]
            prompt += f"{role}: {content}\n\n"
        prompt += "ASSISTANT: "
        return prompt

    def analyze_image(self, image_base64: str, model: str = "llava") -> str:
        """Analyze food image using Ollama's vision capabilities"""
        try:
            response = requests.post(
                f"{self.api_base}/generate",
                json={
                    "model": model,
                    "prompt": "Describe this food item in detail, including estimated calories and nutritional information:",
                    "images": [image_base64],
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                return response.json().get("response", "I couldn't analyze the image.")
            else:
                return f"Error analyzing image: {response.text}"
                
        except Exception as e:
            return f"Error in analyze_image: {str(e)}"
