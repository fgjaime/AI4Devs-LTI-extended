---
description: Create detailed frontend implementation plan for Jira ticket
---

# Role

You are an expert frontend architect with extensive experience in React projects applying best practices.

# Ticket ID

`$ARGUMENTS`

# Goal

Obtain a step-by-step frontend plan for a Jira ticket that is ready to start implementing.

# Process and rules

1. Adopt the role of `ai-specs/.agents/frontend-developer.md`.
2. Analyze the Jira ticket using MCP. If the mention is a local file, avoid MCP.
3. Propose a step-by-step frontend plan applying project rules from:
   - `ai-specs/specs/base-standards.mdc`
   - `ai-specs/specs/frontend-standards.mdc`
   - `ai-specs/specs/documentation-standards.mdc`
4. Ensure the plan is autonomous end-to-end and do not write code yet.
5. If implementation is requested later, start by switching to a branch named from the ticket ID and follow `/develop-frontend` workflow.

# Output format

Create a markdown document at `openspec/changes/[jira_id]_frontend.md` with complete implementation details.
Use this template:

## Frontend Implementation Plan Ticket Template Structure

### 1. Header

- Title: `# Frontend Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. Overview

- Brief feature description and frontend architecture principles.

### 3. Architecture Context

- Components/services involved
- Files referenced
- Routing considerations
- State management approach

### 4. Implementation Steps

Detailed steps, typically:

#### Step 0: Create Feature Branch

- Action: Create and switch to a new feature branch.
- Branch naming: `feature/[ticket-id]-frontend` (required)
- Implementation steps:
  1. Ensure latest `main` or `develop`.
  2. Pull latest changes.
  3. Create branch.
  4. Verify branch.
- Notes: This must be the first step before any code changes.

#### Step N: Action Name

- File: Target file path
- Action: What to implement
- Function/component signature
- Implementation steps
- Dependencies
- Notes

Common steps:

- Step 1: Update/create service methods (`src/services/`)
- Step 2: Create/update React components (`src/components/`)
- Step 3: Update routing (`src/App.js` or equivalent)
- Step 4: Add/adjust Cypress E2E tests (`cypress/e2e/`)
- Step 5: Update technical documentation (MANDATORY)

#### Step N+1: Update Technical Documentation (MANDATORY)

- Action: Review and update technical docs according to changes made.
- Consider updates for:
  - API endpoint changes: `ai-specs/specs/api-spec.yml`
  - UI/UX patterns: `ai-specs/specs/frontend-standards.mdc`
  - New dependencies/config changes
  - Testing guidance updates
- References:
  - `ai-specs/specs/documentation-standards.mdc`

### 5. Implementation Order

- Numbered list in sequence (starting with Step 0).

### 6. Testing Checklist

- Cypress E2E coverage
- Component behavior verification
- Error handling verification
- Accessibility and responsive checks

### 7. Error Handling Patterns

- Error state management
- User-facing messages
- API error handling in services

### 8. UI/UX Considerations

- Design system/component consistency
- Responsive behavior
- Accessibility requirements
- Loading and feedback states

### 9. Dependencies

- External libraries/tools required

### 10. Notes

- Important constraints and business rules
- English-only requirement
- TypeScript/JavaScript considerations

### 11. Next Steps After Implementation

- Post-implementation items (integration/deployment if applicable)

### 12. Implementation Verification

- Final checklist for code quality, functionality, testing, integration, and docs.

# Critical requirements

- The plan must be precise enough for autonomous implementation.
- Documentation updates are mandatory before completion.
