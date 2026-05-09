# Tasks — SCRUM-82: Add Candidate to a Process

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Verify worktree is at `/Users/alvaromoya/projects/versiones ejercicios/AI4Devs-LTI-before-position-update-openspec-raw-2026/.worktrees/scrum-82-add-candidate-to-process` and current branch is `feature/scrum-82-add-candidate-to-process`
- [x] 0.2 Confirm branch creation and clean working tree

## 1. Backend: Validator Tests (TDD - red)

- [x] 1.1 Create sibling test file `backend/src/application/validator.assignCandidate.test.ts`
- [x] 1.2 Add failing test: accepts minimal `{ candidateId: 1 }`
- [x] 1.3 Add failing test: accepts `{ candidateId: 1, notes: 'ok' }`
- [x] 1.4 Add failing test: rejects missing `candidateId`
- [x] 1.5 Add failing test: rejects non-integer / negative / zero `candidateId`
- [x] 1.6 Add failing test: rejects `notes` not-a-string
- [x] 1.7 Add failing test: rejects `notes` length > 500
- [x] 1.8 Add failing test: rejects unknown fields (`applicationDate`, `interviewStepId`)
- [x] 1.9 Add failing test: rejects null/undefined body

## 2. Backend: Validator Implementation (TDD - green)

- [x] 2.1 Add `validateAssignCandidateToPositionData` to `backend/src/application/validator.ts` per design
- [x] 2.2 Run validator tests until green

## 3. Backend: Service Tests (TDD - red)

- [x] 3.1 Create sibling test file `backend/src/application/services/positionService.assignCandidate.test.ts`
- [x] 3.2 Add failing test: happy path returns 201-shaped payload, picks step with lowest `orderIndex`, `interviewStepId === currentInterviewStep`
- [x] 3.3 Add failing test: throws `AssignCandidateError('POSITION_NOT_FOUND', ...)` when position is null
- [x] 3.4 Add failing test: throws `AssignCandidateError('POSITION_CLOSED', ...)` for status `'Closed'` and `'Hired'`
- [x] 3.5 Add failing test: throws `AssignCandidateError('CANDIDATE_NOT_FOUND', ...)` when candidate is null
- [x] 3.6 Add failing test: throws `AssignCandidateError('NO_INTERVIEW_STEPS', ...)` when interview flow has zero steps
- [x] 3.7 Add failing test: throws `AssignCandidateError('DUPLICATE_APPLICATION', ...)` when an `Application` already exists
- [x] 3.8 Add failing test: persists `notes` as provided; persists `null` when omitted
- [x] 3.9 Add failing test: uses `prisma.$transaction` exactly once (spy)

## 4. Backend: Service Implementation (TDD - green)

- [x] 4.1 Add `AssignCandidateError` class and `assignCandidateToPositionService` to `backend/src/application/services/positionService.ts` per design
- [x] 4.2 Use `prisma.$transaction` for the duplicate-check + create sequence
- [x] 4.3 Run service tests until green

## 5. Backend: Controller Tests (TDD - red)

- [x] 5.1 Create sibling test file `backend/src/presentation/controllers/positionController.assignCandidate.test.ts`
- [x] 5.2 Add failing test: 400 on non-numeric `:id`
- [x] 5.3 Add failing test: 400 when validator throws (missing `candidateId`)
- [x] 5.4 Add failing test: 201 with body returned by the service on happy path
- [x] 5.5 Add failing test: 404 on `POSITION_NOT_FOUND`
- [x] 5.6 Add failing test: 404 on `CANDIDATE_NOT_FOUND`
- [x] 5.7 Add failing test: 409 on `POSITION_CLOSED`
- [x] 5.8 Add failing test: 409 on `DUPLICATE_APPLICATION`
- [x] 5.9 Add failing test: 422 on `NO_INTERVIEW_STEPS`
- [x] 5.10 Add failing test: 500 on unexpected error
- [x] 5.11 Add failing test: error response body includes `code` field

## 6. Backend: Controller Implementation (TDD - green)

- [x] 6.1 Add `addCandidateToPosition` to `backend/src/presentation/controllers/positionController.ts` per design
- [x] 6.2 Map `AssignCandidateError.code` to HTTP status per the table in design.md
- [x] 6.3 Run controller tests until green

## 7. Backend: Route Wiring

- [x] 7.1 In `backend/src/routes/positionRoutes.ts`, register `router.post('/:id/candidates', addCandidateToPosition)`
- [x] 7.2 Verify file ordering and imports

## 8. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 8.1 Review existing tests in `backend/src/application/services/positionService.test.ts` for breakage from new exports
- [x] 8.2 Review existing tests in `backend/src/presentation/controllers/positionController.test.ts` for breakage from new imports
- [x] 8.3 Update or extend existing tests if signatures changed (none expected)

