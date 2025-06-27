# AI Nutrition Assistant with Ollama

A Streamlit-based AI Nutrition Assistant that helps users track their diet, get nutrition advice, and generate personalized meal plans using local AI models through Ollama.

## Features

- 💬 Chat interface for nutrition advice
- 🎤 Voice input support
- 📷 Food image analysis
- 🍽️ Personalized meal planning
- 📊 Nutritional information

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

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-nutrition-assistant.git
   cd ai-nutrition-assistant/python-rewrite
   ```

2. Create a virtual environment and activate it:
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

4. (Optional) Create a `.env` file in the project root for any future environment variables:
   ```
   # Add any custom configurations here
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

- The app uses OpenAI's GPT-4 for natural language understanding and generation
- Food images are analyzed using GPT-4 Vision
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