## Why

Recruiters use the candidate details offcanvas to review dense interview and application data, but the current fixed width causes cramped layouts and excessive wrapping on tablet and desktop screens. Expanding the pane responsively improves readability and efficiency without changing business logic.

## What Changes

- Add a dedicated CSS class to the candidate details offcanvas container and apply responsive width rules by breakpoint.
- Keep mobile behavior full-width while widening tablet and desktop widths using `min()` and `clamp()` constraints.
- Preserve existing offcanvas behavior (placement, close mechanics, focus trap, accessibility semantics, and nested modal behavior).
- Add automated frontend tests that validate class attachment, close behavior, and responsive width expectations.

## Capabilities

### New Capabilities
- `candidate-details-pane-width`: Responsive candidate details pane width adapts per viewport while preserving existing interactions.

### Modified Capabilities
- `edit-interview`: Validate edit interview modal layering and usability over wider candidate details pane.
- `delete-interviews`: Validate delete interview modal layering over wider candidate details pane.

## Impact

- Frontend component: `frontend/src/components/CandidateDetails.js`
- New component stylesheet: `frontend/src/components/CandidateDetails.css`
- Frontend tests: Candidate details component tests and Cypress candidate pane E2E coverage
- No backend, API contract, or data model changes
