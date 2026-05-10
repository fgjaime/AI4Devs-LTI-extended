## Context

Candidate assignments to positions are currently additive, and mistakes require indirect correction paths that create workflow friction. The feature spans backend API behavior, frontend candidate details interactions, and API documentation consistency. Existing architecture separates concerns across presentation, application, and domain layers in backend, and component/service boundaries in frontend.

## Goals / Non-Goals

**Goals:**
- Expose a dedicated deletion endpoint to remove one candidate-position relationship.
- Enforce path parameter validation and role-based access according to existing auth policy.
- Provide a clear and safe UI removal flow with confirmation, optimistic feedback, and state refresh.
- Ensure API docs and automated tests reflect the new behavior.

**Non-Goals:**
- Rework broader candidate lifecycle workflows.
- Introduce bulk removal.
- Introduce soft-delete or historical audit redesign outside current domain behavior.

## Decisions

1. **Add explicit delete endpoint under positions routes**
   - Decision: `DELETE /positions/{positionId}/candidates/{candidateId}` in position route group.
   - Rationale: Keeps relationship lifecycle API localized with existing position-candidate orchestration.
   - Alternative considered: Candidate-centric endpoint. Rejected to avoid route fragmentation with current design.

2. **Preserve layered backend flow**
   - Decision: Route -> controller -> service -> repository/domain path with validator checks.
   - Rationale: Maintains existing DDD and clean architecture conventions.
   - Alternative considered: Controller-level direct repository access. Rejected due to coupling and testability loss.

3. **Map service outcomes to contract status codes**
   - Decision: Success returns `204`; invalid IDs `400`; missing entities or relation `404`; conflict `409` only if domain guard exists.
   - Rationale: Matches enriched story and REST semantics while preserving backward-compatible error payload shape.

4. **Frontend removal action in application row with confirmation modal**
   - Decision: Add compact remove button at right side of application row and a confirmation dialog before network call.
   - Rationale: Aligns with UX safety patterns and prevents accidental destructive actions.
   - Alternative considered: Inline immediate delete. Rejected due to high accidental-click risk.

5. **Post-delete state refresh strategy**
   - Decision: Re-fetch candidate details and list-related counters after successful delete.
   - Rationale: Guarantees consistency across UI surfaces without brittle local cache mutation logic.

## Risks / Trade-offs

- **[Risk] Duplicate delete clicks during latency** -> Mitigation: disable confirm action while request is pending.
- **[Risk] Stale UI state after deletion** -> Mitigation: central refresh call for candidate details and list state.
- **[Risk] Route-contract mismatch in docs/tests** -> Mitigation: update OpenAPI and integration tests in same task set.
- **[Risk] Existing config parsing issues affecting OpenSpec tooling** -> Mitigation: proceed with manual artifact creation and validate with verify step output.
