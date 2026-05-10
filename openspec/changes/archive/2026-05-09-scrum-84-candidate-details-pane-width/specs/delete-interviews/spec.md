## ADDED Requirements

### Requirement: Delete interview modal remains correctly layered with wider candidate pane
The system SHALL keep delete interview confirmation modal behavior and layering intact when candidate details pane width increases responsively.

#### Scenario: Delete confirmation modal appears above widened pane
- **WHEN** a recruiter opens the delete interview confirmation from the candidate details pane on tablet or desktop viewports
- **THEN** the modal overlays above the offcanvas
- **AND** confirm/cancel actions remain fully visible and clickable
