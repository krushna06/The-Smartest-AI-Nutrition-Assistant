# 🧠 The Smartest AI Nutrition Assistant

## Overview

**The Smartest AI Nutrition Assistant** is an intelligent, all-in-one platform that uses state-of-the-art generative AI to deliver hyper-personalized nutrition guidance. Unlike traditional one-size-fits-all apps, this assistant learns, reasons, and adapts like a real nutrition expert—offering dynamic meal plans, contextual recommendations, and intuitive interactions via **text, voice, and image** inputs.

This project **does not rely on external LLM APIs** like ChatGPT, Deepseek, or Claude. Instead, it uses **a local Ollama-hosted Mistral model** and open-source tools such as **Teachable Machine** for image classification, along with **Python** and **SQL** for its core logic and data management.

---

## 🚀 Features

* **Multimodal Input Understanding**
  Accepts and interprets:

  * ✍️ Text queries (e.g., “Plan a vegan diet for muscle gain”)
  * 🎤 Voice input (via speech-to-text)
  * 📸 Image input (e.g., food photos, nutrition labels) using **Google Teachable Machine**

* **Personalized Meal Plan Generation**
  Tailored to:

  * Health goals (e.g., weight loss, muscle gain)
  * Medical conditions (e.g., diabetes, hypertension)
  * Activity levels and preferences (e.g., keto, vegan, halal)

* **Dynamic Feedback Loop**
  Learns and adapts based on:

  * User check-ins and meal logs
  * Real-time health data (optional integrations)

* **Contextual Explanations**
  Provides nutrition science-based justifications:

  * “Why is this food better?”
  * “What happens if I skip this meal?”

* **Edge-capable Architecture**
  Designed for on-device inference using **Ollama with Mistral** and no reliance on cloud APIs

---

## 🧠 System Architecture

```
+-------------------------+
|  User Interface (CLI,   |
|  Web, or Mobile)        |
+-----------+-------------+
            |
            v
+-------------------------+
|  Multimodal Input Engine|
|  - NLP                  |
|  - CV (Teachable Machine)|
|  - Voice Parsing        |
+-----------+-------------+
            |
            v
+-------------------------+
|  AI Reasoning Engine    |
|  - Local Mistral LLM    |
|  - Goal-based Planner   |
+-----------+-------------+
            |
            v
+-------------------------+
|  Knowledge Base         |
|  - Food databases       |
|  - Medical guidelines   |
|  - User profiles        |
+-----------+-------------+
            |
            v
+-------------------------+
|  Output Generator       |
|  - Meal plans           |
|  - Explanations         |
+-------------------------+
```

---

## 🛠 Tech Stack

| Component            | Technology Used                                                |
| -------------------- | -------------------------------------------------------------- |
| Language             | Python, SQL                                                    |
| AI Models            | **Local Mistral (via Ollama)**, Nutrition-specific fine-tuning |
| Image Understanding  | **Google Teachable Machine** (for food/image classification)   |
| Voice Input          | Whisper (open-source STT)                                      |
| Meal Planning Engine | Rule-based + LLM hybrid logic                                  |
| Storage              | SQLite                                                         |
| Frontend (Optional)  | Flask                                                          |

---

## 🔐 Privacy & Security

* **Runs entirely locally** — including model inference and image classification.
* **No external API calls** — all logic and data stay on-device.
* **Data is encrypted** and stored locally or optionally in secure on-prem SQL databases.

---

## 🤝 Contributing

Pull requests and issue reports are welcome! To contribute:

```bash
git clone https://github.com/krushna06/The-Smartest-AI-Nutrition-Assistant.git
cd The-Smartest-AI-Nutrition-Assistant-main
```

---

## 📜 License

MIT License — free to use, modify, and distribute.

---

## 👩‍⚕️ Vision

To build an AI that **thinks, learns, and cares like a true nutrition expert**—bridging the gap between static diet apps and personalized human counseling.
