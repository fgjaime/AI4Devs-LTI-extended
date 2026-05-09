## Context

The Position board opens candidate information in a React Bootstrap offcanvas rendered by `CandidateDetails`. The default Bootstrap `.offcanvas-end` width (400px) constrains dense interview data and form controls on tablet and desktop viewports, reducing readability and causing avoidable wrapping.

## Goals / Non-Goals

**Goals:**
- Increase candidate details pane width responsively across breakpoints while keeping mobile full-width.
- Keep all offcanvas interaction behavior unchanged (open/close, focus handling, keyboard dismissal, backdrop behavior).
- Validate behavior with unit/component and E2E coverage.
- Keep implementation isolated to frontend component styling with no dependency additions.

**Non-Goals:**
- No content redesign inside candidate sections.
- No backend, API, or schema changes.
- No theme-level Bootstrap overrides or Sass variable customization.
- No changes to modal copy or i18n strings.

## Decisions

- **Scoped CSS override:** Add `candidate-details-offcanvas` class on the offcanvas root and override width with `.candidate-details-offcanvas.offcanvas-end` so specificity is higher than Bootstrap default.
  - **Alternative considered:** Global Bootstrap override for `.offcanvas-end`; rejected because it affects unrelated panes.
- **Responsive width by media query:** Use explicit breakpoint rules from the story (`100vw`, `min()`, `clamp()`) to guarantee viewport-safe widths.
  - **Alternative considered:** JS-driven dynamic width calculation; rejected for unnecessary runtime complexity.
- **Co-located stylesheet:** Create `CandidateDetails.css` and import directly in component for local ownership and discoverability.
  - **Alternative considered:** App-wide stylesheet; rejected to avoid style leakage.
- **Behavior preservation checks:** Add/extend tests to ensure close interactions and width expectations are covered.
  - **Alternative considered:** manual-only validation; rejected because regression risk is high around responsive behavior.

## Risks / Trade-offs

- **Risk:** Future Bootstrap upgrades alter offcanvas selectors and override precedence. -> **Mitigation:** Keep a scoped selector and add an intent comment in CSS.
- **Risk:** Wider pane could affect nested interview modal visibility on constrained widths. -> **Mitigation:** enforce viewport-safe widths and include E2E/manual checks at mobile and desktop breakpoints.
- **Trade-off:** Additional Cypress assertions increase test runtime slightly. -> **Mitigation:** keep checks focused on key breakpoints only.
