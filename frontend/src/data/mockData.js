// ── Sample clinical notes ─────────────────────────────
export const sampleNotes = [
    {
        id: "n1",
        text: `Patient is a 58-year-old male presenting with persistent chest pain radiating to the left arm for the past 3 days. He has a history of type 2 diabetes mellitus and essential hypertension, both currently managed with medication. The patient reports shortness of breath on exertion and occasional dizziness. Physical examination reveals elevated blood pressure at 158/95 mmHg. ECG shows ST-segment elevation in leads II, III, and aVF. Lab results indicate elevated troponin levels. The patient was administered aspirin and nitroglycerin and is being referred for cardiac catheterization.`,
        preview: "58-year-old male with chest pain, DM type 2, hypertension, ST elevation...",
        uploadedAt: "2026-03-24T10:30:00Z",
        scenario: "completed",
    },
    {
        id: "n2",
        text: `Patient is a 45-year-old female presenting with fatigue, increased thirst, and frequent urination over the past 2 weeks. She has a family history of diabetes. Lab results show fasting blood glucose of 210 mg/dL. BMI is 32. No prior diagnosis of diabetes. Further clarification needed on presence of ketones and specific symptoms to differentiate type.`,
        preview: "45-year-old female with fatigue, polydipsia, polyuria, BG 210...",
        uploadedAt: "2026-03-24T11:15:00Z",
        scenario: "needs_clarification",
    },
    {
        id: "n3",
        text: `Patient is a 72-year-old female presenting with acute onset of right-sided weakness and slurred speech approximately 2 hours ago. CT scan of the head shows no hemorrhage. Patient has a history of atrial fibrillation and is on warfarin. INR is 1.8. NIHSS score is 12. tPA administration is being considered. Neurology consult has been requested.`,
        preview: "72-year-old female, right-sided weakness, slurred speech, AF on warfarin...",
        uploadedAt: "2026-03-24T12:00:00Z",
        scenario: "completed",
    },
];

// ── Processing step sequences ──────────────────────────
export const processingSteps = {
    n1: [
        { agent: "Intake Agent", step: "Reading clinical note...", duration: 800 },
        { agent: "Intake Agent", step: "Extracted 6 conditions and 3 procedures", duration: 1200 },
        { agent: "Coding Agent", step: "Querying ICD-10 knowledge base...", duration: 1000 },
        { agent: "Coding Agent", step: "Assigned 5 ICD-10 codes with reasoning", duration: 1500 },
        { agent: "Coding Agent", step: "Querying CPT knowledge base...", duration: 800 },
        { agent: "Coding Agent", step: "Assigned 4 CPT codes", duration: 1000 },
        { agent: "Validation Agent", step: "Checking for ambiguities...", duration: 1200 },
        { agent: "Validation Agent", step: "All diagnoses clear — codes validated ✓", duration: 800 },
        { agent: "Audit Agent", step: "Computing confidence scores...", duration: 600 },
        { agent: "Audit Agent", step: "Audit trail generated — processing complete ✓", duration: 500 },
    ],
    n2: [
        { agent: "Intake Agent", step: "Reading clinical note...", duration: 800 },
        { agent: "Intake Agent", step: "Extracted 3 conditions and 1 procedure", duration: 1000 },
        { agent: "Coding Agent", step: "Querying ICD-10 knowledge base...", duration: 1000 },
        { agent: "Coding Agent", step: "Preliminary codes assigned", duration: 1200 },
        { agent: "Validation Agent", step: "Checking for ambiguities...", duration: 1500 },
        { agent: "Validation Agent", step: "⚠ Ambiguity detected — clarification needed", duration: 800 },
    ],
    n3: [
        { agent: "Intake Agent", step: "Reading clinical note...", duration: 800 },
        { agent: "Intake Agent", step: "Extracted 4 conditions and 2 procedures", duration: 1200 },
        { agent: "Coding Agent", step: "Querying ICD-10 knowledge base...", duration: 1000 },
        { agent: "Coding Agent", step: "Assigned 4 ICD-10 codes with reasoning", duration: 1400 },
        { agent: "Coding Agent", step: "Querying CPT knowledge base...", duration: 800 },
        { agent: "Coding Agent", step: "Assigned 3 CPT codes", duration: 1000 },
        { agent: "Validation Agent", step: "Checking for ambiguities...", duration: 1200 },
        { agent: "Validation Agent", step: "All diagnoses clear — codes validated ✓", duration: 800 },
        { agent: "Audit Agent", step: "Computing confidence scores...", duration: 600 },
        { agent: "Audit Agent", step: "Audit trail generated — processing complete ✓", duration: 500 },
    ],
};

