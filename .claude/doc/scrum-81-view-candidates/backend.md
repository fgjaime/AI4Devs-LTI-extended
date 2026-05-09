# SCRUM-81 View Candidates — Backend Implementation Plan

## Scope
Extend the existing `GET /candidates` endpoint so the recruiter list view can render each candidate together with their derived "active recruitment process" (most recent application on an `Open` position) and the current step within the position's interview flow. No DB schema changes are required.

## Important constraints / outdated knowledge corrections
- The story narrative says `Application.interviewStepId -> InterviewStep`. **In the actual Prisma schema (`backend/prisma/schema.prisma`), the FK column on `Application` is `currentInterviewStep` (Int), and the relation is `interviewStep` (`@relation(fields: [currentInterviewStep], references: [id])`)**. Use the relation name `interviewStep`. Do NOT introduce a new field.
- `Position.status` is a free `String` (default `"Draft"`). The active-process filter must compare against the literal string `"Open"` (case sensitive — matches existing seed data and current `position.status` usages).
- The endpoint already exists at `GET /` in `backend/src/routes/candidateRoutes.ts` mounted under `/candidates` (see `backend/src/index.ts`). Extend, do not recreate the route.
- Authentication/authorization is currently NOT enforced on the existing route (auth middleware is not present in this codebase yet). The story's AC6 (auth guard) is a frontend route-guard concern; do not add an auth middleware on the backend in this change unless explicitly asked. Note this in the design doc as "out of scope for backend in SCRUM-81; existing pattern preserved".
- `getAllCandidates` currently throws `new Error('Page number must be greater than 0')` etc. The controller maps messages containing `must be greater than` to HTTP 400. Preserve and extend this contract for new validation errors (`sort`/`order`).
- Tests currently live next to source (e.g. `candidateService.test.ts`). Add new tests in the same location/pattern — `backend/src/application/services/candidateService.test.ts` and a new `backend/src/presentation/controllers/candidateController.test.ts` extension if needed.
- Single-Prisma-query rule (NFR P95 < 300 ms): all relations must be retrieved via the existing `findMany` `include`; no per-row follow-up queries.

## Files to change

### 1. `backend/src/application/services/candidateService.ts` (modify)

Goals:
1. Whitelist new sort fields: `lastName`, `applicationDate` (in addition to existing `firstName`, `email`). Reject other sort values with HTTP-400-mapped error (`new Error('Invalid sort field')`).
2. Whitelist `order` values (`asc` | `desc`). On invalid value, throw `new Error('Invalid order value')`.
3. Special-case `sort=applicationDate` — Prisma cannot order parents by a child relation field directly without using `_count`/aggregation. Strategy: order the candidates list by `id asc` from Prisma, then post-sort the page in-memory by the derived `activeProcess.applicationDate`. Document this clearly (acceptable because pagination still applies and the candidate count per page is small, but note it is best-effort within page only). Alternative (preferred if the team accepts a small refactor): keep DB sort `firstName`/`lastName`/`email` for AC2 (the column headers in AC2 only list Name + Email as sortable), and **drop `applicationDate` from the sort whitelist**. The Enriched Story bullet "Sort by lastName desc and by applicationDate" is in the test cases section but no UI sort exists. RECOMMENDATION: add `lastName` only and skip `applicationDate` to keep a single Prisma query and zero in-memory ordering. Confirm with reviewer; default to NOT adding `applicationDate` to keep NFR strict.
4. Replace the `applications` include block to fetch position + company + interview flow steps + interview step (current) ordered by `applicationDate desc`:

```ts
applications: {
  orderBy: { applicationDate: 'desc' },
  select: {
    id: true,
    applicationDate: true,
    currentInterviewStep: true,
    position: {
      select: {
        id: true,
        title: true,
        status: true,
        company: { select: { id: true, name: true } },
        interviewFlow: {
          select: {
            interviewSteps: {
              select: { id: true, name: true, orderIndex: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    },
    interviewStep: { select: { id: true, name: true, orderIndex: true } },
  },
},
```

5. Introduce a pure helper (also exported for direct unit tests):

