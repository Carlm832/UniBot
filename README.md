# UniBot 2.0 - Premium NEU Campus Assistant 🎓✨

**UniBot** is a high-end, AI-powered intelligent companion for Near East University (NEU). It provides students with instant, high-precision answers about campus navigation, admissions, fees, and academic programs, featuring a state-of-the-art Glassmorphic UI and interactive map integration.

![UniBot Premium](https://img.shields.io/badge/UniBot-2.0_Premium-crimson?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-white?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-v24+-green?style=for-the-badge)

---

## 🎨 Premium Experience (v2.0)

The system has been completely redesigned to provide a "Premium" first impression:
- **Glassmorphic UI**: High-end frosted glass effects, backdrop blurs, and sophisticated depth.
- **NEU Crimson Theme**: A custom color palette (Near East Crimson & Deep Gold) perfectly aligned with university identity.
- **Dynamic Mesh Background**: An animated, interactive mesh gradient that brings the landing page to life.
- **Modern Typography**: Integrated **Outfit** and **Inter** Google Fonts for a sleek, breathable feel.
- **Sticky Navigation**: A persistent, compact header that ensures the "Home" button is always accessible.

## 🧠 Advanced Search Engine

The intelligence layer has been significantly hardened:
- **High-Precision Retrieval**: An improved search algorithm supporting multi-word queries, partial matching, and fuzzy logic.
- **Large Knowledge Base**: Integrated **84 detailed documents** covering the entire university ecosystem.
- **Smart Location Sensing**: Automatically detects intent (e.g., "Where is...") and delivers interactive map cards.
- **Vercel Optimized**: Robust path resolution and auto-recovery logic specifically tuned for serverless environments.

---

## 🏗️ Project Structure

```
UniBotProject/
├── unibot-backend/              # Node.js + Express API
│   ├── data/
│   │   └── vector_store.json    # Knowledge Base (84 docs)
│   ├── src/
│   │   ├── services/
│   │   │   ├── aiService.js     # Groq AI Orchestration
│   │   │   └── searchService.js # High-Precision Search Logic
│   │   ├── scripts/
│   │   │   ├── importExtraData.js # Database Sync Script
│   │   │   └── testQuestions.js   # Accuracy Validation Suite
│   │   └── app.js               # Express + Diagnostics API
│
├── neu-unibot/                  # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Sticky Glassmorphic Nav
│   │   │   ├── ChatInterface.jsx# Breathable Conversation UI
│   │   │   └── MessageBubble.jsx# Premium Message & Map Cards
│   │   └── index.css            # Custom Design System
```

---

## 🚀 Technical Specs

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Premium Tokens) + Glassmorphism Utilities
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js v24+
- **AI**: Groq (Llama 3.3 70B)
- **Search**: Custom Search Engine with Runtime Path Resolution
- **Reliability**: Integrated `/api/health/diagnostics` for live infrastructure monitoring

---

## 🛠️ Setup & Deployment

### 1. Backend Setup
```bash
cd unibot-backend
npm install
# Set GROQ_API_KEY in .env
node src/scripts/importExtraData.js # Build the search index
npm run dev
```

### 2. Frontend Setup
```bash
cd neu-unibot
npm install
npm run dev
```

### 3. Vercel Deployment
Ensure you add the following Environment Variables to Vercel:
- `GROQ_API_KEY`: Your Groq API key (Keep this secret!)
- `VITE_API_URL`: Your live backend URL.

---

## 🔐 Security & Integrity
- **History Scrubbed**: This repository has been professionally sanitized to ensure NO API keys or secrets are leaked in the Git history.
- **Verified Link**: All backend-to-frontend communication is health-checked in real-time.

---

## 📄 License
MIT License - Developed by **Carl** - [UniBot Repo](https://github.com/Carlm832/UniBot)

---
*Powered by Advanced Neural AI • Near East University 2026*
