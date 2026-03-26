const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function resolveApiBaseUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname, port, protocol } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalHost && port !== '8000') {
    return `${protocol}//${hostname}:8000`;
  }

  return '';
}

const API_BASE_URL = resolveApiBaseUrl();

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson(path, options, fallbackMessage) {
  try {
    const response = await fetch(apiUrl(path), options);
    return await parseJsonResponse(response, fallbackMessage);
  } catch (error) {
    if (error instanceof Error && error.name === 'TypeError') {
      const target = apiUrl(path);
      throw new Error(
        `Unable to reach the backend at ${target}. Start the API server on http://localhost:8000 or set VITE_API_BASE_URL.`
      );
    }

    throw error;
  }
}

async function parseJsonResponse(response, fallbackMessage) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      typeof payload?.detail === 'string'
        ? payload.detail
        : payload?.message || fallbackMessage;
    throw new Error(detail);
  }

  return payload;
}

const processingBlueprint = [
  {
    agent: 'Intake + Clinical Agent',
    step: 'Reading clinical note',
    detail: 'Extracting diagnoses, procedures, and decision-shaping context.',
    telemetry: ['Parsing note sections', 'Detecting chronology', 'Aligning symptoms to conditions'],
  },
  {
    agent: 'Coding Agent',
    step: 'Assigning ICD-10 candidates',
    detail: 'Mapping extracted findings to candidate diagnosis codes.',
    telemetry: ['Ranking diagnosis evidence', 'Linking note evidence to ICD clusters', 'Comparing specificity levels'],
  },
  {
    agent: 'Coding Agent',
    step: 'Assigning CPT candidates',
    detail: 'Matching documented services and procedures to CPT outputs.',
    telemetry: ['Checking procedures', 'Matching service intensity', 'Preparing billing-ready candidates'],
  },
  {
    agent: 'Validation + Ambiguity Agent',
    step: 'Checking ambiguity and missing specificity',
    detail: 'Searching for unclear diagnoses, missing type, laterality, or intent.',
    telemetry: ['Scanning ambiguity rules', 'Checking missing specificity', 'Preparing clarification prompts if needed'],
  },
  {
    agent: 'Audit Agent',
    step: 'Scoring confidence and generating audit trail',
    detail: 'Creating a trace of how the final coding decision was reached.',
    telemetry: ['Assembling reasoning', 'Scoring final confidence', 'Writing audit trace'],
  },
];

export const sampleClinicalNotes = [
  {
    title: 'Type 2 diabetes follow-up',
    content:
      'Patient returns for diabetes follow-up with fasting glucose 182 mg/dL. Type 2 diabetes and essential hypertension remain stable on metformin and lisinopril. Ordered HbA1c and comprehensive metabolic panel.',
  },
  {
    title: 'Ambiguous diabetes presentation',
    content:
      'Patient reports fatigue, thirst, frequent urination, and elevated glucose. Diabetes is suspected but type is not specified in the documentation. Please evaluate for proper coding and clarification needs.',
  },
  {
    title: 'Emergency stroke evaluation',
    content:
      '72-year-old female with acute right-sided weakness and slurred speech. CT head without contrast performed. Neurology consulted and inpatient admission initiated for stroke workup.',
  },
];

const noteStore = new Map();
const workflowStore = new Map();
const resultStore = new Map();

let noteCounter = 3;

seedDemoData();

function seedDemoData() {
  createSeededCompletedNote();
  createSeededClarificationNote();
  createSeededProcessingNote();
}

function createSeededCompletedNote() {
  const noteId = 'demo-complete';
  noteStore.set(noteId, {
    note_id: noteId,
    content: sampleClinicalNotes[0].content,
    preview: 'Type 2 diabetes follow-up with labs ordered and chronic condition review.',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  });
  resultStore.set(noteId, buildCompletedResult(noteId, sampleClinicalNotes[0].content));
}

