# Step 10 Report - Manual Endpoint Testing with curl

- Date: 2026-05-09
- Change: scrum-82-add-candidate-to-process
- Agent: Claude (opsx:apply)
- Endpoint: `POST /positions/:id/candidates`
- Backend: `npm run dev` on `http://localhost:3010`

## Pre-Test Database Baseline

- Application count: 4 (ids 1..4)
- Position count: 2 (id 1 Senior Full-Stack Engineer, id 2 Data Scientist; both `Open`)
- Candidate count: 3 (ids 1..3)
- Existing applications: pos1+cand1 step2, pos2+cand1 step2, pos1+cand2 step1, pos1+cand3 step3
- Free pair available for happy path: position 2 + candidate 2

## 1. 201 Happy Path

Command:
```
curl -X POST http://localhost:3010/positions/2/candidates \
  -H 'Content-Type: application/json' \
  -d '{"candidateId":2,"notes":"Referred"}'
```

Response: HTTP 201
```json
{"id":5,"positionId":2,"candidateId":2,"applicationDate":"2026-05-09T04:43:01.968Z","currentInterviewStep":4,"interviewStepId":4,"notes":"Referred"}
```

Verification: `interviewStepId === currentInterviewStep === 4` (first step of interview flow 2, lowest `orderIndex`). Created `Application id=5`.

## 2. 409 DUPLICATE_APPLICATION

Command (re-issued same POST while pos2+cand2 still existed):
```
curl -X POST http://localhost:3010/positions/2/candidates \
  -H 'Content-Type: application/json' \
  -d '{"candidateId":2}'
```

Response: HTTP 409
```json
{"code":"DUPLICATE_APPLICATION","message":"Candidate 2 is already assigned to position 2","error":"Candidate 2 is already assigned to position 2"}
```

**Cleanup**: deleted Application id=5 via `prisma.application.delete` (script `scripts/db-cleanup.ts 5`). Application count returned to 4.

## 3. 404 POSITION_NOT_FOUND

```
curl -X POST http://localhost:3010/positions/999999/candidates -d '{"candidateId":1}' -H 'Content-Type: application/json'
```
Response: HTTP 404
```json
{"code":"POSITION_NOT_FOUND","message":"Position 999999 not found","error":"Position 999999 not found"}
```

## 4. 404 CANDIDATE_NOT_FOUND

```
curl -X POST http://localhost:3010/positions/2/candidates -d '{"candidateId":999999}' -H 'Content-Type: application/json'
```
Response: HTTP 404
```json
{"code":"CANDIDATE_NOT_FOUND","message":"Candidate 999999 not found","error":"Candidate 999999 not found"}
```

## 5. 400 VALIDATION_ERROR

5a. Missing `candidateId`:
```
curl -X POST http://localhost:3010/positions/2/candidates -d '{}' -H 'Content-Type: application/json'
```
HTTP 400 → `{"code":"VALIDATION_ERROR","error":"candidateId is required"}`

5b. Unknown field `foo`:
```
curl -X POST http://localhost:3010/positions/2/candidates -d '{"candidateId":1,"foo":"bar"}' -H 'Content-Type: application/json'
```
HTTP 400 → `{"code":"VALIDATION_ERROR","error":"Unexpected field: foo"}`

5c. Non-numeric path id:
```
curl -X POST http://localhost:3010/positions/abc/candidates -d '{"candidateId":1}' -H 'Content-Type: application/json'
```
HTTP 400 → `{"code":"VALIDATION_ERROR","message":"Invalid position ID format"}`

Note: the "notes too long" 400 case shares the same code path as the above three (validator throws → controller returns 400). It is fully covered by unit test `validator.assignCandidate.test.ts` ("rejects notes length > 500"). All 400 branches in the controller are exercised by 5a/5b/5c.

## 6. 422 NO_INTERVIEW_STEPS

Setup (script `db-empty-flow.ts create`): created InterviewFlow id=3 with no steps; pointed Position 2 at flow 3 (saved original `interviewFlowId=2`).
```
curl -X POST http://localhost:3010/positions/2/candidates -d '{"candidateId":2}' -H 'Content-Type: application/json'
```
HTTP 422 → `{"code":"NO_INTERVIEW_STEPS","message":"Position 2 has no configured interview steps"}`

**Cleanup** (script `db-empty-flow.ts restore 2 3`): pointed Position 2 back at flow 2; deleted empty flow 3.

## 7. 409 POSITION_CLOSED

Setup (script `db-empty-flow.ts close`): updated Position 2 status `Open` → `Closed`.
```
curl -X POST http://localhost:3010/positions/2/candidates -d '{"candidateId":2}' -H 'Content-Type: application/json'
```
HTTP 409 → `{"code":"POSITION_CLOSED","message":"Position 2 is Closed and cannot accept candidates"}`

**Cleanup** (script `db-empty-flow.ts reopen Open`): restored Position 2 status to `Open`.

## Post-Test Database Verification

- Application count: 4 (matches baseline)
- Position count: 2 (id 1 `Open` flow 1; id 2 `Open` flow 2)
- Candidate count: 3
- All existing application rows intact (1..4 unchanged)
- State restored: Yes

## Outcome

- Step 10 status: PASS
- All HTTP status codes match the design.md mapping (201/400/404/409/422)
- All error response bodies include the required `code` field
- DB fully restored to baseline
- Blocking issues: none
