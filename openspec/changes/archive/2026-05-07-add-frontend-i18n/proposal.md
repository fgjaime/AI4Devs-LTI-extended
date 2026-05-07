## Why

The React frontend currently mixes Spanish and English literals across components, error messages, and even type union values (e.g. `'Contratado' | 'Cerrado'`), violating the project's English-only code standard and producing an inconsistent UX. Centralizing all user-facing copy into locale JSON bundles is the prerequisite for consistent presentation and any future localization work.

## What Changes

- Add `i18next` and `react-i18next` as runtime dependencies in `frontend/package.json`.
- Create `frontend/src/i18n/index.ts` to initialize i18next with English as the default and fallback locale, configurable via `REACT_APP_DEFAULT_LOCALE`.
- Create `frontend/src/i18n/locales/en.json` and `es.json` with a complete, 1:1-parity key set covering every user-visible string.
- Replace all hardcoded UI literals in `frontend/src/components/**` with `t('key')` calls via the `useTranslation()` hook.
- **BREAKING (internal)**: Normalize `Position.status` to English-only canonical codes (`'Draft' | 'Open' | 'Closed' | 'Hired'`) — aligning the frontend union type, the backend validator's `POSITION_STATUS_VALUES`, and the value the service layer sends to the API. Localized display labels resolve via `t('status.*')`.
- Align the backend validator (`backend/src/application/validator.ts` → `POSITION_STATUS_VALUES`) which currently mixes English and Spanish (`['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador']`) and rejects valid persisted English values such as `'Closed'` and `'Hired'`. Update the corresponding validator unit tests to assert the canonical vocabulary.
- Add a unit test (`frontend/src/i18n/__tests__/locales.test.ts`) asserting key parity, no empty values, and no placeholder text between `en.json` and `es.json`.
- Update `frontend/README.md` and `docs/frontend-standards.md` to document the i18n setup and `REACT_APP_DEFAULT_LOCALE`.

## Capabilities

### New Capabilities
- `frontend-i18n`: i18next initialization, locale resource bundles (`en`/`es`), component migration to `t()` calls, and `Position.status` enum normalization to English-only codes.

### Modified Capabilities
<!-- No existing specs are changing requirements. -->

## Impact

- **Frontend files modified**: all components under `frontend/src/components/**` (RecruiterDashboard.js, AddCandidateForm.js, Positions.tsx, PositionDetails.js, EditPositionForm.js, CandidateDetails.js, FileUploader.js, CandidateCard.js, StageColumn.js), `frontend/src/index.tsx`, `frontend/src/services/positionService.js` (legacy-value normalization).
- **Backend files modified**: `backend/src/application/validator.ts` (`POSITION_STATUS_VALUES`) and `backend/src/application/__tests__/validator.test.ts` (test cases for the canonical English vocabulary). No changes to controllers, services, the domain model, the Prisma schema, or migrations — the persisted status format is already English.
- **New files**: `frontend/src/i18n/index.ts`, `frontend/src/i18n/locales/en.json`, `frontend/src/i18n/locales/es.json`, `frontend/src/i18n/__tests__/locales.test.ts`.
- **Dependencies added**: `i18next`, `react-i18next` (runtime).
- **Docs updated**: `frontend/README.md`, `docs/frontend-standards.md`.
- **API contract**: The set of accepted `status` values for `PUT /positions/:id` becomes `['Draft', 'Open', 'Closed', 'Hired']`. This is the canonical vocabulary already used by the database default and the domain model, so no data migration is required; the change strictly *unblocks* updates that currently fail because the validator rejects `'Closed'`/`'Hired'`.
- **Cypress E2E tests** that assert on Spanish text must be updated to use `data-testid` or English copy.
