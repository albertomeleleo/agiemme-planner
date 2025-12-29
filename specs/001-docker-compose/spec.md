# Feature Specification: Docker Compose Local Infrastructure

**Feature Branch**: `001-docker-compose`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "Genera un dockercompose che permetta di avviare in locale tutta l'infrastruttura"

## Clarifications

### Session 2025-12-29

- Q: How should the system behave when one or more required ports (3000, 5173, 5432) are already occupied? → A: Fail immediately with error message listing occupied ports and instructions to free them
- Q: When one service fails to start while others succeed, what should happen to the already-running services? → A: Stop all services and display the failure (clean failure state)
- Q: How should the system handle missing or invalid environment variables? → A: Use sensible defaults for all variables with validation warnings for critical security values

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Complete Development Environment (Priority: P1)

A developer wants to start the entire application stack (database, backend, frontend) with a single command without manually configuring environment variables or installing dependencies on their local machine.

**Why this priority**: This is the most critical functionality as it enables developers to quickly set up and run the application. This is the minimum viable product that delivers immediate value by eliminating complex manual setup steps.

**Independent Test**: Can be fully tested by running a single command and verifying that all services are accessible (database accepts connections, backend API responds, frontend UI loads). Success is verified by accessing the frontend URL in a browser and confirming the application is functional.

**Acceptance Scenarios**:

1. **Given** a fresh checkout of the repository with no local configuration, **When** the developer runs the startup command, **Then** all three services (PostgreSQL, backend, frontend) start successfully and are accessible within 2 minutes
2. **Given** the development environment is running, **When** the developer makes a code change to the backend, **Then** the backend service automatically reloads with the new changes without requiring a full restart
3. **Given** the development environment is running, **When** the developer makes a code change to the frontend, **Then** the frontend service automatically reloads with the new changes and the browser refreshes

---

### User Story 2 - Stop and Clean Up Environment (Priority: P2)

A developer wants to completely stop all running services and optionally clean up all data (database volumes, node_modules, build artifacts) to return to a clean state or free up system resources.

**Why this priority**: Essential for managing resources and troubleshooting, but secondary to the ability to start the environment. This can be tested independently after P1 is working.

**Independent Test**: Can be fully tested by first starting the environment (P1), then running the cleanup command and verifying that all containers are stopped, volumes are removed (if specified), and no ports are in use.

**Acceptance Scenarios**:

1. **Given** a running development environment, **When** the developer runs the stop command, **Then** all containers stop gracefully within 30 seconds and ports are released
2. **Given** a stopped development environment, **When** the developer runs the cleanup command with volume removal flag, **Then** all database data is removed and the next startup begins with a fresh database
3. **Given** a running development environment, **When** the developer runs the cleanup command without stopping services, **Then** the system prompts to stop services first or stops them automatically before cleanup

---

### User Story 3 - View Service Logs (Priority: P2)

A developer wants to view real-time logs from all services or a specific service to debug issues or monitor application behavior during development.

**Why this priority**: Critical for debugging but can be tested independently from the start/stop functionality. Developers can still work with the application without this feature by accessing container logs manually.

**Independent Test**: Can be fully tested by starting the environment, triggering actions that generate logs (API calls, page loads, database queries), and verifying that logs are displayed correctly and can be filtered by service.

**Acceptance Scenarios**:

1. **Given** a running development environment, **When** the developer requests to view all logs, **Then** interleaved logs from all services are displayed with service name prefixes and timestamps
2. **Given** a running development environment, **When** the developer requests to view only backend logs, **Then** only logs from the backend service are displayed in real-time
3. **Given** a running development environment experiencing errors, **When** the developer views logs, **Then** error messages are clearly visible with stack traces and relevant context

---

### User Story 4 - Run Database Migrations (Priority: P3)

A developer wants to run database migrations against the containerized database to set up the schema or apply updates without accessing the database directly.

**Why this priority**: Important for a complete development workflow but can be tested independently. Developers can work with an existing database state while this feature is being implemented.

**Independent Test**: Can be fully tested by starting the environment with a fresh database, running the migration command, and verifying that all tables and triggers are created correctly by querying the database schema.

**Acceptance Scenarios**:

1. **Given** a fresh database with no tables, **When** the developer runs the migration command, **Then** all migration scripts execute in order and the database schema is fully set up
2. **Given** a database with partial migrations applied, **When** the developer runs the migration command, **Then** only pending migrations are executed and the migration status shows all migrations as applied
3. **Given** a failed migration, **When** the developer views migration status, **Then** the system clearly indicates which migration failed and provides error details

---

### User Story 5 - Persist Data Between Restarts (Priority: P3)

A developer wants database data to persist between container restarts so they don't lose test data, user accounts, or OKRs when stopping and restarting the development environment.

**Why this priority**: Improves developer experience but is not critical for initial setup. Developers can recreate test data as needed while this feature is being implemented.

**Independent Test**: Can be fully tested by starting the environment, creating test data (users, objectives, key results), stopping the environment, restarting it, and verifying that all data is still accessible.

**Acceptance Scenarios**:

1. **Given** a running environment with test data in the database, **When** the developer stops and restarts the environment without cleanup, **Then** all previously created data is available
2. **Given** multiple environment restarts over several days, **When** the developer accesses the application, **Then** data accumulates correctly and remains consistent
3. **Given** a need to start fresh, **When** the developer explicitly requests to remove volumes, **Then** the next startup begins with an empty database

