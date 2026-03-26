from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import importlib.util
import json
import os
import threading
import uuid
from typing import Any


PROCESSING_BLUEPRINT = [
    {
        "agent": "Intake + Clinical Agent",
        "step": "Reading clinical note",
        "detail": "Extracting diagnoses, procedures, and decision-shaping context.",
        "telemetry": [
            "Parsing note sections",
            "Detecting chronology",
            "Aligning symptoms to conditions",
        ],
    },
    {
        "agent": "Coding Agent",
        "step": "Assigning ICD-10 candidates",
        "detail": "Mapping extracted findings to candidate diagnosis codes.",
        "telemetry": [
            "Ranking diagnosis evidence",
            "Linking note evidence to ICD clusters",
            "Comparing specificity levels",
        ],
    },
    {
        "agent": "Coding Agent",
        "step": "Assigning CPT candidates",
        "detail": "Matching documented services and procedures to CPT outputs.",
        "telemetry": [
            "Checking procedures",
            "Matching service intensity",
            "Preparing billing-ready candidates",
        ],
    },
    {
        "agent": "Validation + Ambiguity Agent",
        "step": "Checking ambiguity and missing specificity",
        "detail": "Searching for unclear diagnoses, missing type, laterality, or intent.",
        "telemetry": [
            "Scanning ambiguity rules",
            "Checking missing specificity",
            "Preparing clarification prompts if needed",
        ],
    },
    {
        "agent": "Audit Agent",
        "step": "Scoring confidence and generating audit trail",
        "detail": "Creating a trace of how the final coding decision was reached.",
        "telemetry": [
            "Assembling reasoning",
            "Scoring final confidence",
            "Writing audit trace",
        ],
    },
]


@dataclass
class NoteRecord:
    note_id: str
    content: str
    preview: str
    uploaded_at: str


@dataclass
class WorkflowState:
    status: str
    cursor: int
    timeline: list[dict[str, Any]]
    needs_clarification: bool
    clarification_resolved: bool
    clarification_answers: list[str] = field(default_factory=list)
    clarification_resume_cursor: int = 0
    live_run_started: bool = False
    live_run_finished: bool = False
    live_run_error: str | None = None


