## Context

The platform currently allows recruiters to view candidates from position-specific views and inspect individual candidate detail panels. This supports operational tasks but does not provide a centralized consultation experience to answer cross-process questions such as:

- Which candidates are currently active across multiple processes?
- What is the status of each process where a candidate has participated?
- What happened in each process timeline (interviews, results, current stage)?

The existing architecture already exposes candidate list and candidate detail APIs, and the frontend has React components for candidate and process-related data (`PositionDetails`, `CandidateDetails`). The new feature should prioritize reusing current endpoints and response models, adding read-contract extensions only when required for stable UI behavior.

## Goals / Non-Goals

**Goals**
- Provide a dedicated consultation screen to list candidates independently of position boards.
- Show process participation summary per candidate (one row/card per application/process) including current status.
- Allow users to open process detail for a selected candidate process and inspect key timeline information.
- Preserve consistency with existing UI patterns and backend read contracts.
- Keep implementation additive and non-breaking.

**Non-Goals**
- Modifying interview creation/update/delete workflows.
- Introducing new authorization policies.
- Replacing position-board workflows.
- Building analytics dashboards or reporting exports.

## Decisions

### 1. New Consultation Route in Frontend
**Decision**: Add a dedicated route (proposed: `/candidates/consultation`) and a new top-level page component.

**Rationale**:
- Isolates consultation use case from operational board interactions.
- Enables future enhancements (saved filters, pagination state, deep links).
- Minimizes coupling with existing position-specific components.

**Alternatives considered**:
- Embedding consultation inside existing dashboard: faster initially, but harder to maintain and scale.

### 2. Reuse Existing Candidate Read Endpoints First
**Decision**: Use existing read endpoints (`GET /candidates`, `GET /candidates/:id`) as primary data sources; only add backend read projection if required fields are missing or inconsistent.

**Rationale**:
- Reduces backend scope and regression risk.
- Keeps change incremental and aligned with current architecture.
- Avoids duplicating read models.

**Alternatives considered**:
- New dedicated consultation endpoint from day one: more explicit contract, but higher initial complexity.

### 3. Explicit Process Status Mapping at UI Layer (with Backend Fallback)
**Decision**: Define a deterministic status mapping for process cards (e.g., `In Progress`, `Passed`, `Failed`, `No Interviews Yet`) based on current stage and interview outcomes. If current payload cannot reliably compute this, add backend-computed status fields.

**Rationale**:
- Ensures clear and predictable user experience.
- Allows incremental adoption without immediate backend refactor.
- Creates a path to move business mapping server-side when needed.

**Alternatives considered**:
- Display raw fields only: lower effort, but poor clarity for recruiters.

### 4. Progressive Detail Rendering Pattern
**Decision**: Render candidate list first, then lazy-load process details on demand when user opens a specific process.

**Rationale**:
- Better perceived performance for large candidate sets.
- Avoids over-fetching nested process/interview data for all candidates.
- Keeps UI responsive and easier to paginate.

**Alternatives considered**:
- Eager load all details: simpler state model, but higher network and rendering cost.

### 5. Testing Strategy Before Implementation
**Decision**: Follow TDD for any new logic and define acceptance scenarios in specs/tasks before coding.

**Rationale**:
- Aligns with project standards.
- Reduces ambiguity in status mapping and edge-case handling.
- Improves confidence in non-breaking rollout.

## Risks / Trade-offs

### [Risk] Inconsistent Data Shape Across Endpoints
Some candidate/process fields might differ between list and detail endpoints.

**Mitigation**:
- Introduce frontend adapter/mapping layer.
- Add backend projection normalization if mismatch causes unstable UI.

### [Risk] Ambiguous Process Status Semantics
Status may be interpreted differently across teams (latest interview result vs current stage vs application state).

**Mitigation**:
- Document status precedence in spec scenarios.
- Validate semantics with product stakeholders before coding.

### [Trade-off] Two-step Data Load
Lazy detail loading introduces extra request on detail open.

**Rationale**:
- Acceptable trade-off to keep initial list fast and scalable.

### [Risk] Large Candidate Volumes
Rendering and filtering many candidates client-side can degrade UX.

**Mitigation**:
- Reuse server pagination in `GET /candidates`.
- Debounce search and keep filter state minimal.

## Migration Plan

1. Implement frontend route and consultation page scaffold.
2. Integrate candidate list and process summary rendering.
3. Add process detail view with on-demand fetch.
4. Add/adjust backend read contract only if required by scenarios.
5. Execute unit/integration/manual tests and update docs.

**Rollback**:
- Remove route and entry point from navigation.
- Keep existing candidate and position workflows untouched.
- Backend read projection additions (if any) are additive and can remain without affecting current consumers.

## Open Questions

1. Which process status taxonomy is canonical for recruiters (`In Progress`, `Passed`, `Failed`, `Withdrawn`, etc.)?
2. Should process detail include deleted/cancelled interviews or only active history?
3. Do we need sorting by most recent process activity by default?
4. Should consultation screen be accessible from recruiter dashboard only, or also from position views?
