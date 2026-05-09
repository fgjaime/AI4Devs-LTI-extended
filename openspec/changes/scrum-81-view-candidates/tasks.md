## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Verify working directory is the worktree and current branch is `feature/scrum-81-view-candidates`
- [x] 0.2 Confirm clean tree before starting

## 1. Backend: Service — sort whitelist + DTO shaping (TDD)

- [x] 1.1 Add failing unit tests in `backend/src/application/services/candidateService.test.ts` for `Invalid sort field`, `Invalid order value`, and `lastName` sort passthrough
- [x] 1.2 Add failing unit tests for `buildActiveProcess` (no apps, no Open apps, picks most recent Open, missing interviewStep returns null)
- [x] 1.3 Add failing unit test asserting list DTO excludes `educations`, `workExperiences`, `resumes` and includes `activeProcess`

## 2. Backend: Service — implementation

- [x] 2.1 In `candidateService.ts`, add `ALLOWED_SORT_FIELDS = ['firstName','lastName','email']` and `ALLOWED_ORDER = ['asc','desc']` and throw `Invalid sort field` / `Invalid order value` when violated
- [x] 2.2 Replace the `applications` include with the nested `select` chain (position → company + interviewFlow.interviewSteps + interviewStep), ordered by `applicationDate desc`
- [x] 2.3 Drop `educations`, `workExperiences`, `resumes` from the list `include`
- [x] 2.4 Export pure helper `buildActiveProcess(applications)` returning `ActiveProcessDTO | null`
- [x] 2.5 Map raw Prisma rows to the list DTO `{ id, firstName, lastName, email, phone, address, activeProcess }`
- [x] 2.6 Run targeted unit tests until green

## 3. Backend: Controller — broaden 400 mapping

- [x] 3.1 Update `getAllCandidatesController` to map errors starting with `Invalid sort` or `Invalid order` (in addition to existing `must be greater than`) to HTTP 400
- [x] 3.2 Add/update unit test verifying 400 path for `Invalid sort field`

## 4. Backend: API spec update

- [x] 4.1 Update `docs/api-spec.yml` `GET /candidates` `sort` enum to `[firstName, lastName, email]`
- [x] 4.2 Update `CandidateListResponse` schema and add `ActiveProcess` schema per design

## 5. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 5.1 Review `backend/src/application/services/candidateService.test.ts` for stale assertions (e.g., expecting `educations`)
- [x] 5.2 Update or remove stale assertions to match new DTO

## 6. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 6.1 Capture pre-test DB baseline (counts of `Candidate`, `Application`, `Position`)
- [x] 6.2 Run `npm test` from `backend/` and capture summary
- [x] 6.3 Verify post-test DB state matches baseline; restore if needed
- [x] 6.4 Create report `openspec/changes/scrum-81-view-candidates/reports/2026-05-09-step-6-unit-test-and-db-verification.md`
- [x] 6.5 Mark step complete only after tests pass and report exists

## 7. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Ensure backend server is running on port 3010
- [x] 7.2 `curl -s "http://localhost:3010/candidates?page=1&limit=10&sort=lastName&order=asc"` → assert 200 and DTO shape
- [x] 7.3 `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3010/candidates?sort=invalid"` → expect 400
- [x] 7.4 `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3010/candidates?order=sideways"` → expect 400
- [x] 7.5 `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3010/candidates?page=0"` → expect 400
- [x] 7.6 `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3010/candidates?limit=0"` → expect 400
- [x] 7.7 Document all curl commands and responses in `openspec/changes/scrum-81-view-candidates/reports/2026-05-09-step-7-curl-endpoint-tests.md`
- [x] 7.8 Confirm DB state unchanged (read-only endpoint)

## 8. Frontend: Service + Types

- [x] 8.1 In `frontend/src/services/candidateService.js`, add `getCandidates({ page, limit, search, sort, order })` calling `GET /candidates` with query params and returning the parsed payload
- [x] 8.2 Confirm error propagation for non-2xx responses

## 9. Frontend: i18n strings

- [x] 9.1 Add `dashboard.viewCandidates.*` and `candidates.list.*` keys to `frontend/src/i18n/locales/en.json`
- [x] 9.2 Mirror the same keys in `frontend/src/i18n/locales/es.json` with Spanish translations

## 10. Frontend: RecruiterDashboard — add third card

- [x] 10.1 Modify `frontend/src/components/RecruiterDashboard.js` to render a third card "View Candidates" with primary button "Go to Candidates" → `/candidates`
- [x] 10.2 Ensure `md`+ uses three columns for the cards row
- [x] 10.3 Use i18n keys for all visible strings

## 11. Frontend: CandidatesList page

- [x] 11.1 Create `frontend/src/components/CandidatesList.tsx` with paginated table, columns Full name, Email, Phone, Active position, Current step, Application date, Actions
- [x] 11.2 Add debounced (300ms) search input
- [x] 11.3 Sortable Name and Email column headers (toggle asc/desc)
- [x] 11.4 Page-size selector with options 10/25/50 and pagination controls
- [x] 11.5 Empty state ("No candidates yet" + CTA), Error state (alert + Retry), Loading state (spinner)
- [x] 11.6 Render Active position as `title - company` or "No active process"; Current step as `name (orderIndex/total)` or `-`; Phone or `-`; Date as YYYY-MM-DD
- [x] 11.7 Action: View details → `/candidates/:id`
- [x] 11.8 Aria-labels on table and interactive controls

