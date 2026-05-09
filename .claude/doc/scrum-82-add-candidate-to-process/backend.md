# Backend Implementation Plan — SCRUM-82: Add Candidate to a Process

Worktree path: `/Users/alvaromoya/projects/versiones ejercicios/AI4Devs-LTI-before-position-update-openspec-raw-2026/.worktrees/scrum-82-add-candidate-to-process`
Branch: `feature/scrum-82-add-candidate-to-process`

All file paths below are absolute and refer to the **worktree** path. Within the worktree, the path layout is identical to the main checkout (e.g. `<worktree>/backend/src/...`).

---

## 1. Important Notes (read first — corrects assumptions in the User Story)

These items override the User Story when they conflict with the live codebase. Do not blindly copy fields from the User Story.

1. **Schema reality vs. User Story**: The `Application` Prisma model in `backend/prisma/schema.prisma` (lines 128-139) has only one FK to `InterviewStep`: the column **`currentInterviewStep`**. There is **no separate `interviewStepId` column**. The User Story mentions setting both `interviewStepId` and `currentInterviewStep` — this is wrong. The implementation must:
   - Persist only `currentInterviewStep` (the existing FK column).
   - In the JSON response, expose `currentInterviewStep` as the canonical field. If we want to also expose `interviewStepId` to keep the API contract stable with the user story, alias it in the response payload (`interviewStepId: app.currentInterviewStep`). Document this in the OpenAPI spec.
   - **Do NOT add a new column or run migrations.** No schema change is required (matches the User Story §4 statement).

2. **Position status enum values**: `backend/src/application/validator.ts` (line 150) defines:
   ```ts
   const POSITION_STATUS_VALUES = ['Draft', 'Open', 'Closed', 'Hired'];
   ```
   The User Story Gherkin uses Spanish values (`"Cerrado"`, `"Contratado"`). The codebase uses English. The implementation MUST use the existing English enum (`Closed`, `Hired`) when guarding "closed/filled positions". Update the OpenAPI spec and tasks.md accordingly. Do NOT silently introduce Spanish status values.

3. **Repository pattern is interface-only here**: `backend/src/domain/repositories/IApplicationRepository.ts` exists, but no concrete Prisma implementation is wired into services. The codebase pattern is **services call domain models or `prisma` directly via PrismaClient** (see `positionService.ts`). Follow that established pattern; do not introduce a new repository concrete class for this feature unless we plan a broader refactor (out of scope).

4. **Domain model already supports the create**: `backend/src/domain/models/Application.ts` already has a working `save()` (line 25-44) that creates when `id` is undefined and updates when `id` is set. We will reuse it. We must NOT duplicate persistence in the service.

5. **Transaction needed**: Duplicate-check + create must run inside a Prisma `$transaction`. The simplest and most testable approach is to do the duplicate check + insert via `prisma.$transaction(async (tx) => { ... })` directly inside the service (the `Application.save()` method uses the singleton `prisma` and is fine for the create, but for atomicity we need the transactional client). Two acceptable options:
   - **Option A (preferred — simpler, idiomatic in this codebase)**: Service performs all reads + the `tx.application.create(...)` inside `$transaction`. We keep `Application.save()` for non-transactional callers.
   - **Option B (purist DDD)**: Extend `Application.save(tx?)` to accept an optional Prisma transaction client. Heavier change. Recommend Option A to minimize blast radius.

6. **Auth**: User Story says "auth required (recruiter role)". The current backend does NOT have any auth middleware mounted (`backend/src/index.ts`, `routes/*`). Adding real auth is out of scope. Document this gap in the design doc; do not gate the new endpoint on a non-existent middleware. Add a TODO/Note in tasks.md/design.md.

7. **i18n / response message language**: Existing controllers return English error messages. Stay consistent with English.

8. **Tests location**: There are two competing patterns in the repo:
   - `backend/src/application/services/positionService.test.ts` (sibling)
   - `backend/src/application/services/__tests__/candidateService.test.ts` (folder)
   New tests should live next to the file under test using the **sibling** pattern that is already used by `positionService.test.ts` for the position service. Add the new test file as `positionService.test.ts` extension (append describe blocks) **or** create a new file `positionService.assignCandidate.test.ts` next to it. Recommend: extend the existing `positionService.test.ts`.

9. **HTTP status mapping**: 201, 400, 404, 409, 422, 500. Position with status `Closed` or `Hired` returns **409** (per User Story §5). Empty interview flow returns **422** (per §5). Duplicate returns **409**.

10. **Notes length limit**: User Story says max 500 chars. Existing validator pattern uses `<= 1000` for interview notes; here we enforce `<= 500` per the spec. Do NOT silently widen.

