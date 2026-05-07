## Context

The React frontend (`frontend/src/components/**`) currently renders user-facing text as hardcoded string literals—most in Spanish, some in English. There is no i18n layer. This violates the project's English-only code standard and prevents consistent localization. The change introduces `react-i18next` as a thin translation layer without altering visual layout, routing, or API contracts.

Current constraints:
- Frontend is a Create React App project (`REACT_APP_*` env vars, `tsconfig.json` with `strict: true`).
- Existing Cypress E2E tests assert on Spanish text; those selectors must be updated.
- `Position.status` is inconsistent across the stack:
  - Prisma schema (`backend/prisma/schema.prisma:110`) defaults to `'Draft'` (English).
  - Domain model (`backend/src/domain/models/Position.ts:31`) defaults to `'Draft'` (English).
  - Backend validator (`backend/src/application/validator.ts:150`) accepts `['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador']` (mixed). The validator currently rejects any update carrying `'Closed'` or `'Hired'` even though those are the canonical English equivalents already used elsewhere.
  - Frontend (`Positions.tsx`) uses the union `'Open' | 'Contratado' | 'Cerrado' | 'Borrador'` (mixed), and `EditPositionForm.js` declares `validStatuses = ['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador']`.

## Goals / Non-Goals

**Goals:**
- Extract every user-facing literal in `frontend/src/components/**` into `en.json` and `es.json`.
- Configure i18next with English as default locale; fallback to English on missing keys.
- Allow locale to be set at build time via `REACT_APP_DEFAULT_LOCALE`.
- Normalize `Position.status` to a single canonical English vocabulary across frontend type, frontend `validStatuses`, frontend service mapping, and backend validator.
- Unblock the `PUT /positions/:id` endpoint for records whose status is already `'Closed'` or `'Hired'` (currently rejected by `validatePositionUpdateData`).
- Add a parity unit test asserting `en.json` and `es.json` have identical key sets.

**Non-Goals:**
- Runtime language switcher in the UI.
- Backend/API response translation.
- Plural rules, RTL support, date/number formatting.
- Async (lazy-loaded) locale chunks.
- Storybook or visual regression tests.

## Decisions

### D1: Library — `i18next` + `react-i18next`
**Chosen**: `i18next` with the `react-i18next` bindings.
**Rationale**: De-facto standard for React i18n; first-class TypeScript typings; `useTranslation()` hook integrates cleanly with functional components; no additional detector plugin needed for this ticket.
**Alternatives considered**: `react-intl` (heavier, ICU-message-format overhead not needed); `linguiJS` (excellent but less common in existing CRA projects).

### D2: Static JSON imports (no async chunks)
**Chosen**: `en.json` and `es.json` are statically imported in `frontend/src/i18n/index.ts`.
**Rationale**: Both bundles are small; sync initialization avoids a loading state before the first render; simplifies the initialization flow for CRA.
**Trade-off**: Slightly larger initial bundle. Acceptable per the < 50 KB gzipped budget stated in the ticket.

### D3: Locale source — env var only
**Chosen**: `process.env.REACT_APP_DEFAULT_LOCALE ?? 'en'` at initialization; no runtime detection plugin.
**Rationale**: Keeps the implementation minimal; a language picker is explicitly out of scope for this ticket.

### D4: Key naming — dot notation, feature-grouped
**Chosen**: `feature.subSection.element` (e.g., `candidates.form.firstName`, `status.open`).
**Rationale**: Groups keys by domain, making missing-key audits and future additions predictable. Keys are English, role-descriptive, not literal copy.

### D5: `Position.status` canonical vocabulary — `Draft | Open | Closed | Hired`
**Chosen**: Adopt `'Draft' | 'Open' | 'Closed' | 'Hired'` as the canonical English vocabulary across the entire stack. The frontend union type, the frontend `validStatuses` array, the backend validator's `POSITION_STATUS_VALUES`, and any new database default all use this set. Display labels resolve via `t('status.draft' | 'status.open' | 'status.closed' | 'status.hired')`.
**Rationale**: Picks the values already used by the Prisma schema default and the domain model (`Draft`), and the natural English equivalents of the Spanish labels (`Hired ↔ Contratado`, `Closed ↔ Cerrado`). The earlier ticket draft proposed `'Filled'` but the existing domain vocabulary uses `'Hired'`, so we align with reality rather than introducing a third term.
**Alternatives considered**:
- Keep the Spanish values as the canonical set and translate only the display label. Rejected: violates the project's English-only code rule and leaves mixed-language status comparisons in TypeScript.
- Introduce a discriminated `enum` instead of a string union. Rejected: increases blast radius beyond i18n scope; current persistence layer uses `String`.

### D6: Legacy Spanish values mapped at the frontend service boundary
**Chosen**: `frontend/src/services/positionService.js` maps any incoming `'Contratado' → 'Hired'`, `'Cerrado' → 'Closed'`, `'Borrador' → 'Draft'` before the value reaches React state. Outgoing values (PUT body) are always canonical English.
**Rationale**: Single point of normalization keeps components free of legacy logic; the mapping can be removed in a future ticket once we confirm no Spanish values remain in the database.

