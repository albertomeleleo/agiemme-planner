# Tasks: Docker Compose Local Infrastructure

**Input**: Design documents from `/specs/001-docker-compose/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/compose-schema.yml

**Tests**: Not explicitly requested in specification - tasks focus on infrastructure implementation and validation through health checks and integration testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each Docker Compose feature.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app monorepo**: `backend/`, `frontend/`, root level for Docker files
- Paths follow structure defined in plan.md (root: docker-compose.yml, backend/Dockerfile, frontend/Dockerfile, scripts/)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Docker infrastructure scaffolding

- [X] T001 Create `.dockerignore` file in project root to exclude node_modules, dist, coverage, .env files
- [X] T002 [P] Create `scripts/` directory in project root for helper scripts
- [X] T003 [P] Create `.env.docker.example` file in project root with all environment variables documented

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Docker infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create `backend/Dockerfile` with Node.js 20 Alpine base, PostgreSQL client, and multi-stage build structure per research.md
- [X] T005 [P] Create `frontend/Dockerfile` with Node.js 20 Alpine base and Vite dev server configuration per research.md
- [X] T006 Create root-level `docker-compose.yml` with initial structure: version, services (postgres, backend, frontend), volumes, networks per data-model.md
- [X] T007 Configure PostgreSQL service in `docker-compose.yml` with postgres:16-alpine image, environment variables, health check (pg_isready), and postgres_data volume per data-model.md
- [X] T008 Add backend service configuration to `docker-compose.yml` with build context, depends_on postgres (service_healthy), ports, environment variables per data-model.md
- [X] T009 Add frontend service configuration to `docker-compose.yml` with build context, depends_on backend (service_started), ports, environment variables per data-model.md
- [X] T010 Define named volumes in `docker-compose.yml`: postgres_data, backend_node_modules, frontend_node_modules, backend_dist, frontend_vite_cache with labels per data-model.md
- [X] T011 Define agiemme-network bridge network in `docker-compose.yml` with appropriate labels per data-model.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start Complete Development Environment (Priority: P1) 🎯 MVP

**Goal**: Developers can start entire application stack (database, backend, frontend) with a single command with zero manual configuration

**Independent Test**: Run `docker compose up` from fresh repository checkout, verify all three services start within 2 minutes, access frontend at localhost:5173, backend API at localhost:3000/api/health, database at localhost:5432

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `backend/docker-entrypoint.sh` with wait-for-database logic using pg_isready per research.md section 6
- [X] T013 [P] [US1] Add smart npm install logic to `backend/docker-entrypoint.sh` with package.json timestamp comparison and marker file per research.md section 7
- [X] T014 [US1] Add database migration execution to `backend/docker-entrypoint.sh` with npm run migrate:up and error handling per research.md section 6
- [X] T015 [US1] Add security validation warnings to `backend/docker-entrypoint.sh` for default JWT_SECRET and DATABASE_PASSWORD per research.md section 4
- [X] T016 [US1] Complete `backend/docker-entrypoint.sh` with exec command to start npm run dev per research.md section 6
- [X] T017 [US1] Update `backend/Dockerfile` to install postgresql-client via apk, copy docker-entrypoint.sh, set as ENTRYPOINT per research.md section 6
- [X] T018 [P] [US1] Create optional `frontend/docker-entrypoint.sh` with smart npm install logic per research.md section 7
- [X] T019 [P] [US1] Configure backend volume mounts in `docker-compose.yml`: ./backend:/app:cached, /app/node_modules (anonymous), /app/dist per research.md section 2
- [X] T020 [P] [US1] Configure frontend volume mounts in `docker-compose.yml`: ./frontend:/app:cached, /app/node_modules (anonymous), /app/node_modules/.vite per research.md section 2
- [X] T021 [US1] Set backend environment variables in `docker-compose.yml` with all defaults per data-model.md Backend Service section (DATABASE_*, JWT_*, PORT, NODE_ENV, FRONTEND_URL, CHOKIDAR_USEPOLLING=false)
- [X] T022 [P] [US1] Set frontend environment variables in `docker-compose.yml` per data-model.md Frontend Service section (VITE_API_BASE_URL, NODE_ENV, VITE_HMR_*, CHOKIDAR_USEPOLLING=false)
- [X] T023 [US1] Configure backend health check in `docker-compose.yml`: curl localhost:3000/api/health, interval 10s, timeout 5s, retries 3, start_period 30s per data-model.md
- [X] T024 [US1] Add backend health endpoint at `backend/src/api/routes/health.ts` returning JSON with status, timestamp, database connection state per data-model.md Health Endpoint Contract
- [X] T025 [US1] Register health route in backend Express app configuration per existing backend structure
- [ ] T026 [US1] Test full startup sequence: docker compose up, verify postgres healthy in ~35s, backend healthy in ~60s, frontend running in ~20s, total <3 minutes (SC-001)
- [ ] T027 [US1] Test hot-reload: edit backend .ts file, verify reload <3s (SC-003); edit frontend .tsx file, verify browser update <2s (SC-002)
- [ ] T028 [US1] Test automatic dependency installation: modify package.json, restart service, verify npm ci runs automatically (FR-012)

**Checkpoint**: User Story 1 complete - developers can start entire stack with `docker compose up` and get automatic hot-reload

---

## Phase 4: User Story 2 - Stop and Clean Up Environment (Priority: P2)

**Goal**: Developers can stop all services gracefully and optionally clean up all data to return to clean state

**Independent Test**: Start environment (US1), run stop command, verify containers stop in <30s and ports released; run cleanup with -v flag, verify volumes removed; restart, verify fresh database

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create `scripts/cleanup.sh` script with graceful stop (docker compose down) option per quickstart.md
- [ ] T030 [P] [US2] Add volume cleanup option to `scripts/cleanup.sh` (docker compose down -v) with confirmation prompt per spec.md US2 acceptance scenario 3
- [ ] T031 [P] [US2] Add complete cleanup option to `scripts/cleanup.sh` (docker compose down -v --remove-orphans) per FR-009
- [ ] T032 [US2] Update root `package.json` with npm scripts: docker:down, docker:clean, docker:clean:all per quickstart.md Common Commands section
- [ ] T033 [US2] Add conditional logic to `scripts/cleanup.sh` to stop running containers before cleanup if they're still running per spec.md US2 acceptance scenario 3
- [ ] T034 [US2] Test graceful stop: docker compose down, verify all containers stop in <30s, ports released, volumes preserved (SC-006)
- [ ] T035 [US2] Test cleanup with volumes: docker compose down -v, verify volumes removed, next startup creates fresh database per spec.md US2 acceptance scenario 2
- [ ] T036 [US2] Test data persistence: create test data, docker compose down (no -v), docker compose up, verify data still exists (SC-004 partial)

**Checkpoint**: User Story 2 complete - developers have full control over environment lifecycle with data preservation options

---

## Phase 5: User Story 3 - View Service Logs (Priority: P2)

**Goal**: Developers can view real-time logs from all services or specific services for debugging

**Independent Test**: Start environment, trigger API calls and page loads, run log commands, verify logs display with timestamps and service names, filter by specific service

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create `scripts/logs.sh` wrapper script for docker compose logs with all services option per quickstart.md
- [ ] T038 [P] [US3] Add service-specific filtering to `scripts/logs.sh` accepting service name argument (postgres, backend, frontend) per FR-010
- [ ] T039 [P] [US3] Add follow mode option to `scripts/logs.sh` (--follow or -f flag) for real-time log streaming per spec.md US3 acceptance scenario 1
- [ ] T040 [P] [US3] Add tail option to `scripts/logs.sh` (--tail N) to limit initial output per quickstart.md
- [ ] T041 [US3] Update root `package.json` with npm scripts: docker:logs, docker:logs:backend, docker:logs:frontend, docker:logs:db per quickstart.md Cheat Sheet
- [ ] T042 [US3] Ensure backend logging includes timestamps and proper log levels (debug in development) via winston or existing logger per spec.md US3 acceptance scenario 3
- [ ] T043 [US3] Test aggregated logs: docker compose logs -f, verify interleaved output from all services with service name prefixes and timestamps (SC-005)
- [ ] T044 [US3] Test filtered logs: docker compose logs backend, verify only backend service logs displayed per spec.md US3 acceptance scenario 2
- [ ] T045 [US3] Test error visibility: trigger backend error, verify stack trace and context clearly visible in logs per spec.md US3 acceptance scenario 3

**Checkpoint**: User Story 3 complete - developers have comprehensive log viewing capabilities for debugging

---

## Phase 6: User Story 4 - Run Database Migrations (Priority: P3)

**Goal**: Developers can run database migrations against containerized database without direct database access

**Independent Test**: Start environment with fresh database, run migration command, verify schema created by querying database; apply partial migrations, run command, verify only pending migrations execute

### Implementation for User Story 4

- [ ] T046 [US4] Verify automatic migration execution in `backend/docker-entrypoint.sh` is working per implementation in User Story 1 (already implemented in T014)
- [ ] T047 [P] [US4] Create `scripts/migrate.sh` wrapper script for manual migration operations (up, down, status) per quickstart.md Development Workflow
- [ ] T048 [P] [US4] Add migration status command to `scripts/migrate.sh` (docker compose exec backend npm run migrate:status) per spec.md US4 acceptance scenario 3
- [ ] T049 [P] [US4] Add migration up command to `scripts/migrate.sh` (docker compose exec backend npm run migrate:up) for manual execution per spec.md US4 acceptance scenario 1
- [ ] T050 [P] [US4] Add migration down/rollback command to `scripts/migrate.sh` (docker compose exec backend npm run migrate:down) per spec.md US4 acceptance scenario 3
- [ ] T051 [US4] Update root `package.json` with npm scripts: docker:migrate:up, docker:migrate:down, docker:migrate:status per quickstart.md Common Commands
- [ ] T052 [US4] Test automatic migrations: fresh database, docker compose up, verify all migration scripts execute in order and database schema fully set up per spec.md US4 acceptance scenario 1
- [ ] T053 [US4] Test partial migrations: apply some migrations manually, restart backend, verify only pending migrations executed per spec.md US4 acceptance scenario 2
- [ ] T054 [US4] Test migration failure: introduce error in migration SQL, start backend, verify clear error indication and which migration failed per spec.md US4 acceptance scenario 3

**Checkpoint**: User Story 4 complete - developers have both automatic and manual migration management capabilities

---

## Phase 7: User Story 5 - Persist Data Between Restarts (Priority: P3)

**Goal**: Database data persists between container restarts without loss of test data, users, or OKRs

**Independent Test**: Start environment, create test data (users, objectives, key results), stop without cleanup, restart, verify all data accessible; repeat 10 times to validate persistence

### Implementation for User Story 5

- [ ] T055 [US5] Verify postgres_data named volume is correctly configured in `docker-compose.yml` per implementation in Phase 2 (already implemented in T007, T010)
- [ ] T056 [US5] Verify volume persistence across restarts: docker compose down preserves volumes, docker compose down -v removes them per data-model.md Data Persistence Strategy
- [ ] T057 [P] [US5] Create `scripts/backup.sh` script for database backups using pg_dump per data-model.md Backup Strategy
- [ ] T058 [P] [US5] Add volume backup option to `scripts/backup.sh` using docker run with tar per data-model.md Backup Strategy
- [ ] T059 [P] [US5] Create `scripts/restore.sh` script for restoring from SQL dumps or volume tar archives per data-model.md Backup Strategy
- [ ] T060 [US5] Update root `package.json` with npm scripts: docker:backup, docker:restore per data persistence needs
- [ ] T061 [US5] Test data persistence: create test data (users, objectives, key results), docker compose down (no -v), docker compose up, verify all data accessible per spec.md US5 acceptance scenario 1
- [ ] T062 [US5] Test multiple restarts: perform 10 consecutive docker compose down && docker compose up cycles, verify data accumulates correctly and remains consistent (SC-004)
- [ ] T063 [US5] Test fresh start: docker compose down -v, docker compose up, verify database starts empty per spec.md US5 acceptance scenario 3
- [ ] T064 [US5] Test backup and restore: create data, backup with pg_dump, docker compose down -v, restore, verify data intact per data-model.md Backup Strategy

**Checkpoint**: User Story 5 complete - developers have full data persistence with backup/restore capabilities

---

## Phase 8: Port Conflict Detection & Error Handling

**Goal**: Implement port conflict detection and graceful error handling for robust developer experience

**Independent Test**: Occupy port 3000 manually, run docker compose up, verify immediate failure with clear error listing occupied ports and remediation instructions

### Implementation for Port Conflict Detection

- [ ] T065 [P] Create `scripts/check-ports.sh` with cross-platform port checking (macOS, Linux, Windows/WSL2) per research.md section 3
- [ ] T066 [P] Add port availability check to `scripts/check-ports.sh` for ports 3000, 5173, 5432 using lsof/ss/netstat per research.md section 3
- [ ] T067 Add process identification to `scripts/check-ports.sh` showing PID and process name for occupied ports per research.md section 3
- [ ] T068 Add user-friendly error messages to `scripts/check-ports.sh` with remediation instructions (kill commands) per research.md section 3 and FR-005a
- [ ] T069 Update root `package.json` with docker:check-ports script and integrate into docker:up command per research.md section 3
- [ ] T070 Test port conflict detection: occupy port 3000, run npm run docker:check-ports, verify clear error with port list and kill instructions per spec.md Edge Cases
- [ ] T071 Test all ports free: run npm run docker:check-ports, verify success message and proceed to startup per research.md section 3
- [ ] T072 Configure docker-compose.yml for clean failure state: ensure partial failures stop all services per FR-005b and spec.md Edge Cases

**Checkpoint**: Port conflict detection complete - developers get immediate, actionable feedback on port availability

---

## Phase 9: Documentation & Developer Experience

**Purpose**: Comprehensive documentation for smooth developer onboarding and troubleshooting

- [ ] T073 [P] Create `README-DOCKER.md` in project root with quick start guide, prerequisites, common commands per research.md Files to Create
- [ ] T074 [P] Document all npm scripts in `README-DOCKER.md` (docker:up, docker:down, docker:clean, docker:logs, etc.) per quickstart.md
- [ ] T075 [P] Add troubleshooting section to `README-DOCKER.md` covering port conflicts, migration failures, slow performance per quickstart.md Troubleshooting section
- [ ] T076 [P] Document environment variable customization in `README-DOCKER.md` with .env file creation instructions per quickstart.md Environment Configuration
- [ ] T077 [P] Add platform-specific notes to `README-DOCKER.md` (macOS VirtioFS, Windows WSL2, Linux native) per quickstart.md Performance Tips
- [ ] T078 [P] Document data persistence and backup procedures in `README-DOCKER.md` per quickstart.md Manage Data section
- [ ] T079 Update main project `README.md` with link to `README-DOCKER.md` and quick Docker setup instructions
- [ ] T080 [P] Validate `.env.docker.example` has all required variables with descriptions and security warnings per data-model.md Environment Variables sections
- [ ] T081 [P] Add comments to `docker-compose.yml` explaining key configurations (health checks, volumes, dependencies) for maintainability
- [ ] T082 Test documentation: follow `README-DOCKER.md` from fresh clone, verify all commands work as documented per quickstart.md validation

**Checkpoint**: Documentation complete - new developers can onboard and troubleshoot independently

---

## Phase 10: Final Validation & Polish

**Purpose**: End-to-end validation of all success criteria and cross-cutting improvements

- [ ] T083 Validate SC-001: Fresh checkout, run docker compose up, measure time to all services accessible, verify <3 minutes
- [ ] T084 Validate SC-002: Edit frontend file, measure time to browser update, verify <2 seconds
- [ ] T085 Validate SC-003: Edit backend file, measure time to server reload, verify <3 seconds
- [ ] T086 Validate SC-004: Create data, perform 10 consecutive restarts, verify no data loss
- [ ] T087 Validate SC-005: Run docker compose logs -f, verify timestamps and service identification
- [ ] T088 Validate SC-006: Run docker compose down -v, measure time, verify <30 seconds
- [ ] T089 Validate SC-007: Fresh checkout, verify zero manual steps required (no .env creation, no npm install, no DB setup)
- [ ] T090 [P] Test cross-platform: Verify on macOS, Linux, and Windows/WSL2 if possible per Assumptions A-001
- [ ] T091 [P] Test all edge cases: Network issues, disk space insufficient, Ctrl+C interruption, outdated node_modules per spec.md Edge Cases
- [ ] T092 [P] Performance validation: Measure actual startup times, hot-reload times, cleanup times per Technical Context Performance Goals
- [ ] T093 Review and optimize `.dockerignore` to exclude all unnecessary files (coverage reports, logs, temp files)
- [ ] T094 Security review: Verify all default passwords have warnings, verify no secrets in repository, verify .env files in .gitignore
- [ ] T095 [P] Code quality check: Ensure shell scripts are executable (chmod +x), YAML is valid, all paths are correct
- [ ] T096 [P] Create quickstart validation script to automate testing of key user journeys per quickstart.md scenarios
- [ ] T097 Final integration test: Complete user journey from fresh clone → start → develop (make changes) → view logs → stop → cleanup → start fresh
- [ ] T098 Update CLAUDE.md if needed with Docker-specific development workflow notes beyond what was auto-added

**Checkpoint**: All success criteria validated - feature complete and production-ready for local development

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Start Environment) - P1: No dependencies on other stories (MVP)
  - US2 (Stop/Cleanup) - P2: Independent, but logically follows US1
  - US3 (View Logs) - P2: Independent from US1/US2
  - US4 (Migrations) - P3: Built on top of US1 (migrations already run in entrypoint)
  - US5 (Data Persistence) - P3: Built on top of US1 (volumes already configured)
- **Port Conflict Detection (Phase 8)**: Can start after US1, enhances robustness
- **Documentation (Phase 9)**: Can start any time, should complete before final validation
- **Final Validation (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation → US1 (MVP complete!)
- **User Story 2 (P2)**: Foundation → US2 (independent of US1, but builds on same infra)
- **User Story 3 (P2)**: Foundation → US3 (fully independent)
- **User Story 4 (P3)**: Foundation + US1 → US4 (leverages entrypoint from US1)
- **User Story 5 (P3)**: Foundation + US1 → US5 (leverages volumes from US1)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T003 can all run in parallel (different files)

**Phase 2 (Foundational)**:
- T004 (backend Dockerfile) and T005 (frontend Dockerfile) can run in parallel
- After T006 (docker-compose.yml created): T007, T008, T009 can be developed in parallel by different team members
- T010, T011 can run in parallel

**User Stories**:
- Once Foundational completes, **US1, US2, US3 can ALL start in parallel** (different files, independent features)
- US4 and US5 can start in parallel after US1 completes

**Within US1**:
- T012, T013, T018, T019, T020, T022 are all [P] and can run in parallel
- T024 (health endpoint) can run in parallel with entrypoint scripts

**Phase 8 (Port Detection)**:
- T065, T066 can run in parallel

**Phase 9 (Documentation)**:
- T073-T082 are nearly all [P] - documentation can be written in parallel

**Phase 10 (Validation)**:
- T090, T091, T092, T093, T094, T095, T096 can all run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch Dockerfile creation in parallel:
Task T004: "Create backend/Dockerfile with Node.js 20 Alpine..."
Task T005: "Create frontend/Dockerfile with Node.js 20 Alpine..."

# After docker-compose.yml exists, configure services in parallel:
Task T007: "Configure PostgreSQL service in docker-compose.yml..."
Task T008: "Add backend service configuration to docker-compose.yml..."
Task T009: "Add frontend service configuration to docker-compose.yml..."
```