11. **`applicationDate`**: Server-generated `new Date()` — never accept it from the client.

---

## 2. Affected Layers and File Inventory

### Files to CREATE

| Path (relative to worktree root) | Purpose |
| --- | --- |
| `backend/src/application/services/positionService.assignCandidate.test.ts` *(or extend existing)* | Unit tests for `assignCandidateToPositionService` covering all branches |
| `backend/src/presentation/controllers/positionController.assignCandidate.test.ts` *(or extend existing)* | Unit tests for `addCandidateToPosition` controller covering HTTP status mapping |
| `backend/src/application/__tests__/validator.assignCandidate.test.ts` *(or extend existing)* | Unit tests for `validateAssignCandidateToPositionData` |

### Files to MODIFY

| Path | Change |
| --- | --- |
| `backend/src/routes/positionRoutes.ts` | Register `router.post('/:id/candidates', addCandidateToPosition)` |
| `backend/src/presentation/controllers/positionController.ts` | Add `addCandidateToPosition` controller |
| `backend/src/application/services/positionService.ts` | Add `assignCandidateToPositionService({ positionId, candidateId, notes })` |
| `backend/src/application/validator.ts` | Add `validateAssignCandidateToPositionData(data)` |
| `docs/api-spec.yml` (if exists) or equivalent OpenAPI doc | Add new operation + schemas + error codes |

### Files NOT to modify

- `backend/prisma/schema.prisma` — no migrations required.
- `backend/src/domain/models/Application.ts` — reuse existing `save()` method (or skip and use `tx.application.create` in service per Option A).
- Domain repository interfaces — out of scope for this feature.

---

## 3. Validator (`backend/src/application/validator.ts`)

Add **at the bottom** of the file:

```ts
export const validateAssignCandidateToPositionData = (data: any): void => {
    if (data == null || typeof data !== 'object') {
        throw new Error('Request body is required');
    }
    if (data.candidateId == null || typeof data.candidateId !== 'number' || !Number.isInteger(data.candidateId) || data.candidateId <= 0) {
        throw new Error('candidateId is required and must be a positive integer');
    }
    if (data.notes !== undefined && data.notes !== null) {
        if (typeof data.notes !== 'string') {
            throw new Error('notes must be a string');
        }
        if (data.notes.length > 500) {
            throw new Error('notes must not exceed 500 characters');
        }
    }
    // Optional sanity guard: reject unexpected fields commonly set by clients
    const ALLOWED = new Set(['candidateId', 'notes']);
    for (const key of Object.keys(data)) {
        if (!ALLOWED.has(key)) {
            throw new Error(`Unexpected field: ${key}`);
        }
    }
};
```

### Validator unit test cases (TDD-first)

- accepts minimal `{ candidateId: 1 }`
- accepts `{ candidateId: 1, notes: 'ok' }`
- rejects missing `candidateId` → `candidateId is required...`
- rejects non-integer `candidateId` (string, float, 0, negative)
- rejects `notes` not-a-string
- rejects `notes` length > 500
- rejects unknown fields (e.g. `applicationDate`, `interviewStepId`)
- rejects null/undefined body

---

## 4. Application Service (`backend/src/application/services/positionService.ts`)

Add a new exported function. Use a Prisma `$transaction` for atomicity:

```ts
export interface AssignCandidateInput {
    positionId: number;
    candidateId: number;
    notes?: string;
}

export class AssignCandidateError extends Error {
    code:
        | 'POSITION_NOT_FOUND'
        | 'CANDIDATE_NOT_FOUND'
        | 'POSITION_CLOSED'
        | 'NO_INTERVIEW_STEPS'
        | 'DUPLICATE_APPLICATION';
    constructor(code: AssignCandidateError['code'], message: string) {
        super(message);
        this.code = code;
        this.name = 'AssignCandidateError';
    }
}

export const assignCandidateToPositionService = async (
    input: AssignCandidateInput,
): Promise<{
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: Date;
    interviewStepId: number;       // alias of currentInterviewStep
    currentInterviewStep: number;  // canonical FK
    notes: string | null;
}> => {
    const { positionId, candidateId, notes } = input;

    return await prisma.$transaction(async (tx) => {
        // 1) Position exists and is open
        const position = await tx.position.findUnique({
            where: { id: positionId },
            include: {
                interviewFlow: {
                    include: {
                        interviewSteps: { orderBy: { orderIndex: 'asc' } },
                    },
                },
            },
        });
        if (!position) {
            throw new AssignCandidateError('POSITION_NOT_FOUND', 'Position not found');
        }
        if (position.status === 'Closed' || position.status === 'Hired') {
            throw new AssignCandidateError('POSITION_CLOSED', 'Cannot add candidates to a closed position');
        }

        // 2) Candidate exists
        const candidate = await tx.candidate.findUnique({ where: { id: candidateId } });
        if (!candidate) {
            throw new AssignCandidateError('CANDIDATE_NOT_FOUND', 'Candidate not found');
        }

        // 3) InterviewFlow has at least one step
        const firstStep = position.interviewFlow.interviewSteps[0];
        if (!firstStep) {
            throw new AssignCandidateError('NO_INTERVIEW_STEPS', 'Position has no configured interview steps');
        }

        // 4) Duplicate guard
        const existing = await tx.application.findFirst({
            where: { positionId, candidateId },
        });
        if (existing) {
            throw new AssignCandidateError('DUPLICATE_APPLICATION', 'Candidate is already assigned to this position');
        }

        // 5) Create
        const created = await tx.application.create({
            data: {
                positionId,
                candidateId,
                applicationDate: new Date(),
                currentInterviewStep: firstStep.id,
                notes: notes ?? null,
            },
        });

        return {
            id: created.id,
            positionId: created.positionId,
            candidateId: created.candidateId,
            applicationDate: created.applicationDate,
            interviewStepId: created.currentInterviewStep,
            currentInterviewStep: created.currentInterviewStep,
            notes: created.notes,
        };
    });
};
```