function createSeededClarificationNote() {
  const noteId = 'demo-clarify';
  const timeline = buildProcessingTimeline(sampleClinicalNotes[1].content, true);
  const clarificationCursor = timeline.findIndex((entry) => entry.type === 'clarification_gate');
  noteStore.set(noteId, {
    note_id: noteId,
    content: sampleClinicalNotes[1].content,
    preview: 'Suspected diabetes without documented type; likely requires ambiguity handling.',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  });
  workflowStore.set(noteId, {
    status: 'needs_clarification',
    cursor: clarificationCursor,
    timeline,
    needsClarification: true,
    clarificationResolved: false,
    clarificationResumeCursor: clarificationCursor + 1,
  });
}

function createSeededProcessingNote() {
  const noteId = 'demo-processing';
  const timeline = buildProcessingTimeline(sampleClinicalNotes[2].content, false);
  noteStore.set(noteId, {
    note_id: noteId,
    content: sampleClinicalNotes[2].content,
    preview: 'Acute stroke evaluation with imaging and admission workflow in motion.',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  });
  workflowStore.set(noteId, {
    status: 'processing',
    cursor: 7,
    timeline,
    needsClarification: false,
    clarificationResolved: true,
  });
}

function createWorkflow(noteId) {
  const note = noteStore.get(noteId);
  const needsClarification = isClarificationLikely(note?.content || '');
  const timeline = buildProcessingTimeline(note?.content || '', needsClarification);
  const clarificationCursor = timeline.findIndex((entry) => entry.type === 'clarification_gate');

  workflowStore.set(noteId, {
    status: 'processing',
    cursor: 0,
    timeline,
    needsClarification,
    clarificationResolved: !needsClarification,
    clarificationAnswers: [],
    clarificationResumeCursor: clarificationCursor >= 0 ? clarificationCursor + 1 : timeline.length,
  });
}

function deriveLiveInsights(content, stepIndex) {
  const lowered = content.toLowerCase();
  const conditions = [];
  const procedures = [];
  const evidence = [];

  if (lowered.includes('diabetes')) {
    conditions.push('Diabetes mellitus');
    evidence.push('Glucose management context');
  }
  if (lowered.includes('hypertension')) {
    conditions.push('Essential hypertension');
    evidence.push('Chronic medication support');
  }
  if (lowered.includes('stroke') || lowered.includes('weakness')) {
    conditions.push('Acute neurologic deficit');
    evidence.push('Emergency presentation');
  }
  if (lowered.includes('ct')) {
    procedures.push('CT imaging');
    evidence.push('Imaging evidence');
  }
  if (lowered.includes('hba1c') || lowered.includes('metabolic panel')) {
    procedures.push('Laboratory workup');
    evidence.push('Ordered labs');
  }
  if (lowered.includes('admission')) {
    procedures.push('Hospital admission');
    evidence.push('Inpatient level of service');
  }

  const safeConditions = conditions.length ? conditions : ['Clinical condition under review'];
  const safeProcedures = procedures.length ? procedures : ['Procedural context pending'];
  const safeEvidence = evidence.length ? evidence : ['General note evidence'];

  return {
    conditions: safeConditions.slice(0, Math.min(3, stepIndex + 1)),
    procedures: safeProcedures.slice(0, Math.min(2, stepIndex + 1)),
    evidence: safeEvidence.slice(0, Math.min(3, stepIndex + 1)),
  };
}

function buildProcessingTimeline(content, needsClarification) {
  const timeline = processingBlueprint.flatMap((item, stageIndex) =>
    item.telemetry.map((telemetry, telemetryIndex) => ({
      type: 'telemetry',
      stageIndex,
      telemetryIndex,
      agent: item.agent,
      step: item.step,
      detail: item.detail,
      telemetry,
    }))
  );

  if (needsClarification) {
    const validationStageIndex = processingBlueprint.findIndex((item) => item.agent === 'Validation + Ambiguity Agent');
    const insertAt = processingBlueprint
      .slice(0, validationStageIndex + 1)
      .reduce((count, item) => count + item.telemetry.length, 0);

    timeline.splice(insertAt, 0, {
      type: 'clarification_gate',
      stageIndex: validationStageIndex,
      telemetryIndex: processingBlueprint[validationStageIndex].telemetry.length,
      agent: 'Validation + Ambiguity Agent',
      step: 'Clarification required',
      detail: 'Ambiguity detected. The workflow is paused until the clinician or operator responds.',
      telemetry: 'Generated hybrid clarification request',
    });
  }

  return timeline.map((entry, index) => ({
    ...entry,
    progress: Math.min(96, Math.round(((index + 1) / timeline.length) * 100)),
    timestamp: `${((index + 1) * 0.6).toFixed(1)}s`,
  }));
}

