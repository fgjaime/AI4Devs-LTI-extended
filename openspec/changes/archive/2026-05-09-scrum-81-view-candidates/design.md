## Context

The recruiter dashboard already wires "Add Candidate" and "View Positions" cards. `GET /candidates` exists in `backend/src/routes/candidateRoutes.ts` and is served by `getAllCandidatesController` → `candidateService.getAllCandidates`. The service currently includes `applications`, `educations`, `workExperiences`, and `resumes`. The Prisma schema models `Application` with `currentInterviewStep` (FK column) and `interviewStep` (relation), `Position.status` as a free-form string with `"Open"` used to denote active positions, and `InterviewFlow.interviewSteps` ordered by `orderIndex`.

There is no auth middleware on the backend in this repo. AC6 (auth guard) is therefore a frontend-only concern (route gating) for this change.

## Goals / Non-Goals

**Goals:**
- Extend `GET /candidates` to return a derived `activeProcess` per candidate suitable for a recruiter list view.
- Keep the response lean and the query single-shot to meet P95 < 300ms.
- Add a recruiter dashboard entry point and a `/candidates` paginated list view with search, sortable headers, and i18n in en/es.

**Non-Goals:**
- Auth middleware on the backend (out of scope; tracked separately).
- Schema migrations.
- Trimming `educations/workExperiences/resumes` from `GET /candidates/:id`.
- New endpoints; this story extends the existing one.

## Decisions

### D1: Sort whitelist excludes `applicationDate`
We add `lastName` only. `applicationDate` would force either a sub-query Prisma `orderBy` workaround or in-memory page sort, both compromising the single-query NFR. The UI columns specified as sortable in AC2 are Name and Email, so `applicationDate` sort is unnecessary. Whitelist: `firstName`, `lastName`, `email`. Default: `firstName asc`.

### D2: Single Prisma query with nested `select`
Replace the existing `applications` include with a tight `select` chain: `applications → position(id,title,status,company(id,name),interviewFlow.interviewSteps(id,name,orderIndex)) + interviewStep(id,name,orderIndex)`, ordered by `applicationDate desc`. We drop `educations`, `workExperiences`, `resumes` from the LIST payload (none are referenced by the recruiter list UI).

### D3: Pure helper `buildActiveProcesses` — returns array, not single item
The active-process derivation lives in `candidateService.ts` as an exported pure function (`buildActiveProcesses`) for direct unit testing.

**Rationale for array over single item**: a candidate can be enrolled in multiple open positions simultaneously (edge case confirmed in seed data: John Doe has two open applications). The original design silently dropped all but the most recent open application via `.find()`. Returning `ActiveProcessDTO[]` preserves all data without API pagination complexity.

The function iterates the applications array (already ordered `applicationDate desc` by Prisma), collects every entry whose `position.status === "Open"` and whose `interviewStep` relation is present, and returns them as an array. Entries with a missing `interviewStep` are skipped (data-integrity guard). Returns `[]` when no open applications exist.

DTO field is renamed from `activeProcess: ActiveProcessDTO | null` to `activeProcesses: ActiveProcessDTO[]`.

### D4: Validation error mapping
The controller maps any service error whose message starts with `Invalid sort` or `Invalid order`, or contains `must be greater than`, to HTTP 400. Other errors map to 500.

### D5: Frontend pagination model
`CandidatesList.tsx` is a TypeScript component (the rest of the app is JS/TS mixed; new component is TS for safety). It manages `{ page, limit, search, sort, order }` in component state and reflects them in the URL via `useSearchParams` (best-effort; no router change beyond a route registration). Search input is debounced 300ms via a small custom hook. Page size is 10 (default), 25, or 50.

### D6: Active process display formatting
- Phone cell: `phone || '-'`.
- When `activeProcesses` is empty: Active position = `No active process`; Current step = `-`; Application date = `-`.
- When `activeProcesses.length === 1`: Active position = `title - company`; Current step = `name (orderIndex/total)`; Application date = `YYYY-MM-DD`.
- When `activeProcesses.length > 1`: render the first entry inline (same as single), append a `+N more` badge (N = length − 1). Current step and application date reflect the first entry only.
- **Why first entry**: applications are already ordered `applicationDate desc` by Prisma, so the first entry is the most recently started process — the most actionable for the recruiter.

## Risks / Trade-offs

- **Risk**: Position with empty `interviewFlow.interviewSteps` causes `(orderIndex/0)` rendering. → **Mitigation**: emit it literally; data integrity is server-side responsibility. UI tolerates this gracefully.
- **Risk**: Removing `educations/workExperiences/resumes` from list payload could break a hidden consumer. → **Mitigation**: only the list page consumes this endpoint per current frontend; the detail endpoint `/candidates/:id` remains unchanged.
- **Risk**: Frontend route guard alone does not protect data exposure. → **Mitigation**: tracked as a follow-up; documented as "out of scope for backend in SCRUM-81".

## Migration Plan

No data migration. Deploy in order: backend → frontend. Backend change is additive (new field, dropped fields are list-only). No rollback risk; revert is safe.

## Open Questions

- None blocking. (Backend auth middleware is intentionally deferred.)
