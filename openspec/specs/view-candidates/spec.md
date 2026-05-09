# Spec: View Candidates

## Purpose

This spec describes the requirements for the candidates list feature, including the backend API endpoint (`GET /candidates`) that exposes a paginated, searchable, and sortable list of candidates with their active hiring processes, as well as the frontend recruiter dashboard entry point and the candidates list page user experience.

## Requirements

### Requirement: List candidates with active hiring processes
The system SHALL expose a paginated list of candidates via `GET /candidates`, where each item includes basic candidate identity fields and a derived `activeProcesses` array containing **all** applications on positions whose `status` equals `"Open"` (case-sensitive), ordered by `applicationDate desc`.

#### Scenario: Candidate has one open application
- **WHEN** a candidate has exactly one application whose `position.status === "Open"`
- **THEN** the API response item SHALL include `activeProcesses` as a one-element array; each element contains `applicationId`, `applicationDate` (ISO-8601), `position` (`id`, `title`, `status`, `company.id`, `company.name`), `currentStep` (`id`, `name`, `orderIndex`), and `totalSteps`

#### Scenario: Candidate has multiple open applications
- **WHEN** a candidate has more than one application on positions with `status === "Open"`
- **THEN** `activeProcesses` SHALL contain one entry per open application, ordered by `applicationDate desc`
- **THEN** the UI SHALL display the first (most recent) process inline and a `+N more` badge for remaining processes

#### Scenario: Candidate has no open application
- **WHEN** a candidate has zero applications, or all applications are on positions with `status !== "Open"`
- **THEN** `activeProcesses` SHALL be an empty array `[]`

#### Scenario: Heavy relations are excluded from list
- **WHEN** the list endpoint returns candidate items
- **THEN** each item SHALL NOT include `educations`, `workExperiences`, or `resumes`

### Requirement: Pagination, search, and sort for candidate list
The system SHALL accept query parameters `page` (>=1), `limit` (>=1), `search` (substring on first name, last name, or email), `sort` (whitelisted: `firstName`, `lastName`, `email`), and `order` (`asc` | `desc`), and return validation errors mapped to HTTP 400 when inputs are invalid.

#### Scenario: Valid pagination request
- **WHEN** the client requests `GET /candidates?page=1&limit=10&sort=lastName&order=asc`
- **THEN** the API SHALL return HTTP 200 with `data: []` and metadata `{ total, page, limit, totalPages }`

#### Scenario: Invalid sort field
- **WHEN** the client requests `GET /candidates?sort=invalid`
- **THEN** the API SHALL return HTTP 400 with an error message containing `Invalid sort field`

#### Scenario: Invalid order value
- **WHEN** the client requests `GET /candidates?order=sideways`
- **THEN** the API SHALL return HTTP 400 with an error message containing `Invalid order value`

#### Scenario: Invalid page or limit
- **WHEN** the client requests `GET /candidates?page=0` or `GET /candidates?limit=0`
- **THEN** the API SHALL return HTTP 400 with the corresponding `must be greater than 0` validation message

### Requirement: Recruiter dashboard exposes View Candidates entry point
The recruiter dashboard SHALL expose a third card titled "View Candidates" with a primary button "Go to Candidates" that navigates to `/candidates`. The dashboard cards SHALL render in three columns on `md`+ breakpoints.

#### Scenario: Recruiter sees the new card
- **WHEN** a recruiter loads the dashboard
- **THEN** three cards SHALL be visible: Add Candidate, View Positions, View Candidates

#### Scenario: Navigation to candidates page
- **WHEN** the recruiter clicks "Go to Candidates"
- **THEN** the application SHALL navigate to `/candidates`

### Requirement: Candidates list page user experience
The `/candidates` page SHALL render a paginated table with columns Full name, Email, Phone (`-` when null), Active position (see display rules below), Current step (see display rules below), Application date (YYYY-MM-DD or `-`), and Actions (link to `/candidates/:id`). The page SHALL include a debounced (300ms) search input, sortable Name and Email column headers, pagination controls, and a page-size selector with options 10/25/50.

Active position and Current step display rules:
- If `activeProcesses` is empty: render `No active process` / `-`.
- If `activeProcesses` has one entry: render `title - company` / `Step Name (orderIndex/total)`.
- If `activeProcesses` has more than one entry: render the first process inline followed by a `+N more` badge (where N = `activeProcesses.length - 1`). Current step reflects the first process only.

#### Scenario: Empty state
- **WHEN** the API returns zero candidates and no search term is active
- **THEN** the page SHALL render an empty state message "No candidates yet" with a CTA pointing to the Add Candidate flow

#### Scenario: Error state
- **WHEN** the API request fails
- **THEN** the page SHALL render an alert with the error and a Retry button

#### Scenario: Loading state
- **WHEN** the API request is pending
- **THEN** the page SHALL render a spinner

#### Scenario: Internationalization
- **WHEN** the user switches between English and Spanish locales
- **THEN** all dashboard card and candidates list strings SHALL render localized via `dashboard.viewCandidates.*` and `candidates.list.*` keys
