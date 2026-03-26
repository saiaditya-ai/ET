from __future__ import annotations

from typing import Any

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from demo.services.workflow_service import workflow_service


app = FastAPI(title="Medical Coding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UploadRequest(BaseModel):
    notes: list[str] = Field(default_factory=list)


class StartProcessingRequest(BaseModel):
    note_id: str


class ClarificationRequest(BaseModel):
    note_id: str
    answers: Any


@app.get("/api/notes")
def get_all_notes() -> list[dict[str, Any]]:
    return workflow_service.get_all_notes()


@app.post("/api/notes/upload")
def upload_notes(req: UploadRequest) -> dict[str, list[str]]:
    if not req.notes:
        raise HTTPException(status_code=400, detail="At least one note is required")
    return workflow_service.upload_notes(req.notes)


@app.post("/api/processing/start")
def start_processing(
    req: StartProcessingRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    try:
        response = workflow_service.start_processing(req.note_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if workflow_service.can_attempt_crewai():
        background_tasks.add_task(workflow_service.run_crewai_processing, req.note_id)

    return response


@app.get("/api/processing/status/{note_id}")
def get_status(note_id: str) -> dict[str, Any]:
    try:
        return workflow_service.get_status(note_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/api/results/{note_id}")
def get_results(note_id: str) -> dict[str, Any]:
    try:
        return workflow_service.get_result(note_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/clarification")
def submit_clarification(req: ClarificationRequest) -> dict[str, str]:
    try:
        return workflow_service.submit_clarification(req.note_id, req.answers)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


def start_server() -> None:
    import uvicorn

    uvicorn.run("demo.api:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    start_server()