```ts
export interface ActiveProcessDTO {
  applicationId: number;
  applicationDate: string; // ISO
  position: {
    id: number;
    title: string;
    status: string;
    company: { id: number; name: string };
  };
  currentStep: { id: number; name: string; orderIndex: number };
  totalSteps: number;
}

export const buildActiveProcess = (
  applications: any[]
): ActiveProcessDTO | null => {
  if (!applications || applications.length === 0) return null;
  // applications already ordered desc by applicationDate (Prisma include)
  const active = applications.find(a => a?.position?.status === 'Open');
  if (!active) return null;
  const totalSteps =
    active.position?.interviewFlow?.interviewSteps?.length ?? 0;
  const currentStep = active.interviewStep
    ? {
        id: active.interviewStep.id,
        name: active.interviewStep.name,
        orderIndex: active.interviewStep.orderIndex,
      }
    : null;
  if (!currentStep) return null;
  return {
    applicationId: active.id,
    applicationDate: active.applicationDate.toISOString(),
    position: {
      id: active.position.id,
      title: active.position.title,
      status: active.position.status,
      company: {
        id: active.position.company.id,
        name: active.position.company.name,
      },
    },
    currentStep,
    totalSteps,
  };
};
```

6. Map each fetched candidate to the DTO described in the story:

```ts
const data = candidates.map(c => ({
  id: c.id,
  firstName: c.firstName,
  lastName: c.lastName,
  email: c.email,
  phone: c.phone ?? null,
  address: c.address ?? null,
  activeProcess: buildActiveProcess(c.applications),
}));
```

Drop `educations`, `workExperiences`, `resumes` from the list payload and from the `include` to keep response lean (frontend list view does not need them; this also improves P95 latency). Verify no other consumer of `GET /candidates` relies on these fields (search the frontend; based on context the list is the only consumer).

7. Update validation messages:
   - Keep `'Page number must be greater than 0'` and `'Limit must be greater than 0'`.
   - Add `'Invalid sort field'` and `'Invalid order value'` (controller already maps anything containing `must be greater than` to 400 — extend to also map these new errors → see controller change below).

### 2. `backend/src/presentation/controllers/candidateController.ts` (modify)

In `getAllCandidatesController`, broaden the 400-mapping condition to include new validation error strings:

```ts
const isValidationError = (msg: string) =>
  msg.includes('must be greater than') ||
  msg.startsWith('Invalid sort') ||
  msg.startsWith('Invalid order');
// ... if (isValidationError(error.message)) return res.status(400)...
```

No changes to other endpoints. Keep controller thin; it already delegates to the service.

### 3. `backend/src/application/services/candidateService.test.ts` (extend)

Add Jest specs (mock PrismaClient like the existing test) covering:
- `activeProcess === null` when candidate has zero applications.
- `activeProcess === null` when all applications are on positions with `status !== 'Open'`.
- `activeProcess` picks the most recent application by `applicationDate` when multiple `Open` exist (verify selection of the first item after Prisma `orderBy: { applicationDate: 'desc' }`).
- Sort `lastName` `asc`/`desc` passes through to Prisma `orderBy`.
- Returns 400-mappable errors for invalid `page` (< 1), invalid `limit` (< 1), invalid `sort` (`'foo'`), invalid `order` (`'sideways'`).
- DTO shape: phone is `null` when source phone is `null`; `educations`, `workExperiences`, `resumes` are NOT present in DTO.
- Pagination metadata returns `total`, `page`, `limit`, `totalPages` correctly.

Also export and unit test `buildActiveProcess` directly with synthetic `applications` arrays for clarity.

### 4. `backend/src/presentation/controllers/candidateController.test.ts` (new or extend)

If absent, create minimal Supertest-style tests (or jest with mocked service) verifying:
- Returns 200 with the new payload shape.
- Returns 400 when `getAllCandidates` throws `Invalid sort field`.
- Returns 500 for unexpected errors.

### 5. `docs/api-spec.yml` (modify)

Update `/candidates` GET:
- Extend `sort` enum to `[firstName, lastName, email]` (no `applicationDate` per recommendation above).
- Update `CandidateListResponse` schema (find it in `components.schemas`) so each `data[]` item matches:

