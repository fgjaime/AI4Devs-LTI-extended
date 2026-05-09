# Spec — add-candidate-to-process

## Purpose

Defines the behaviour of the feature that allows a recruiter to assign an existing candidate to an open position, creating a new Application record and placing the candidate at the first step of the position's interview flow.

## Requirements

### Requirement: Assign existing candidate to a position

The system SHALL provide an endpoint `POST /positions/{positionId}/candidates` that creates a new `Application` linking an existing `Candidate` to the specified `Position` and sets the application's `currentInterviewStep` to the first step (lowest `orderIndex`) of the position's `InterviewFlow`. The operation SHALL run inside a single Prisma transaction.

#### Scenario: Successful assignment with notes

- **WHEN** a recruiter sends `POST /positions/{positionId}/candidates` with body `{ "candidateId": <id>, "notes": "Referred by employee #42" }` and the position is `Open`, the candidate exists, no prior `Application` exists for that pair, and the position's interview flow has at least one step
- **THEN** the system SHALL create a new `Application` row with `positionId`, `candidateId`, `applicationDate = now()`, `currentInterviewStep = firstStep.id`, and `notes = "Referred by employee #42"`, and SHALL respond `201 Created` with body `{ id, positionId, candidateId, applicationDate, currentInterviewStep, interviewStepId, notes }` where `interviewStepId === currentInterviewStep`

#### Scenario: Successful assignment without notes

- **WHEN** the request body is `{ "candidateId": <id> }` (no `notes` field)
- **THEN** the system SHALL persist `notes = null` and respond `201 Created` with the same payload shape

#### Scenario: First step selection is deterministic

- **WHEN** the position's `InterviewFlow` has multiple steps with distinct `orderIndex` values
- **THEN** the system SHALL select the step with the lowest `orderIndex` as `currentInterviewStep`

### Requirement: Validate request body

The system SHALL reject malformed request bodies with HTTP 400 before any database access. Validation rules:

- `candidateId` is required, MUST be a positive integer.
- `notes` is optional, MUST be a string with length ≤ 500 characters when present.
- The body MUST NOT contain fields other than `candidateId` and `notes`.

#### Scenario: Missing candidateId

- **WHEN** the request body is `{}` or `{ "notes": "abc" }`
- **THEN** the system SHALL respond `400 Bad Request` with `code: "VALIDATION_ERROR"` and an error message identifying `candidateId` as required

#### Scenario: Non-integer candidateId

- **WHEN** the request body contains `candidateId` as a string, float, zero, or negative number
- **THEN** the system SHALL respond `400 Bad Request` with `code: "VALIDATION_ERROR"`

#### Scenario: Notes too long

- **WHEN** `notes` length exceeds 500 characters
- **THEN** the system SHALL respond `400 Bad Request` with `code: "VALIDATION_ERROR"` and an error message indicating the 500-character limit

#### Scenario: Unexpected field

- **WHEN** the body contains a field other than `candidateId` or `notes` (for example `applicationDate` or `interviewStepId`)
- **THEN** the system SHALL respond `400 Bad Request` with `code: "VALIDATION_ERROR"`

#### Scenario: Invalid path parameter

- **WHEN** `:positionId` in the path is not a valid integer
- **THEN** the system SHALL respond `400 Bad Request` with a message indicating the position ID format is invalid

### Requirement: Reject when position does not exist

The system SHALL return HTTP 404 when the supplied `positionId` does not match any `Position` row.

#### Scenario: Position not found

- **WHEN** the request targets a `positionId` that does not exist
- **THEN** the system SHALL respond `404 Not Found` with `code: "POSITION_NOT_FOUND"`

### Requirement: Reject when candidate does not exist

The system SHALL return HTTP 404 when the supplied `candidateId` does not match any `Candidate` row.

#### Scenario: Candidate not found

- **WHEN** the position exists but the supplied `candidateId` does not match any candidate
- **THEN** the system SHALL respond `404 Not Found` with `code: "CANDIDATE_NOT_FOUND"`

### Requirement: Reject when position is closed or filled

The system SHALL refuse to assign candidates to a position whose `status` is `Closed` or `Hired`.

#### Scenario: Position is Closed

