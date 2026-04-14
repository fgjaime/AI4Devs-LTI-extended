---
description: Create detailed backend implementation plan for Jira ticket
---

# Role

You are an expert software architect with extensive experience in Node/Express projects applying Domain-Driven Design (DDD).

# Ticket ID

`$ARGUMENTS`

# Goal

Obtain a step-by-step backend plan for a Jira ticket that is ready to start implementing.

# Process and rules

1. Adopt the role of `ai-specs/.agents/backend-developer.md`.
2. Analyze the Jira ticket using MCP. If the mention is a local file, avoid MCP.
3. Propose a step-by-step backend plan applying project rules from:
   - `ai-specs/specs/base-standards.mdc`
   - `ai-specs/specs/backend-standards.mdc`
   - `ai-specs/specs/documentation-standards.mdc`
   - `openspec/config.yaml`
4. Ensure the plan is autonomous end-to-end and do not write code yet.
5. If implementation is requested later, start by switching to a branch named from the ticket ID and follow `/develop-backend` workflow.

# Output format

Create a markdown document at `openspec/changes/[jira_id]_backend.md` with complete implementation details.
Use this template:

## Backend Implementation Plan Ticket Template Structure

### 1. Header

- Title: `# Backend Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. Overview

- Brief feature description and architecture principles (DDD, clean architecture)

### 3. Architecture Context

- Layers involved (Domain, Application, Presentation)
- Components/files referenced

### 4. Implementation Steps

Detailed steps, typically:

#### Step 0: Create Feature Branch

- Action: Create and switch to a new feature branch following development workflow.
- Branch naming: `feature/[ticket-id]-backend` (required)
- Implementation steps:
  1. Ensure latest `main` or `develop`.
  2. Pull latest changes.
  3. Create branch.
  4. Verify branch.
- Notes: This must be the first step before any code changes.

#### Step N: Action Name

- File: Target file path
- Action: What to implement
- Function signature
- Implementation steps
- Dependencies
- Implementation notes

Common steps:

- Step 1: Create validation function
- Step 2: Create service method
- Step 3: Create controller method
- Step 4: Add route
- Step 5: Write unit tests (successful cases, validation errors, not found, reference validation, server errors, edge cases)
- Step 6: Review and update existing unit tests (MANDATORY)
- Step 7: Run unit tests and verify database state (MANDATORY)
- Step 8: Manual endpoint testing with curl (MANDATORY)
- Step 9: Update technical documentation (MANDATORY)

#### Step N: Review and Update Existing Unit Tests (MANDATORY)

- Action: Analyze existing tests impacted by the change.
- Implementation steps:
  1. Identify affected tests.
  2. Review current coverage.
  3. Update tests to reflect new behavior.
  4. Document what changed and why.

#### Step N+1: Run Unit Tests and Verify Database State (MANDATORY)

- Action: Execute all related tests and verify database restoration.
- Implementation steps:
  1. Run test suite for modified components.
  2. Verify all tests pass.
  3. Fix failures.
  4. Verify cleanup/teardown restores DB state.
  5. Show full test report.
  6. Re-run to confirm stability.

#### Step N+2: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- Action: Manually validate all relevant endpoints and restore DB state after mutating tests.
- Implementation steps:
  1. Prepare environment.
  2. Test GET endpoints.
  3. Test POST endpoints and cleanup.
  4. Test PUT/PATCH endpoints and rollback.
  5. Test DELETE endpoints and recreate state.
  6. Test error cases.
  7. Document commands, responses, and cleanup.

#### Step N+3: Update Technical Documentation (MANDATORY)

- Action: Update docs for code/API/model/standards changes.
- References:
  - `ai-specs/specs/documentation-standards.mdc`
  - `ai-specs/specs/api-spec.yml`
  - `ai-specs/specs/data-model.md`

### 5. Implementation Order

- Numbered sequence from Step 0 to final documentation updates.

### 6. Testing Checklist

- Mandatory checks:
  - Existing tests reviewed/updated
  - New tests added and passing
  - Full suite passes with 0 failures
  - DB state restored after tests
  - Manual curl tests executed and documented
  - Error cases manually validated

### 7. Error Response Format

- JSON structure and HTTP status mapping

### 8. Dependencies

- Required libraries/tools

### 9. Notes

- Important constraints and business rules

### 10. Next Steps After Implementation

- Post-implementation items (integration/deployment if applicable)

### 11. Implementation Verification

- Final checklist for code quality, functionality, testing, integration, and docs.

# Critical requirements

- The plan must be precise enough for autonomous implementation.
- Backend tasks must follow mandatory rules from `openspec/config.yaml`.
- Manual testing steps must be executed by the agent, not delegated.
