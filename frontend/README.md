# 🏥 AI Medical Coding System - Frontend

A modern, beautiful React frontend for an AI-powered medical coding system. Built with **Vite + React + Tailwind CSS** with a fully functional mock data layer ready for real backend integration.

## ✨ Features

- **🎨 Modern SaaS Dashboard Design** - Beautiful UI with smooth animations and transitions
- **📤 Clinical Note Upload** - Textarea with character validation
- **⚡ Real-time Processing** - Live status polling with animated step-by-step progress
- **🤖 AI Clarification** - Interactive disambiguation for ambiguous medical terms
- **📊 Rich Results Display** - Tabbed interface showing ICD-10 codes, CPT codes, and audit trail
- **🔐 Mock + Real Backend Support** - Toggle flag to switch between demo and real API
- **✅ Production-Ready Architecture** - Clean separation with API service layer
- **🌟 Smooth Animations** - Beautiful transitions throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Navigate to project directory
cd medical_coding_system

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start at `http://localhost:5173/`

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── UploadPanel.jsx
│   ├── ProcessingViewer.jsx
│   ├── ResultCard.jsx
│   ├── AmbiguityBox.jsx
│   ├── ConfidenceBadge.jsx
│   └── AuditTrail.jsx
├── pages/
│   ├── UploadPage.jsx       # Main upload page (/)
│   └── NoteDetailPage.jsx   # Processing page (/note/:id)
├── services/
│   └── api.js              # Mock & real backend integration
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## 🔌 API Service Architecture

### Toggle Between Mock & Real Backend

```javascript
// src/services/api.js
const USE_MOCK = true; // Set to false for real backend

// Exported functions
export const uploadNote(note);
export const startProcessing(noteId);
export const getStatus(noteId);
export const getResult(noteId);
export const sendClarification(noteId, answers);
```

### Backend Endpoints Required

When `USE_MOCK = false`, implement:

```
POST   /api/notes/upload
POST   /api/processing/start
GET    /api/processing/status/:id
GET    /api/results/:id
POST   /api/clarification
```

## 🎯 Pages & Components

### Pages

1. **UploadPage** (`/`)
   - Upload clinical notes
   - Character validation
   - Submit → navigate to /note/{id}

2. **NoteDetailPage** (`/note/:id`)
   - Polls status every 2 seconds
   - Shows processing steps or clarifications
   - Displays final results

### Components

- **UploadPanel** - Textarea with validation
- **ProcessingViewer** - Animated step timeline
- **ResultCard** - ICD/CPT codes with tabs
- **AmbiguityBox** - Clarification dialog
- **ConfidenceBadge** - Score indicator
- **AuditTrail** - Event timeline

## 🎨 Design Features

- Modern SaaS dashboard style
- Gradient backgrounds
- Smooth animations (fade, slide, bounce)
- Responsive design
- Color-coded status indicators
- Glass-morphism effects

## 📦 Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Lucide Icons

## 🚀 Build & Deploy

```bash
npm run build    # Production build
npm run preview  # Preview build
```

## 🔄 Data Flow

```
Upload Note → Start Processing → Poll Status
    ↓
Processing Display (or Clarification Dialog)
    ↓
Results Display (ICD, CPT, Audit Trail)
```

## ✅ Status: PRODUCTION READY

Fully functional with mock data. Ready for:
- UI/UX testing
- Backend integration
- Deployment

---

**Made with ❤️ for medical excellence** 🏥