- **WHEN** the position's `status` is `Closed`
- **THEN** the system SHALL respond `409 Conflict` with `code: "POSITION_CLOSED"`

#### Scenario: Position is Hired

- **WHEN** the position's `status` is `Hired`
- **THEN** the system SHALL respond `409 Conflict` with `code: "POSITION_CLOSED"`

### Requirement: Reject when interview flow has no steps

The system SHALL refuse to assign candidates when the position's `InterviewFlow` has zero `InterviewStep`s.

#### Scenario: Empty interview flow

- **WHEN** the position's interview flow has no configured interview steps
- **THEN** the system SHALL respond `422 Unprocessable Entity` with `code: "NO_INTERVIEW_STEPS"`

### Requirement: Reject duplicate assignment

The system SHALL refuse to create a second `Application` for the same `(positionId, candidateId)` pair.

#### Scenario: Duplicate

- **WHEN** an `Application` already exists for the supplied `(positionId, candidateId)` pair
- **THEN** the system SHALL respond `409 Conflict` with `code: "DUPLICATE_APPLICATION"`

### Requirement: Recruiter UI to add a candidate from the position page

The system SHALL provide an "Add candidate" action on the position details page that opens a modal allowing recruiters to search for an existing candidate, optionally enter notes (≤ 500 characters), and submit the assignment.

#### Scenario: Open and submit modal

- **WHEN** a recruiter clicks the "Add candidate" button on a position's details page, types a query, selects a candidate from the debounced search results, optionally fills notes, and clicks Submit
- **THEN** the UI SHALL call `POST /positions/{positionId}/candidates`, on `201` close the modal, show a success toast, and refresh the Kanban board so the candidate appears on the first interview step

#### Scenario: Server returns an error

- **WHEN** the server returns a `4xx` or `5xx` response
- **THEN** the UI SHALL keep the modal open and display an error toast localized using the response `code` (e.g. `DUPLICATE_APPLICATION`, `POSITION_CLOSED`, `NO_INTERVIEW_STEPS`)

#### Scenario: Debounced candidate search

- **WHEN** the recruiter types in the search input
- **THEN** the UI SHALL debounce search requests with a delay of at least 300 ms before calling the candidate search API

#### Scenario: Candidate list appears immediately with only assignable candidates

- **WHEN** a recruiter opens the "Add candidate" modal from a position details page
- **THEN** the UI SHALL immediately render a selectable list of candidates without requiring an initial query
- **AND** the UI SHALL exclude any candidate that already has an `Application` for the current position

#### Scenario: Notes character limit

- **WHEN** the recruiter types into the notes textarea
- **THEN** the UI SHALL prevent submission and surface a validation message when the value exceeds 500 characters

#### Scenario: Keyboard accessibility

- **WHEN** the modal is open
- **THEN** focus SHALL be trapped inside the modal, ESC SHALL close it, and all interactive elements SHALL be reachable via Tab in a logical order

### Requirement: Internationalization of new UI strings

The system SHALL provide English and Spanish translations for all new UI strings under the `positions.addCandidate.*` namespace, including button label, modal title, search placeholder, notes label/placeholder, submit/cancel buttons, success toast, and error toasts keyed by server `code`.

#### Scenario: English locale

- **WHEN** the locale is `en`
- **THEN** all new UI strings SHALL render in English

#### Scenario: Spanish locale

- **WHEN** the locale is `es`
- **THEN** all new UI strings SHALL render in Spanish

### Requirement: API documentation

The OpenAPI specification SHALL document the new operation, including the request body schema, the success response schema (with both `currentInterviewStep` and the `interviewStepId` alias), and all error codes (`VALIDATION_ERROR`, `POSITION_NOT_FOUND`, `CANDIDATE_NOT_FOUND`, `POSITION_CLOSED`, `DUPLICATE_APPLICATION`, `NO_INTERVIEW_STEPS`, `INTERNAL_ERROR`).

#### Scenario: OpenAPI updated

- **WHEN** a developer reads `docs/api-spec.yml`
- **THEN** the file SHALL contain a `POST /positions/{positionId}/candidates` operation with request schema, 201 response schema, and 400/404/409/422/500 error responses described
