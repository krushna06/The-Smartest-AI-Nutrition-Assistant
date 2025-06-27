# The Smartest AI Nutrition Assistant

**The Smartest AI Nutrition Assistant** is an intelligent, all-in-one platform that uses state-of-the-art generative AI to deliver hyper-personalized nutrition guidance. Unlike traditional one-size-fits-all apps, this assistant learns, reasons, and adapts like a real nutrition expert—offering dynamic meal plans, contextual recommendations, and intuitive interactions via **text, voice, and image** inputs.

This project **does not rely on external LLM APIs** like ChatGPT, Deepseek, or Claude. Instead, it uses **a local Ollama-hosted  model** and open-source tools such as **Teachable Machine** for image classification, along with **Python** and **SQL** for its core logic and data management.

## Table of Contents
- [System Architecture](#system-architecture)
  - [Component Details](#component-details)
    - [1. User Interface](#1-user-interface)
    - [2. API Gateway](#2-api-gateway)
    - [3. Core Services](#3-core-services)
    - [4. AI Services](#4-ai-services)
    - [5. Data Storage](#5-data-storage)
    - [6. Local Cache](#6-local-cache)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Google OAuth Configuration](#google-oauth-configuration)
- [API Endpoints](#api-endpoints)
  - [Frontend API](#frontend-api)
  - [Backend API](#backend-api)
- [Project Structure](#project-structure)
- [License](#license)

## System Architecture

```
+---------------------+       +---------------------+
|                     |       |                     |
|  User Interface     |<----->|  Google OAuth       |
|  (Next.js Frontend) |       |                     |
+----------+----------+       +---------------------+
           |
           | (HTTP/HTTPS)
           v
+---------------------+
|  API Gateway        |
|  - Request Routing  |
|  - Authentication  |
+----------+----------+
           |
           v
+---------------------+
|  Core Services     |
|  - User Management |
|  - Meal Planning   |
|  - Health Tracking |
+----------+----------+
           |
           v
+---------------------+
|  AI Services        |
|  - Food Recognition |
|  - Nutrition Analysis|
|  - Meal Suggestions |
+----------+----------+
           |
           v
+---------------------+
|  Data Storage       |
|  - User Data        |
|  - Meal History     |
|  - Nutrition Data   |
+----------+----------+
           ^
           |
+----------+----------+
|  Local Cache        |
|  - Chat History     |
|  - Generated Meals  |
+---------------------+
```

### Component Details

#### 1. User Interface
- **Web Application**
  - Responsive design
  - Interactive dashboard
  - Real-time updates
  - User authentication

#### 2. API Gateway
- **Request Handling**
  - Routes requests to services
  - Handles authentication
  - Request validation

#### 3. Core Services
- **User Management**
  - Profile handling
  - Preferences
  - Authentication state

- **Meal Planning**
  - Recipe management
  - Meal suggestions
  - Dietary restrictions

- **Health Tracking**
  - Nutrition logging
  - Progress monitoring
  - Health insights

#### 4. AI Services
- **Food Recognition**
  - Image analysis
  - Portion estimation
  - Ingredient detection

- **Nutrition Analysis**
  - Calorie calculation
  - Macronutrient breakdown
  - Dietary recommendations

#### 5. Data Storage
- **User Data**
  - Profiles
  - Preferences
  - Settings

- **Meal Data**
  - Recipes
  - Meal history
  - Favorites

- **Nutrition Data**
  - Food database
  - Nutritional information
  - Health metrics

#### 6. Local Cache
- **Chat History**
  - Recent conversations
  - User preferences
  - Context data

- **Generated Meals**
  - Cached meal plans
  - User-specific recommendations
  - Quick access to recent meals


## Setup

### Prerequisites
- Node.js (v16 or later)
- Python (3.8 or later)
- npm or yarn
- Google Cloud Platform account with Google Fit API enabled

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/The-Smartest-AI-Nutrition-Assistant.git
   cd The-Smartest-AI-Nutrition-Assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend URL
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`

## Google OAuth Configuration

For Google OAuth to work with Google Fit, you need to configure the following in your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project > APIs & Services > Credentials
3. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   ```

4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```

5. Enable the following APIs in the Google Cloud Console:
   - Google Fit API
   - Google OAuth2 API

## API Endpoints

### Frontend API

#### Authentication
- `POST /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback

#### Fitness Data
- `GET /api/fitness` - Get fitness data
- `GET /api/fitness/check` - Check fitness connection status
- `POST /api/fitness/disconnect` - Disconnect from fitness service

### Backend API

#### Speech to Text
- `POST /api/v1/speech-to-text` - Convert speech to text
  - Requires: `audio_file` (multipart/form-data)
  - Returns: `{ "text": string }`

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file for details.
