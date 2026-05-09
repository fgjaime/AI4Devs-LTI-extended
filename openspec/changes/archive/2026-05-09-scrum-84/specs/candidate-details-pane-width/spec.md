## ADDED Requirements

### Requirement: Candidate details pane uses responsive width rules
The system SHALL render the candidate details offcanvas with responsive, viewport-safe widths so candidate content remains readable on mobile, tablet, desktop, and wide desktop displays.

#### Scenario: Mobile viewport keeps full-width pane
- **WHEN** a recruiter opens candidate details on a viewport narrower than 576px
- **THEN** the offcanvas width is 100vw
- **AND** no horizontal overflow appears

#### Scenario: Tablet and desktop widths expand readability
- **WHEN** a recruiter opens candidate details on viewports at or above 576px
- **THEN** the offcanvas width follows configured breakpoint rules using `min()` and `clamp()`
- **AND** the width never exceeds viewport width

### Requirement: Candidate details pane behavior remains unchanged
The system SHALL preserve existing React Bootstrap offcanvas behavior while applying new width rules.

#### Scenario: Close interactions continue to work
- **WHEN** the pane is open and the recruiter clicks close, clicks backdrop, or presses Escape
- **THEN** the pane closes and focus returns to the trigger per existing offcanvas behavior

#### Scenario: Internal content remains usable in wider pane
- **WHEN** the pane renders candidate sections, interviews rows, and interview forms
- **THEN** content reflows without truncation, overlapping action icons, or broken alignment
- **AND** nested edit/delete interview modals continue rendering above the pane
