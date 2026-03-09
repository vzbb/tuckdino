# Technology Stack

## Core Technologies
- **Next.js (React):** The foundational framework for the application, using the App Router for routing and server-side logic.
- **TypeScript:** The primary language, providing type safety and robust development for complex 3D and AI integrations.
- **React Three Fiber & Drei:** The React bridge for Three.js, used to create and manage the 3D world and characters (GLTF/GLB models).
- **Zustand:** A lightweight state management library for handling the game's global state, including dino needs and world settings.

## AI & Multimodal Integration
- **Google Gemini (@google/genai):** The core intelligence for the baby dino.
  - **Gemini 2.5 Flash Lite:** Used for multimodal vision and audio analysis, and high-level decision-making for the dino's "brain."
  - **Gemini 2.5 Flash TTS:** Used for real-time text-to-speech generation for the dino's voice.

## Infrastructure & Deployment
- **Vercel:** The primary deployment platform, optimized for Next.js applications and handling serverless functions for AI API communication.
- **LocalStorage:** Used for persistent local progress and dino state.

## Design & Assets
- **Vanilla CSS:** For flexible, high-performance UI styling.
- **Quaternius Assets:** Low-poly 3D models for the environment and characters.
- **Web APIs:** Use of the MediaDevices API for camera and microphone access.

## Dev Tools
- **ESLint:** For maintaining code quality and adhering to Next.js best practices.
- **Prettier:** (Recommended) For consistent code formatting.