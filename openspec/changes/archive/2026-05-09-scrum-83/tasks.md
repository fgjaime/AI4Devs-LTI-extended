## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create and switch to feature branch `feature/scrum-83-backend` from `main`
- [x] 0.2 Verify current branch and clean baseline context inside isolated worktree

## 1. Backend: Validator TDD for delete endpoint

- [x] 1.1 Add failing validator tests for `positionId` and `candidateId` positive-integer path rules
- [x] 1.2 Implement/update validator logic to satisfy tests and shared error format

## 2. Backend: Service TDD for removing candidate-position relationship

- [x] 2.1 Add failing service tests for successful delete and relation-not-found path
- [x] 2.2 Implement service orchestration for targeted relationship removal and expected domain errors

## 3. Backend: Controller and route wiring

- [x] 3.1 Add failing controller tests for status mapping (`204`, `400`, `404`, optional `409`, `500`)
- [x] 3.2 Implement controller delete method and register route in `positionRoutes.ts`
- [x] 3.3 Ensure authorization middleware parity with existing recruiter-protected position operations

## 4. Backend: API contract and integration coverage

- [x] 4.1 Add/update API integration tests for existing relationship delete (`204`)
- [x] 4.2 Add/update integration tests for invalid params (`400`) and missing relationship (`404`)
- [x] 4.3 Update `docs/api-spec.yml` with delete endpoint and response schema mappings

## 5. Frontend: Candidate details remove action with confirmation

- [x] 5.1 Add remove action UI element aligned to the right of each application entry in candidate details panel
- [x] 5.2 Add confirmation modal flow with clear warning text and cancel/no-side-effects behavior
- [x] 5.3 Add frontend service/API client method for delete endpoint call

## 6. Frontend: State refresh and feedback behavior

- [x] 6.1 On successful delete, close candidate details pane and re-fetch kanban candidates from API without full-page reload
- [x] 6.2 Add success toast and error toast handling for delete outcome branches
- [x] 6.3 Add frontend unit tests for render conditions, modal confirm/cancel, and success/error handling

## 7. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 7.1 Review impacted existing backend test suites and update expectations to include delete flow
- [x] 7.2 Ensure previously existing tests remain aligned with updated controller/service behavior

## 8. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 8.1 Capture pre-test database baseline for entities involved in candidate-position relations
- [x] 8.2 Run targeted unit tests for validator/service/controller/frontend modules changed by this story
- [x] 8.3 Run required broader unit test suites and record pass/fail/skipped summary
- [x] 8.4 Verify post-test database state matches baseline and restore state if needed
- [x] 8.5 Create report `openspec/changes/scrum-83/reports/2026-05-09-step-N+1-unit-test-and-db-verification.md`

## 9. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Ensure backend and database services are running and capture pre-test relationship baseline
- [x] 9.2 Execute curl delete happy path for an existing relationship and verify `204 No Content`
- [x] 9.3 Execute curl invalid parameter case and verify `400` response schema
- [x] 9.4 Execute curl missing relationship case and verify `404` response schema
- [x] 9.5 Restore database state for any created/updated/deleted test data and document cleanup actions

## 10. Frontend: E2E Testing with Playwright MCP (MANDATORY if applicable - AGENT MUST EXECUTE)

- [x] 10.1 Ensure frontend and backend services are running and reachable
- [x] 10.2 Execute E2E workflow: open candidate details, remove an application, confirm deletion, verify refreshed UI state
- [x] 10.3 Execute E2E cancel workflow and verify no deletion occurs
- [x] 10.4 Execute E2E error scenario and verify error feedback rendering
- [x] 10.5 Restore any test data created/changed during E2E and document restoration

## 11. Update Technical Documentation (MANDATORY)

- [x] 11.1 Update technical docs describing candidate-position relationship management behavior if required