## Parallel Example: User Story 1

```bash
# Launch entrypoint scripts and Dockerfiles together:
Task T012: "Create backend/docker-entrypoint.sh with wait-for-database..."
Task T018: "Create frontend/docker-entrypoint.sh with smart npm install..."

# Configure volume mounts in parallel:
Task T019: "Configure backend volume mounts in docker-compose.yml..."
Task T020: "Configure frontend volume mounts in docker-compose.yml..."

# Set environment variables in parallel:
Task T021: "Set backend environment variables in docker-compose.yml..."
Task T022: "Set frontend environment variables in docker-compose.yml..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) → ~15 minutes
2. Complete Phase 2: Foundational (T004-T011) → ~2-3 hours
3. Complete Phase 3: User Story 1 (T012-T028) → ~3-4 hours
4. **STOP and VALIDATE**: Test docker compose up from fresh clone
5. **MVP READY**: Developers can start full stack with one command

**Total MVP Time**: ~6-8 hours for experienced developer

### Incremental Delivery

1. **Week 1**: Setup + Foundational + US1 → MVP deployed
2. **Week 2**: Add US2 (Stop/Cleanup) + US3 (Logs) → Enhanced operations
3. **Week 3**: Add US4 (Migrations) + US5 (Data Persistence) → Complete feature set
4. **Week 4**: Port Detection + Documentation + Validation → Production-ready

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

1. **Developer A**: User Story 1 (Start Environment) - critical path
2. **Developer B**: User Story 2 (Stop/Cleanup) + User Story 3 (Logs) - operations
3. **Developer C**: Documentation + Port Detection - DevEx improvements

Then converge for US4, US5 and final validation.

---

## Task Summary

**Total Tasks**: 98
**Parallelizable Tasks**: 47 tasks marked [P] (~48%)

**Tasks per User Story**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 8 tasks (BLOCKS ALL STORIES)
- Phase 3 (US1 - Start Environment): 17 tasks - **MVP SCOPE**
- Phase 4 (US2 - Stop/Cleanup): 8 tasks
- Phase 5 (US3 - View Logs): 9 tasks
- Phase 6 (US4 - Migrations): 9 tasks
- Phase 7 (US5 - Data Persistence): 10 tasks
- Phase 8 (Port Detection): 8 tasks
- Phase 9 (Documentation): 10 tasks
- Phase 10 (Validation): 16 tasks

**Independent Test Criteria per Story**:
- **US1**: Run `docker compose up`, access all services in browser/API client
- **US2**: Start → Stop (verify <30s) → Clean (verify volumes gone) → Fresh start
- **US3**: Start → Trigger logs → View aggregated → View filtered → Verify clarity
- **US4**: Fresh DB → Auto migrations → Manual migrations → Verify schema
- **US5**: Create data → Restart 10x → Verify persistence → Backup/restore

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 28 tasks

---

## Notes

- All tasks follow strict checkbox format: `- [ ] [ID] [P?] [Story] Description`
- [P] tasks target different files with no blocking dependencies
- [Story] labels (US1-US5) map directly to spec.md user stories for traceability
- Each user story is independently completable and testable per specification requirements
- Tests are integrated into implementation tasks via validation steps (health checks, integration tests)
- File paths are absolute and match plan.md project structure
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Commit after each logical task group or user story completion
- Stop at any checkpoint to validate story independently before proceeding
