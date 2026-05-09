# Design — SCRUM-82: Add Candidate to a Process

## Context

The LTI ATS already models recruitment processes as `Position` rows linked to an `InterviewFlow`, which owns an ordered list of `InterviewStep`s. Candidates exist as `Candidate` rows. The link between a candidate and a position is the `Application` row (`backend/prisma/schema.prisma`, lines 128-139), which carries `positionId`, `candidateId`, `applicationDate`, **`currentInterviewStep`** (the only FK to `InterviewStep`), and `notes`.

Today there is no API or UI path to create that `Application` row. The position's Kanban board reads applications grouped by `currentInterviewStep`, so a candidate that has no `Application` cannot be placed on the board.

This change adds a single endpoint and a frontend modal to assign an existing candidate to a position. The candidate is automatically placed on the first step of the position's interview flow (lowest `orderIndex`).

The user story includes a few details that conflict with the live codebase. The design freezes the following corrections (applied throughout):

1. **One FK column**: `Application.currentInterviewStep` is the single FK to `InterviewStep`. There is no separate `interviewStepId` column. The response payload exposes both `currentInterviewStep` (canonical) and `interviewStepId` (alias) to keep the API contract stable for frontend consumers.
2. **English status enum**: `validator.ts` already enforces `Position.status ∈ {'Draft','Open','Closed','Hired'}`. The user story's Spanish examples (`'Cerrado'`, `'Contratado'`) are illustrative only. We guard against `'Closed'` and `'Hired'`.
3. **Services call `prisma` directly**: there is no concrete repository class in the wired codebase. The new service will use `prisma.$transaction` for atomicity.
4. **Tests sibling pattern**: `positionService.test.ts` lives next to the source. New unit tests follow the same pattern.
5. **No auth middleware exists** in `backend/src/index.ts` or routes. Adding authn/authz is out of scope.

## Goals / Non-Goals

**Goals:**

- Provide a typed, transactional backend endpoint that creates an `Application` linking an existing `Candidate` to a `Position`, automatically placed on the first interview step.
- Map domain failure modes deterministically to HTTP status codes (201 / 400 / 404 / 409 / 422 / 500) with a stable error `code` field.
- Provide a recruiter-facing modal in the position details page with debounced candidate search, optional notes, success/error toasts, and full keyboard a11y.
- Full English + Spanish i18n coverage for the new UI strings.
- Update OpenAPI spec to document the new operation.
- Maintain >=90% unit test coverage for new backend modules.

**Non-Goals:**

- No database schema migration. No new columns, no new unique constraints.
- No auth middleware. The fact that the endpoint is unauthenticated today is documented as a known gap.
- No bulk-add (multiple candidates at once) — single candidate per request.
- No candidate creation flow (the modal only assigns existing candidates).
- No movement of candidates between interview steps (covered elsewhere — Kanban drag/drop story).
- No automated email notification to the candidate.

## Decisions

### D1: Persist only `currentInterviewStep`; expose `interviewStepId` as a response alias

- **Choice**: Set only `currentInterviewStep` at create time. In the JSON response, return both `currentInterviewStep` (canonical) and `interviewStepId` (alias of the same value).
- **Why**: The Prisma schema has only one FK column. Adding a second column or migration would be wasted work and risks divergence with `Application.save()`. An alias in the response keeps the documented user-story contract without coupling to a non-existent column.
- **Alternative considered**: Drop the alias and document a contract change. Rejected to minimize frontend coupling churn.

### D2: Atomicity via `prisma.$transaction` inside the service (Option A)

- **Choice**: The service performs all reads (position+flow+steps, candidate, duplicate) and the `tx.application.create` inside a single `prisma.$transaction(async (tx) => ...)` block.
- **Why**: Smallest blast radius. `Application.save()` is left untouched for non-transactional callers. Mocking is straightforward in unit tests (one `$transaction` spy).
- **Alternative considered**: Extend `Application.save(tx?)` to accept an optional transactional client (Option B). Rejected as a wider, riskier change for no gain in this story.
- **Trade-off**: `findFirst` + `create` inside a transaction is not race-proof under concurrent inserts (no `@@unique` constraint). Documented as a follow-up.

### D3: Typed `AssignCandidateError` for domain failures