class WorkflowService:
    def __init__(self) -> None:
        self.notes: dict[str, NoteRecord] = {}
        self.workflows: dict[str, WorkflowState] = {}
        self.results: dict[str, dict[str, Any]] = {}
        self._lock = threading.RLock()

    def upload_notes(self, notes: list[str]) -> dict[str, list[str]]:
        note_ids: list[str] = []
        with self._lock:
            for content in notes:
                note_id = f"n{uuid.uuid4().hex[:8]}"
                self.notes[note_id] = NoteRecord(
                    note_id=note_id,
                    content=content,
                    preview=self._build_preview(content),
                    uploaded_at=self._now_iso(),
                )
                note_ids.append(note_id)
        return {"note_ids": note_ids}

    def get_all_notes(self) -> list[dict[str, Any]]:
        with self._lock:
            rows = []
            for note_id, note in self.notes.items():
                workflow = self.workflows.get(note_id)
                status = "uploaded"
                if note_id in self.results:
                    status = "completed"
                elif workflow:
                    status = workflow.status
                rows.append(
                    {
                        "note_id": note.note_id,
                        "content": note.content,
                        "preview": note.preview,
                        "uploaded_at": note.uploaded_at,
                        "status": status,
                    }
                )
        return sorted(rows, key=lambda item: item["uploaded_at"], reverse=True)

    def start_processing(self, note_id: str) -> dict[str, Any]:
        with self._lock:
            note = self.notes.get(note_id)
            if not note:
                raise KeyError("Note not found")

            self.results.pop(note_id, None)
            self.workflows[note_id] = self._create_workflow(note.content)

        return {"status": "started", "note_id": note_id}

    def get_status(self, note_id: str) -> dict[str, Any]:
        with self._lock:
            note = self.notes.get(note_id)
            workflow = self.workflows.get(note_id)

            if not note or not workflow:
                raise KeyError("Status not found")

            if note_id in self.results:
                return {"status": "completed", "progress": 100}

            if workflow.live_run_error:
                workflow.status = "failed"
                return {
                    "status": "failed",
                    "current_step": "Processing failed",
                    "current_agent": "System",
                    "current_detail": workflow.live_run_error,
                    "progress": 100,
                    "activity_feed": [],
                    "extracted_entities": self._derive_live_insights(note.content, 0),
                }

            if workflow.status == "needs_clarification" and not workflow.clarification_resolved:
                return self._build_status_payload(workflow, note, "needs_clarification")

            if workflow.cursor >= len(workflow.timeline):
                if note_id not in self.results:
                    self.results[note_id] = self._build_completed_result(
                        note_id,
                        note.content,
                        workflow.clarification_answers,
                    )
                workflow.status = "completed"
                return {"status": "completed", "progress": 100}

            current_event = workflow.timeline[workflow.cursor]
            if (
                workflow.needs_clarification
                and not workflow.clarification_resolved
                and current_event["type"] == "clarification_gate"
            ):
                workflow.status = "needs_clarification"
                return self._build_status_payload(workflow, note, "needs_clarification")

            workflow.status = "processing"
            payload = self._build_status_payload(workflow, note, "processing")
            workflow.cursor += 1
            return payload

    def get_result(self, note_id: str) -> dict[str, Any]:
        with self._lock:
            result = self.results.get(note_id)
            if result:
                return result
        raise KeyError("Result not ready or note not found")

    def submit_clarification(self, note_id: str, answers: Any) -> dict[str, str]:
        normalized_answers = self._normalize_answers(answers)
        with self._lock:
            note = self.notes.get(note_id)
            workflow = self.workflows.get(note_id)
            if not note or not workflow:
                raise KeyError("Note not found")

            workflow.clarification_answers = normalized_answers
            workflow.clarification_resolved = True
            workflow.status = "processing"
            workflow.cursor = workflow.clarification_resume_cursor or workflow.cursor + 1

            if normalized_answers:
                note.content = (
                    f"{note.content}\nClarification Answers: {' | '.join(normalized_answers)}"
                )
                note.preview = self._build_preview(note.content)

        return {"status": "clarification received, resume processing"}

    def can_attempt_crewai(self) -> bool:
        enabled = os.getenv("ENABLE_CREWAI_PROCESSING", "true").lower() in {
            "1",
            "true",
            "yes",
        }
        return enabled and importlib.util.find_spec("crewai") is not None

    def run_crewai_processing(self, note_id: str) -> None:
        with self._lock:
            note = self.notes.get(note_id)
            workflow = self.workflows.get(note_id)
            if not note or not workflow or workflow.live_run_started:
                return
            workflow.live_run_started = True

        try:
            result = self._run_crewai(note_id, note.content)
            if result is None:
                return
            with self._lock:
                self.results[note_id] = result
                current_workflow = self.workflows.get(note_id)
                if current_workflow:
                    current_workflow.status = "completed"
                    current_workflow.cursor = len(current_workflow.timeline)
                    current_workflow.live_run_finished = True
        except Exception as exc:  # pragma: no cover - defensive path
            with self._lock:
                current_workflow = self.workflows.get(note_id)
                if current_workflow:
                    current_workflow.live_run_error = str(exc)

    def _run_crewai(self, note_id: str, note_content: str) -> dict[str, Any] | None:
        from datetime import datetime

        try:
            from demo.crew import MedicalCrew
        except Exception:
            return None

        crew = MedicalCrew().crew()
        result = crew.kickoff(
            inputs={
                "note": note_content,
                "current_year": str(datetime.now().year),
            }
        )

        parsed = None
        if hasattr(result, "pydantic") and result.pydantic:
            parsed = result.pydantic.model_dump()
        elif hasattr(result, "raw"):
            raw = str(result.raw).strip()
            if raw.startswith("```json"):
                raw = raw.split("```json", 1)[1].split("```", 1)[0].strip()
            parsed = json.loads(raw)

        if not parsed:
            return None

        return {
            "note_id": note_id,
            "status": "completed",
            "icd10_codes": parsed.get("icd10_codes", []),
            "cpt_codes": parsed.get("cpt_codes", []),
            "confidence": parsed.get("confidence", 0.0),
            "reasoning": parsed.get("reasoning", []),
            "audit_trail": parsed.get("audit_trail", []),
        }

    def _create_workflow(self, note_content: str) -> WorkflowState:
        needs_clarification = self._is_clarification_likely(note_content)
        timeline = self._build_processing_timeline(needs_clarification)
        clarification_cursor = next(
            (
                index
                for index, item in enumerate(timeline)
                if item["type"] == "clarification_gate"
            ),
            -1,
        )
        return WorkflowState(
            status="processing",
            cursor=0,
            timeline=timeline,
            needs_clarification=needs_clarification,
            clarification_resolved=not needs_clarification,
            clarification_resume_cursor=(
                clarification_cursor + 1 if clarification_cursor >= 0 else len(timeline)
            ),
        )

    def _build_status_payload(
        self,
        workflow: WorkflowState,
        note: NoteRecord,
        status: str,
    ) -> dict[str, Any]:
        cursor = max(0, min(workflow.cursor, len(workflow.timeline) - 1))
        current_event = workflow.timeline[cursor]
        live_insights = self._derive_live_insights(
            note.content,
            current_event.get("stage_index", 0),
        )
        payload: dict[str, Any] = {
            "status": status,
            "current_step": current_event.get("step", "Initializing workflow"),
            "current_agent": current_event.get("agent", "Intake + Clinical Agent"),
            "current_detail": current_event.get(
                "detail", "Preparing the processing pipeline."
            ),
            "progress": current_event.get("progress", 0),
            "activity_feed": self._build_activity_feed(note.content, workflow.timeline, cursor),
            "extracted_entities": live_insights,
        }
        if status == "needs_clarification":
            payload["questions"] = self._build_clarification_questions(note.content)
        return payload

    def _build_processing_timeline(self, needs_clarification: bool) -> list[dict[str, Any]]:
        timeline: list[dict[str, Any]] = []
        for stage_index, item in enumerate(PROCESSING_BLUEPRINT):
            for telemetry_index, telemetry in enumerate(item["telemetry"]):
                timeline.append(
                    {
                        "type": "telemetry",
                        "stage_index": stage_index,
                        "telemetry_index": telemetry_index,
                        "agent": item["agent"],
                        "step": item["step"],
                        "detail": item["detail"],
                        "telemetry": telemetry,
                    }
                )

        if needs_clarification:
            validation_stage_index = next(
                index
                for index, item in enumerate(PROCESSING_BLUEPRINT)
                if item["agent"] == "Validation + Ambiguity Agent"
            )
            insert_at = sum(
                len(item["telemetry"])
                for item in PROCESSING_BLUEPRINT[: validation_stage_index + 1]
            )
            timeline.insert(
                insert_at,
                {
                    "type": "clarification_gate",
                    "stage_index": validation_stage_index,
                    "telemetry_index": len(
                        PROCESSING_BLUEPRINT[validation_stage_index]["telemetry"]
                    ),
                    "agent": "Validation + Ambiguity Agent",
                    "step": "Clarification required",
                    "detail": (
                        "Ambiguity detected. The workflow is paused until the clinician "
                        "or operator responds."
                    ),
                    "telemetry": "Generated hybrid clarification request",
                },
            )

        total = max(len(timeline), 1)
        for index, entry in enumerate(timeline):
            entry["progress"] = min(96, round(((index + 1) / total) * 100))
            entry["timestamp"] = f"{((index + 1) * 0.6):.1f}s"
        return timeline

    def _build_activity_feed(
        self,
        content: str,
        timeline: list[dict[str, Any]],
        cursor: int,
    ) -> list[dict[str, Any]]:
        safe_cursor = max(0, min(cursor, len(timeline) - 1))
        active_event = timeline[safe_cursor]
        stage_index = active_event.get("stage_index", 0)
        note_signals = self._derive_live_insights(content, stage_index)
        evidence = note_signals["evidence"]
        evidence_index = min(stage_index, max(len(evidence) - 1, 0))
        signal_detail = evidence[evidence_index] if evidence else ""

        feed = [
            {
                "agent": item["agent"],
                "title": item["telemetry"],
                "detail": (
                    item["detail"]
                    if item["type"] == "clarification_gate"
                    else f"{item['step']}. {item['detail']}"
                ),
                "status": "active" if index == safe_cursor else "completed",
                "timestamp": item["timestamp"],
            }
            for index, item in enumerate(timeline[: safe_cursor + 1])
        ]

        if signal_detail:
            feed.append(
                {
                    "agent": "Signal Layer",
                    "title": "Evidence trace",
                    "detail": signal_detail,
                    "status": "completed",
                    "timestamp": f"{safe_cursor + 1}.signal",
                }
            )
        return feed

    def _derive_live_insights(self, content: str, step_index: int) -> dict[str, list[str]]:
        lowered = content.lower()
        conditions: list[str] = []
        procedures: list[str] = []
        evidence: list[str] = []

        if "diabetes" in lowered:
            conditions.append("Diabetes mellitus")
            evidence.append("Glucose management context")
        if "hypertension" in lowered:
            conditions.append("Essential hypertension")
            evidence.append("Chronic medication support")
        if "stroke" in lowered or "weakness" in lowered:
            conditions.append("Acute neurologic deficit")
            evidence.append("Emergency presentation")
        if "ct" in lowered:
            procedures.append("CT imaging")
            evidence.append("Imaging evidence")
        if "hba1c" in lowered or "metabolic panel" in lowered:
            procedures.append("Laboratory workup")
            evidence.append("Ordered labs")
        if "admission" in lowered:
            procedures.append("Hospital admission")
            evidence.append("Inpatient level of service")

        safe_conditions = conditions or ["Clinical condition under review"]
        safe_procedures = procedures or ["Procedural context pending"]
        safe_evidence = evidence or ["General note evidence"]

        return {
            "conditions": safe_conditions[: min(3, step_index + 1)],
            "procedures": safe_procedures[: min(2, step_index + 1)],
            "evidence": safe_evidence[: min(3, step_index + 1)],
        }

    def _build_clarification_questions(self, content: str) -> list[dict[str, Any]]:
        lowered = content.lower()
        if "diabetes" in lowered:
            return [
                {
                    "id": "diabetes_clarification",
                    "prompt": (
                        "Confirm the diabetes type and add any supporting detail "
                        "needed for coding."
                    ),
                    "options": ["Type 1", "Type 2", "Gestational", "Unspecified"],
                    "answer_type": "hybrid",
                    "required": True,
                    "selection_required": True,
                    "text_required": False,
                    "helper_text": (
                        "Choose the most specific diabetes type documented in the chart, "
                        "then add optional lab, medication, or insulin detail if available."
                    ),
                    "input_label": "Select one diagnosis path",
                    "text_input_label": "Add supporting clinical detail",
                    "placeholder": (
                        "Example: A1c 8.2%, fasting glucose 210 mg/dL, currently on "
                        "metformin."
                    ),
                }
            ]

        return [
            {
                "id": "supporting_detail",
                "prompt": (
                    "What missing clinical detail should be considered before final "
                    "validation?"
                ),
                "answer_type": "text",
                "required": True,
                "helper_text": (
                    "Provide the exact specificity needed to validate the diagnosis "
                    "or procedure code."
                ),
                "placeholder": "Type the missing specificity here.",
                "input_label": "Required clarification",
            }
        ]

    def _build_completed_result(
        self,
        note_id: str,
        content: str,
        clarification_answers: list[str] | None = None,
    ) -> dict[str, Any]:
        clarification_answers = clarification_answers or []
        lowered = content.lower()
        lowered_answers = " ".join(clarification_answers).lower()
        clarified_type = "type 1" if "type 1" in lowered_answers else "type 2"

        if "stroke" in lowered or "weakness" in lowered:
            return {
                "note_id": note_id,
                "status": "completed",
                "icd10_codes": [
                    {
                        "code": "I63.9",
                        "description": "Cerebral infarction, unspecified",
                        "confidence": 0.95,
                    },
                    {
                        "code": "R47.81",
                        "description": "Slurred speech",
                        "confidence": 0.89,
                    },
                ],
                "cpt_codes": [
                    {
                        "code": "70450",
                        "description": "CT head or brain without contrast",
                        "confidence": 0.94,
                    },
                    {
                        "code": "99223",
                        "description": "Initial hospital care, high complexity",
                        "confidence": 0.87,
                    },
                ],
                "confidence": 0.91,
                "reasoning": [
                    "Acute focal neurological deficits support ischemic stroke coding.",
                    (
                        "Documented CT imaging and admission-level management support "
                        "the selected CPT set."
                    ),
                ],
                "audit_trail": [
                    {
                        "step": 1,
                        "agent": "Intake + Clinical Agent",
                        "action": "Extracted acute neuro findings and imaging events",
                        "duration": "0.4s",
                    },
                    {
                        "step": 2,
                        "agent": "Coding Agent",
                        "action": (
                            "Matched stroke presentation to ICD-10 and CT/admission "
                            "CPT outputs"
                        ),
                        "duration": "0.8s",
                    },
                    {
                        "step": 3,
                        "agent": "Audit Agent",
                        "action": (
                            "Computed final confidence across extraction, coding, and "
                            "validation signals"
                        ),
                        "duration": "0.3s",
                    },
                ],
            }

        if "diabetes" in lowered:
            return {
                "note_id": note_id,
                "status": "completed",
                "icd10_codes": [
                    {
                        "code": "E10.9" if clarified_type == "type 1" else "E11.9",
                        "description": (
                            "Type 1 diabetes mellitus without complications"
                            if clarified_type == "type 1"
                            else "Type 2 diabetes mellitus without complications"
                        ),
                        "confidence": 0.95,
                    },
                    {
                        "code": "I10",
                        "description": "Essential (primary) hypertension",
                        "confidence": 0.92,
                    },
                ],
                "cpt_codes": [
                    {
                        "code": "83036",
                        "description": "Hemoglobin; glycosylated (A1c)",
                        "confidence": 0.90,
                    },
                    {
                        "code": "80053",
                        "description": "Comprehensive metabolic panel",
                        "confidence": 0.85,
                    },
                ],
                "confidence": 0.90,
                "reasoning": [
                    (
                        f"Documentation supports {clarified_type.title()} diabetes coding "
                        "based on the available diagnosis context and clarification."
                    ),
                    "Hypertension is directly documented and active treatment is present.",
                ],
                "audit_trail": [
                    {
                        "step": 1,
                        "agent": "Intake + Clinical Agent",
                        "action": "Identified diabetes, hypertension, and ordered labs",
                        "duration": "0.5s",
                    },
                    {
                        "step": 2,
                        "agent": "Validation + Ambiguity Agent",
                        "action": (
                            "Resolved missing diabetes specificity before final validation"
                        ),
                        "duration": "0.6s",
                    },
                    {
                        "step": 3,
                        "agent": "Audit Agent",
                        "action": (
                            "Published confidence score and evidence-backed reasoning"
                        ),
                        "duration": "0.2s",
                    },
                ],
            }

        return {
            "note_id": note_id,
            "status": "completed",
            "icd10_codes": [
                {
                    "code": "R69",
                    "description": "Illness, unspecified",
                    "confidence": 0.72,
                }
            ],
            "cpt_codes": [
                {
                    "code": "99213",
                    "description": "Office or outpatient visit, established patient",
                    "confidence": 0.80,
                }
            ],
            "confidence": 0.78,
            "reasoning": [
                (
                    "The note contains limited structured specificity, so a generalized "
                    "coding outcome was returned for demo purposes."
                )
            ],
            "audit_trail": [
                {
                    "step": 1,
                    "agent": "Intake + Clinical Agent",
                    "action": "Extracted broad clinical summary",
                    "duration": "0.3s",
                },
                {
                    "step": 2,
                    "agent": "Coding Agent",
                    "action": "Generated default ICD-10 and CPT candidates",
                    "duration": "0.5s",
                },
                {
                    "step": 3,
                    "agent": "Audit Agent",
                    "action": "Logged fallback confidence for limited documentation",
                    "duration": "0.2s",
                },
            ],
        }

    def _is_clarification_likely(self, content: str) -> bool:
        lowered = content.lower()
        return "diabetes" in lowered and "type 1" not in lowered and "type 2" not in lowered

    def _normalize_answers(self, answers: Any) -> list[str]:
        if isinstance(answers, list):
            result: list[str] = []
            for item in answers:
                result.extend(self._normalize_answers(item))
            return result

        if isinstance(answers, dict):
            result = []
            for value in answers.values():
                result.extend(self._normalize_answers(value))
            return result

        if isinstance(answers, str):
            value = answers.strip()
            return [value] if value else []

        return []

    def _build_preview(self, content: str) -> str:
        cleaned = " ".join(content.split())
        return f"{cleaned[:110]}..." if len(cleaned) > 110 else cleaned

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()


workflow_service = WorkflowService()
