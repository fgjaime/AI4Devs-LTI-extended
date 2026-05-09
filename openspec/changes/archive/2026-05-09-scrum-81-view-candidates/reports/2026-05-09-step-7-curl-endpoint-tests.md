# Step 7 Report - Manual Endpoint Testing with curl

- Date: 2026-05-09
- Change: scrum-81-view-candidates
- Agent: Claude Sonnet 4.6

## Environment
- Backend server: http://localhost:3010 (running)
- Database: SQLite (dev)

## Tests Executed

### 7.2 — GET /candidates?page=1&limit=10&sort=lastName&order=asc → expect 200

**Command:**
```
curl -s "http://localhost:3010/candidates?page=1&limit=10&sort=lastName&order=asc"
```

**Response (HTTP 200):**
```json
{
  "data": [
    {
      "id": 1, "firstName": "John", "lastName": "Doe", "email": "john.doe@gmail.com",
      "phone": "1234567890", "address": "123 Main St",
      "activeProcess": {
        "applicationId": 2, "applicationDate": "2025-06-30T14:21:16.421Z",
        "position": { "id": 2, "title": "Data Scientist", "status": "Open", "company": { "id": 1, "name": "LTI" } },
        "currentStep": { "id": 2, "name": "Technical Interview", "orderIndex": 2 },
        "totalSteps": 4
      }
    },
    { "id": 3, "firstName": "Carlos", "lastName": "García", ... },
    { "id": 2, "firstName": "Jane", "lastName": "Smith", ... }
  ],
  "metadata": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 }
}
```

**Result:** PASS — HTTP 200, correct DTO shape (no educations/workExperiences/resumes), activeProcess populated, sorted by lastName asc.

---

### 7.3 — GET /candidates?sort=invalid → expect 400

**Command:**
```
curl -s -w "\nHTTP:%{http_code}" "http://localhost:3010/candidates?sort=invalid"
```

**Response:**
```
{"error":"Invalid sort field"}
HTTP:400
```

**Result:** PASS

---

### 7.4 — GET /candidates?order=sideways → expect 400

**Command:**
```
curl -s -w "\nHTTP:%{http_code}" "http://localhost:3010/candidates?order=sideways"
```

**Response:**
```
{"error":"Invalid order value"}
HTTP:400
```

**Result:** PASS

---

### 7.5 — GET /candidates?page=0 → expect 400

**Command:**
```
curl -s -w "\nHTTP:%{http_code}" "http://localhost:3010/candidates?page=0"
```

**Response:**
```
{"error":"Page number must be greater than 0"}
HTTP:400
```

**Result:** PASS

---

### 7.6 — GET /candidates?limit=0 → expect 400

**Command:**
```
curl -s -w "\nHTTP:%{http_code}" "http://localhost:3010/candidates?limit=0"
```

**Response:**
```
{"error":"Limit must be greater than 0"}
HTTP:400
```

**Result:** PASS

---

## Database State Verification
- Endpoint is read-only (GET). No writes performed.
- Pre/post DB state: candidates=3, applications=4, positions=2 (unchanged).

## Outcome
- All 5 curl tests: PASS
- Step 7 status: PASS
- Blocking issues: none