function buildActivityFeed(content, timeline, cursor) {
  const safeCursor = Math.max(0, Math.min(cursor, timeline.length - 1));
  const activeEvent = timeline[safeCursor];
  const stageIndex = activeEvent?.stageIndex ?? 0;
  const noteSignals = deriveLiveInsights(content, stageIndex);
  const signalDetail = noteSignals.evidence[Math.min(stageIndex, Math.max(noteSignals.evidence.length - 1, 0))];

  const feed = timeline.slice(0, safeCursor + 1).map((item, index) => ({
    agent: item.agent,
    title: item.telemetry,
    detail: item.type === 'clarification_gate' ? item.detail : `${item.step}. ${item.detail}`,
    status: index === safeCursor ? 'active' : 'completed',
    timestamp: item.timestamp,
  }));

  if (signalDetail) {
    feed.push({
      agent: 'Signal Layer',
      title: 'Evidence trace',
      detail: signalDetail,
      status: 'completed',
      timestamp: `${safeCursor + 1}.signal`,
    });
  }

  return feed;
}

function buildStatusPayload(workflow, noteId, status) {
  const note = noteStore.get(noteId);
  const cursor = Math.max(0, Math.min(workflow.cursor, workflow.timeline.length - 1));
  const currentEvent = workflow.timeline[cursor];
  const liveInsights = deriveLiveInsights(note.content, currentEvent?.stageIndex ?? 0);

  return {
    status,
    current_step: currentEvent?.step || 'Initializing workflow',
    current_agent: currentEvent?.agent || 'Intake + Clinical Agent',
    current_detail: currentEvent?.detail || 'Preparing the processing pipeline.',
    progress: currentEvent?.progress || 0,
    activity_feed: buildActivityFeed(note.content, workflow.timeline, cursor),
    extracted_entities: liveInsights,
    questions: status === 'needs_clarification' ? buildClarificationQuestions(note.content) : undefined,
  };
}

function isClarificationLikely(content) {
  const lowered = content.toLowerCase();
  return lowered.includes('diabetes') && !lowered.includes('type 1') && !lowered.includes('type 2');
}

function buildClarificationQuestions(content) {
  const lowered = content.toLowerCase();
  if (lowered.includes('diabetes')) {
    return [
      {
        id: 'diabetes_clarification',
        prompt: 'Confirm the diabetes type and add any supporting detail needed for coding.',
        options: ['Type 1', 'Type 2', 'Gestational', 'Unspecified'],
        answer_type: 'hybrid',
        required: true,
        selection_required: true,
        text_required: false,
        helper_text: 'Choose the most specific diabetes type documented in the chart, then add optional lab, medication, or insulin detail if available.',
        input_label: 'Select one diagnosis path',
        text_input_label: 'Add supporting clinical detail',
        placeholder: 'Example: A1c 8.2%, fasting glucose 210 mg/dL, currently on metformin.',
      },
    ];
  }

  return [
    {
      id: 'supporting_detail',
      prompt: 'What missing clinical detail should be considered before final validation?',
      answer_type: 'text',
      required: true,
      helper_text: 'Provide the exact specificity needed to validate the diagnosis or procedure code.',
      placeholder: 'Type the missing specificity here.',
      input_label: 'Required clarification',
    },
  ];
}