```yaml
CandidateListItem:
  type: object
  required: [id, firstName, lastName, email, activeProcess]
  properties:
    id: { type: integer }
    firstName: { type: string }
    lastName: { type: string }
    email: { type: string, format: email }
    phone: { type: string, nullable: true }
    address: { type: string, nullable: true }
    activeProcess:
      nullable: true
      $ref: '#/components/schemas/ActiveProcess'

ActiveProcess:
  type: object
  required: [applicationId, applicationDate, position, currentStep, totalSteps]
  properties:
    applicationId: { type: integer }
    applicationDate: { type: string, format: date-time }
    position:
      type: object
      required: [id, title, status, company]
      properties:
        id: { type: integer }
        title: { type: string }
        status: { type: string }
        company:
          type: object
          required: [id, name]
          properties:
            id: { type: integer }
            name: { type: string }
    currentStep:
      type: object
      required: [id, name, orderIndex]
      properties:
        id: { type: integer }
        name: { type: string }
        orderIndex: { type: integer }
    totalSteps: { type: integer }
```

Update the example payload to match the story.

## DDD layering check
- Domain: no new entities/methods strictly required because list aggregation is a read concern. **Optional improvement (recommended)**: move the `findMany` + DTO derivation into a static method `Candidate.findAll(options)` on `backend/src/domain/models/Candidate.ts`, mirroring the existing `Candidate.findOne` pattern. The application service then becomes a thin orchestrator + validator. This aligns with the project's pattern (Candidate uses `prisma.candidate.update/create/findUnique` directly). If you choose to keep it minimal for this story, leave the query in the service but justify in `design.md`.
- Application: validation + sort/order whitelist enforcement + DTO shaping (keep `buildActiveProcess` here as a pure function).
- Presentation: controller stays thin; only mapping rules change.
- Infrastructure: Prisma schema unchanged.

## Edge cases to cover
- Candidate has applications but `interviewStep` relation is missing (data integrity issue) → treat as no active process (`null`). Already handled by `buildActiveProcess`.
- Position's `interviewFlow.interviewSteps` array empty → `totalSteps = 0`; still emit `activeProcess` with `totalSteps: 0` so the frontend can render `(2/0)` defensively. Decide with frontend; recommended: still emit, since the frontend story formats `(orderIndex/totalSteps)` literally.
- Multiple applications on same `Open` position with same `applicationDate` → first one returned by Prisma after `orderBy desc` wins. Document as deterministic-but-unspecified ordering tiebreaker.
- Empty result set: `data: []`, `metadata.total: 0` (already handled).

## Performance
Single `prisma.candidate.findMany` + `prisma.candidate.count` (existing pattern). The new `select` set adds joins on `position`, `company`, `interviewFlow`, `interviewSteps`, `interviewStep`. Verify with `EXPLAIN ANALYZE` after seeding test data; ensure existing FK indexes cover joins. No new index required (FKs auto-indexed in Prisma + Postgres on FK columns referenced).

## Testing checklist (for parent agent / apply step)
- Add unit tests as listed in section 3.
- Run `npm test` in `backend/`.
- Manual `curl` (mandatory per `.claude/rules/openspec-tasks-mandatory-steps.md`):
  - `curl -s "http://localhost:3010/candidates?page=1&limit=10&sort=lastName&order=asc"` → assert structure.
  - `curl -s "http://localhost:3010/candidates?sort=invalid"` → expect 400.
  - `curl -s "http://localhost:3010/candidates?page=0"` → expect 400.
- Update `openspec/changes/scrum-81-view-candidates/reports/...` per the rules.

## Mandatory-steps reminder
Per `/Users/alvaromoya/projects/versiones ejercicios/AI4Devs-LTI-before-position-update-openspec-raw-2026/.claude/rules/openspec-tasks-mandatory-steps.md`, when generating `tasks.md` ensure: Step 0 = create branch `feature/scrum-81-view-candidates-backend` (or unified branch from the pipeline `feature/scrum-81-view-candidates`), include the mandatory testing/report steps, and the apply agent must execute curl tests itself and create the verification report under `openspec/changes/scrum-81-view-candidates/reports/`.

## Out of scope (do not implement here)
- Auth middleware / role check.
- New endpoint paths.
- Schema migrations.
- Removal of `educations/workExperiences/resumes` from `GET /candidates/:id` (only the LIST endpoint is trimmed).
