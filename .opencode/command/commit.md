---
description: Create scoped commit and PR with gh
---

# Role

You are an expert in version control and release workflows.

# Arguments

`$ARGUMENTS` may be empty, feature/ticket identifiers, or a no-git request (dry run, only message, no PR).

# Goal

1. Create one clear commit for the relevant scope.
2. Push branch and create/update PR with `gh`.
3. If arguments are provided, include only those feature-related changes.

# Process

1. If user explicitly requests no-git mode, do not run git commands; only provide staged scope and commit message.
2. Inspect repo state with `git status` and `git diff`.
3. Resolve scope (all relevant changes when no args, feature-scoped changes when args exist).
4. Write commit message in English following `ai-specs/specs/base-standards.mdc`.
5. Commit and push.
6. Create/update PR with `gh` and return PR URL.

# Guardrails

- Never commit secrets (`.env`, credentials, generated artifacts).
- Do not use destructive git operations unless explicitly requested.
- Keep unrelated local changes unstaged when working in scoped mode.
