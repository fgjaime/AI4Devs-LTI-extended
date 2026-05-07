## 1. Setup

- [x] 1.1 Create feature branch `feature/scrum-80-frontend-i18n` from `main`. If you are already in a proper branch for the spec, but not properly named, just rename it
- [x] 1.2 Install `i18next` and `react-i18next` in `frontend/`: `npm install i18next react-i18next`
- [x] 1.3 Verify `frontend/package.json` and `package-lock.json` reflect the new dependencies

## 2. i18n Module

- [x] 2.1 Create `frontend/src/i18n/index.ts` with i18next initialization (resources, `lng`, `fallbackLng: 'en'`, `returnNull: false`, `interpolation.escapeValue: false`)
- [x] 2.2 Create `frontend/src/i18n/locales/en.json` with a complete English key set covering all groups: `common`, `dashboard`, `candidates`, `positions`, `interviews`, `fileUploader`, `validation`, `errors`, `status`
- [x] 2.3 Create `frontend/src/i18n/locales/es.json` with 1:1 key parity and Spanish translations for every key in `en.json`
- [x] 2.4 Import `./i18n` once in `frontend/src/index.tsx` before `<App />` renders
- [x] 2.5 Run `npm run build` in `frontend/` and confirm no TypeScript errors from the new module

## 3. Component Migration — RecruiterDashboard & FileUploader

- [x] 3.1 Migrate `RecruiterDashboard.js`: add `useTranslation()`, replace all visible literals (title, button labels, `alt` text) with `t()` calls
- [x] 3.2 Migrate `FileUploader.js`: replace `"Subir Archivo"`, `"Selected file:"`, `"Archivo subido con éxito"`, `"Error al subir archivo"` with `t()` calls; leave `console.error` strings as English literals
- [x] 3.3 Run `npm run build` and confirm no errors after these two components

## 4. Component Migration — Positions & EditPositionForm

- [x] 4.1 Migrate `Positions.tsx`: replace all visible literals (back link, page title, search placeholders, filter labels, column headers, badge labels, button labels, `aria-label` values) with `t()` calls
- [x] 4.2 Migrate `EditPositionForm.js`: replace all `Form.Label` strings, status `<option>` labels, validation error messages, and loading/error state messages with `t()` calls
- [x] 4.3 Run `npm run build` and confirm no TypeScript errors

## 5. Component Migration — AddCandidateForm

- [x] 5.1 Migrate `AddCandidateForm.js`: replace page title, all field labels, placeholders, section titles (`"Añadir Educación"`, `"Añadir Experiencia Laboral"`), button labels, and all alert/success/error messages with `t()` calls
- [x] 5.2 Run `npm run build` and confirm no errors

## 6. Component Migration — CandidateDetails & PositionDetails

- [x] 6.1 Migrate `CandidateDetails.js`: replace all section headings, field labels (`"Email:"`, `"Phone:"`, etc.), empty-state messages, modal titles, form labels, button labels, and interpolated strings (e.g. `Notes (max ${NOTES_MAX_LENGTH} characters)`) with `t()` / `t('key', { count })` calls
- [x] 6.2 Migrate `PositionDetails.js`: replace `"Volver a Posiciones"` and any other visible literals with `t()` calls
- [x] 6.3 Run `npm run build` and confirm no errors

## 7. Component Migration — CandidateCard & StageColumn

- [x] 7.1 Migrate `CandidateCard.js`: replace any visible user-facing labels with `t()` calls (data-driven stage titles are not copy and should remain as-is)
- [x] 7.2 Migrate `StageColumn.js`: replace any visible user-facing labels with `t()` calls
- [x] 7.3 Run `npm run build` and confirm clean build across all migrated components

## 8. Position.status Frontend Normalization

- [x] 8.1 Update the `Position.status` union type in `Positions.tsx` from `'Open' | 'Contratado' | 'Cerrado' | 'Borrador'` to the canonical English vocabulary `'Draft' | 'Open' | 'Closed' | 'Hired'`
- [x] 8.2 Add a legacy-value mapping in `frontend/src/services/positionService.js` that converts incoming API values: `'Contratado' → 'Hired'`, `'Cerrado' → 'Closed'`, `'Borrador' → 'Draft'`. Apply the mapping in the GET response path so components only ever see canonical English values
- [x] 8.3 Update `validStatuses` in `EditPositionForm.js` to `['Draft', 'Open', 'Closed', 'Hired']` and replace all status comparisons / option `value` attributes in `Positions.tsx` and `EditPositionForm.js` with the canonical English codes
- [x] 8.4 Confirm the EditPositionForm submit path sends only canonical English status values to `PUT /positions/:id` (no Spanish-value PUT bodies anywhere in the codebase)
- [x] 8.5 Run `npm run build` and confirm the TypeScript compiler rejects any remaining non-English status literals (e.g. `'Cerrado'`, `'Filled'`)

## 9. Backend Validator Alignment (`POSITION_STATUS_VALUES`)