### Service unit test branches (TDD-first, mock `prisma.$transaction`)

- happy path: returns 201-shaped payload, applicationDate is a `Date`, `interviewStepId === currentInterviewStep === firstStep.id`, picks step with the lowest `orderIndex`
- rejects `POSITION_NOT_FOUND` when `findUnique` returns null
- rejects `POSITION_CLOSED` for status `'Closed'` AND for status `'Hired'`
- rejects `CANDIDATE_NOT_FOUND` when candidate `findUnique` returns null
- rejects `NO_INTERVIEW_STEPS` when `interviewSteps` is empty
- rejects `DUPLICATE_APPLICATION` when an Application already exists for (positionId, candidateId)
- persists `notes` as provided; persists `null` when omitted
- uses transactional client (asserted by spying `prisma.$transaction` is called once)

Mocking pattern (consistent with existing `positionService.test.ts`):
```ts
jest.mock('@prisma/client', () => {
  const tx = {
    position: { findUnique: jest.fn() },
    candidate: { findUnique: jest.fn() },
    application: { findFirst: jest.fn(), create: jest.fn() },
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $transaction: (cb: any) => cb(tx),
      // expose tx for assertions if needed
    })),
  };
});
```

---

## 5. Presentation Controller (`backend/src/presentation/controllers/positionController.ts`)

Add new export:

```ts
import {
    // ... existing imports
    assignCandidateToPositionService,
    AssignCandidateError,
} from '../../application/services/positionService';
import {
    validatePositionUpdateData,
    validateAssignCandidateToPositionData,
} from '../../application/validator';

export const addCandidateToPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id, 10);
        if (isNaN(positionId)) {
            return res.status(400).json({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number',
            });
        }

        try {
            validateAssignCandidateToPositionData(req.body);
        } catch (validationError) {
            const message = validationError instanceof Error ? validationError.message : String(validationError);
            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: 'Validation error',
                error: message,
            });
        }

        const result = await assignCandidateToPositionService({
            positionId,
            candidateId: req.body.candidateId,
            notes: req.body.notes,
        });

        return res.status(201).json(result);
    } catch (error) {
        if (error instanceof AssignCandidateError) {
            switch (error.code) {
                case 'POSITION_NOT_FOUND':
                    return res.status(404).json({ code: error.code, message: error.message });
                case 'CANDIDATE_NOT_FOUND':
                    return res.status(404).json({ code: error.code, message: error.message });
                case 'POSITION_CLOSED':
                    return res.status(409).json({ code: error.code, message: error.message });
                case 'DUPLICATE_APPLICATION':
                    return res.status(409).json({ code: error.code, message: error.message });
                case 'NO_INTERVIEW_STEPS':
                    return res.status(422).json({ code: error.code, message: error.message });
            }
        }
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Error assigning candidate to position',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
```

### Controller unit test cases

- 400 on invalid `:id` (non-numeric)
- 400 when validator throws (e.g., missing `candidateId`)
- 201 with body returned by the service on happy path
- 404 on `POSITION_NOT_FOUND`
- 404 on `CANDIDATE_NOT_FOUND`
- 409 on `POSITION_CLOSED`
- 409 on `DUPLICATE_APPLICATION`
- 422 on `NO_INTERVIEW_STEPS`
- 500 on unexpected error
- error response includes `code` field

Mock pattern follows `positionController.test.ts` (jest.mock the service module + validator module).

---

## 6. Routes (`backend/src/routes/positionRoutes.ts`)

