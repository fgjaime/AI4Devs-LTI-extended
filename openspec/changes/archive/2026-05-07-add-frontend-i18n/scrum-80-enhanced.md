## [enhanced]

### Summary

Externalize all user-facing UI text from the React frontend (`frontend/src/**`) into locale JSON files, eliminating the current ES/EN mix. Introduce a lightweight i18n layer based on `react-i18next` so any string rendered to the user is resolved through translation keys. Provide complete `en.json` and `es.json` resource bundles, with **English (`en`) as the default and fallback language**, configurable via an environment variable.

This is a non-functional refactor: visual layout, navigation, behavior and API contracts must remain unchanged. Only the source of strings changes.

### Background and motivation

The current UI mixes Spanish and English across components, error messages, alerts and even type union literals (e.g. `status: 'Open' | 'Contratado' | 'Cerrado' | 'Borrador'` in `frontend/src/components/Positions.tsx`). This violates `docs/base-standards.md` §2 "English Only" for code artifacts, blocks future localization, and produces an inconsistent UX. Centralizing copy in JSON resource files is the prerequisite for any future locale work and aligns hardcoded literals with the project's English-only code rule.

### Scope

**In scope**
- Extract every visible UI literal (titles, labels, buttons, placeholders, alerts, success/error messages, badges, modal titles, tooltips, `aria-label` values intended for users) from all components under `frontend/src/components/**`.
- Create resource files `en.json` and `es.json` containing the full set of keys.
- Configure `react-i18next` with English as default and fallback locale.
- Replace string literals in components with `t('key')` calls.
- Normalize the `Position.status` union type literals to English-only enum values; keep the localized labels in `en.json`/`es.json`.

