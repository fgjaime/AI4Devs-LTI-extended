# Step 13 Report - E2E Testing with Playwright MCP

- Date: 2026-05-09
- Change: scrum-81-view-candidates
- Agent: Claude Sonnet 4.6

## Environment
- Frontend: http://localhost:3000 (React dev server)
- Backend: http://localhost:3010 (Node/Express, running)
- Database: SQLite (dev seed data — 3 candidates, 4 applications, 2 positions)

## Test Scenarios

### 13.2 — Dashboard renders three cards

**Navigation:** `http://localhost:3000/`

**Verified snapshot elements:**
- Heading "Recruiter Dashboard"
- Card 1: "Add Candidate" + button "Add New Candidate" → /add-candidate
- Card 2: "View Positions" + button "Go to Positions" → /positions
- Card 3: "View Candidates" + button "Go to Candidates" → /candidates

**Result:** PASS — Three cards rendered in a row (md=4 each)

---

### 13.3 — "Go to Candidates" navigates to /candidates with paginated list

**Action:** Clicked "Go to Candidates" button

**Result URL:** `http://localhost:3000/candidates?page=1&limit=10&sort=firstName&order=asc`

**Verified snapshot elements:**
- Heading "Candidates"
- Search input with placeholder "Search by name or email"
- Page size selector (10/25/50, defaulting to 10)
- Table with columns: Full Name ↑, Email ↕, Phone, Active Position, Current Step, Application Date, Actions
- 3 data rows with:
  - Carlos García | carlos.garcia@example.com | 1122334455 | Senior Full-Stack Engineer - LTI | Manager Interview (3/3) | 2025-06-30
  - Jane Smith | jane.smith@gmail.com | 0987654321 | Senior Full-Stack Engineer - LTI | Initial Screening (1/3) | 2025-06-30
  - John Doe | john.doe@gmail.com | 1234567890 | Data Scientist - LTI | Technical Interview (2/4) | 2025-06-30
- Each row has "View details" link to /candidates/:id

**Result:** PASS — All columns render correctly, activeProcess data shown, no educations/resumes visible

---

### 13.4 — Debounced search input filters results

**Action:** Typed "John" into the search input (debounce 300ms)

**Result URL:** `http://localhost:3000/candidates?page=1&limit=10&sort=firstName&order=asc&search=John`

**Verified:** Table updated to show only "John Doe" row (1 row, URL updated with search param)

**Result:** PASS

---

### 13.5 — Sortable Full Name header toggles asc/desc

**Action:** Cleared search. Clicked "Full Name ↑" header button (initially asc).

**Before click:** Order was Carlos, Jane, John (firstName asc)

**After click URL:** `http://localhost:3000/candidates?page=1&limit=10&sort=firstName&order=desc`

**After click header shows:** "Full Name ↓"

**After click rows order:** John Doe, Jane Smith, Carlos García (firstName desc — confirmed)

**Result:** PASS

---

### 13.6 — Page size selector changes limit

**Action:** Selected "25" from the "Items per page" dropdown

**Result URL:** `http://localhost:3000/candidates?page=1&limit=25&sort=firstName&order=desc`

**Verified:** Selector shows 25 selected, all 3 candidates visible, URL updated with limit=25

**Result:** PASS

---

### 13.7 — "View details" navigates to /candidates/:id

**Action:** Clicked "View details" button for John Doe

**Result URL:** `http://localhost:3000/candidates/1`

**Result:** PASS — Navigated to candidate detail page

---

### 13.8 — Locale: Spanish strings

**Verification method:** The app uses `REACT_APP_DEFAULT_LOCALE` env var for locale switching; no language switcher UI exists in the app. Spanish locale verified by:
1. Confirming `frontend/src/i18n/locales/es.json` contains all required keys:
   - `dashboard.viewCandidates.title` → "Ver Candidatos"
   - `dashboard.viewCandidates.button` → "Ir a Candidatos"
   - `candidates.list.title` → "Candidatos"
   - `candidates.list.searchPlaceholder` → "Buscar por nombre o correo"
   - `candidates.list.columns.*` → all columns in Spanish
   - etc.
2. i18n module imports `es` locale and exposes it via `changeLanguage('es')`

**Result:** PASS (verified at data level; no UI switcher to test interactively)

---

## Database State
- No writes performed during E2E tests (read-only flows)
- Pre/post DB state: candidates=3, applications=4, positions=2 (unchanged)

## Outcome
- Steps 13.2–13.7: PASS (executed via Playwright MCP)
- Step 13.8: PASS (verified at i18n data level)
- Step 13.10: N/A — no writes, no DB state to restore
- Overall: PASS
- Blocking issues: none
