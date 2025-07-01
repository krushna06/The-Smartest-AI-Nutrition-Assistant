###### This branch is a rewrite of the [Typescript Codebase](https://github.com/krushna06/The-Smartest-AI-Nutrition-Assistant).

# The Smartest AI Nutrition Assistant

**The Smartest AI Nutrition Assistant** is an intelligent, all-in-one platform that uses state-of-the-art generative AI to deliver hyper-personalized nutrition guidance. Unlike traditional one-size-fits-all apps, this assistant learns, reasons, and adapts like a real nutrition expert—offering dynamic meal plans, contextual recommendations, and intuitive interactions via **text, voice, and image** inputs.

This project **does not rely on external LLM APIs** like ChatGPT, Deepseek, or Claude. Instead, it uses **a local Ollama-hosted  model** and open-source tools such as **Teachable Machine** for image classification, along with **Python** and **SQL** for its core logic and data management.

## Features

- 💬 Chat interface for nutrition advice
- 🎤 Voice input support
- 📷 Food image analysis
- 🍽️ Personalized meal planning
- 📊 Nutritional information
- 🏗️ Modular and maintainable codebase

## Prerequisites

- Python 3.8 or higher
- [Ollama](https://ollama.ai/) installed and running locally
- Microphone (for voice input)
- Webcam (for image capture with vision models)

### Setting up Ollama

1. Download and install Ollama from [ollama.ai](https://ollama.ai/)
2. Start the Ollama server
3. Pull the desired models (e.g., `llama3`, `mistral`, `llava`):
   ```bash
   ollama pull qwen2.5:0.5b
   # For image analysis (optional):
   ollama pull llava
   ```

## Installation

1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start Guide

1. **Start the Ollama server** (if not already running):
   ```bash
   ollama serve
   ```

2. **In a new terminal, run the Streamlit app**:
   ```bash
   streamlit run main.py
   ```

3. **Open your browser** to `http://localhost:8501`

4. **Using the app**:
   - **Chat**: Type your nutrition-related questions in the chat box
   - **Voice Input**: Click the "Start Voice Input" button and speak your query
   - **Food Analysis**: Upload a food image and click "Analyze Food"
   - **Meal Planning**: Customize and generate personalized meal plans
   - **Model Selection**: Change the AI model in the sidebar (requires the model to be pulled first)

## Features in Detail

### Chat Interface
- Ask any nutrition-related questions
- Get detailed, personalized responses
- Conversation history is maintained during the session

### Voice Input
- Click the microphone button to start speaking
- Your speech will be transcribed using Whisper
- The transcription will be sent to the AI for a response

### Food Image Analysis
- Upload images of food
- Get nutritional analysis (requires a vision model like LLaVA)
- Understand portion sizes and ingredients

### Meal Planning
- Customize based on dietary preferences and allergies
- Set daily calorie targets
- Get detailed meal plans with recipes and nutritional info

## How It Works

- The app uses Ollama's Qwen-2.5 for natural language understanding and generation
- Food images are analyzed using Ollama's LLaVA
- Voice input is processed using the SpeechRecognition library
- Session state maintains conversation history

## Customization

You can customize the app by:

1. **Models**: 
   - Change the default model in `DEFAULT_MODEL`
   - Add more models to the `available_models` list in the sidebar

2. **Prompts**:
   - Modify the system prompts in the code for different behaviors
   - Adjust the meal plan generation prompt for different formats

3. **UI**:
   - Customize the Streamlit interface in `main.py`
   - Add more customization options for meal planning
   - Extend the dietary preferences and allergies lists

4. **Features**:
   - Add more interactive elements
   - Implement user profiles
   - Add meal tracking functionality
   - Integrate with nutrition databases for more accurate information

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