function buildCompletedResult(noteId, content, clarificationAnswers = []) {
  const lowered = content.toLowerCase();
  const clarifiedType = clarificationAnswers.find((answer) =>
    typeof answer === 'string' && answer.toLowerCase().includes('type 1')
  )
    ? 'type 1'
    : 'type 2';

  if (lowered.includes('stroke') || lowered.includes('weakness')) {
    return {
      note_id: noteId,
      status: 'completed',
      icd10_codes: [
        { code: 'I63.9', description: 'Cerebral infarction, unspecified', confidence: 0.95 },
        { code: 'R47.81', description: 'Slurred speech', confidence: 0.89 },
      ],
      cpt_codes: [
        { code: '70450', description: 'CT head or brain without contrast', confidence: 0.94 },
        { code: '99223', description: 'Initial hospital care, high complexity', confidence: 0.87 },
      ],
      confidence: 0.91,
      reasoning: [
        'Acute focal neurological deficits support ischemic stroke coding.',
        'Documented CT imaging and admission-level management support the selected CPT set.',
      ],
      audit_trail: [
        { step: 1, agent: 'Intake + Clinical Agent', action: 'Extracted acute neuro findings and imaging events', duration: '0.4s' },
        { step: 2, agent: 'Coding Agent', action: 'Matched stroke presentation to ICD-10 and CT/admission CPT outputs', duration: '0.8s' },
        { step: 3, agent: 'Audit Agent', action: 'Computed final confidence across extraction, coding, and validation signals', duration: '0.3s' },
      ],
    };
  }

  if (lowered.includes('diabetes')) {
    return {
      note_id: noteId,
      status: 'completed',
      icd10_codes: [
        {
          code: clarifiedType === 'type 1' ? 'E10.9' : 'E11.9',
          description:
            clarifiedType === 'type 1'
              ? 'Type 1 diabetes mellitus without complications'
              : 'Type 2 diabetes mellitus without complications',
          confidence: 0.95,
        },
        { code: 'I10', description: 'Essential (primary) hypertension', confidence: 0.92 },
      ],
      cpt_codes: [
        { code: '83036', description: 'Hemoglobin; glycosylated (A1c)', confidence: 0.9 },
        { code: '80053', description: 'Comprehensive metabolic panel', confidence: 0.85 },
      ],
      confidence: 0.9,
      reasoning: [
        `Documentation supports ${clarifiedType === 'type 1' ? 'Type 1' : 'Type 2'} diabetes coding based on the available diagnosis context and clarification.`,
        'Hypertension is directly documented and active treatment is present.',
      ],
      audit_trail: [
        { step: 1, agent: 'Intake + Clinical Agent', action: 'Identified diabetes, hypertension, and ordered labs', duration: '0.5s' },
        { step: 2, agent: 'Validation + Ambiguity Agent', action: 'Resolved missing diabetes specificity before final validation', duration: '0.6s' },
        { step: 3, agent: 'Audit Agent', action: 'Published confidence score and evidence-backed reasoning', duration: '0.2s' },
      ],
    };
  }

  return {
    note_id: noteId,
    status: 'completed',
    icd10_codes: [{ code: 'R69', description: 'Illness, unspecified', confidence: 0.72 }],
    cpt_codes: [{ code: '99213', description: 'Office or outpatient visit, established patient', confidence: 0.8 }],
    confidence: 0.78,
    reasoning: ['The note contains limited structured specificity, so a generalized coding outcome was returned for demo purposes.'],
    audit_trail: [
      { step: 1, agent: 'Intake + Clinical Agent', action: 'Extracted broad clinical summary', duration: '0.3s' },
      { step: 2, agent: 'Coding Agent', action: 'Generated default ICD-10 and CPT candidates', duration: '0.5s' },
      { step: 3, agent: 'Audit Agent', action: 'Logged fallback confidence for limited documentation', duration: '0.2s' },
    ],
  };
}

async function mockUploadNotes(notes) {
  await delay(450);

  const noteIds = notes.map((content) => {
    const noteId = `note-${noteCounter += 1}`;
    noteStore.set(noteId, {
      note_id: noteId,
      content,
      preview: content.slice(0, 110).trim(),
      uploaded_at: new Date().toISOString(),
    });
    return noteId;
  });

  return { note_ids: noteIds };
}

async function mockStartProcessing(noteId) {
  await delay(300);

  if (!noteStore.has(noteId)) {
    throw new Error('Note not found');
  }

  resultStore.delete(noteId);
  createWorkflow(noteId);
  return { success: true };
}

