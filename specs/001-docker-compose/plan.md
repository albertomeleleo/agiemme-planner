# Implementation Plan: Docker Compose Local Infrastructure

**Branch**: `001-docker-compose` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-docker-compose/spec.md`

## Summary

This feature implements a Docker Compose-based development environment that enables developers to start the entire Agiemme Planner infrastructure (PostgreSQL database, Express backend, React frontend) with a single command. The implementation uses service health checks with `depends_on: service_healthy` conditions, hybrid volume strategies (bind mounts for source code, named volumes for dependencies), and zero-configuration defaults with automatic dependency installation and database migration execution.

## Technical Context

**Language/Version**: TypeScript (Node.js 20+), YAML (Docker Compose file format 3.8)
**Primary Dependencies**: Docker Engine 24+, Docker Compose V2, existing package.json dependencies (Express, React, Vite, PostgreSQL client)
**Storage**: PostgreSQL 16 (official Docker image), Docker named volumes for persistence
**Testing**: Existing test frameworks (Vitest for backend/frontend, Playwright for E2E) - no new test infrastructure required
**Target Platform**: Cross-platform development (macOS, Linux, Windows/WSL2)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Environment starts in <3 minutes (SC-001), frontend hot-reload <2s (SC-002), backend hot-reload <3s (SC-003)
**Constraints**: Zero manual configuration required (SC-007), data persists across restarts (SC-004), cleanup in <30s (SC-006)
**Scale/Scope**: Local development environment for 1-10 concurrent developers, 3 services, 5 Docker volumes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality Standards** | ✅ PASS | Docker Compose YAML follows best practices; shell scripts will follow Bash style guide |
| **II. Testing Discipline** | ✅ PASS | Infrastructure testing via contract validation (SC-001 through SC-007); Docker healthchecks serve as automated tests |
| **III. UX Consistency** | ⚠️ N/A | Infrastructure feature - no UI components |
| **IV. Accessibility (WCAG 2.1 AA)** | ⚠️ N/A | Infrastructure feature - no user-facing UI |
| **V. Web Vitals Performance** | ⚠️ N/A | Infrastructure feature - no frontend performance impact |
| **VI. Performance Requirements** | ✅ PASS | Success criteria define explicit performance targets (startup time, hot-reload latency, cleanup time) |

**Gate Result**: ✅ PASSED - All applicable principles satisfied

### Post-Design Check (After Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality Standards** | ✅ PASS | docker-compose.yml uses explicit health checks, proper dependencies, and clear naming; entrypoint scripts follow single-responsibility principle |
| **II. Testing Discipline** | ✅ PASS | Contract tests defined in contracts/compose-schema.yml; validation criteria map to success criteria; healthchecks provide automated verification |
| **VI. Performance Requirements** | ✅ PASS | Hybrid volume strategy (research.md section 2) achieves hot-reload targets; named volumes for node_modules eliminate sync overhead |

**Gate Result**: ✅ PASSED - Design maintains constitution compliance

## Project Structure

### Documentation (this feature)

```text
specs/001-docker-compose/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - 7 research topics resolved
├── data-model.md        # Phase 1 output - Service schemas, volumes, networks
├── quickstart.md        # Phase 1 output - Developer onboarding guide
├── contracts/
│   └── compose-schema.yml  # Phase 1 output - Service contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

This feature adds Docker infrastructure to the existing web application:

```text
# Project Root (Docker Compose files)
./
├── docker-compose.yml           # Main compose configuration (3 services)
├── .dockerignore                # Exclude node_modules, dist, .env*
├── .env.docker.example          # Template for optional overrides
└── scripts/
    └── check-ports.sh           # Cross-platform port conflict detection

# Backend (existing structure + Docker additions)
backend/
├── Dockerfile                   # Multi-stage build (development target)
├── docker-entrypoint.sh         # Startup script (wait-for-db, npm install, migrations)
├── src/                         # Existing application code
│   ├── models/
│   ├── services/
│   ├── api/
│   └── migrations/              # Existing migration scripts (reused)
└── tests/                       # Existing tests

# Frontend (existing structure + Docker additions)
frontend/
├── Dockerfile                   # Multi-stage build (development target)
├── docker-entrypoint.sh         # Startup script (npm install, Vite dev server)
├── src/                         # Existing application code
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/                       # Existing tests
```

**Structure Decision**: Web application structure (Option 2). Docker files are added at the root level for orchestration and within each service directory (backend/, frontend/) for containerization. This maintains the existing monorepo structure while adding containerization capabilities.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution checks passed.

## Phase 0: Research (COMPLETED ✅)

**Status**: All 7 research topics resolved in `research.md`

### Research Topics Addressed

1. **Docker Compose Service Orchestration** (research.md section 1)
   - Decision: `depends_on` with `service_healthy` condition
   - Postgres health check: `pg_isready -U user -d db` every 5s, 5 retries
   - Backend depends on postgres.healthy

2. **Hot-Reload in Containers** (research.md section 2)
   - Decision: Hybrid volume strategy
   - Bind mounts for source code (`:cached` flag)
   - Named volumes for node_modules (10-50x faster)

