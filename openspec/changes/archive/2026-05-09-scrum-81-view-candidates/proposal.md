## Why

Recruiters currently lack a unified view to quickly track all candidates and their progress through hiring processes. The recruiter dashboard only exposes "Add Candidate" and "View Positions" — there is no way to list every candidate together with their active recruitment process and current step. This change adds the missing "View Candidates" capability so recruiters can manage workflows efficiently.

## What Changes

- Extend `GET /candidates` so each item includes a derived `activeProcess` (most recent application on a position with `status === 'Open'`) containing position, company, current interview step, and total steps.
- Drop heavyweight relations (`educations`, `workExperiences`, `resumes`) from the LIST payload to keep response lean and meet P95 < 300ms.
- Add `lastName` to the sort whitelist (sortable: `firstName`, `lastName`, `email`).
- Map new validation errors (`Invalid sort field`, `Invalid order value`) to HTTP 400 in the candidate controller.
- Add a third "View Candidates" card to `RecruiterDashboard` linking to `/candidates`.
- Create `CandidatesList` page: paginated table with search (debounced 300ms), sortable headers (Name, Email), pagination + page-size selector (10/25/50), Active position column ("title - company" or "No active process"), Current step ("Step Name (orderIndex/total)"), Application date (YYYY-MM-DD), and Actions → `/candidates/:id`.
- Align `CandidatesList` page header/navigation styling with existing app conventions (same back button pattern and title placement used by `Positions`).
- Register `/candidates` and `/candidates/:id` routes in `App.js`, both backed by the same candidates page composition so the table remains visible while the details offcanvas is open (same interaction pattern as `PositionDetails`).
- Add i18n keys under `candidates.list.*` and `dashboard.viewCandidates.*` in both `en.json` and `es.json`.
- Update OpenAPI (`docs/api-spec.yml`) with the new list response schema.

## Capabilities

### New Capabilities
- `view-candidates`: Recruiter-facing capability to list all candidates with their derived active hiring process and current interview step, including pagination, search, and sort.

### Modified Capabilities
<!-- No existing capability requirements changing. -->

## Impact

- Backend: `backend/src/application/services/candidateService.ts`, `backend/src/presentation/controllers/candidateController.ts`, `backend/src/application/services/candidateService.test.ts`.
- Frontend: `frontend/src/components/RecruiterDashboard.js`, `frontend/src/components/CandidatesList.tsx` (new), `frontend/src/services/candidateService.js`, `frontend/src/App.js`, `frontend/src/i18n/locales/{en,es}.json`.
- Docs: `docs/api-spec.yml`.
- No DB schema/migration changes. No new dependencies. Single Prisma query (no N+1).