### D7: Backend validator alignment — replace mixed set with canonical English (no aliases)
**Chosen**: Rewrite `POSITION_STATUS_VALUES` in `backend/src/application/validator.ts` to `['Draft', 'Open', 'Closed', 'Hired']`. Do **not** retain the Spanish aliases.
**Rationale**:
- The validator's current set is incoherent — it accepts `'Draft'` (English) and `'Borrador'` (Spanish) for the same logical state. Keeping both is permanent technical debt.
- The frontend, after this change, never sends Spanish values, so accepting them serves no client.
- Persisted data already uses the English vocabulary; nothing in the database requires Spanish acceptance.
**Alternative considered**: Accept both English and Spanish during a transition window, then drop Spanish later. Rejected: there is no real client sending Spanish today (this PR removes the only one), so a transition window adds noise without buying anything.
**Mitigation for any unknown clients**: The validator already throws a descriptive error; if a caller sends a Spanish value, the response will name the offending value, which is enough to diagnose.

### D8: `returnNull: false` + missing-key fallback
**Chosen**: Configure i18next with `returnNull: false` and `fallbackLng: 'en'`.
**Rationale**: Prevents `undefined` from reaching the DOM; ensures a missing key in `es.json` silently falls back to English rather than crashing.

## Risks / Trade-offs

- **Cypress selector breakage** → Mitigation: update tests to use `data-testid` (preferred) or assert on English copy from `en.json`.
- **Position.status mapping drift** → Mitigation: document legacy-to-new mapping in `positionService.js`; add a smoke test assertion on normalized values.
- **Bundle size** → Mitigation: both locale files are compact; verify with `npm run build` output that gzip delta is < 50 KB.
- **`escapeValue: false` + XSS** → Not a risk here: React's JSX escapes output; no `dangerouslySetInnerHTML` is introduced.
- **Backend validator regression — DB rows with Spanish status values** → Risk: if any production row stores `'Contratado'` / `'Cerrado'` / `'Borrador'`, a PUT echoing that value would now be rejected. Mitigation: (a) verify with a one-off DB query that no such rows exist before deploy; (b) if any are found, run a one-off backfill migrating them to the canonical English code (`Contratado→Hired`, `Cerrado→Closed`, `Borrador→Draft`) prior to merging the validator change.
- **Backend validator regression — unknown API clients sending Spanish** → Risk: an external script or test fixture might still POST/PUT Spanish status values. Mitigation: grep `backend/`, `frontend/`, and `cypress/` for the Spanish string literals before merging; the error response identifies the offending value, so any miss is diagnosable in logs.
- **Validator test coverage gap** → Risk: existing tests in `validator.test.ts` explicitly assert that `'Contratado'` and `'Borrador'` are accepted; those tests will become misleading. Mitigation: replace them with tests asserting `'Hired'`, `'Closed'`, and `'Draft'` are accepted, plus a negative test that `'Contratado'` is now rejected.

## Migration Plan

1. Install dependencies (`npm install i18next react-i18next` in `frontend/`).
2. Create `frontend/src/i18n/` module (index.ts + locale JSONs).
3. Import `./i18n` in `frontend/src/index.tsx` before `<App />`.
4. Migrate components one at a time; run `npm run build` after each batch.
5. Normalize the frontend `Position.status` union and `validStatuses`; add the legacy Spanish-to-English mapping in `positionService.js`.
6. **Pre-validator-change DB check**: run a query against the database to confirm zero rows have `status IN ('Contratado', 'Cerrado', 'Borrador')`. If rows exist, backfill before step 7.
7. Update the backend validator: change `POSITION_STATUS_VALUES` to `['Draft', 'Open', 'Closed', 'Hired']`; update `validator.test.ts` to match; run `npm test` in `backend/`.
8. Verify with `REACT_APP_DEFAULT_LOCALE=es npm start` that all UI renders in Spanish.
9. Run full Cypress suite; fix any broken selectors.
10. Manually exercise the PUT `/positions/:id` endpoint with `status: 'Draft'`, `'Open'`, `'Closed'`, `'Hired'` (each must succeed) and `'Contratado'` (must now return 400 with a descriptive error).

**Rollback**: The frontend changes are reverted by restoring `frontend/src/index.tsx`, the components, and `positionService.js`. The backend validator change is reverted by restoring the previous `POSITION_STATUS_VALUES` array and its tests. Both reverts are independent and have no schema/migration footprint.

## Open Questions

- *(Resolved)* `Position.status` canonical vocabulary: confirmed against the codebase (`schema.prisma:110`, `Position.ts:31`) — it is `Draft | Open | Closed | Hired`, not `Filled`.
- Are there any external API consumers (scripts, integrations, fixtures) that still send `'Contratado' / 'Cerrado' / 'Borrador'` in PUT requests? *(To verify with a repo-wide grep and a quick log scan during implementation.)*