- [x] 9.1 Run a database check (`SELECT id, status FROM "Position" WHERE status IN ('Contratado', 'Cerrado', 'Borrador');`) to confirm zero rows hold legacy Spanish values. If any rows are returned, backfill them (`Contratado→Hired`, `Cerrado→Closed`, `Borrador→Draft`) before proceeding with task 9.2
- [x] 9.2 In `backend/src/application/validator.ts`, replace `const POSITION_STATUS_VALUES = ['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador'];` with `const POSITION_STATUS_VALUES = ['Draft', 'Open', 'Closed', 'Hired'];`
- [x] 9.3 In `backend/src/application/__tests__/validator.test.ts`, replace the existing tests asserting `'Contratado'` and `'Borrador'` are accepted with tests asserting `'Draft'`, `'Open'`, `'Closed'`, and `'Hired'` are accepted; add negative tests asserting `'Contratado'`, `'Cerrado'`, and `'Borrador'` are now rejected
- [x] 9.4 Search the rest of the backend (`grep -rn "Contratado\|Cerrado\|Borrador" backend/src`) and remove any remaining Spanish status references in non-test code; flag any references in fixtures or seed data for a follow-up
- [x] 9.5 Run `npm test` in `backend/` and confirm all tests pass, including the updated validator tests
- [x] 9.6 Manually exercise `PUT /positions/:id` with `curl` for each canonical value (`Draft`, `Open`, `Closed`, `Hired`) — all must return 2xx; then issue one with `status: 'Contratado'` — must return 400 with the invalid-status error message
- [x] 9.7 After all CRUD curl tests, restore the database to its pre-test state

## 10. Frontend Tests

- [x] 10.1 Create `frontend/src/i18n/__tests__/locales.test.ts` with:
  - Key parity assertion: `Object.keys(en)` deep-equals `Object.keys(es)` (recursive)
  - No empty / null / `"TODO"` values in either bundle
- [x] 10.2 Add a component render test (e.g. `RecruiterDashboard` wrapped in `I18nextProvider`) that asserts the English heading is present with default locale and the Spanish heading with `lng: 'es'`
- [x] 10.3 Add a `positionService` unit test asserting that GET responses with `'Contratado'`/`'Cerrado'`/`'Borrador'` are mapped to `'Hired'`/`'Closed'`/`'Draft'` before reaching the caller
- [x] 10.4 Run `npm test` in `frontend/` and confirm all tests pass with 0 failures

## 11. Cypress E2E Update

- [x] 11.1 Identify all Cypress tests under `frontend/cypress/e2e/**` that assert on Spanish text
- [x] 11.2 Update those selectors to use `data-testid` (preferred) or assert against the English copy from `en.json`
- [x] 11.3 Add or update `frontend/cypress/e2e/i18n.cy.ts`: visit `/`, `/positions`, `/add-candidate` with default locale and assert English headings are present
- [x] 11.4 Run the full Cypress suite and confirm 0 failures

## 14. Fix pre-existing Cypress failures in positions.cy.ts

- [x] 14.1 Replace all `method: 'PUT'` with `method: 'PATCH'` in `frontend/cypress/e2e/positions.cy.ts` — the backend route is `PATCH /positions/:id`, not `PUT`
- [x] 14.2 Align response-body assertions with the actual backend format (the backend returns the updated position object directly, not `{ message, data }`)
- [x] 14.3 Remove or fix assertions that depend on Spanish error message strings from the backend (backend error messages are out of scope for this ticket — assert on HTTP status code only)
- [x] 14.4 Re-run `npx cypress run --spec cypress/e2e/positions.cy.ts` and confirm 0 failures
- [x] 14.5 Re-run the full Cypress suite and confirm all specs pass

## 12. Documentation

- [x] 12.1 Update `frontend/README.md`: document `REACT_APP_DEFAULT_LOCALE` (accepted values: `en`, `es`; default: `en`) and the `frontend/src/i18n/` directory structure
- [x] 12.2 Add an "Internationalization" subsection to `docs/frontend-standards.md` describing the key naming convention (`feature.subSection.element`), file locations, and the rule that all user-visible strings must use `t()`
- [x] 12.3 Create or update `frontend/.env.example` with `REACT_APP_DEFAULT_LOCALE=en`
- [x] 12.4 Update `openspec/specs/api-spec.yml` (or equivalent) so the `PUT /positions/:id` `status` enum lists `['Draft', 'Open', 'Closed', 'Hired']`

## 13. Manual Smoke QA

- [x] 13.1 Start `npm start` with no `.env` overrides → confirm UI renders in English across Dashboard, Positions, and Add Candidate screens
- [x] 13.2 Set `REACT_APP_DEFAULT_LOCALE=es` in `frontend/.env`, restart → confirm UI renders in Spanish with identical layout
- [x] 13.3 Trigger an "add candidate" success and a deliberate validation error in both locales → confirm Alert messages show translated copy
- [x] 13.4 In the UI, edit an existing position whose status is `'Draft'` and save without changing the status → confirm the request succeeds (regression coverage for the previously broken validator)
- [x] 13.5 Run `grep -r "\"[A-ZÁÉÍÓÚÑ]" frontend/src/components` and confirm no Spanish literals remain in component source files
- [x] 13.6 Run `npm run build` one final time in `frontend/` and `npm test` in `backend/` → confirm exit code 0, no new TypeScript errors, no new ESLint warnings, all backend tests passing

## 15. Post-verification fixes (C1, W1)

- [x] 15.1 Add `"ratingLabel"` key to `frontend/src/i18n/locales/en.json` (`"rating"`) and `es.json` (`"puntuación"`) under `common`
- [x] 15.2 Add spec scenarios to `specs/frontend-i18n/spec.md`: CandidateCard rating aria-label and StageColumn English-only comments
- [x] 15.3 Migrate `CandidateCard.js`: convert to function body, add `useTranslation()`, replace `aria-label="rating"` with `t('common.ratingLabel')`
- [x] 15.4 Replace Spanish inline comments in `StageColumn.js` with English equivalents
- [x] 15.5 Run `npm test` in `frontend/` and confirm locale parity and all 14 tests still pass
