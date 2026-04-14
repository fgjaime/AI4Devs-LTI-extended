---
description: Analyze and implement backend Jira ticket
---

Please analyze and implement the Jira ticket: `$ARGUMENTS`.

Follow these steps:

1. Understand the problem from the ticket.
2. Search the codebase for relevant backend files.
3. Create/switch to a branch using the ticket ID (`feature/[ticket-id]-backend`).
4. Implement changes in small steps, following TDD and backend standards.
5. Run tests, linting, and type checking.
6. Stage only files related to the ticket and create a descriptive commit message.
7. Push and create a PR linked to the ticket.

Use these references while implementing:

- `ai-specs/specs/base-standards.mdc`
- `ai-specs/specs/backend-standards.mdc`
- `ai-specs/specs/documentation-standards.mdc`
- `openspec/config.yaml` (mandatory workflow requirements)

Use GitHub CLI (`gh`) for all GitHub operations.
