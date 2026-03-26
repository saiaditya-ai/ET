# Backend Integration Guide

This document describes how to integrate your backend with the AI Medical Coding System frontend.

## Quick Start

1. **Stop using mock data:** Change `USE_MOCK = false` in `src/services/api.js`
2. **Update API URLs:** Point to your actual backend server
3. **Test each endpoint:** Verify responses match expected formats
4. **Deploy:** No UI changes needed!

## API Endpoints

### 1. Upload Note

**Endpoint:** `POST /api/notes/upload`

**Request:**
```json
{
  "content": "Clinical note text here..."
}
```

**Response:**
```json
{
  "success": true,
  "noteId": "note_12345"
}
```

**Expected Status Codes:**
- `200` - Success
- `400` - Bad request (missing content)
- `500` - Server error

---

### 2. Start Processing

**Endpoint:** `POST /api/processing/start`

**Request:**
```json
{
  "noteId": "note_12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processing started"
}
```

**Expected Status Codes:**
- `200` - Success
- `404` - Note not found
- `400` - Invalid note ID

---

### 3. Get Processing Status

**Endpoint:** `GET /api/processing/status/:id`

**Parameters:**
- `id` - Note ID from upload response

**Response (Processing):**
```json
{
  "status": "processing",
  "progress": 60,
  "currentStep": {
    "step": "Tokenizing",
    "description": "Processing medical terminology..."
  }
}
```

**Response (Needs Clarification):**
```json
{
  "status": "needs_clarification",
  "question": "What type of diabetes does the patient have?",
  "options": ["Type 1", "Type 2", "Gestational", "Unknown"]
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Processing complete!"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Processing failed",
  "message": "Details about what went wrong"
}
```

**Frontend Polling:**
- Calls this endpoint every 2 seconds
- Continues until status is `completed` or `error`
- Updates UI based on status

---

### 4. Get Results

**Endpoint:** `GET /api/results/:id`

**Parameters:**
- `id` - Note ID from upload response

**Response:**
```json
{
  "success": true,
  "icdCodes": [
    {
      "code": "E11.9",
      "description": "Type 2 diabetes mellitus without complications",
      "confidence": 0.98,
      "category": "Diagnosis"
    }
  ],
  "cptCodes": [
    {
      "code": "99214",
      "description": "Office/outpatient visit - moderate to high complexity",
      "confidence": 0.92,
      "category": "Evaluation & Management"
    }
  ],
  "overallConfidence": 0.91,
  "reasoning": "Clinical presentation shows clear indicators of Type 2 diabetes...",
  "auditTrail": [
    {
      "timestamp": "2026-03-24T12:30:00.000Z",
      "action": "Note uploaded",
      "status": "success"
    }
  ]
}
```

**Expected Status Codes:**
- `200` - Success
- `404` - Note/results not found
- `202` - Still processing (return standard status format instead)
- `500` - Server error

---

### 5. Send Clarification

**Endpoint:** `POST /api/clarification`

**Request:**
```json
{
  "noteId": "note_12345",
  "answers": ["Type 2"]  // Array of selected answers
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clarification received, processing resumed"
}
```

**Frontend Flow:**
1. Shows clarification dialog with question and options
2. User selects answer(s)
3. Sends request with their response
4. Resumes polling status endpoint
5. Processing continues in backend

**Expected Status Codes:**
- `200` - Success
- `404` - Note not found
- `400` - Invalid format
- `500` - Server error

---

## Integration Steps

### Step 1: Update API Service

Edit `src/services/api.js`:

```javascript
// Change this line
const USE_MOCK = false; // Enable real API mode

// Update the real API functions with your backend URL
const API_BASE_URL = 'https://your-backend.com'; // or http://localhost:8000

async function realUploadNote(note) {
  const response = await fetch(`${API_BASE_URL}/api/notes/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: note }),
  });
  return await response.json();
}

// Update other functions similarly...
```

### Step 2: Handle CORS

Enable CORS in your backend to accept requests from `http://localhost:5173` (dev) and your production domain.

**Node.js/Express Example:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### Step 3: Add Error Handling

The frontend expects errors to be returned as JSON:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details"
}
```

### Step 4: Test Each Endpoint

Use an API testing tool (Postman, Insomnia, or curl) to verify:

1. Upload returns a valid `noteId`
2. Status polling works correctly
3. All response formats match expectations
4. Error handling works properly

---

## Mock Data Reference

For testing without a backend, the mock system provides:

**Processing Steps:**
```
1. Extracting - Analyzing clinical note
2. Tokenizing - Processing medical terminology
3. Matching - Matching with ICD-10 codes
4. Calculating - Computing CPT codes
5. Validating - Validating coding accuracy
```

**Mock ICD Codes:**
- E11.9 - Type 2 diabetes (98% confidence)
- I10 - Essential hypertension (95% confidence)
- M79.3 - Panniculitis (87% confidence)

**Mock CPT Codes:**
- 99214 - Office visit (92% confidence)
- 98966 - Telehealth (88% confidence)
- 81000 - Urinalysis (85% confidence)

**Mock Clarification:**
- Question: "What type of diabetes?"
- Options: Type 1, Type 2, Gestational, Unknown

---

## Frontend Behavior

### On Upload Success
- Extracts `noteId` from response
- Navigates to `/note/{noteId}`
- Begins polling status

### On Processing Complete
- Calls `getResult()` endpoint
- Displays all codes with confidence scores
- Shows reasoning and audit trail

### On Error
- Displays error message to user
- Stops polling
- Offers retry option

### On Clarification
- Shows dialog with question and options
- Disables polling temporarily
- Sends answer to backend
- Resumes polling after confirmation

---

## Common Pitfalls

### ❌ Wrong Response Format
- Codes must be arrays, not objects
- Confidence must be 0-1, not 0-100
- Status must be exact string match

### ❌ Missing CORS Headers
- Frontend can't access backend if CORS not enabled

### ❌ Slow Processing
- Frontend times out if processing takes > 5 minutes
- Return appropriate status to prevent timeout

### ❌ No Error Handling
- Backend returns HTML instead of JSON on error
- Crashes frontend error handler

---

## Deployment Checklist

Before going to production:

- [ ] Set `USE_MOCK = false`
- [ ] Update API base URL
- [ ] Enable CORS for production domain
- [ ] Test all 5 endpoints
- [ ] Verify error responses
- [ ] Test polling with slow backend
- [ ] Test clarification flow
- [ ] Load test with multiple users
- [ ] Monitor error logs
- [ ] Set up CI/CD pipeline

---

## Need Help?

Check the Frontend Architecture section in README.md for more details on:
- Component structure
- Data flow
- API layer design
- Error handling

---

Made with ❤️ for seamless backend integration
