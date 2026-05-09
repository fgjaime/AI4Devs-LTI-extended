## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create and switch to `feature/scrum-84-frontend` from `main`
- [x] 0.2 Create isolated worktree at `.worktrees/scrum-84` and confirm active branch

## 1. Frontend: Candidate Details Offcanvas Width

- [x] 1.1 Add `candidate-details-offcanvas` className on `Offcanvas` in `CandidateDetails.js`
- [x] 1.2 Create and import `CandidateDetails.css` in `CandidateDetails.js`
- [x] 1.3 Implement responsive width rules for breakpoints `<576`, `>=576`, `>=768`, `>=992`, `>=1400`
- [x] 1.4 Verify pane keeps viewport-safe width and no horizontal overflow

## 2. Frontend: Unit/Component Test Updates (MANDATORY)

- [x] 2.1 Review existing candidate details component tests for className and close behavior coverage
- [x] 2.2 Add or update tests to assert offcanvas includes `candidate-details-offcanvas` class
- [x] 2.3 Add or update tests to assert close button interaction keeps `onClose` behavior

## 3. Frontend: Run Unit Tests and Verify Frontend State (MANDATORY)

- [x] 3.1 Capture pre-test baseline (lint/typescript/test status and relevant fixture state)
- [x] 3.2 Run targeted frontend unit/component tests related to candidate details
- [x] 3.3 Run required broader frontend checks (lint, type checks, and required test suite)
- [x] 3.4 Verify post-test state matches pre-test baseline expectations (no unintended data/config mutation)
- [x] 3.5 Create report `openspec/changes/scrum-84/reports/YYYY-MM-DD-step-N+1-unit-test-and-state-verification.md`

## 4. Frontend: Manual UI Validation with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [x] 4.1 Ensure frontend (and backend if needed) are running and reachable
- [x] 4.2 Open candidate details pane on desktop viewport and verify widened layout visually
- [x] 4.3 Validate interview row actions and create/edit interview form controls are not clipped
- [x] 4.4 Validate close button, backdrop click, and Escape dismiss behavior still works
- [x] 4.5 Re-run checks on tablet and mobile widths and confirm no horizontal overflow
- [x] 4.6 Document manual validation outcomes and cleanup actions in `openspec/changes/scrum-84/reports/`

## 5. Frontend: E2E Testing with Playwright MCP/Cypress (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 Add or extend Cypress candidate pane E2E to assert desktop width range and mobile full-width behavior
- [x] 5.2 Execute E2E scenario for open/close behavior including Escape key dismissal
- [x] 5.3 Verify i18n parity and existing flows remain stable with wider pane
- [x] 5.4 Restore test state after any mutations and document outcomes in `openspec/changes/scrum-84/reports/`

## 6. Documentation and Final Validation (MANDATORY)

- [x] 6.1 Update technical documentation only if changed behavior requires it
- [x] 6.2 Run final verification (`openspec verify` equivalent workflow) and resolve warnings
- [x] 6.3 Mark all completed tasks with `[x]` and ensure artifact readiness for review
