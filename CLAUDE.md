# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal Growth Planner (Agiemme Planner) is a full-stack TypeScript application for managing personal growth through OKRs (Objectives and Key Results). The project uses a monorepo structure with separate backend (Express + PostgreSQL) and frontend (React + Vite) applications.

## Development Commands

### Backend (from `backend/` directory)
```bash
npm run dev              # Start dev server with hot reload (port 3000)
npm run type-check       # TypeScript type checking (strict mode)
npm test                 # Run all tests with Vitest
npm run migrate:up       # Run pending database migrations
npm run migrate:down     # Rollback last migration
npm run migrate:status   # Show migration status
```

### Frontend (from `frontend/` directory)
```bash
npm run dev              # Start dev server with Vite (port 5173)
npm run type-check       # TypeScript type checking (strict mode)
npm test                 # Run unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:a11y        # Run accessibility tests with axe-core
```

### Database Setup (First Time)
```sql
CREATE DATABASE agiemme_planner_dev;
CREATE USER agiemme_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agiemme_planner_dev TO agiemme_user;
```

Then run migrations: `cd backend && npm run migrate:up`

## Architecture

### Three-Layer Backend Architecture

1. **Models Layer** (`backend/src/models/`)
   - Direct database interaction using pg (node-postgres)
   - Pure data access functions (CRUD operations)
   - Returns mapped TypeScript types
   - Example: `findObjectiveById()`, `createUser()`

2. **Services Layer** (`backend/src/services/`)
   - Business logic and validation
   - Orchestrates multiple model operations
   - Enforces domain rules (e.g., 2-5 key results per objective)
   - Example: `createObjectiveWithKeyResults()` validates count, creates objective, then creates key results

3. **Routes Layer** (`backend/src/api/routes/`)
   - HTTP request/response handling
   - Input validation and sanitization
   - Authentication/authorization checks
   - Calls service layer functions

### Critical Business Rule: OKR Constraint

**Every objective MUST have exactly 2-5 key results** (enforced in `backend/src/services/objective-service.ts:37-42`). This is validated at:
- Creation time in service layer
- Deletion time (prevents deleting if count would drop below 2)
- Referenced in code comments as "FR-002" and "data-model.md"

### Database Triggers & Auto-Updates

The database has intelligent triggers that auto-update fields:

1. **Key Result Status** (`backend/src/migrations/005_create_key_results_table.sql:59-89`)
   - Automatically sets status based on progress and deadline
   - `completed`: when current_value >= target_value
   - `at_risk`: when deadline < 14 days AND completion < 50%
   - `in_progress`: when current_value > 0 (and not at risk)
   - Trigger fires on INSERT/UPDATE

2. **Progress Updates → Key Result** (`backend/src/migrations/006_create_progress_updates_table.sql`)
   - When you create a progress update, it automatically updates the parent key result's `current_value`
   - This then triggers the status update (above)
   - Chain: ProgressUpdate INSERT → KeyResult UPDATE → Status recalculation

3. **Objective Auto-Completion** (`backend/src/services/objective-service.ts:151-162`)
   - Application-level logic (not DB trigger)
   - Called after progress updates
   - Sets objective to 'completed' when ALL key results are completed

### Authentication Flow

1. **Registration/Login**: Returns JWT token stored in `localStorage` as 'auth_token'
2. **API Requests**: Axios interceptor (`frontend/src/services/api.ts:21-32`) auto-attaches token to `Authorization: Bearer <token>` header
3. **Backend Validation**: `requireAuth` middleware (`backend/src/api/middleware/auth.ts`) verifies token, attaches user to `req.user`
4. **Unauthorized**: 401 responses auto-redirect to `/login` via response interceptor

### Frontend Route Protection

Protected routes use `<ProtectedRoute>` wrapper in `App.tsx` that checks `isAuthenticated()` (presence of token in localStorage). Unauthenticated users are redirected to `/login`.

### Error Handling Pattern

Backend uses centralized error handling with `createError()` helper:
```typescript
throw createError('Message', statusCode, 'ERROR_CODE');
```

All errors flow through `errorHandler` middleware which:
- Logs full error details server-side
- Returns user-friendly JSON response
- Includes error details only in development mode

### API URL Configuration

- Backend base URL: Controlled by `VITE_API_BASE_URL` env var
- Default: `http://localhost:3000/api/v1` (note: `/api/v1` in URL but routes use `/api/` prefix)
- **Important**: The API currently uses `/api/` prefix, NOT `/api/v1/`. Update `frontend/src/services/api.ts:9` if changing this.

## Code Quality Standards

- **TypeScript Strict Mode**: Enforced in both frontend and backend
- **ESLint**: Cyclomatic complexity ≤10 per function
- **Test Coverage**: 80% minimum required
- **Performance**: Database queries >200ms are logged as warnings (`backend/src/lib/database.ts:60`)
- **Accessibility**: WCAG 2.1 Level AA compliance (Chakra UI provides baseline)

## Migration Strategy

Migrations are sequential SQL files in `backend/src/migrations/`:
- Naming: `001_description.sql`, `002_description.sql`, etc.
- Run by custom script: `backend/src/scripts/migrate.ts`
- Tracks applied migrations in `migrations` table
- Always use transactions (automatic in migration runner)

## Frontend State Management

No global state management library (Redux/MobX) is used. State is managed via:
- React local state (`useState`)
- API calls return fresh data
- Token stored in `localStorage` only

## Path Aliases

Backend uses TypeScript path aliases in `tsconfig.json`:
- `@/*` → `./src/*`
- `@models/*` → `./src/models/*`
- `@services/*` → `./src/services/*`

Frontend uses Vite configuration for path resolution.

## Testing Approach

- **Backend**: Vitest for unit/integration tests
- **Frontend**: Vitest for components, Playwright for E2E
- **Accessibility**: axe-core for automated a11y testing
- **Coverage**: Must maintain 80% minimum (constitutional requirement)

## Environment Variables

### Backend `.env`
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=agiemme_planner_dev
DATABASE_USER=agiemme_user
DATABASE_PASSWORD=your_password
JWT_SECRET=your_random_secret_key
JWT_EXPIRATION=7d
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend
- `VITE_API_BASE_URL`: Backend API base URL (defaults to `http://localhost:3000/api/v1`)

## Common Issues

### "Invalid key results count" Error
This means an objective doesn't have 2-5 key results. The constraint is enforced at creation and deletion. You cannot delete a key result if it would leave the objective with fewer than 2.

### Token Expired/401 Errors
JWT tokens expire based on `JWT_EXPIRATION` setting (default 7d). Frontend auto-redirects to login on 401. Token is stored in localStorage with key 'auth_token'.

### Migration Conflicts
If migrations fail, check `migrations` table in database to see what's been applied. You may need to manually rollback or fix the migration SQL before retrying.

### TypeScript "Property does not exist on ImportMeta"
Make sure `frontend/src/vite-env.d.ts` exists with Vite type definitions.

## Active Technologies
- TypeScript (Node.js 20+), YAML (Docker Compose file format 3.8) + Docker Engine 24+, Docker Compose V2, existing package.json dependencies (Express, React, Vite, PostgreSQL client) (001-docker-compose)
- PostgreSQL 16 (official Docker image), Docker named volumes for persistence (001-docker-compose)

## Recent Changes
- 001-docker-compose: Added TypeScript (Node.js 20+), YAML (Docker Compose file format 3.8) + Docker Engine 24+, Docker Compose V2, existing package.json dependencies (Express, React, Vite, PostgreSQL client)
