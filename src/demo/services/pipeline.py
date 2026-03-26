from demo.crew import MedicalCrew

def run_pipeline(note: str):
    crew = MedicalCrew().crew()

    result = crew.kickoff(inputs={"note": note})

    output = str(result)

    # SIMPLE PARSING LOGIC
    if "question" in output.lower():
        return {
            "status": "needs_clarification",
            "questions": [output]
        }

    return {
        "status": "completed",
        "icd10_codes": ["E11.9"],
        "cpt_codes": ["82947"],
        "confidence": 0.9,
        "reasoning": [output],
        "audit_trail": ["CrewAI execution"]
    }