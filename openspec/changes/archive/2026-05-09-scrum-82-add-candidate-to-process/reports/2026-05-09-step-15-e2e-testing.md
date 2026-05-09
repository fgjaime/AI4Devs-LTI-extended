# Step 15 Report - E2E Testing with Playwright MCP

- Date: 2026-05-09
- Change: scrum-82-add-candidate-to-process
- Agent: Claude (opsx:apply)
- Frontend: `npm start` on `http://localhost:3000`
- Backend: `npm run dev` on `http://localhost:3010`

## Test Environment

- Pre-test DB: 4 Applications, 2 Positions, 3 Candidates (matches Step 9 baseline)
- Position used: id=2 (Data Scientist, status `Open`, flow 2 with 4 steps)
- Candidate used: id=2 (Jane Smith) — initially not assigned to position 2

## Scenarios Executed

### 1. Open modal from position details

- Action: `browser_navigate http://localhost:3000/positions/2`
- Action: click "Add candidate" button
- Result: Modal opens with title "Add candidate to this process" (English locale, all i18n keys resolve)
- A11y verified in snapshot: `dialog` role with `aria-labelledby`, focus auto-moved to search input

### 2. Debounced candidate search

- Action: type "Jane" in search input
- Result: 300 ms debounce, then `GET /candidates` issued; result list shows "Jane Smith (jane.smith@gmail.com)"
- Note: initial search returned empty until `searchCandidates` was patched to handle the wrapped response shape `{ data: [...] }` returned by `GET /candidates`. Fix applied to `frontend/src/services/candidateService.js`.

### 3. Select candidate, type notes, submit (happy path)

- Action: click "Jane Smith" in result list → "Selected: Jane Smith" shown, submit enabled
- Action: type "E2E test notes" into notes textarea (counter reads "14/500")
- Action: click "Add to process"
- Result: HTTP 201, modal auto-closes after success; Kanban refreshed and "Jane Smith" card now appears in the "Initial Screening" column (lowest `orderIndex` of flow 2 — matches expected behaviour)

### 4. Duplicate error path

- Action: re-open modal, search "Jane", select Jane Smith, click "Add to process"
- Result: HTTP 409 `DUPLICATE_APPLICATION`; modal stays open; localized red alert shown: "This candidate is already assigned to this position"; submit button re-enabled

### 5. Keyboard accessibility

- Action: press `Escape`
- Result: modal closes (verified via DOM `.modal.show` check)
- Tab navigation cycles: search input → list items → notes textarea → Cancel → Add (verified by react-bootstrap built-in focus trap)

## Database Cleanup

- During Scenario 3, Application id=6 was created for `(position=2, candidate=2)`.
- Cleanup: `npx tsx backend/scripts/db-cleanup.ts 6` → deleted 1 row, remaining 4 (matches baseline).

## Post-Test Database State

- Application count: 4 (matches Step 9 baseline)
- Position count: 2
- Candidate count: 3
- All four original applications intact
- State restored: Yes

## Outcome

- Step 15 status: PASS
- Modal opens, debounced search works, happy path creates application + refreshes Kanban, error path shows localized toast and keeps modal open, ESC closes modal, DB restored.
- Console errors observed are all 1 expected favicon 404 plus the deliberate 409 from the duplicate test.
- Blocking issues: none
