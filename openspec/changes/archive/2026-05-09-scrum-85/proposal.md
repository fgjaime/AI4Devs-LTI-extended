# Proposal — SCRUM-85: Recruiter dashboard layout and grouping

## Why

The recruiter home page (`/`) shows two similar cards without a clear information hierarchy, so candidate and position workflows are easy to confuse. We need an explicit visual grouping and refreshed layout so recruiters orient faster, without changing underlying routes or backend behavior.

## What Changes

- Restructure `RecruiterDashboard` into two clearly labeled **sections** (Candidates vs Positions) with improved typography, spacing, and optional icons (React Bootstrap / `react-bootstrap-icons`).
- Preserve existing navigation: primary action to **add a candidate** → `/add-candidate`; primary action to **open positions** → `/positions`.
- Extend `dashboard.*` i18n keys in `en.json` and `es.json` for any new section titles, subtitles, or accessibility labels; maintain key parity (existing `frontend-i18n` global rules still apply).
- Improve responsive behavior (stacked layout on small screens, readable targets).
- No backend or API contract changes; no new data fetching on the dashboard.

## Capabilities

### New Capabilities

- `recruiter-dashboard-layout`: Defines the recruiter home page structure, visual grouping of candidate vs position actions, navigation preservation, responsive layout, and accessibility expectations for the dashboard.

### Modified Capabilities

- None. Locale parity and `useTranslation` usage remain governed by the existing `frontend-i18n` capability in `openspec/specs/frontend-i18n/spec.md`; this change only adds keys under the existing `dashboard` namespace.

## Impact

| Area | Impact |
|------|--------|
| Frontend | `frontend/src/components/RecruiterDashboard.js`; optional `frontend/src/index.css` |
| i18n | `frontend/src/i18n/locales/en.json`, `es.json` |
| Tests | `frontend/src/i18n/__tests__/i18nIntegration.test.tsx`; optional new RTL tests; optional Cypress e2e |
| Backend | None |
| API / data model docs | None |