- **Choice**: A custom `AssignCandidateError` class with a discriminated `code` field (`POSITION_NOT_FOUND` | `CANDIDATE_NOT_FOUND` | `POSITION_CLOSED` | `NO_INTERVIEW_STEPS` | `DUPLICATE_APPLICATION`).
- **Why**: Keeps service free of HTTP concerns. Controller maps `code` → status code in a single switch. Stable `code` field on the wire helps the frontend localize messages.
- **Alternative considered**: Throwing plain `Error`s and string-matching messages. Rejected — brittle and untyped.

### D4: HTTP status mapping

| `code` | Status |
| --- | --- |
| validator throw | 400 |
| invalid `:id` (NaN) | 400 |
| `POSITION_NOT_FOUND` | 404 |
| `CANDIDATE_NOT_FOUND` | 404 |
| `POSITION_CLOSED` (status `Closed` or `Hired`) | 409 |
| `DUPLICATE_APPLICATION` | 409 |
| `NO_INTERVIEW_STEPS` | 422 |
| unexpected | 500 |

`POSITION_CLOSED` covers both `Closed` and `Hired` per the user story's "closed/filled position" intent. The error message remains generic; the `code` is the contract.

### D5: Notes max length = 500 chars (validator)

- **Choice**: Enforce `notes.length <= 500` in `validateAssignCandidateToPositionData`. Reject unexpected fields (`applicationDate`, `interviewStepId`, etc.) at the validator boundary.
- **Why**: Matches the user story; protects against client-supplied `applicationDate` (server-generated only) and stale FK columns.
- **Alternative considered**: Match the existing `<= 1000` for interview notes. Rejected — the spec says 500.

### D6: First step = lowest `orderIndex`

- **Choice**: Fetch `interviewSteps` ordered by `orderIndex asc`; select index `[0]`.
- **Why**: Deterministic, matches existing UI assumptions for the Kanban first column.

### D7: Frontend modal — debounced search >= 300ms, full a11y

- **Choice**: New TS component `AddCandidateToPositionModal.tsx` with:
  - Immediate candidate list on modal open (no initial typing required).
  - Candidate selector constrained to candidates not already assigned to the current position.
  - Debounced (300ms) in-memory filtering while typing.
  - Optional notes (multiline, 500-char counter, client-side guard).
  - Submit disabled until a candidate is selected.
  - Loading + error + success toasts; on 201 close modal and refresh Kanban.
  - Keyboard nav: tab cycle, ESC to close, focus trap, role="dialog", aria-labelledby.
- **Why**: Matches NFRs in the user story; avoids redundant API calls; keeps a11y posture consistent with existing modals.

### D8: Test placement — sibling pattern

- **Choice**: New tests live next to the source files: `positionService.assignCandidate.test.ts`, `positionController.assignCandidate.test.ts`, `validator.assignCandidate.test.ts`.
- **Why**: Matches the existing `positionService.test.ts` pattern. Keeps related code colocated.

## Risks / Trade-offs

- **[Race on concurrent duplicate inserts]** Two simultaneous POSTs for the same `(positionId, candidateId)` could both pass `findFirst` and both `create`. → **Mitigation**: documented; follow-up to add `@@unique([positionId, candidateId])` and catch Prisma `P2002`. Out of scope for this story.
- **[No auth]** The new endpoint is reachable by any client that can reach the server. → **Mitigation**: documented gap; aligned with the rest of the codebase, which has no auth middleware mounted. A future change introduces `requireRecruiter` middleware.
- **[Status-enum drift]** If a future change adds a Spanish-named status, this guard becomes incomplete. → **Mitigation**: validator already centralizes the enum (`POSITION_STATUS_VALUES`); add new statuses there and re-evaluate the guard.
- **[Alias drift]** Frontend may rely on `interviewStepId` long after we drop the alias. → **Mitigation**: document the alias in the OpenAPI spec; mark it for removal once frontend is migrated to `currentInterviewStep`.
- **[Empty interview flow]** A position with zero interview steps cannot accept candidates. → **Mitigation**: 422 with `NO_INTERVIEW_STEPS`. UI surfaces the error toast and keeps the modal open so the recruiter can fix the position.

## Open Questions

- Should the alias `interviewStepId` be removed in a follow-up once the frontend is fully migrated? (Recommendation: yes, with a deprecation note.)
- Should the duplicate guard be hardened with a DB unique constraint in a follow-up? (Recommendation: yes; small migration.)
- Which seed `positionId` and `candidateId` will be used for manual curl tests? (Picked at apply time from the seeded DB.)
