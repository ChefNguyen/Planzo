# Planzo AI - Vibe-Based Travel Itinerary Generator

Planzo AI is a modern travel itinerary planner powered by Google Gemini AI, Firebase Firestore, and Google Cloud Run.

## 🛠 Tech Stack & Architecture

- **Frontend & Server**: Full-stack Node.js (Vite + React 19 + Express server)
- **Language**: TypeScript (End-to-end type safety)
- **Styling**: Tailwind CSS v4 + Glassmorphism / Fresh Ocean theme
- **Authentication**: Firebase Authentication (Google Auth Provider)
- **Database**: Firebase Firestore (Persistent user itineraries, community vault, real-time sync)
- **AI Core**: Google Gemini API (`@google/genai` with Gemini 3.6 Flash model)
- **Maps**: Interactive canvas map visualizer & location pin routing
- **Calendar**: Google Calendar sync micro-interactions & schedule review
- **CI/CD & Deployment**: Docker containerization target for Google Cloud Run

## 🚀 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```

2. Development:
   ```bash
   npm run dev
   ```

3. Production Build & Docker:
   ```bash
   npm run build
   docker build -t planzo-ai .
   docker run -p 3000:3000 planzo-ai
   ```