**Out of scope**
- Adding a runtime language switcher in the UI (the locale will be controlled by an env variable / `i18next` default for this ticket).
- Backend message translation (server responses such as `{ message: '...' }` from the API are out of scope; only the frontend's display logic is affected).
- Plural rules, RTL support, date/number formatting beyond what already exists.
- Storybook or visual-regression tests beyond the existing test stack.

### Technical approach

**Library**
- Add `i18next` and `react-i18next` as runtime dependencies.
  ```bash
  cd frontend
  npm install i18next react-i18next
  ```
- No detector plugin is added in this ticket — locale is fixed via configuration.

**Configuration parameter**
- Default language: `en` (English).
- Read from `process.env.REACT_APP_DEFAULT_LOCALE`, falling back to `'en'` when the variable is not defined.
- Document the variable in `frontend/README.md` and `.env.example` (create the latter if missing).

**File layout**
```
frontend/src/
├── i18n/
│   ├── index.ts             # i18next initialization
│   ├── locales/
│   │   ├── en.json          # English resource bundle (default + fallback)
│   │   └── es.json          # Spanish resource bundle (parity with en.json)
│   └── types.ts             # Optional: typed key map for autocomplete
```

**Initialization (sketch)**

```ts
// frontend/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const DEFAULT_LOCALE = process.env.REACT_APP_DEFAULT_LOCALE ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
```

- Import `./i18n` once in `frontend/src/index.tsx` before `<App />` renders.

**Key naming convention**
- Namespace by feature/component using dot notation: `feature.subSection.element`.
- Example top-level groups: `common`, `dashboard`, `candidates`, `positions`, `interviews`, `fileUploader`, `validation`, `errors`, `status`.
- Keys must be in English, lowercase, dot-separated, descriptive of role rather than literal copy. Example:
  - `dashboard.title` → "Recruiter Dashboard" / "Dashboard del Reclutador"
  - `candidates.form.firstName` → "First name" / "Nombre"
  - `errors.invalidData` → "Invalid data: {{message}}" / "Datos inválidos: {{message}}"
  - `status.open` → "Open" / "Abierto"

**Files to update (non-exhaustive — every visible string must be converted)**

| File | Examples of strings to extract |
|---|---|
| `frontend/src/components/RecruiterDashboard.js` | "Dashboard del Reclutador", "Añadir Candidato", "Añadir Nuevo Candidato", "Ver Posiciones", "Ir a Posiciones", `alt="LTI Logo"` |
| `frontend/src/components/AddCandidateForm.js` | "Agregar Candidato", "Nombre", "Apellido", "Correo Electrónico", "Teléfono", "Dirección", "CV", "Añadir Educación", "Institución", "Título", "Fecha de Inicio", "Fecha de Fin", "Eliminar", "Añadir Experiencia Laboral", "Empresa", "Puesto", "Enviar", "Candidato añadido con éxito", "Datos inválidos: ...", "Error interno del servidor", "Error al enviar datos del candidato", "Error al añadir candidato: ..." |
| `frontend/src/components/Positions.tsx` | "Volver al Dashboard", "Posiciones", "Buscar por título", "Buscar por fecha", "Estado", "Abierto", "Contratado", "Cerrado", "Borrador", "Manager", "Deadline", "Editar", "Ver proceso", `aria-label="Buscar posiciones por título"` |
| `frontend/src/components/PositionDetails.js` | "Volver a Posiciones" |
| `frontend/src/components/EditPositionForm.js` | "Loading position data...", "Edit Position", all `Form.Label` strings, status `<option>` labels, validation messages ("Title is required", "Title must not exceed 100 characters", "Invalid status value", "Salary minimum must be a number >= 0", etc.), "Error loading position data. Please try again." |
| `frontend/src/components/CandidateDetails.js` | "Candidate details", "Loading...", "Email:", "Phone:", "Address:", "Education", "No education listed", "Work experience", "No work experience listed", "Resumes", "No resumes", "Applications", "Position:", "Application date:", "Interviews", "Step:", "Score:", "Notes:", "No interviews yet", "No applications", "Create new interview", "Application", "Select an application", "Interview date and time", "Interview step", "Select a step", "Employee", "Select an employee", "Result", "Score (0-5, optional)", `Notes (max ${NOTES_MAX_LENGTH} characters)`, "Edit Interview", "Delete interview", "Deletion reason", "e.g. Interview cancelled by candidate", etc. |
| `frontend/src/components/FileUploader.js` | "Subir Archivo", "Selected file:", "Archivo subido con éxito", "Error al subir archivo" (only the user-visible one; keep `console.error` in English per `docs/frontend-standards.md`) |
| `frontend/src/components/CandidateCard.js`, `StageColumn.js` | Any visible labels (`stage.title` is data, not copy — leave it). |
| `frontend/src/index.tsx` | Import `./i18n` to initialize the library before render. |

**Status enum cleanup**
- In `frontend/src/components/Positions.tsx` and `frontend/src/components/EditPositionForm.js`, the `Position.status` union currently mixes English and Spanish (`'Open' | 'Contratado' | 'Cerrado' | 'Borrador'` and `validStatuses = ['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador']`). Normalize the union to English-only stable codes (`'Draft' | 'Open' | 'Filled' | 'Closed'`) and resolve the visible label through `t('status.open')`, `t('status.filled')`, etc. The mapping from any legacy backend value (e.g. `'Contratado'`) to the new code, if needed, must be done in the service layer (`frontend/src/services/positionService.js`) and documented in the PR.

**Console / error logs**
- `console.error`, `console.warn`, `console.log` strings remain English literals (per `docs/frontend-standards.md`). The i18n layer applies only to user-facing UI.

**Non-functional requirements**

- **Performance**: bundle size growth must be < 50 KB gzipped after the dependency is added; both locale JSONs are statically imported (no async chunk requirement for this ticket).
- **Type safety**: `frontend/src/i18n/index.ts` and resource imports compile under `tsconfig.json` `strict` mode without errors. Provide a typed key helper or rely on `react-i18next`'s built-in typings — no `any` introduced.
- **Accessibility**: all `aria-label` values that are user-visible must also go through `t()`; ensure no key resolves to `undefined` (configure `returnNull: false`, missing-key guard).
- **Security**: `interpolation.escapeValue: false` is acceptable because React already escapes output; do not introduce `dangerouslySetInnerHTML` to render translations.
- **Resilience**: missing key in active locale must fall back to English without crashing; verify by temporarily renaming a key in `es.json` during local QA.

### Acceptance criteria

- [ ] `i18next` and `react-i18next` are listed in `frontend/package.json` dependencies and `package-lock.json` is updated in the same commit.
- [ ] `frontend/src/i18n/index.ts` exists, is imported once from `frontend/src/index.tsx`, initializes with `lng = process.env.REACT_APP_DEFAULT_LOCALE ?? 'en'` and `fallbackLng = 'en'`.
- [ ] `frontend/src/i18n/locales/en.json` and `frontend/src/i18n/locales/es.json` exist with **identical key sets** (1:1 parity, verified by a unit test or build script).
- [ ] No user-facing literal string remains in any component under `frontend/src/components/**` (verified by `grep`-style smoke check listed in the test plan).
- [ ] `RecruiterDashboard.js`, `AddCandidateForm.js`, `Positions.tsx`, `PositionDetails.js`, `EditPositionForm.js`, `CandidateDetails.js`, `FileUploader.js`, `CandidateCard.js`, `StageColumn.js` use `useTranslation()` for every visible string.
- [ ] `Position.status` type union and all related comparisons / option values use English-only stable codes; localized labels come from `t('status.*')`.
- [ ] App boots with default locale `en` and renders the Recruiter Dashboard fully in English; setting `REACT_APP_DEFAULT_LOCALE=es` in `.env` and restarting renders the same screen fully in Spanish.
- [ ] `npm run build` succeeds with no new TypeScript errors and no new ESLint warnings introduced by this change.
- [ ] Existing Cypress E2E tests under `frontend/cypress/e2e/**` still pass; selectors that relied on Spanish text are updated either to use `data-testid` (preferred per `docs/frontend-standards.md`) or to the new English default copy.
- [ ] `frontend/README.md` documents the `REACT_APP_DEFAULT_LOCALE` variable and the `frontend/src/i18n/` structure.
- [ ] No new strings are added in `console.*` calls; existing console messages remain English.

### Test plan

**Unit / parity tests (Jest)**
- Add `frontend/src/i18n/__tests__/locales.test.ts` that:
  - Loads both JSON bundles and asserts `Object.keys` deep equality (key parity between `en` and `es`).
  - Asserts no value is empty string or `null`.
  - Asserts no value still contains "TODO" / placeholder text.
- Add a test that renders one component (e.g. `RecruiterDashboard`) wrapped in `I18nextProvider` for both locales and asserts the expected string appears.

**E2E (Cypress)**
- Update or add `frontend/cypress/e2e/i18n.cy.ts` that:
  - Visits `/`, `/positions`, `/add-candidate` with the default locale and asserts the English heading is present.
  - Re-runs the recruiter dashboard happy path (already covered) without regressions.
- For tests asserting on text, prefer `cy.findByTestId` or assert against the resolved English copy from `en.json`.

**Manual smoke**
- Run `npm start` with no `.env` overrides → UI renders in English.
- Set `REACT_APP_DEFAULT_LOCALE=es`, restart → UI renders in Spanish, identical layout.
- Trigger an "add candidate" success and a deliberate validation error in both locales and confirm Alert messages render translated copy.

### Definition of Done

1. All acceptance criteria met.
2. Unit tests for locale parity green; existing Cypress suite green.
3. `npm run build` clean.
4. PR description references this ticket, lists added i18n keys count, and includes screenshots of dashboard + positions + add-candidate in both locales.
5. `frontend/README.md` updated; `docs/frontend-standards.md` gets a short "Internationalization" subsection pointing to `frontend/src/i18n/` (per `docs/documentation-standards.md`).
6. No Spanish literals remain outside `es.json` and any business-data fields that legitimately come from the backend.
