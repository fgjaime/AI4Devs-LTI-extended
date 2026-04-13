## ADDED Requirements

### Requirement: Candidate consultation screen
The system SHALL provide a dedicated consultation screen that lists candidates and allows recruiters to review process participation without entering a position-specific board.

#### Scenario: Open consultation screen
- **WHEN** a recruiter navigates to the consultation route
- **THEN** the system SHALL render the candidate consultation page
- **AND** the page SHALL show a candidate list section and process summary section

#### Scenario: Load candidates successfully
- **WHEN** candidate data retrieval succeeds
- **THEN** the system SHALL display candidates with key identification data (name, email, phone)
- **AND** the list SHALL support pagination if provided by backend contract

#### Scenario: Candidate list loading state
- **WHEN** candidate data is being fetched
- **THEN** the system SHALL display a loading indicator
- **AND** the page SHALL prevent duplicate fetch actions while loading

#### Scenario: Candidate list error state
- **WHEN** candidate data retrieval fails
- **THEN** the system SHALL display a user-friendly error message
- **AND** the screen SHALL allow retrying the fetch operation

### Requirement: Candidate filtering and search
The system SHALL allow recruiters to search and filter candidates in the consultation screen.

#### Scenario: Search candidates by text
- **WHEN** a recruiter enters text in the search field
- **THEN** the system SHALL filter the candidate list by relevant fields (at minimum: full name and email)
- **AND** search input SHALL be debounced to avoid excessive requests

#### Scenario: Clear search criteria
- **WHEN** a recruiter clears the search input
- **THEN** the system SHALL restore the unfiltered candidate list for the current pagination context

### Requirement: Process participation summary
The system SHALL show process participation for each candidate, including a process-level status for each application/process where the candidate has participated.

#### Scenario: Candidate with multiple processes
- **WHEN** a candidate has participated in multiple processes
- **THEN** the system SHALL display one process summary item per process
- **AND** each summary item SHALL include position/process reference and current process status

#### Scenario: Candidate with no processes
- **WHEN** a candidate has no process participation
- **THEN** the system SHALL display an explicit empty-state message for process participation

#### Scenario: Process status visualization
- **WHEN** process summary is displayed
- **THEN** each process item SHALL include a clear status badge/label
- **AND** status representation SHALL be consistent across list and detail views

### Requirement: Process detail visualization
The system SHALL allow recruiters to open detailed process information for a selected candidate process.

#### Scenario: Open process detail
- **WHEN** a recruiter selects a process summary item
- **THEN** the system SHALL open a process detail view (panel, modal, or dedicated section)
- **AND** the detail view SHALL show process timeline information including interview step status/results when available

#### Scenario: Process detail loading state
- **WHEN** process detail data is being fetched
- **THEN** the system SHALL display a loading indicator within the detail view

#### Scenario: Process detail error state
- **WHEN** process detail retrieval fails
- **THEN** the system SHALL display a detail-level error message
- **AND** the recruiter SHALL be able to close the detail view or retry loading

### Requirement: Read contract for consultation data
The system SHALL expose a stable read contract for candidate-process consultation using existing endpoints or additive read-model enhancements.

#### Scenario: Existing endpoints are sufficient
- **WHEN** `GET /candidates` and `GET /candidates/{id}` provide all required fields
- **THEN** the frontend SHALL reuse those endpoints without introducing new endpoints

#### Scenario: Existing endpoints are insufficient
- **WHEN** required consultation fields are missing or inconsistent
- **THEN** the backend SHALL provide additive read-model fields and/or a dedicated read endpoint
- **AND** existing consumers SHALL remain backward compatible

### Requirement: Non-breaking integration
The consultation feature SHALL not break existing candidate, position, or interview workflows.

#### Scenario: Existing workflows remain functional
- **WHEN** the consultation feature is introduced
- **THEN** existing routes and operations (candidate details, position board, interview CRUD) SHALL continue working unchanged
- **AND** no existing API write contract SHALL be modified by this feature