// ── Completed results ──────────────────────────────────
export const completedResults = {
    n1: {
        note_id: "n1",
        status: "completed",
        icd10_codes: [
            { code: "I21.19", description: "ST elevation MI involving other coronary artery of inferior wall", confidence: 0.95, linkedCondition: "STEMI" },
            { code: "R07.9", description: "Chest pain, unspecified", confidence: 0.96, linkedCondition: "Chest Pain" },
            { code: "E11.9", description: "Type 2 diabetes mellitus without complications", confidence: 0.99, linkedCondition: "Type 2 DM" },
            { code: "I10", description: "Essential (primary) hypertension", confidence: 0.98, linkedCondition: "Hypertension" },
            { code: "R06.02", description: "Shortness of breath", confidence: 0.91, linkedCondition: "Dyspnea" },
        ],
        cpt_codes: [
            { code: "93458", description: "Catheter placement in coronary artery for angiography", confidence: 0.93, linkedProcedure: "Cardiac Catheterization" },
            { code: "93000", description: "Electrocardiogram, routine ECG with 12 leads", confidence: 0.97, linkedProcedure: "ECG" },
            { code: "84484", description: "Troponin, quantitative", confidence: 0.95, linkedProcedure: "Troponin Test" },
            { code: "80053", description: "Comprehensive metabolic panel", confidence: 0.88, linkedProcedure: "Lab Panel" },
        ],
        confidence: 0.94,
        reasoning: [
            "Identified ST-segment elevation in leads II, III, aVF → classified as inferior wall STEMI (I21.19)",
            "Chest pain radiating to left arm with elevated troponin confirms acute coronary syndrome",
            "Type 2 diabetes mellitus documented as current managed condition → E11.9",
            "Essential hypertension with BP 158/95 → I10",
            "Shortness of breath on exertion supports R06.02",
            "Cardiac catheterization referral → CPT 93458; ECG performed → CPT 93000",
        ],
        audit_trail: [
            { step: 1, agent: "Intake Agent", action: "Parsed clinical note — identified 23 medical entities via NER", duration: "0.4s" },
            { step: 2, agent: "Intake Agent", action: "Classified entities: 6 conditions, 3 procedures, 4 medications", duration: "0.8s" },
            { step: 3, agent: "Coding Agent", action: "ICD-10 assignment via BioBERT + SNOMED CT cross-reference", duration: "1.2s" },
            { step: 4, agent: "Coding Agent", action: "CPT mapping against CMS guidelines with bundling check", duration: "0.9s" },
            { step: 5, agent: "Validation Agent", action: "Ambiguity check passed — all diagnoses have sufficient evidence", duration: "0.6s" },
            { step: 6, agent: "Audit Agent", action: "Ensemble confidence scoring across 3 models — weighted average: 94%", duration: "0.3s" },
        ],
    },
    n3: {
        note_id: "n3",
        status: "completed",
        icd10_codes: [
            { code: "I63.9", description: "Cerebral infarction, unspecified", confidence: 0.93, linkedCondition: "Ischemic Stroke" },
            { code: "I48.91", description: "Unspecified atrial fibrillation", confidence: 0.97, linkedCondition: "Atrial Fibrillation" },
            { code: "R47.1", description: "Dysarthria and anarthria", confidence: 0.90, linkedCondition: "Slurred Speech" },
            { code: "G81.91", description: "Hemiplegia, unspecified, affecting right dominant side", confidence: 0.88, linkedCondition: "Right-Sided Weakness" },
        ],
        cpt_codes: [
            { code: "70551", description: "MRI brain without contrast", confidence: 0.91, linkedProcedure: "Brain MRI" },
            { code: "70450", description: "CT head/brain without contrast", confidence: 0.96, linkedProcedure: "CT Head" },
            { code: "99223", description: "Initial hospital care, high complexity", confidence: 0.89, linkedProcedure: "Hospital Admission" },
        ],
        confidence: 0.91,
        reasoning: [
            "Acute right-sided weakness + slurred speech + no hemorrhage on CT → ischemic stroke (I63.9)",
            "History of atrial fibrillation as documented → I48.91",
            "NIHSS 12 indicates moderate-severe stroke; tPA consideration appropriate",
            "CT head performed → CPT 70450; neurology consult supports 99223",
        ],
        audit_trail: [
            { step: 1, agent: "Intake Agent", action: "Parsed note — 18 medical entities extracted", duration: "0.3s" },
            { step: 2, agent: "Intake Agent", action: "Classified: 4 conditions, 2 procedures, 2 medications", duration: "0.7s" },
            { step: 3, agent: "Coding Agent", action: "ICD-10 assigned via stroke classification model", duration: "1.1s" },
            { step: 4, agent: "Coding Agent", action: "CPT codes mapped with radiology and E&M guidelines", duration: "0.8s" },
            { step: 5, agent: "Validation Agent", action: "Validated — evidence sufficient for all codes", duration: "0.5s" },
            { step: 6, agent: "Audit Agent", action: "Confidence ensemble: 91% weighted average", duration: "0.3s" },
        ],
    },
};

