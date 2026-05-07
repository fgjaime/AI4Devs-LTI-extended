# frontend-i18n

## Purpose

Defines the internationalization (i18n) requirements for the frontend application, covering i18next initialization, locale bundles, component migration, status vocabulary normalization, backend validator alignment, environment variable documentation, and build quality gates.

## Requirements

### Requirement: i18next initialization module
The system SHALL provide a single `frontend/src/i18n/index.ts` module that initializes i18next with the `react-i18next` plugin, loads `en.json` and `es.json` as static imports, sets the active locale to `process.env.REACT_APP_DEFAULT_LOCALE ?? 'en'`, and configures `fallbackLng: 'en'` and `returnNull: false`.

#### Scenario: Default locale is English when env var is absent
- **WHEN** `REACT_APP_DEFAULT_LOCALE` is not set
- **THEN** i18next initializes with `lng: 'en'` and renders English strings

#### Scenario: Locale overridden via env var
- **WHEN** `REACT_APP_DEFAULT_LOCALE=es` is set before `npm start`
- **THEN** i18next initializes with `lng: 'es'` and renders Spanish strings

#### Scenario: Missing key falls back to English
- **WHEN** a key exists in `en.json` but is absent from `es.json` and the active locale is `es`
- **THEN** i18next returns the English value without throwing an error or rendering undefined

### Requirement: English and Spanish locale bundles with key parity
The system SHALL provide `frontend/src/i18n/locales/en.json` and `frontend/src/i18n/locales/es.json` containing identical key sets. Every user-visible string in any component under `frontend/src/components/**` SHALL be represented by a key in both files. No value SHALL be an empty string, null, or contain placeholder text (e.g. "TODO").

#### Scenario: Key sets are identical
- **WHEN** a parity unit test loads both JSON bundles
- **THEN** `Object.keys(en)` deep-equals `Object.keys(es)` (recursively)

#### Scenario: No empty or placeholder values
- **WHEN** the parity test inspects all leaf values in both bundles
- **THEN** no value is an empty string, null, or contains the substring "TODO"

#### Scenario: English bundle covers all visible component text
- **WHEN** `grep -r "useTranslation" frontend/src/components` is run after migration
- **THEN** every component that renders text imports `useTranslation` and calls `t()`

### Requirement: Component migration to useTranslation
Every component under `frontend/src/components/**` that renders user-visible text SHALL replace hardcoded string literals with `useTranslation()` hook calls using the form `const { t } = useTranslation()` and `t('feature.subSection.element')` key syntax.

Affected components: `RecruiterDashboard.js`, `AddCandidateForm.js`, `Positions.tsx`, `PositionDetails.js`, `EditPositionForm.js`, `CandidateDetails.js`, `FileUploader.js`, `CandidateCard.js`, `StageColumn.js`.

#### Scenario: Recruiter Dashboard renders in English by default
- **WHEN** the app loads with no locale override
- **THEN** the dashboard heading resolves to the English value of `dashboard.title`

#### Scenario: Recruiter Dashboard renders in Spanish when locale is es
- **WHEN** the app loads with `REACT_APP_DEFAULT_LOCALE=es`
- **THEN** the dashboard heading resolves to the Spanish value of `dashboard.title`

#### Scenario: aria-label values are translated
- **WHEN** a component renders an element with an `aria-label` visible to screen readers
- **THEN** the label is resolved through `t()` and not a hardcoded string

#### Scenario: CandidateCard rating aria-label uses translation key
- **WHEN** `CandidateCard.js` renders the rating emoji spans
- **THEN** each span's `aria-label` resolves to `t('common.ratingLabel')` (key `common.ratingLabel` present in both `en.json` and `es.json`)

#### Scenario: console.error / console.log strings are not translated
- **WHEN** a component logs to the browser console
- **THEN** the log message remains a hardcoded English string literal (not passed through `t()`)

#### Scenario: StageColumn inline comments are in English
- **WHEN** a developer reads `StageColumn.js`
- **THEN** all inline comments are written in English (no Spanish comment text remains)

### Requirement: Position.status normalized to canonical English vocabulary
The `Position.status` union type in the frontend SHALL be `'Draft' | 'Open' | 'Closed' | 'Hired'`. The same four values SHALL be the only entries in any frontend `validStatuses` array (e.g. in `EditPositionForm.js`). Any legacy Spanish values received from the API (`'Contratado'`, `'Cerrado'`, `'Borrador'`) SHALL be mapped at the service-layer boundary in `frontend/src/services/positionService.js` to `'Hired'`, `'Closed'`, and `'Draft'` respectively before reaching React state. The frontend SHALL never send Spanish status values to the API. Display labels SHALL be resolved via `t('status.<code>')` (`status.draft`, `status.open`, `status.closed`, `status.hired`) in components.

#### Scenario: Status dropdown renders localized labels
- **WHEN** the Positions or EditPositionForm component renders a status filter or selector
- **THEN** the displayed label is resolved through `t('status.draft')`, `t('status.open')`, `t('status.closed')`, or `t('status.hired')` — not from a hardcoded string

