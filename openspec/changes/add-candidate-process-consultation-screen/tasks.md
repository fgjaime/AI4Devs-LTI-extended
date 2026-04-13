## 0. Setup and Alignment

- [x] 0.1 Validate change scope with proposal, design, and spec artifacts
- [x] 0.2 Create feature branch `feature/candidate-process-consultation` from main/master
- [x] 0.3 Confirm implementation boundaries (consultation only, no write workflow changes)

## 1. Backend Contract Assessment (TDD-first for new logic)

- [x] 1.1 Review `GET /candidates` and `GET /candidates/:id` payloads against consultation requirements
- [x] 1.2 Define a response mapping matrix for required fields (candidate identity, processes, statuses, timeline fields)
- [x] 1.3 If contract gaps exist, write failing backend tests for additive read projection/endpoint changes
- [x] 1.4 Implement minimal backend read-contract changes to satisfy consultation scenarios
- [x] 1.5 Add/update controller and service tests for new read behavior
- [x] 1.6 Verify existing candidate/interview tests still pass after read-contract changes

## 2. Frontend Consultation Route and Screen Scaffold (TDD)

- [x] 2.1 Write failing frontend tests for route registration and initial consultation page rendering
- [x] 2.2 Add route in `frontend/src/App.js` for consultation screen
- [x] 2.3 Create `CandidateProcessConsultation` page component scaffold
- [x] 2.4 Add navigation entry point from existing recruiter navigation flow
- [x] 2.5 Implement loading and error states for initial page data fetch
- [x] 2.6 Make route tests pass and confirm navigation behavior

## 3. Frontend Candidate List and Search/Filter (TDD)

- [x] 3.1 Write failing tests for candidate list rendering and empty-state behavior
- [x] 3.2 Write failing tests for search/filter interactions (search by name/email)
- [x] 3.3 Add candidate list UI with pagination controls if backend pagination exists
- [x] 3.4 Implement debounced search and reset behavior
- [x] 3.5 Add robust error handling and retry action for list fetch failures
- [x] 3.6 Make list and filter tests pass

## 4. Frontend Process Summary Status Mapping (TDD)

- [x] 4.1 Write failing tests for process summary rendering per candidate
- [x] 4.2 Write failing tests for status badge mapping and consistency rules
- [x] 4.3 Implement process summary section for each candidate process/application
- [x] 4.4 Implement deterministic status mapping adapter for UI consumption
- [x] 4.5 Verify candidates with zero processes show explicit empty state
- [x] 4.6 Make summary/status tests pass

## 5. Frontend Process Detail View (TDD)

- [x] 5.1 Write failing tests for opening process detail from summary item
- [x] 5.2 Write failing tests for detail loading, success, and error states
- [x] 5.3 Implement process detail view component (`CandidateProcessDetail`)
- [x] 5.4 Add on-demand detail fetch and state management
- [x] 5.5 Render interview timeline/step status information in detail view
- [x] 5.6 Make process detail tests pass

## 6. Frontend Service Layer

- [x] 6.1 Add/extend methods in `frontend/src/services/candidateService.js` for consultation data retrieval
- [x] 6.2 Centralize API error normalization for consultation calls
- [x] 6.3 Add tests for service methods and error propagation

## 7. Mandatory Quality Gates

- [x] 7.1 Review and update existing unit tests impacted by new route/components
- [x] 7.2 Run full backend test suite and verify 0 failures
- [x] 7.3 Run frontend test suite and verify 0 failures
- [x] 7.4 Execute manual end-to-end validation of consultation flow
- [x] 7.5 Confirm no regressions in position board and candidate detail workflows

## 8. Mandatory Manual API Validation (if backend read changes were introduced)

- [x] 8.1 Validate candidate list read contract manually with curl
- [x] 8.2 Validate candidate process detail read contract manually with curl
- [x] 8.3 Validate error scenarios for missing candidate/process resources

## 9. Documentation Updates (MANDATORY)

- [x] 9.1 Update `ai-specs/specs/api-spec.yml` for any new/extended read contracts
- [x] 9.2 Update `ai-specs/specs/data-model.md` with process status semantics used in consultation
- [x] 9.3 Add implementation notes for consultation route and UX behavior in relevant docs

## 10. Final Verification

- [x] 10.1 Verify all acceptance scenarios from spec are covered by tests or manual evidence
- [x] 10.2 Verify all new artifacts and code follow English-only and project standards
- [x] 10.3 Prepare change for review with clear test evidence and known limitations