async function mockGetStatus(noteId) {
  await delay(280);

  if (resultStore.has(noteId)) {
    return { status: 'completed' };
  }

  const workflow = workflowStore.get(noteId);

  if (!noteStore.has(noteId) || !workflow) {
    throw new Error('Note not found');
  }

  if (workflow.status === 'needs_clarification' && !workflow.clarificationResolved) {
    return buildStatusPayload(workflow, noteId, 'needs_clarification');
  }

  if (workflow.cursor >= workflow.timeline.length) {
    const result = buildCompletedResult(
      noteId,
      noteStore.get(noteId).content,
      workflow.clarificationAnswers || []
    );
    resultStore.set(noteId, result);
    workflow.status = 'completed';
    return { status: 'completed', progress: 100 };
  }

  if (
    workflow.needsClarification &&
    !workflow.clarificationResolved &&
    workflow.timeline[workflow.cursor]?.type === 'clarification_gate'
  ) {
    workflow.status = 'needs_clarification';
    return buildStatusPayload(workflow, noteId, 'needs_clarification');
  }

  workflow.status = 'processing';
  const payload = buildStatusPayload(workflow, noteId, 'processing');
  workflow.cursor += 1;

  return payload;
}

async function mockGetResult(noteId) {
  await delay(250);

  if (!resultStore.has(noteId)) {
    throw new Error('Result not found');
  }

  return resultStore.get(noteId);
}

async function mockSendClarification(noteId, answers) {
  await delay(320);

  const workflow = workflowStore.get(noteId);

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  workflow.status = 'processing';
  workflow.clarificationResolved = true;
  workflow.clarificationAnswers = normalizeAnswers(answers);
  workflow.cursor = workflow.clarificationResumeCursor || workflow.cursor + 1;

  return { success: true };
}

async function mockGetAllNotes() {
  await delay(200);

  return [...noteStore.values()]
    .map((note) => ({
      ...note,
      status: resultStore.has(note.note_id)
        ? 'completed'
        : workflowStore.get(note.note_id)?.status || 'uploaded',
    }))
    .sort((left, right) => new Date(right.uploaded_at) - new Date(left.uploaded_at));
}

function normalizeAnswers(answers) {
  if (Array.isArray(answers)) {
    return answers.flatMap((value) => normalizeAnswers(value));
  }

  if (answers && typeof answers === 'object') {
    return Object.values(answers).flatMap((value) => normalizeAnswers(value));
  }

  if (typeof answers === 'string') {
    return answers.trim() ? [answers.trim()] : [];
  }

  return [];
}

async function realUploadNotes(notes) {
  return requestJson(
    '/api/notes/upload',
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
    },
    'Unable to upload note'
  );
}

async function realStartProcessing(noteId) {
  return requestJson(
    '/api/processing/start',
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_id: noteId }),
    },
    'Unable to start processing'
  );
}

async function realGetStatus(noteId) {
  return requestJson(`/api/processing/status/${noteId}`, undefined, 'Note not found');
}

async function realGetResult(noteId) {
  return requestJson(`/api/results/${noteId}`, undefined, 'Result not found');
}

async function realSendClarification(noteId, answers) {
  return requestJson(
    '/api/clarification',
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_id: noteId, answers }),
    },
    'Unable to submit clarification'
  );
}

async function realGetAllNotes() {
  return requestJson('/api/notes', undefined, 'Unable to load notes');
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const uploadNotes = USE_MOCK ? mockUploadNotes : realUploadNotes;
export const startProcessing = USE_MOCK ? mockStartProcessing : realStartProcessing;
export const getStatus = USE_MOCK ? mockGetStatus : realGetStatus;
export const getResult = USE_MOCK ? mockGetResult : realGetResult;
export const sendClarification = USE_MOCK ? mockSendClarification : realSendClarification;
export const getAllNotes = USE_MOCK ? mockGetAllNotes : realGetAllNotes;

export async function uploadNote(note) {
  const response = await uploadNotes([note]);
  return {
    success: Boolean(response.note_ids?.[0]),
    noteId: response.note_ids?.[0],
  };
}

export const USE_MOCK_DATA = USE_MOCK;
