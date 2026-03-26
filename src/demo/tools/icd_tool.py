import requests
from crewai.tools import tool

@tool("ICD Search Tool")
def icd_tool(query: str):
    url = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"
    params = {
        "terms": query,
        "sf": "code,name",
        "maxList": 3
    }

    res = requests.get(url, params=params)
    data = res.json()

    codes = data[1]
    display = data[3]

    results = []
    for i in range(len(codes)):
        results.append({
            "code": codes[i],
            "description": display[i][1]
        })

    return results