## 12. Frontend: Route registration and details-pane composition

- [x] 12.1 Modify `frontend/src/App.js` to register `/candidates` route → `CandidatesList`
- [x] 12.2 Keep `CandidatesList` rendered for both `/candidates` and `/candidates/:id` so the list remains visible while details is open (same UX pattern used in `PositionDetails`)
- [x] 12.3 Read `:id` route param in `CandidatesList` and drive `CandidateDetails` open/close state from it
- [x] 12.4 Ensure close action from candidate details navigates back to `/candidates`
- [x] 12.5 Align candidates page header/back control styling with existing app pattern used in `Positions`

## 13. Frontend: E2E Testing with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [x] 13.1 Ensure frontend (port 3000) and backend (port 3010) servers are running
- [x] 13.2 Navigate to dashboard, verify three cards render
- [x] 13.3 Click "Go to Candidates" → verify `/candidates` loads with paginated list
- [x] 13.4 Type a search term; verify debounced refresh
- [x] 13.5 Click Name header to sort; verify rows reorder
- [x] 13.6 Change page size to 25; verify pagination
- [x] 13.7 Click View details → verify navigation to `/candidates/:id`
- [x] 13.8 Switch locale to Spanish; verify localized strings
- [x] 13.9 Document outcomes in `openspec/changes/scrum-81-view-candidates/reports/2026-05-09-step-13-e2e-playwright.md`
- [x] 13.10 Restore database state (no writes expected)
- [x] 13.11 Add/update frontend route test coverage to assert `/candidates/:id` renders candidate details content

## 14. Update Technical Documentation (MANDATORY)

- [x] 14.1 Confirm `docs/api-spec.yml` updated and example payload matches the new DTO
- [x] 14.2 Update any related notes in `openspec/specs/` only via the archive flow (not in this change)

---

## 15. Fix: Multi-process edge case — `activeProcess` → `activeProcesses`

> Edge case discovered during manual testing: a candidate enrolled in more than one Open position
> only showed the most recent process. Root cause: `buildActiveProcess` uses `.find()` and stops
> at the first match. Fix tracked in spec (Requirement updated) and design (D3, D6 updated).

### 15.1 Backend: update `buildActiveProcess` → `buildActiveProcesses`

- [x] 15.1.1 In `candidateService.ts`, rename exported function `buildActiveProcess` → `buildActiveProcesses`; change return type from `ActiveProcessDTO | null` to `ActiveProcessDTO[]`; replace `.find()` with a loop that collects **all** Open applications with a valid `interviewStep`; return `[]` instead of `null` for the empty case
- [x] 15.1.2 In `getAllCandidates`, update the DTO mapping from `activeProcess: buildActiveProcess(...)` to `activeProcesses: buildActiveProcesses(...)`

### 15.2 Backend: update unit tests

- [x] 15.2.1 Update all existing `buildActiveProcess` test cases to call `buildActiveProcesses` and assert array shape (`[]` for empty, `[item]` for single)
- [x] 15.2.2 Add new test: candidate with **two** Open applications → returns array of length 2, ordered most-recent first
- [x] 15.2.3 Add new test: candidate with one Open + one non-Open application → returns array of length 1 (only the Open one)
- [x] 15.2.4 Update any DTO-shape assertions that reference `activeProcess` → `activeProcesses`
- [x] 15.2.5 Run `npm test` from `backend/`; confirm all tests pass

### 15.3 Frontend: update `CandidatesList.tsx` renderer

- [x] 15.3.1 Change `getCandidates` response typing: `activeProcess: ActiveProcessDTO | null` → `activeProcesses: ActiveProcessDTO[]`
- [x] 15.3.2 Update the Active position cell renderer:
  - `activeProcesses.length === 0` → render `No active process`
  - `activeProcesses.length === 1` → render `title - company`
  - `activeProcesses.length > 1` → render `title - company` for first entry + `+N more` badge
- [x] 15.3.3 Update the Current step cell renderer to read from `activeProcesses[0]` instead of `activeProcess`
- [x] 15.3.4 Update the Application date cell renderer accordingly

### 15.4 Update `docs/api-spec.yml`

- [x] 15.4.1 In `CandidateListItem` schema, replace `activeProcess` (nullable object) with `activeProcesses` (array of `ActiveProcess`, minItems 0)

### 15.5 Verify fix with curl

- [x] 15.5.1 Ensure backend server is running on port 3010
- [x] 15.5.2 `curl -s "http://localhost:3010/candidates?sort=lastName&order=asc"` → assert John Doe row contains `activeProcesses` array with length 2
- [x] 15.5.3 Assert other candidates have `activeProcesses` of length 1 or 0 as expected
- [x] 15.5.4 DB state is read-only; no restoration needed

---

## 16. Dashboard: grouped workflow sections (Candidates vs Positions)

> Align home page with recruiter dashboard UX: section headings plus two stacked actions under **Candidates** (add + browse list); **Positions** remains a separate section. Supersedes the former three-column card row (tasks §10).

- [x] 16.1 Add `dashboard.sections.*` strings (EN + ES parity)
- [x] 16.2 Refactor `RecruiterDashboard.js` (sections + `GET /candidates` entry unchanged at `/candidates`)
- [x] 16.3 Extend `i18nIntegration.test.tsx`; run frontend test suite (`react-scripts test`)

