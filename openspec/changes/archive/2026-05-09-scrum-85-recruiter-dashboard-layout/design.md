# Design — SCRUM-85: Recruiter dashboard grouping and restyle

## Context

`RecruiterDashboard.js` renders the app root (`/`): centered logo, `h1`, and two `Col md={6}` cards with links to `/add-candidate` and `/positions`. Internationalization uses `useTranslation` and keys under `dashboard.*`. The stack is React 18, React Router 6, React Bootstrap, Bootstrap 5, and i18next per `docs/frontend-standards.md`.

## Goals / Non-Goals

**Goals:**

- Make **Candidates** and **Positions** workflows visually distinct via section structure (headings, spacing, optional short description under each section).
- Improve visual hierarchy (card styling, typography scale, optional icons) while staying on Bootstrap / React Bootstrap.
- Keep routes and link targets unchanged; no new network calls.
- Meet basic accessibility: logical heading order, descriptive link text, sufficient contrast.

**Non-Goals:**

- Dashboard metrics, charts, or new APIs.
- Candidate listing or search from the home page.
- Auth or role-based visibility.
- Replacing Bootstrap with another CSS framework.

## Decisions

1. **Section structure**  
   Use a **page-level `h1`** (existing title), then **two regions** each introduced by an **`h2`** (or `h2` + optional `p` lead) wrapping the action card(s) for that workflow. This satisfies grouping and keeps a sensible heading outline.

   *Alternative considered:* Tabs for Candidates vs Positions — rejected because it hides one workflow and adds interaction cost for a simple two-action screen.

2. **Layout**  
   Prefer `Container` → `Stack` or `Row`/`Col` with **vertical stacking on `xs`**, **two-column layout from `md` upward** so each section group reads as a column of content. Maintain full-width readable tap targets on mobile.

   *Alternative considered:* Always single column — acceptable if design uses strong section dividers; two-column from `md` matches current behavior and scales well.

3. **Icons**  
   Optional **`react-bootstrap-icons`** (already a project dependency per frontend standards) for section headers (e.g. person icon vs briefcase). Icons are decorative or paired with visible text (`aria-hidden` where redundant).

4. **Styling**  
   Prefer **Bootstrap utility classes** and React Bootstrap props (`className`, `Card`, etc.). Touch `index.css` only for one-off spacing if utilities are insufficient.

5. **i18n**  
   Add nested keys under `dashboard`, e.g. `dashboard.sections.candidates.title`, `dashboard.sections.candidates.description`, mirror in `es.json`. Do not leave empty or TODO strings.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Heading order regressions confuse screen readers | Code review checklist: single `h1`, then section `h2`s; validate in browser a11y tree |
| String drift between `en` and `es` | Run or extend parity tests; mirror keys when adding strings |
| Over-styled cards hurt consistency | Reuse patterns from `Positions.tsx` / other list pages where possible |

## Migration Plan

Not applicable: static UI change, deploy with normal frontend release. Rollback = revert component and locale commits.

## Open Questions

- None for MVP; product may later request dashboard widgets or additional quick actions.
