# Medical Coding Demo

This repository contains:

- a FastAPI backend in [`src/demo`](/d:/ET_FULL/src/demo)
- a React + Vite frontend in [`frontend`](/d:/ET_FULL/frontend)
- an optional CrewAI-powered processing path when CrewAI and model keys are available

## Tools & APIs Used

**Frontend Desktop/Web:**
- React 18, Vite, Tailwind CSS, Lucide React (Icons)

**Backend / AI Orchestration:**
- Python 3.10+, FastAPI, Uvicorn, CrewAI (AI Agent framework)

**External APIs / Models:**
- Groq API (`llama-3.3-70b-versatile`)

## Features

The app currently supports:

- note upload
- processing start
- live processing status
- clarification flow for ambiguous notes
- final ICD-10 and CPT results
- confidence, reasoning, and audit trail
- dashboard listing for uploaded notes

API routes exposed by the backend:

- `POST /api/notes/upload`
- `POST /api/processing/start`
- `GET /api/processing/status/{note_id}`
- `GET /api/results/{note_id}`
- `POST /api/clarification`
- `GET /api/notes`

## Setup On A New System

### 1. Install prerequisites

Make sure the new machine has:

- Python `>=3.10,<3.14`
- Node.js `>=18` and npm
- `git`

Optional but recommended for the Python side:

- `uv`

Install `uv` if needed:

```powershell
pip install uv
```

### 2. Clone the project

```powershell
git clone <your-repo-url>
cd ET_FULL
```

### 3. Configure environment files

Create the backend env file from [`.env.example`](/d:/ET_FULL/.env.example):

```powershell
Copy-Item .env.example .env
```

Create the frontend env file from [`frontend/.env.example`](/d:/ET_FULL/frontend/.env.example):

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Backend env values:

- `ENABLE_CREWAI_PROCESSING=true`
- `MODEL=openai/gpt-4o-mini`
- `MEDICAL_CODING_MODEL=groq/llama-3.3-70b-versatile`
- `OPENAI_API_KEY=...`
- `GROQ_API_KEY=...`

Frontend env values:

- `VITE_API_BASE_URL=http://localhost:8000`
- `VITE_USE_MOCK=false`

If you do not want live model execution yet, you can set:

```env
ENABLE_CREWAI_PROCESSING=false
```

The backend will still run using the built-in deterministic workflow.

## Install Dependencies

### Backend

If `uv` is available:

```powershell
uv sync
```

If `uv` is not available, create a virtual environment and install with pip:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -e .
```

### Frontend

```powershell
npm --prefix frontend install
```

## Run The Project

Open two terminals.

### Terminal 1: backend

If you are using the editable install or `uv sync`, you can run:

```powershell
$env:PYTHONPATH='src'
python -m uvicorn demo.api:app --reload --host 0.0.0.0 --port 8000
```

Expected backend URL:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### Terminal 2: frontend

```powershell
npm --prefix frontend run dev
```

Expected frontend URL:

- `http://localhost:5173`

## First Run Checklist

After both servers start:

1. Open `http://localhost:5173`
2. Go to Upload
3. Paste a clinical note
4. Click Start Processing
5. Confirm the note moves through processing and shows results

## Optional CrewAI Mode

The backend is designed to start even when CrewAI is missing. There are two modes:

- fallback mode: deterministic workflow, always available
- live CrewAI mode: used when CrewAI is installed and env keys are configured

CrewAI is declared in [pyproject.toml](/d:/ET_FULL/pyproject.toml) as:

- `crewai[tools]==1.11.0`

If CrewAI is installed and `ENABLE_CREWAI_PROCESSING=true`, the API will try the live background run. If that fails or CrewAI is unavailable, the backend still remains functional.

## Useful Commands

Backend compile check:

```powershell
$env:PYTHONPATH='src'
python -m compileall src
```

Frontend production build:

```powershell
npm --prefix frontend run build
```

API smoke test against a running backend:

```powershell
python test_api_script.py
```

## Troubleshooting

### Frontend says `Unable to upload note`

Check:

- backend server is running on `http://localhost:8000`
- `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`
- frontend dev server was restarted after changing env files

### `uv` command not found

Install it:

```powershell
pip install uv
```

Or use the virtualenv + pip path described above.

### `ModuleNotFoundError: demo` or import issues

Run the backend with:

```powershell
$env:PYTHONPATH='src'
python -m uvicorn demo.api:app --reload --host 0.0.0.0 --port 8000
```

### CrewAI/model keys are not ready yet

Set:

```env
ENABLE_CREWAI_PROCESSING=false
```

The app will still work for frontend/backend integration and demo flows.

## Project Structure

```text
ET_FULL/
├── src/demo/
│   ├── api.py
│   ├── crew.py
│   ├── main.py
│   ├── config/
│   └── services/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── .env.example
├── pyproject.toml
└── test_api_script.py
```

## Verification

Verified locally with:

- FastAPI `TestClient` for upload -> processing -> clarification -> results -> notes list
- `python -m compileall src`
- `npm --prefix frontend run build`