Add the route. Place BEFORE the parametric routes that use `:id` only when ordering matters; in Express `router.post('/:id/candidates', ...)` will not collide with the existing `GET /:id/candidates` because methods differ — order does not matter here:

```ts
import {
    // ... existing
    addCandidateToPosition,
} from '../presentation/controllers/positionController';

router.post('/:id/candidates', addCandidateToPosition);
```

Verify final ordering in the file is consistent. No new middleware required.

---

## 7. OpenAPI / `docs/api-spec.yml`

Add the operation. Snippet to add (verify the file format used in the project):

```yaml
paths:
  /positions/{positionId}/candidates:
    post:
      summary: Assign an existing candidate to a position
      tags: [Positions]
      parameters:
        - in: path
          name: positionId
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [candidateId]
              properties:
                candidateId: { type: integer, minimum: 1 }
                notes: { type: string, maxLength: 500, nullable: true }
      responses:
        '201':
          description: Application created
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: integer }
                  positionId: { type: integer }
                  candidateId: { type: integer }
                  applicationDate: { type: string, format: date-time }
                  interviewStepId: { type: integer, description: Alias of currentInterviewStep }
                  currentInterviewStep: { type: integer }
                  notes: { type: string, nullable: true }
        '400': { description: VALIDATION_ERROR }
        '404': { description: POSITION_NOT_FOUND or CANDIDATE_NOT_FOUND }
        '409': { description: DUPLICATE_APPLICATION or POSITION_CLOSED }
        '422': { description: NO_INTERVIEW_STEPS }
        '500': { description: INTERNAL_ERROR }
```

Note: in the description for `POSITION_CLOSED` clarify it covers status values `Closed` and `Hired` (English, consistent with validator).

---

## 8. Test Strategy & Coverage Targets

- 90% coverage threshold per CLAUDE.md.
- Use AAA pattern, descriptive `it(...)` names in English (per project standard).
- Mocks for Prisma client follow the existing `positionService.test.ts` pattern.
- Run targeted suite first: `npx jest src/application/services/positionService` and `npx jest src/presentation/controllers/positionController` and `npx jest src/application/__tests__/validator`.
- Then full backend suite: `npm test --workspace backend` (verify exact command in `package.json`).
- Capture pre/post DB state for the mandatory Step N+1 report.

### Manual curl tests (Step N+2 — agent must execute)

Pick a real `positionId` and `candidateId` from seed data. Expected:

```bash
# 201 happy path
curl -i -X POST http://localhost:3010/positions/{positionId}/candidates \
  -H 'Content-Type: application/json' \
  -d '{"candidateId": <id>, "notes": "Referred by employee #42"}'

# 409 duplicate (re-run the same call)
# 404 position not found (positionId=999999)
# 404 candidate not found (candidateId=999999)
# 400 validation (no candidateId)
# 422 — pre-create a position whose interviewFlow has zero steps to assert
# 409 closed — PATCH a position to status="Closed" first, then try
```

After every successful POST, DELETE the created `Application` row (or wrap in a transaction reverted manually) to restore DB state. Likewise revert any status patch.

### E2E (Step N+3) — frontend agent will own; backend must be running on the standard port.

---

## 9. Order of Implementation (TDD baby steps)

1. Validator unit tests (red) → implement `validateAssignCandidateToPositionData` → green.
2. Service unit tests (red) → implement `assignCandidateToPositionService` + `AssignCandidateError` → green.
3. Controller unit tests (red) → implement `addCandidateToPosition` → green.
4. Wire route in `positionRoutes.ts`.
5. Update OpenAPI doc.
6. Re-run full suite, fix coverage gaps.
7. Manual curl tests with state restore (Step N+2 mandatory report).
8. Update technical docs (Step N+4 mandatory).

---

## 10. Risks / Open Questions

- **Auth/role enforcement** is not implementable today (no middleware exists). Decide whether to add a stub `requireRecruiter` middleware or document the gap. Recommendation: document the gap in `design.md`; do not introduce half-baked auth.
- **Status enum**: The OpenSpec change must explicitly state we use English statuses (`Closed`, `Hired`) and that the User Story's Spanish examples were illustrative.
- **`interviewStepId` alias** in the response is purely a contract convenience; if the team prefers strict response = DB column, drop the alias and update the spec to expose only `currentInterviewStep`. Decide before coding the OpenAPI section.
- **Transaction isolation**: `findFirst` + `create` inside `$transaction` is not race-proof under concurrent inserts (no unique constraint on `(positionId, candidateId)`). For true safety, a follow-up could add `@@unique([positionId, candidateId])` to the schema and catch Prisma `P2002`. Out of scope for this story but flag in design.
