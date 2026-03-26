from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import datetime

from demo.crew import MedicalCrew

app = FastAPI(title="Medical Coding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For demo/development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demonstration purposes
db_notes: Dict[str, str] = {}
db_status: Dict[str, Dict[str, Any]] = {}
db_results: Dict[str, Dict[str, Any]] = {}

# --- Pydantic Models for Requests ---
class UploadRequest(BaseModel):
    notes: List[str]

class StartProcessingRequest(BaseModel):
    note_id: str

class ClarificationRequest(BaseModel):
    note_id: str
    answers: List[str]


# --- API Endpoints ---

@app.get("/api/notes")
def get_all_notes():
    result = []
    for nid, content in db_notes.items():
        status_data = db_status.get(nid, {})
        status = "completed" if nid in db_results else status_data.get("status", "uploaded")
        result.append({
            "note_id": nid,
            "content": content,
            "preview": content[:110] + "..." if len(content) > 110 else content,
            "uploaded_at": str(datetime.datetime.now()), # Mocking as we don't store it yet
            "status": status
        })
    return result

@app.post("/api/notes/upload")
def upload_notes(req: UploadRequest):
    note_ids = []
    for note in req.notes:
        nid = f"n{uuid.uuid4().hex[:4]}"  # e.g. "n1a2b"
        db_notes[nid] = note
        db_status[nid] = {
            "status": "pending",
            "current_step": "Pending",
            "steps": []
        }
        note_ids.append(nid)
    return {"note_ids": note_ids}


def run_crew_task(note_id: str, note_content: str):
    """Background task to run the CrewAI agents."""
    db_status[note_id] = {
        "status": "processing",
        "current_step": "Coding",
        "steps": ["Extracted conditions", "Fetching rules"]
    }
    
    try:
        inputs = {
            'note': note_content,
            'current_year': str(datetime.datetime.now().year)
        }
        # Execute crew
        crew = MedicalCrew().crew()
        result = crew.kickoff(inputs=inputs)
        
        # After execution, store the results securely. 
        if hasattr(result, 'pydantic') and result.pydantic:
            res_dict = result.pydantic.model_dump()
            db_results[note_id] = {
                "status": "completed",
                "icd10_codes": res_dict.get("icd10_codes", []),
                "cpt_codes": res_dict.get("cpt_codes", []),
                "confidence": res_dict.get("confidence", 0.0),
                "reasoning": res_dict.get("reasoning", []),
                "audit_trail": res_dict.get("audit_trail", [])
            }
        else:
            import json
            try:
                # If for some reason pydantic model isn't populated, but raw output is JSON
                raw_json = result.raw
                if raw_json.startswith("```json"):
                     raw_json = raw_json.split("```json")[1].split("```")[0]
                res_dict = json.loads(raw_json)
                db_results[note_id] = {
                    "status": "completed",
                    "icd10_codes": res_dict.get("icd10_codes", []),
                    "cpt_codes": res_dict.get("cpt_codes", []),
                    "confidence": res_dict.get("confidence", 0.0),
                    "reasoning": res_dict.get("reasoning", []),
                    "audit_trail": res_dict.get("audit_trail", [])
                }
            except Exception:
                db_results[note_id] = {
                    "status": "completed",
                    "icd10_codes": ["Error: Could not parse results"],
                    "cpt_codes": [],
                    "confidence": 0.0,
                    "reasoning": [str(result.raw)],
                    "audit_trail": ["Raw string output received instead of json"]
                }
        db_status[note_id]["status"] = "completed"
        db_status[note_id]["current_step"] = "Finished"
        
    except Exception as e:
        db_status[note_id]["status"] = "failed"
        db_status[note_id]["error"] = str(e)


@app.post("/api/processing/start")
def start_processing(req: StartProcessingRequest, background_tasks: BackgroundTasks):
    if req.note_id not in db_notes:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Kick off the heavy processing in the background so the frontend doesn't hang
    background_tasks.add_task(run_crew_task, req.note_id, db_notes[req.note_id])
    return {"status": "started", "note_id": req.note_id}


@app.get("/api/processing/status/{note_id}")
def get_status(note_id: str):
    if note_id not in db_status:
        raise HTTPException(status_code=404, detail="Status not found")
    return db_status[note_id]


@app.get("/api/results/{note_id}")
def get_results(note_id: str):
    if note_id in db_results:
        return db_results[note_id]
        
    status_info = db_status.get(note_id, {})
    
    # Example logic for clarification mode
    if status_info.get("status") == "needs_clarification":
         return {
            "status": "needs_clarification",
            "questions": ["Is diabetes type 1 or type 2?"]
         }
         
    raise HTTPException(status_code=404, detail="Result not ready or note not found")


@app.post("/api/clarification")
def submit_clarification(req: ClarificationRequest):
    if req.note_id not in db_notes:
         raise HTTPException(status_code=404, detail="Note not found")
         
    # Append the clarification answer to the original note and re-trigger
    appended_context = "\nClarification Answers: " + " ".join(req.answers)
    db_notes[req.note_id] += appended_context
    
    # Set status back to pending/processing if you want to rerun automatically
    db_status[req.note_id]["status"] = "clarification_received"
    
    return {"status": "clarification received, resume processing"}

def start_server():
    import uvicorn
    uvicorn.run("demo.api:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start_server()