## ADDED Requirements

### Requirement: Position candidate relationship can be removed
The system SHALL support removing a single candidate application relationship from a position using a dedicated delete endpoint and preserve consistent error mapping for invalid or missing resources.

#### Scenario: Delete relationship with valid identifiers
- **WHEN** a delete request is sent to `/positions/{positionId}/candidates/{candidateId}` with valid IDs and an existing relationship
- **THEN** the system returns `204 No Content`
- **AND** the targeted relationship no longer exists

#### Scenario: Delete relationship for missing link
- **WHEN** a delete request is sent for a position-candidate pair that is not linked
- **THEN** the system returns `404 Not Found`
- **AND** no other relationships are changed

### Requirement: Candidate detail panel remains consistent after removal
The system SHALL refresh candidate detail and list indicators after successful relationship removal to avoid stale UI state.

#### Scenario: Refresh dependent data after successful delete
- **WHEN** the frontend receives successful delete response
- **THEN** the candidate details panel updates to remove that application entry
- **AND** related counters or list indicators are refreshed without full-page reload
