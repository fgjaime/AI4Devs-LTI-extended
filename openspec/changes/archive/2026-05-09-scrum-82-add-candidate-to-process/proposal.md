# Proposal — SCRUM-82: Add Candidate to a Process

## Why

Recruiters currently cannot assign an existing candidate to a recruitment process (Position) from the application. Candidates exist in the system, but there is no UI/API path to enroll them in a position's interview flow. As a result the position's Kanban board cannot reflect newly added candidates, blocking day-to-day recruiting work.

This change closes that gap by introducing an endpoint and a UI flow that creates an `Application` linking a candidate to a position and placing the candidate on the first stage of the position's `InterviewFlow`.

## What Changes

- **NEW** endpoint `POST /positions/{positionId}/candidates` that creates an `Application` linking an existing candidate to the position and sets `currentInterviewStep` to the first step of the position's interview flow.
- **NEW** validator `validateAssignCandidateToPositionData` enforcing `candidateId` (positive integer, required) and `notes` (optional string, max 500 chars).
- **NEW** application service `assignCandidateToPositionService` running the duplicate-check + create inside a `prisma.$transaction` for atomicity, with a typed `AssignCandidateError` for domain failure modes (`POSITION_NOT_FOUND`, `CANDIDATE_NOT_FOUND`, `POSITION_CLOSED`, `NO_INTERVIEW_STEPS`, `DUPLICATE_APPLICATION`).
- **NEW** controller `addCandidateToPosition` mapping domain errors to HTTP status codes (201, 400, 404, 409, 422, 500).
- **NEW** frontend modal `AddCandidateToPositionModal` triggered from `PositionDetails`, with debounced (>=300ms) candidate search, optional notes (<=500 chars), success/error toasts, and full keyboard a11y.
- **NEW** frontend service methods `assignCandidateToPosition` and `searchCandidates`.
- **NEW** i18n keys under `positions.addCandidate.*` for English and Spanish bundles.
- **MODIFIED** OpenAPI spec (`docs/api-spec.yml`) adding the new operation, request schema, response schema, and error codes (English status enum: `Closed`, `Hired`).
- **NO** database schema changes. `Application` already has `currentInterviewStep` (the only FK to `InterviewStep`); response payload exposes both `currentInterviewStep` (canonical) and `interviewStepId` (alias) for contract compatibility.

## Capabilities

### New Capabilities

- `add-candidate-to-process`: Recruiter-facing capability to assign an existing candidate to a position, automatically placing them on the first interview step of the position's interview flow, with idempotent guards (duplicate, closed/hired, missing steps).

### Modified Capabilities

(none — no existing spec requirements change)

## Impact

- **Backend code**:
  - `backend/src/routes/positionRoutes.ts` — registers `POST /:id/candidates`.
  - `backend/src/presentation/controllers/positionController.ts` — adds `addCandidateToPosition`.
  - `backend/src/application/services/positionService.ts` — adds `assignCandidateToPositionService` and `AssignCandidateError`.
  - `backend/src/application/validator.ts` — adds `validateAssignCandidateToPositionData`.
  - Sibling unit tests next to each new function.
- **Frontend code**:
  - `frontend/src/components/PositionDetails.js` — wires "Add candidate" button.
  - `frontend/src/components/AddCandidateToPositionModal.tsx` — new component.
  - `frontend/src/services/positionService.js`, `frontend/src/services/candidateService.js` — new client methods.
  - `frontend/src/i18n/locales/en.json`, `es.json` — new translation keys.
- **Documentation**:
  - `docs/api-spec.yml` — new operation and schemas.
- **Database**: no schema migration. Uses existing `Application`, `Position`, `Candidate`, `InterviewFlow`, and `InterviewStep` tables.
- **Auth**: no auth middleware exists in the codebase today; this gap is documented in `design.md` as out of scope.
- **Race-safety**: duplicate guard uses `findFirst` + `create` inside `$transaction`; a follow-up could add `@@unique([positionId, candidateId])` for true concurrency safety (out of scope).