## 9. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 9.1 Capture pre-test database baseline (counts of `Application`, `Position`, `Candidate`)
- [x] 9.2 Run targeted unit tests for changed modules (`positionService`, `positionController`, `validator`)
- [x] 9.3 Run the full backend unit test suite (`npm test` in `backend/`)
- [x] 9.4 Verify post-test database state matches the baseline; restore if mutated
- [x] 9.5 Create report `openspec/changes/scrum-82-add-candidate-to-process/reports/2026-05-09-step-9-unit-test-and-db-verification.md`
- [x] 9.6 Mark step complete only after tests pass and report exists

## 10. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 10.1 Ensure backend server is running on port 3010 (start with `npm run dev` in `backend/` if needed)
- [x] 10.2 Pick valid `positionId` and `candidateId` from seed data; record pre-test row counts
- [x] 10.3 Test 201 happy path with curl, capture response, then DELETE the created `Application` to restore DB state
- [x] 10.4 Test 409 duplicate (re-issue the same POST after recreating one application; clean up after)
- [x] 10.5 Test 404 position not found (`positionId=999999`)
- [x] 10.6 Test 404 candidate not found (`candidateId=999999`)
- [x] 10.7 Test 400 validation (missing `candidateId`; notes too long; unknown field)
- [x] 10.8 Test 422 `NO_INTERVIEW_STEPS` (use a position whose flow has zero steps, or temporarily detach steps; restore afterwards)
- [x] 10.9 Test 409 `POSITION_CLOSED` (PATCH a position to `Closed`; restore status afterwards)
- [x] 10.10 Verify post-test DB row counts match baseline
- [x] 10.11 Save curl report `openspec/changes/scrum-82-add-candidate-to-process/reports/2026-05-09-step-10-curl-endpoint-testing.md`

## 11. Frontend: Service Methods

- [x] 11.1 Add `assignCandidateToPosition(positionId, payload)` to `frontend/src/services/positionService.js`
- [x] 11.2 Ensure `searchCandidates(query)` exists in `frontend/src/services/candidateService.js`; add if missing

## 12. Frontend: i18n Keys

- [x] 12.1 Add `positions.addCandidate.*` keys to `frontend/src/i18n/locales/en.json`
- [x] 12.2 Add Spanish translations to `frontend/src/i18n/locales/es.json`
- [x] 12.3 Include keys for: button label, modal title, search placeholder, notes label/placeholder, submit/cancel, success toast, error toasts (`duplicate`, `positionClosed`, `noInterviewSteps`, `positionNotFound`, `candidateNotFound`, `validation`, `unknown`)

## 13. Frontend: Add Candidate Modal Component

- [x] 13.1 Create `frontend/src/components/AddCandidateToPositionModal.tsx` per design
- [x] 13.2 Implement debounced (>=300ms) candidate search using `searchCandidates`
- [x] 13.3 Implement notes textarea with 500-char counter and client-side guard
- [x] 13.4 Wire submit to `assignCandidateToPosition`; on 201 close modal, show success toast, refresh Kanban
- [x] 13.5 On error, keep modal open and show localized error toast based on response `code`
- [x] 13.6 A11y: role="dialog", aria-labelledby, focus trap, ESC closes, tab cycle

## 14. Frontend: Wire Add Candidate Button on Position Details

- [x] 14.1 In `frontend/src/components/PositionDetails.js`, add "Add candidate" button visible on the position page
- [x] 14.2 Toggle the new modal open/closed; pass `positionId` and an `onSuccess` refresh callback

## 15. Frontend: E2E Testing with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [x] 15.1 Ensure frontend (port 3000) and backend (port 3010) servers are running
- [x] 15.2 Use `browser_navigate` to open the app and navigate to a position details page
- [x] 15.3 Click "Add candidate" button, verify modal opens
- [x] 15.4 Type a candidate query, verify debounced search results appear
- [x] 15.5 Select a candidate, optionally type notes, click Submit
- [x] 15.6 Verify success toast and Kanban shows the candidate on the first interview step
- [x] 15.7 Test error scenario: try assigning the same candidate again, verify duplicate toast
- [x] 15.8 Test ESC key closes the modal; test focus trap with Tab
- [x] 15.9 Restore DB by deleting created `Application` rows
- [x] 15.10 Save E2E report `openspec/changes/scrum-82-add-candidate-to-process/reports/2026-05-09-step-15-e2e-testing.md`

## 16. Update Technical Documentation (MANDATORY)

- [x] 16.1 Update `docs/api-spec.yml` with `POST /positions/{positionId}/candidates` operation, schemas, and error codes
- [x] 16.2 Update `openspec/specs` if any reused capability requires documentation (none expected)
- [x] 16.3 Verify all docs are in English

## 17. Frontend UX Refinement: Immediate and Relevant Candidate Selector

- [x] 17.1 Update OpenSpec artifacts (`design.md`, `spec.md`) to include immediate candidate list and exclusion of already-assigned candidates
- [x] 17.2 Refactor `AddCandidateToPositionModal` to preload candidates on open and show options immediately
- [x] 17.3 Exclude candidates already assigned to the current position from the selector options
- [x] 17.4 Keep debounced typing behavior while filtering the preloaded assignable candidates
- [x] 17.5 Verify manually in UI: opening modal shows immediate options and assigned candidates are not listed