---

### Edge Cases

- **Port conflicts**: When required ports (3000, 5173, 5432) are already in use, startup fails immediately with an error message listing which ports are occupied and instructions to free them before retrying
- **Partial service failures**: When one service fails to start (e.g., database starts but backend fails), all successfully started services are stopped automatically, and the system displays the failure in a clean state with error details
- **Missing or invalid environment variables**: The system uses sensible defaults for all configuration variables (database credentials, JWT secret, ports, etc.) to enable zero-configuration startup, but displays validation warnings for security-critical values (e.g., default JWT_SECRET, default database passwords) that should be changed for non-local environments
- How does the system handle network issues preventing image downloads?
- What happens when disk space is insufficient for Docker volumes?
- How does the system handle interruption during startup (Ctrl+C during initialization)?
- What happens when dependencies in package.json change and node_modules is cached in volumes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single command to start all services (PostgreSQL database, Express backend, React frontend) simultaneously
- **FR-002**: System MUST automatically execute database migrations on backend startup to ensure schema is up-to-date
- **FR-003**: System MUST enable hot-reload for both frontend and backend code changes during development
- **FR-004**: System MUST persist database data in a named Docker volume that survives container restarts
- **FR-005**: System MUST expose services on standard development ports (PostgreSQL: 5432, Backend: 3000, Frontend: 5173)
- **FR-005a**: System MUST detect port conflicts before starting services and fail with a clear error message listing occupied ports and remediation instructions
- **FR-005b**: System MUST stop all successfully started services when any service fails during startup, returning to a clean failure state with error details displayed
- **FR-006**: System MUST configure backend service to wait for database readiness before starting
- **FR-007**: System MUST provide environment variable configuration for all services without requiring manual .env file creation
- **FR-007a**: System MUST use sensible defaults for all environment variables (database credentials, JWT secret, API URLs, ports) to enable zero-configuration startup
- **FR-007b**: System MUST display validation warnings during startup when security-critical values use default configurations (e.g., default JWT_SECRET, default database passwords)
- **FR-008**: System MUST include a command to stop all services gracefully
- **FR-009**: System MUST include a command to remove all containers, volumes, and networks for complete cleanup
- **FR-010**: System MUST provide a command to view aggregated logs from all services or filter logs by specific service
- **FR-011**: System MUST mount local source code directories into containers to enable development without rebuilding images
- **FR-012**: System MUST install Node.js dependencies automatically on container startup if node_modules is missing or outdated
- **FR-013**: System MUST use official PostgreSQL image version compatible with the application (PostgreSQL 15 or 16)
- **FR-014**: System MUST use Node.js version 20 or higher as specified in package.json engines
- **FR-015**: System MUST configure CORS to allow frontend service to communicate with backend service

### Key Entities *(include if feature involves data)*

- **Docker Compose Configuration**: Defines all services, their relationships, ports, volumes, and environment variables
- **PostgreSQL Service**: Database service running in a container with persistent volume for data storage
- **Backend Service**: Express API service running in a container with hot-reload enabled and environment configured
- **Frontend Service**: React/Vite development server running in a container with hot-reload enabled
- **Persistent Volume**: Named Docker volume for PostgreSQL data that persists between container lifecycle operations
- **Network**: Docker network that allows services to communicate using service names as hostnames

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can start the complete application stack from a fresh repository checkout in under 3 minutes using a single command
- **SC-002**: Code changes to frontend files are reflected in the browser within 2 seconds without manual refresh
- **SC-003**: Code changes to backend files trigger automatic service reload within 3 seconds
- **SC-004**: Database data persists across 10 consecutive environment restarts without data loss
- **SC-005**: Developers can view real-time logs from all services with timestamps and clear service identification
- **SC-006**: Complete environment cleanup (stop + remove volumes) completes in under 30 seconds
- **SC-007**: Zero manual configuration steps are required to start the application (no manual .env creation, no dependency installation, no database setup)

## Assumptions

- **A-001**: Developers have Docker and Docker Compose installed on their local machines
- **A-002**: Developers have sufficient disk space for Docker images and volumes (minimum 5GB free)
- **A-003**: Required ports (3000, 5173, 5432) are available and not used by other applications
- **A-004**: Developers have basic familiarity with Docker commands (docker compose up, down, logs)
- **A-005**: The application's existing migration scripts are compatible with containerized PostgreSQL
- **A-006**: JWT_SECRET and other sensitive configuration can use default values for local development
- **A-007**: Email SMTP configuration is optional for local development (features requiring email can be tested later)
- **A-008**: Docker Compose V2 (docker compose) is used, not the deprecated V1 (docker-compose)

## Out of Scope

- **OS-001**: Production Docker configuration (production-grade Dockerfile, security hardening, multi-stage builds)
- **OS-002**: Kubernetes or other orchestration platform configurations
- **OS-003**: CI/CD pipeline integration with Docker builds
- **OS-004**: Docker image optimization for size or build speed
- **OS-005**: Monitoring or observability tools (Prometheus, Grafana, etc.)
- **OS-006**: Automated database backups or restore procedures
- **OS-007**: SSL/TLS certificate configuration for local HTTPS
- **OS-008**: Multi-environment support (staging, QA, production configurations)
- **OS-009**: Windows-specific Docker Desktop configuration or WSL2 setup instructions
- **OS-010**: Performance tuning for resource-constrained development machines
