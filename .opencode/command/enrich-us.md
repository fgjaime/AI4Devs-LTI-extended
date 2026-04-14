---
description: Enrich Jira user story with technical detail
---

Please analyze and enrich the Jira ticket: `$ARGUMENTS`.

Steps:

1. Use Jira MCP to locate and read the ticket (ID, keywords, or status-based reference).
2. Evaluate whether the story is complete for autonomous implementation.
3. If not complete, produce an enhanced user story with:
   - clear functionality
   - fields affected
   - endpoint URLs and structures
   - files to modify by architecture
   - implementation completion criteria
   - test and documentation requirements
   - non-functional requirements (security, performance)
4. Update Jira description preserving original and enhanced sections (`[original]` and `[enhanced]`).
5. If ticket is in "To refine", move it to "Pending refinement validation".

Use project context from `ai-specs/specs/`.
