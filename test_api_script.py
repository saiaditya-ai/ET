import json
import os
import time

import requests


BASE_URL = os.getenv("MEDICAL_CODING_API_URL", "http://localhost:8000")


def test_api():
    print("Testing Medical Coding API...")
    upload_res = requests.post(
        f"{BASE_URL}/api/notes/upload",
        json={
            "notes": [
                (
                    "Patient returns for diabetes follow-up with fasting glucose "
                    "182 mg/dL. Diabetes remains stable on metformin. Ordered "
                    "HbA1c and comprehensive metabolic panel."
                )
            ]
        },
        timeout=15,
    )
    upload_res.raise_for_status()
    upload_payload = upload_res.json()
    note_id = upload_payload["note_ids"][0]
    print("Upload Response:", upload_payload)

    start_res = requests.post(
        f"{BASE_URL}/api/processing/start",
        json={"note_id": note_id},
        timeout=15,
    )
    start_res.raise_for_status()
    print("Start Response:", start_res.json())

    while True:
        status_res = requests.get(
            f"{BASE_URL}/api/processing/status/{note_id}",
            timeout=15,
        )
        status_res.raise_for_status()
        status_data = status_res.json()
        print("Current Status:", status_data["status"])

        if status_data["status"] == "needs_clarification":
            clarification_res = requests.post(
                f"{BASE_URL}/api/clarification",
                json={
                    "note_id": note_id,
                    "answers": {
                        "diabetes_clarification": {
                            "choice": "Type 2",
                            "text": "A1c elevated, on metformin, no insulin use documented.",
                        }
                    },
                },
                timeout=15,
            )
            clarification_res.raise_for_status()
            print("Clarification Response:", clarification_res.json())

        if status_data["status"] in {"completed", "failed"}:
            break

        time.sleep(1)

    if status_data["status"] == "completed":
        result_res = requests.get(f"{BASE_URL}/api/results/{note_id}", timeout=15)
        result_res.raise_for_status()
        print("\n--- FINAL JSON RESULTS ---")
        print(json.dumps(result_res.json(), indent=2))


if __name__ == "__main__":
    test_api()
