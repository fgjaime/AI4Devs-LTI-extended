# Tasks — SCRUM-85: Recruiter dashboard grouping and restyle

## 0. Setup: Create Feature Branch (MANDATORY — FIRST STEP)

- [x] 0.1 Create and switch to branch `feature/scrum-85-frontend` from the target integration branch
- [x] 0.2 Confirm current branch and clean working tree before implementation

## 1. Internationalization (before or with UI)

- [x] 1.1 Add structured `dashboard` keys in `frontend/src/i18n/locales/en.json` for section titles, optional descriptions, and any new control labels
- [x] 1.2 Mirror the same key paths and non-empty values in `frontend/src/i18n/locales/es.json`
- [x] 1.3 Ensure no hardcoded user-visible strings remain in `RecruiterDashboard.js` for the changed areas

## 2. Frontend: Layout and grouping

- [x] 2.1 Refactor `frontend/src/components/RecruiterDashboard.js` to render two distinct workflow sections (Candidates vs Positions) with section headings per `design.md`
- [x] 2.2 Preserve navigation targets: `/add-candidate` for the add-candidate action and `/positions` for the positions entry
- [x] 2.3 Apply responsive layout (stack on small screens; structured layout from `md`+) using React Bootstrap / Bootstrap utilities
- [x] 2.4 Optionally add icons from `react-bootstrap-icons` with correct accessibility (decorative vs labeled)
- [x] 2.5 Only add scoped styles to `frontend/src/index.css` if utilities are insufficient

## 3. Frontend: Review and update existing unit tests (MANDATORY)

- [x] 3.1 Update `frontend/src/i18n/__tests__/i18nIntegration.test.tsx` (and any assertions) to match new `dashboard.*` strings or headings
- [x] 3.2 Add or extend RTL tests for `RecruiterDashboard` if new structure or roles warrant coverage

## 4. Frontend: Run unit tests and record results (MANDATORY — AGENT MUST EXECUTE)

- [x] 4.1 Run targeted frontend tests (e.g. `npm test` scoped to dashboard/i18n) from `frontend/` and capture output
- [x] 4.2 Run the project’s configured frontend lint/unit suite as needed so regressions surface before merge
- [x] 4.3 Create report `openspec/changes/scrum-85/reports/2026-05-09-step-4-frontend-unit-test-verification.md` with commands, pass/fail summary, and notes (database N/A — state explicitly)

## 5. Backend: Manual endpoint testing with curl (N/A)

- [x] 5.1 Record in the same step-4 report (or a one-line appendix) that **no new or changed REST endpoints** are part of SCRUM-85; **curl regression is out of scope** for this change

## 6. E2E: Playwright MCP (MANDATORY — AGENT MUST EXECUTE — UI WORKFLOW)

- [x] 6.1 Start frontend (and backend only if required for app health in this project’s dev setup)
- [x] 6.2 Navigate to `/` and verify both workflow sections are visible and visually grouped
- [x] 6.3 Follow candidate primary action to `/add-candidate` and confirm navigation
- [x] 6.4 Return and follow positions primary action to `/positions` and confirm navigation
- [x] 6.5 Optionally verify responsive width behavior via viewport resize if supported by MCP
- [x] 6.6 Create report `openspec/changes/scrum-85/reports/2026-05-09-step-6-e2e-playwright.md` documenting scenarios and outcomes

## 7. Update technical documentation (MANDATORY)

- [x] 7.1 If `README.md` or internal frontend docs describe the recruiter dashboard UX, update them to mention grouped sections (only if such references exist — avoid inventing docs)
- [x] 7.2 Do **not** change `openspec/specs/api-spec.yml` or `openspec/specs/data-model.md` unless an unexpected API touch appears (there should be none)

## 8. Completion checklist

- [x] 8.1 ESLint passes on touched frontend files
- [x] 8.2 All checklist items above are satisfied before marking tasks complete in this file during apply/verify