#### Scenario: Legacy Spanish status from API is normalized at service boundary
- **WHEN** the API returns a position with `status: 'Contratado'`
- **THEN** `positionService.js` maps it to `'Hired'` before the component receives it

#### Scenario: Legacy Spanish 'Cerrado' from API is normalized
- **WHEN** the API returns a position with `status: 'Cerrado'`
- **THEN** `positionService.js` maps it to `'Closed'` before the component receives it

#### Scenario: Legacy Spanish 'Borrador' from API is normalized
- **WHEN** the API returns a position with `status: 'Borrador'`
- **THEN** `positionService.js` maps it to `'Draft'` before the component receives it

#### Scenario: TypeScript rejects unknown status codes
- **WHEN** a component assigns an unlisted value (e.g. `'Cerrado'` or `'Filled'`) to `Position.status`
- **THEN** the TypeScript compiler emits an error

#### Scenario: Outgoing PUT request always uses canonical English status
- **WHEN** the user submits the EditPositionForm
- **THEN** the request body sent to `PUT /positions/:id` contains `status` as one of `'Draft'`, `'Open'`, `'Closed'`, `'Hired'`, never a Spanish value

### Requirement: Backend position-update validator accepts the canonical English vocabulary
The backend `POSITION_STATUS_VALUES` constant in `backend/src/application/validator.ts` SHALL be set to `['Draft', 'Open', 'Closed', 'Hired']`. `validatePositionUpdateData` SHALL accept those four values and reject any other value (including Spanish values such as `'Contratado'`, `'Cerrado'`, and `'Borrador'`). Existing validator unit tests in `backend/src/application/__tests__/validator.test.ts` SHALL be updated so the canonical vocabulary is asserted as accepted and the Spanish values are asserted as rejected.

#### Scenario: PUT with status 'Draft' is accepted
- **WHEN** `validatePositionUpdateData({ status: 'Draft' })` is invoked
- **THEN** it does not throw

#### Scenario: PUT with status 'Open' is accepted
- **WHEN** `validatePositionUpdateData({ status: 'Open' })` is invoked
- **THEN** it does not throw

#### Scenario: PUT with status 'Closed' is accepted
- **WHEN** `validatePositionUpdateData({ status: 'Closed' })` is invoked
- **THEN** it does not throw

#### Scenario: PUT with status 'Hired' is accepted
- **WHEN** `validatePositionUpdateData({ status: 'Hired' })` is invoked
- **THEN** it does not throw

#### Scenario: PUT with legacy Spanish status 'Contratado' is rejected
- **WHEN** `validatePositionUpdateData({ status: 'Contratado' })` is invoked
- **THEN** it throws an error referencing the invalid status value

#### Scenario: PUT with legacy Spanish status 'Cerrado' is rejected
- **WHEN** `validatePositionUpdateData({ status: 'Cerrado' })` is invoked
- **THEN** it throws an error referencing the invalid status value

#### Scenario: PUT with legacy Spanish status 'Borrador' is rejected
- **WHEN** `validatePositionUpdateData({ status: 'Borrador' })` is invoked
- **THEN** it throws an error referencing the invalid status value

#### Scenario: Manual end-to-end update of a Draft position succeeds
- **WHEN** the operator issues `PUT /positions/:id` with `{ "status": "Draft" }` against an existing Draft record
- **THEN** the API responds with 2xx and persists the unchanged status (regression coverage for the previously broken validator)

#### Scenario: Validator test suite reflects the canonical vocabulary
- **WHEN** `npm test` is run in `backend/`
- **THEN** `validator.test.ts` contains passing tests for `'Draft'`, `'Open'`, `'Closed'`, `'Hired'` accepted, and `'Contratado'`, `'Cerrado'`, `'Borrador'` rejected; no remaining test asserts that a Spanish status is accepted

### Requirement: REACT_APP_DEFAULT_LOCALE documented
The `REACT_APP_DEFAULT_LOCALE` environment variable SHALL be documented in `frontend/README.md` with its accepted values (`en`, `es`), default behavior, and the location of locale files. `docs/frontend-standards.md` SHALL include a short "Internationalization" subsection pointing to `frontend/src/i18n/`.

#### Scenario: README documents locale variable
- **WHEN** a developer reads `frontend/README.md`
- **THEN** they find `REACT_APP_DEFAULT_LOCALE` listed with its accepted values and default

#### Scenario: Frontend standards reference i18n directory
- **WHEN** a developer reads `docs/frontend-standards.md`
- **THEN** they find an "Internationalization" section explaining the key naming convention and file structure

### Requirement: Build remains clean and Cypress suite passes
After migration, `npm run build` SHALL complete with no new TypeScript errors and no new ESLint warnings. All existing Cypress E2E tests SHALL pass; any selector that previously matched Spanish text SHALL be updated to use `data-testid` or English copy.

#### Scenario: TypeScript compilation is clean
- **WHEN** `npm run build` is executed after all component migrations
- **THEN** the build exits with code 0 and no new type errors

#### Scenario: Cypress selectors updated for English default
- **WHEN** the Cypress suite runs with no locale override
- **THEN** all tests pass and no test asserts on a Spanish string that is now translated to English