3. **Port Conflict Detection** (research.md section 3)
   - Decision: Pre-flight shell script
   - Cross-platform (lsof/ss/netstat)
   - Clear error messages with remediation

4. **Environment Variable Defaults** (research.md section 4)
   - Decision: Inline `environment` section in docker-compose.yml
   - Zero-configuration with sensible defaults
   - Startup warnings for insecure defaults (non-blocking)

5. **Database Volume Management** (research.md section 5)
   - Decision: Named Docker volume `postgres_data`
   - Cross-platform performance
   - Clear lifecycle (down vs down -v)

6. **Migration Automation** (research.md section 6)
   - Decision: Entrypoint script pattern
   - Wait for database readiness (pg_isready)
   - Run existing migration scripts (npm run migrate:up)
   - Fail-fast on migration errors

7. **Node Modules Caching** (research.md section 7)
   - Decision: Smart installation with timestamp detection
   - Named volumes for node_modules
   - Entrypoint checks package.json/package-lock.json timestamps
   - Auto-runs npm ci only when needed

### Key Findings

- **Performance**: Hybrid volumes achieve <2s frontend hot-reload, <3s backend hot-reload
- **Reliability**: Health checks prevent backend from starting before database is ready
- **Developer Experience**: Zero configuration required, automatic dependency management
- **Cross-platform**: Works on macOS, Linux, Windows/WSL2 with same configuration

## Phase 1: Design & Contracts (COMPLETED ✅)

**Status**: All design artifacts created

### Artifacts Created

1. **data-model.md** - Complete service schemas
   - 3 service definitions (postgres, backend, frontend)
   - 5 named volumes with purposes and cleanup impact
   - Environment variable schemas (15 backend vars, 5 frontend vars)
   - Health check specifications
   - Service dependency graph and startup sequence

2. **contracts/compose-schema.yml** - Service contracts
   - Service contracts for each component
   - Integration contracts (frontend→backend, backend→database)
   - Validation rules (startup order, port availability, environment security)
   - Failure modes and recovery procedures
   - Success criteria mapping

3. **quickstart.md** - Developer onboarding
   - Prerequisites checklist (Docker Engine 24+, Docker Compose V2)
   - Quick start (3 steps: clone, `docker compose up`, access)
   - Common commands (start, stop, logs, migrations, exec)
   - Development workflow (code changes, dependencies, migrations)
   - Comprehensive troubleshooting section
   - Platform-specific performance tips

### Data Model Summary

**Services**:
- `postgres`: PostgreSQL 16 Alpine, port 5432, health check via pg_isready
- `backend`: Node.js 20 Alpine, port 3000, depends on postgres.healthy
- `frontend`: Node.js 20 Alpine, port 5173, depends on backend.started

**Volumes**:
- `postgres_data`: Database files (critical persistence)
- `backend_node_modules`: Backend dependencies (restorable)
- `frontend_node_modules`: Frontend dependencies (restorable)
- `backend_dist`: Build artifacts (restorable)
- `frontend_vite_cache`: Vite pre-bundled deps (restorable)

**Network**: `agiemme-network` (bridge driver)

### Contract Validation

All success criteria (SC-001 through SC-007) validated as achievable:
- SC-001: Startup <3 minutes ✓ (60-90s first time, 5-10s subsequent)
- SC-002: Frontend hot-reload <2s ✓ (bind mount + Vite HMR)
- SC-003: Backend hot-reload <3s ✓ (bind mount + tsx watch)
- SC-004: Data persistence ✓ (named volume for postgres_data)
- SC-005: Real-time logs ✓ (docker compose logs -f)
- SC-006: Cleanup <30s ✓ (docker compose down -v)
- SC-007: Zero configuration ✓ (environment defaults + auto npm install)

## Phase 2: Implementation Tasks

**Status**: Tasks generated in `tasks.md` by `/speckit.tasks` command

- **Total Tasks**: 98
- **Parallelizable**: 47 tasks (~48%)
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 = 28 tasks (User Story 1)
- **Organization**: Tasks grouped by user story (US1-US5) for independent implementation

See [tasks.md](./tasks.md) for complete task breakdown.

## Next Steps

1. ✅ **Specification** - Created via `/speckit.specify`
2. ✅ **Clarification** - Resolved via `/speckit.clarify`
3. ✅ **Planning** - This document (Phase 0 research + Phase 1 design completed)
4. ✅ **Task Generation** - Created via `/speckit.tasks`
5. **Implementation** - Begin executing tasks from tasks.md (ready to start)
6. **Validation** - Verify all success criteria after MVP completion

## Notes

- All research findings are documented in `research.md` with concrete implementation recommendations
- Design artifacts (data-model.md, contracts/, quickstart.md) are complete and ready for implementation
- Agent context file (CLAUDE.md) has been updated with Docker technologies
- No constitutional violations or complexity justifications needed
- Feature can be implemented incrementally by user story (MVP = User Story 1)

---

**Plan Status**: ✅ COMPLETE
**Ready for Implementation**: Yes
**Blocking Issues**: None
