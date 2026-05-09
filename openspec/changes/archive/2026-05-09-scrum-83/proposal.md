## Why

Recruiters sometimes assign a candidate to the wrong position and currently have no direct way to undo that relationship from the candidate details context. Adding a safe remove flow prevents data inconsistencies and reduces operational friction in active hiring workflows.

## What Changes

- Add backend endpoint `DELETE /positions/{positionId}/candidates/{candidateId}` to remove one candidate-position application relationship.
- Add controller, service, and validation paths to enforce positive integer IDs and map domain outcomes to expected HTTP responses.
- Update API documentation to include the new endpoint success and error contracts.
- Add a remove action in the candidate details panel for each application row, with confirmation modal, loading state, and success/error toasts.
- Refresh candidate details and related list state after successful deletion without full-page reload.
- Add backend and frontend automated tests for happy path and error branches.

## Capabilities

### New Capabilities
- `remove-candidate-from-position`: Remove a candidate application from a position through API and candidate details UI with explicit confirmation and feedback.

### Modified Capabilities
- `position-update`: Extend candidate-position management to include removal behavior and post-action UI consistency expectations.

## Impact

- Backend route/controller/service/validator files under positions and applications flow.
- Frontend candidate details panel and service/API client code.
- OpenAPI documentation in `docs/api-spec.yml`.
- Unit and integration tests for backend and frontend delete flow behavior.
