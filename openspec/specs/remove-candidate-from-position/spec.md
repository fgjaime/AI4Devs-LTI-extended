## Purpose

Define backend and frontend behavior for safely removing a candidate application relationship from a position.

## Requirements

### Requirement: Remove candidate application from position
The system SHALL provide an authenticated endpoint that removes exactly one candidate-position application relationship for the provided `positionId` and `candidateId`.

#### Scenario: Remove existing relationship successfully
- **WHEN** a recruiter sends `DELETE /positions/{positionId}/candidates/{candidateId}` for an existing relationship
- **THEN** the system returns `204 No Content`
- **AND** only that relationship is removed

#### Scenario: Reject invalid path parameters
- **WHEN** a recruiter sends a delete request with non-positive or invalid `positionId` or `candidateId`
- **THEN** the system returns `400 Bad Request`
- **AND** no relationship is removed

#### Scenario: Relationship not found
- **WHEN** a recruiter sends a delete request for a non-existing position, candidate, or relationship
- **THEN** the system returns `404 Not Found`
- **AND** the response uses the standard API error format

### Requirement: Candidate details UI supports safe removal flow
The system SHALL provide a remove action in the candidate details panel for each application row, requiring explicit user confirmation before deletion.

#### Scenario: User confirms removal
- **WHEN** the user clicks remove on an application row and confirms in the modal
- **THEN** the frontend calls the delete endpoint for that row
- **AND** on success the application disappears from candidate details
- **AND** the candidate details pane closes after removal succeeds
- **AND** the kanban candidate columns are re-fetched from API and refreshed to avoid stale cards
- **AND** a success toast is shown

#### Scenario: User cancels removal
- **WHEN** the user opens the confirmation modal and clicks cancel
- **THEN** the modal closes
- **AND** no API request is made
- **AND** UI data remains unchanged

#### Scenario: Remove request fails
- **WHEN** delete request returns an error status
- **THEN** the UI keeps current data visible
- **AND** an error toast with contextual feedback is shown
