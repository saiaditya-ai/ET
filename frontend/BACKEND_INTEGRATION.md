# Backend Integration Guide

The frontend is already wired to the backend routes used by the FastAPI app in this repo.

## Current API contract

### `POST /api/notes/upload`

Request:

```json
{
  "notes": ["Clinical note text"]
}
```

Response:

```json
{
  "note_ids": ["n1234abcd"]
}
```

### `POST /api/processing/start`

Request:

```json
{
  "note_id": "n1234abcd"
}
```

Response:

```json
{
  "status": "started",
  "note_id": "n1234abcd"
}
```

### `GET /api/processing/status/{note_id}`

Processing response:

```json
{
  "status": "processing",
  "current_step": "Assigning ICD-10 candidates",
  "current_agent": "Coding Agent",
  "current_detail": "Mapping extracted findings to candidate diagnosis codes.",
  "progress": 42,
  "activity_feed": [],
  "extracted_entities": {
    "conditions": [],
    "procedures": [],
    "evidence": []
  }
}
```

Clarification response:

```json
{
  "status": "needs_clarification",
  "current_step": "Clarification required",
  "current_agent": "Validation + Ambiguity Agent",
  "current_detail": "Ambiguity detected. The workflow is paused until the clinician or operator responds.",
  "progress": 76,
  "activity_feed": [],
  "extracted_entities": {
    "conditions": [],
    "procedures": [],
    "evidence": []
  },
  "questions": [
    {
      "id": "diabetes_clarification",
      "prompt": "Confirm the diabetes type and add any supporting detail needed for coding.",
      "options": ["Type 1", "Type 2", "Gestational", "Unspecified"],
      "answer_type": "hybrid"
    }
  ]
}
```

Completed response:

```json
{
  "status": "completed",
  "progress": 100
}
```

### `GET /api/results/{note_id}`

Response:

```json
{
  "note_id": "n1234abcd",
  "status": "completed",
  "icd10_codes": [
    {
      "code": "E11.9",
      "description": "Type 2 diabetes mellitus without complications",
      "confidence": 0.95
    }
  ],
  "cpt_codes": [
    {
      "code": "83036",
      "description": "Hemoglobin; glycosylated (A1c)",
      "confidence": 0.9
    }
  ],
  "confidence": 0.9,
  "reasoning": ["Reasoning item"],
  "audit_trail": [
    {
      "step": 1,
      "agent": "Audit Agent",
      "action": "Published confidence score and evidence-backed reasoning",
      "duration": "0.2s"
    }
  ]
}
```

### `POST /api/clarification`

Request:

```json
{
  "note_id": "n1234abcd",
  "answers": {
    "diabetes_clarification": {
      "choice": "Type 2",
      "text": "A1c 8.2%, currently on metformin."
    }
  }
}
```

Response:

```json
{
  "status": "clarification received, resume processing"
}
```

### `GET /api/notes`

Response:

```json
[
  {
    "note_id": "n1234abcd",
    "content": "Clinical note text",
    "preview": "Clinical note text",
    "uploaded_at": "2026-03-26T12:00:00+00:00",
    "status": "processing"
  }
]
```

## Frontend configuration

Use [`frontend/.env.example`](/d:/ET_FULL/frontend/.env.example) as the template.

Supported variables:

- `VITE_API_BASE_URL=http://localhost:8000`
- `VITE_USE_MOCK=false`

If `VITE_API_BASE_URL` is empty, the frontend uses relative `/api/...` routes and the Vite dev proxy handles local development.

## Local development

Backend:

```powershell
$env:PYTHONPATH='src'
python -m uvicorn demo.api:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```
