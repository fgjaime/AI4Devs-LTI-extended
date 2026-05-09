# Step 6 Report - Unit Tests and Database Verification

- Date: 2026-05-09
- Change: scrum-81-view-candidates
- Agent: Claude Sonnet 4.6

## Commands Executed
- `npm test -- --testPathPattern="candidateService|candidateController" --forceExit` (targeted)
- `npm test -- --forceExit` (full suite)
- `node -e "prisma.candidate.count(), prisma.application.count(), prisma.position.count()"` (baseline and post-test)

## Unit Test Results
- Targeted tests: 70 passed, 1 failed (pre-existing), 0 skipped
- Full suite: 276 passed, 1 failed (pre-existing), 0 skipped
- Runtime: ~3 seconds
- Notes: The single failing test (`debería retornar 400 cuando ID contiene caracteres no numéricos`) is a pre-existing failure in `backend/src/presentation/controllers/__tests__/candidateController.test.ts`. It tests that `getCandidateById` returns 400 for `'12abc'`, but `parseInt('12abc')` returns `12` (not NaN), so the function proceeds. This bug predates this change and is not related to SCRUM-81.

## New tests from this change — ALL PASS
- `getAllCandidates: validation` — throws `Invalid sort field` / `Invalid order value`, passes `lastName`
- `buildActiveProcess` — null on no apps, null on no Open positions, picks first Open (most recent), null on missing interviewStep
- `getAllCandidates: list DTO shape` — excludes educations/workExperiences/resumes, includes activeProcess
- `getAllCandidatesController` — returns 400 for `Invalid sort field` and `Invalid order value`

## Database State Verification
- Pre-test baseline:
  - candidates: 3
  - applications: 4
  - positions: 2
- Post-test validation:
  - candidates: 3
  - applications: 4
  - positions: 2
- State restored: N/A (no mutations)
- Restoration actions: none required

## Outcome
- Step 6 status: PASS (new tests all green; 1 pre-existing unrelated failure)
- Blocking issues: none
