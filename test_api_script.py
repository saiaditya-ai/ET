import requests
import time

def test_api():
    print("Testing Medical Coding API...")
    url = "http://localhost:8000/api/notes/upload"
    payload = {
        "notes": [
            "A 45-year-old male with a history of essential hypertension and type 2 diabetes mellitus presented with severe chest pain. EKG showed STEMI. He underwent an emergency angioplasty."
        ]
    }
    
    upload_res = requests.post(url, json=payload)
    print("Upload Response:", upload_res.status_code, upload_res.json())
    note_id = upload_res.json()["note_ids"][0]
    
    start_url = "http://localhost:8000/api/processing/start"
    start_res = requests.post(start_url, json={"note_id": note_id})
    print("Start Response:", start_res.status_code, start_res.json())
    
    status_url = f"http://localhost:8000/api/processing/status/{note_id}"
    while True:
        status_res = requests.get(status_url)
        status_data = status_res.json()
        print("Current Status:", status_data["status"])
        if status_data["status"] in ["completed", "failed"]:
            break
        time.sleep(5)
    
    if status_data["status"] == "completed":
        result_url = f"http://localhost:8000/api/results/{note_id}"
        result_res = requests.get(result_url)
        print("\n--- FINAL JSON RESULTS ---")
        import json
        print(json.dumps(result_res.json(), indent=2))

if __name__ == "__main__":
    test_api()
