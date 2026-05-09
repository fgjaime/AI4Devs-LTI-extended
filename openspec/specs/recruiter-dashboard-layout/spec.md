# recruiter-dashboard-layout Specification

## Purpose

Defines recruiter home (`/`) layout: grouped candidate vs position workflows, responsive structure, dashboard i18n, and no extra backend coupling for the landing page alone.
## Requirements
### Requirement: Recruiter home page groups candidate and position actions

The system SHALL render the recruiter dashboard at route `/` with two distinct groups: one for **candidate-related** actions and one for **position-related** actions. Each group SHALL include a visible section title and at least one primary navigation control. The candidate group SHALL provide access to add a candidate (navigate to `/add-candidate`). The position group SHALL provide access to the positions list (navigate to `/positions`).

#### Scenario: Candidate group links to add candidate

- **WHEN** the user views `/`
- **THEN** a candidate workflow section is visible and includes a control that navigates to `/add-candidate`

#### Scenario: Position group links to positions list

- **WHEN** the user views `/`
- **THEN** a position workflow section is visible and includes a control that navigates to `/positions`

#### Scenario: Sections are distinguishable from each other

- **WHEN** the dashboard is rendered
- **THEN** candidate and position groups are visually separated by section headings and/or spacing so a typical user can tell which actions belong to which workflow

### Requirement: Dashboard layout and responsiveness

The dashboard SHALL use React Bootstrap and Bootstrap patterns consistent with `docs/frontend-standards.md`. Content SHALL be usable on narrow viewports (stacked layout, adequate spacing and touch targets) and on `md` and wider viewports (clear multi-column or structured layout without horizontal overflow).

#### Scenario: Narrow viewport stacks content

- **WHEN** the viewport width is below the `md` breakpoint
- **THEN** section groups stack vertically and remain readable without horizontal scrolling

#### Scenario: Wider viewport shows structured layout

- **WHEN** the viewport width is at or above the `md` breakpoint
- **THEN** the page presents a clear structured layout (e.g. two columns or equivalent) that preserves both workflow groups

### Requirement: Internationalization for new dashboard copy

All new or changed user-visible strings on the recruiter dashboard SHALL be defined under the `dashboard` namespace in both `frontend/src/i18n/locales/en.json` and `frontend/src/i18n/locales/es.json` with identical key structure. The component SHALL resolve them through `useTranslation()` and `t()`.

#### Scenario: English and Spanish keys exist for new strings

- **WHEN** a new translation key is added for dashboard section titles or descriptions
- **THEN** the same key path exists in both `en.json` and `es.json` with non-empty values

### Requirement: Accessible structure for the recruiter dashboard

The page SHALL expose a logical heading hierarchy: exactly one primary page title suitable for `h1`, and section titles for each workflow group using heading elements (e.g. `h2`). Links SHALL have descriptive visible text or accessible names so purpose is clear out of context.

#### Scenario: Heading hierarchy is logical

- **WHEN** assistive technology reads the `/` page
- **THEN** a single primary document title precedes section headings for candidate and position groups in a logical order

#### Scenario: Primary actions have clear names

- **WHEN** the user inspects candidate and position primary links or buttons
- **THEN** each target’s purpose is clear from its label (via `t()`-resolved text or equivalent)

### Requirement: No new backend coupling on the dashboard

The recruiter dashboard SHALL NOT introduce new HTTP requests or dependency on new backend endpoints solely for this change. Existing client-side routing and downstream pages remain responsible for API usage.

#### Scenario: Dashboard renders without fetching dashboard-specific data

- **WHEN** the user loads `/` with the application in a normal running state
- **THEN** the dashboard does not require new API endpoints introduced by SCRUM-85 to render grouped sections and links

