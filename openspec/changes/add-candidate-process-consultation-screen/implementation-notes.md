## Consultation Implementation Notes

### Route and Navigation
- New route: `/candidates/consultation`
- Route registration: `frontend/src/App.js`
- Dashboard entry point: `frontend/src/components/RecruiterDashboard.js`

### UX Behavior
- Candidate list loads from `GET /candidates` with pagination support.
- Search input is debounced (300ms) and resets page to 1.
- Status filter is client-side and uses process-derived status labels.
- Process detail opens on demand and loads from `GET /candidates/{id}`.
- Error states include retry for list loading and clear messaging for detail loading.

### Response Mapping Matrix

| Consultation field | Source endpoint | Source path |
| --- | --- | --- |
| Candidate full name | `GET /candidates` | `data[].firstName + data[].lastName` |
| Candidate email | `GET /candidates` | `data[].email` |
| Candidate phone | `GET /candidates` | `data[].phone` |
| Process count | `GET /candidates` | `data[].applications.length` |
| Process position title | `GET /candidates` | `data[].applications[].position.title` |
| Process date | `GET /candidates` | `data[].applications[].applicationDate` |
| Process current step | `GET /candidates` | `data[].applications[].currentInterviewStep` |
| Process status badge | Derived in frontend | interviews + current step |
| Process interviews timeline | `GET /candidates/{id}` | `applications[].interviews[]` |
| Interview step name in detail | `GET /candidates/{id}` | `applications[].interviews[].interviewStep.name` |

### Derived Status Precedence
1. Latest interview result is `Passed` -> `Passed`
2. Latest interview result is `Failed` -> `Failed`
3. Any interview exists or current step exists -> `In Progress`
4. No interviews and no current step -> `No Interviews Yet`

### Known Limitations
- Frontend tests pass but include React Testing Library `act` warnings; behavior is validated, but tests can be further polished.
- Candidate summary status is currently derived client-side; server-side computed status can be introduced later if needed.
