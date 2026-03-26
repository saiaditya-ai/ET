from __future__ import annotations

from demo.services.workflow_service import WorkflowService


def run_pipeline(note: str):
    service = WorkflowService()
    upload_response = service.upload_notes([note])
    note_id = upload_response["note_ids"][0]
    service.start_processing(note_id)

    while True:
        status = service.get_status(note_id)
        if status["status"] == "needs_clarification":
            return {
                "status": "needs_clarification",
                "questions": status.get("questions", []),
            }
        if status["status"] == "completed":
            return service.get_result(note_id)