// ── Ambiguous result ───────────────────────────────────
export const ambiguousResult = {
    note_id: "n2",
    status: "needs_clarification",
    questions: [
        "Is the diabetes Type 1 or Type 2? The note mentions family history but no prior diagnosis.",
        "Are ketones present in urine? This affects the specificity of the ICD-10 code.",
        "Has the patient experienced any episodes of diabetic ketoacidosis (DKA)?",
    ],
};

// ── Result after clarification ─────────────────────────
export const clarifiedResult = {
    note_id: "n2",
    status: "completed",
    icd10_codes: [
        { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia", confidence: 0.96, linkedCondition: "Type 2 DM with Hyperglycemia" },
        { code: "E66.01", description: "Morbid obesity due to excess calories", confidence: 0.85, linkedCondition: "Obesity (BMI 32)" },
        { code: "R63.1", description: "Polydipsia", confidence: 0.92, linkedCondition: "Increased Thirst" },
    ],
    cpt_codes: [
        { code: "82947", description: "Glucose; quantitative, blood", confidence: 0.97, linkedProcedure: "Blood Glucose" },
        { code: "83036", description: "Hemoglobin; glycosylated (A1c)", confidence: 0.90, linkedProcedure: "HbA1c Test" },
    ],
    confidence: 0.92,
    reasoning: [
        "Patient confirmed Type 2 DM — with fasting glucose 210 → E11.65 (hyperglycemia)",
        "BMI 32 qualifies as morbid obesity → E66.01",
        "Increased thirst (polydipsia) as presenting symptom → R63.1",
        "No ketones present — ruled out DKA, confirming Type 2 classification",
    ],
    audit_trail: [
        { step: 1, agent: "Intake Agent", action: "Re-parsed note with clarification answers", duration: "0.3s" },
        { step: 2, agent: "Coding Agent", action: "Reclassified diabetes with user-confirmed type", duration: "1.0s" },
        { step: 3, agent: "Validation Agent", action: "All ambiguities resolved — codes validated", duration: "0.5s" },
        { step: 4, agent: "Audit Agent", action: "Updated confidence: 92%", duration: "0.2s" },
    ],
};
