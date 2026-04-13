## Why

Recruiters currently review candidates mainly from position-specific boards, which makes it hard to perform a global consultation of all candidates and quickly understand every recruitment process each candidate has participated in. This slows down decision-making, creates fragmented visibility across processes, and makes follow-up harder when a candidate has multiple applications. The system needs a dedicated consultation screen to list candidates, show their participated processes with status, and allow opening detailed process information from a single place.

## What Changes

- **New Frontend Consultation Screen**: Add a candidate consultation page that lists candidates with search/filter support and quick process summary per candidate
- **New Candidate Process Summary UI**: Display all processes (applications) each candidate has participated in, including process status and key metadata (position, dates, current stage)
- **New Process Detail View**: Add a drill-down panel/modal/page to visualize detailed process information, including interview progression and status per step
- **Frontend Routing Update**: Add route entry and navigation for the new consultation screen
- **Candidate Service Enhancements**: Add frontend service methods for candidate listing and process-detail retrieval, reusing existing endpoints where possible
- **Backend Read Model Enhancement (if needed)**: Extend candidate read responses to include consistent process status fields required by the consultation and detail views
- **Comprehensive Testing**: Add frontend component/service tests and backend unit tests for any response-shape adjustments
- **Documentation Updates**: Update API and data model documentation for any new or adjusted read contracts used by the consultation flow

## Capabilities

### New Capabilities
- `candidate-process-consultation`: Capability to consult candidates in a centralized screen, review all processes each candidate has participated in with status, and open a detailed process view for deeper analysis

### Modified Capabilities
- `create-interview`: Interview creation outcomes become visible in the new consultation and process-detail views through updated status/read projections
- `edit-interview`: Interview updates are reflected in process statuses and timeline details shown in the consultation experience
- `delete-interviews`: Interview deletion/cancellation states are reflected in process detail views to preserve process traceability

## Impact

**Frontend Impact:**
- `frontend/src/components/CandidateProcessConsultation.js`: New screen for candidate list and process summary
- `frontend/src/components/CandidateProcessDetail.js`: New detail view component for selected process (panel/modal/section)
- `frontend/src/services/candidateService.js`: Add `getCandidates()` and `getCandidateProcessDetail()` methods for consultation flow
- `frontend/src/App.js`: Add route for consultation screen (for example, `/candidates/consultation`)
- Existing navigation components (dashboard/menu): add entry point to the new consultation screen

**Backend Impact (if needed by UI contract):**
- `backend/src/presentation/controllers/candidateController.ts`: Ensure list/detail responses expose process status fields required by UI
- `backend/src/application/services/candidateService.ts`: Add or adapt mapping logic for process summary/detail payloads
- `backend/src/routes/candidateRoutes.ts`: Add read route for process detail only if existing candidate detail payload is insufficient

**Testing Impact:**
- Frontend tests for list rendering, process-status display, and process-detail navigation/open flow
- Backend tests for candidate list/detail response contract consistency and process status mapping

**Documentation Impact:**
- `ai-specs/specs/api-spec.yml`: Document any new read endpoint or response fields used by consultation/detail views
- `ai-specs/specs/data-model.md`: Document process status semantics shown in the consultation screen

**No Breaking Changes**: This change adds a new read/consultation experience and optionally extends read payloads without changing existing write workflows.
