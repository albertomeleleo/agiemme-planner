# Quick Start Guide: Personal Growth Planner

**Branch**: `001-personal-growth-planner` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This guide helps developers get the Personal Growth Planner application running locally for development and testing. It covers environment setup, database initialization, running tests, and starting the development servers.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v20 LTS or later ([nodejs.org](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **PostgreSQL**: v16 or later ([postgresql.org](https://www.postgresql.org/))
- **Git**: For version control
- **Code Editor**: VS Code recommended (with ESLint, Prettier extensions)

## Technology Stack Summary

This application uses:

- **Frontend**: React 18.2+ with TypeScript, Vite, Chakra UI, FullCalendar
- **Backend**: Node.js 20 LTS with Express 4.x, TypeScript
- **Database**: PostgreSQL 16
- **Testing**: Vitest (unit/integration), Playwright (E2E), axe-core (accessibility)
- **Email**: Nodemailer with SMTP

For detailed technology stack decisions, see [research.md](./research.md).

---

## Initial Setup

### 1. Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd agiemme-planner

# Checkout feature branch
git checkout 001-personal-growth-planner

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database and user
CREATE DATABASE agiemme_planner_dev;
CREATE USER agiemme_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE agiemme_planner_dev TO agiemme_user;

# Exit psql
\q
```

#### Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# backend/.env

# Database
DATABASE_URL=postgresql://agiemme_user:your_secure_password@localhost:5432/agiemme_planner_dev
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=agiemme_planner_dev
DATABASE_USER=agiemme_user
DATABASE_PASSWORD=your_secure_password

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000/api/v1

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
EMAIL_FROM=Personal Growth Planner <noreply@agiemme-planner.com>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

Create `.env` file in `frontend/` directory:

```bash
# frontend/.env

# API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Environment
NODE_ENV=development
```

**Security Note**: Never commit `.env` files to version control. They are already in `.gitignore`.

#### Run Database Migrations

```bash
cd backend

# Run migrations to create database schema
npm run migrate:up

# Verify migrations succeeded
npm run migrate:status

# (Optional) Seed database with sample data for development
npm run seed
```

Expected output after migration:
- All entity tables created (User, Objective, KeyResult, ProgressUpdate, LearningPath, LearningResource, CalendarEvent)
- ENUM types created
- Indexes and constraints applied

---

## Development Workflow

### 1. Start Backend Server

```bash
cd backend

# Start development server with hot reload
npm run dev

# Server should start on http://localhost:3000
# API endpoints available at http://localhost:3000/api/v1
```

Expected console output:
```
[INFO] Database connected successfully
[INFO] Server listening on port 3000
[INFO] Environment: development
[INFO] API available at http://localhost:3000/api/v1
```

### 2. Start Frontend Server

In a new terminal:

```bash
cd frontend

# Start Vite development server with hot reload
npm run dev

# Frontend should start on http://localhost:5173
```

Expected console output:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open browser to [http://localhost:5173](http://localhost:5173) to view the application.

### 3. Verify Setup

**Backend Health Check**:
```bash
curl http://localhost:3000/api/v1/health
# Expected: {"status":"ok","timestamp":"2025-12-28T..."}
```

**Frontend**: Navigate to `http://localhost:5173` and verify:
- Landing page loads without errors
- Console shows no errors
- Registration form is accessible

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all unit tests
npm run test

# Run unit tests in watch mode (during development)
npm run test:watch

# Run integration tests
npm run test:integration

# Run contract tests (API spec validation)
npm run test:contract

# Run all tests with coverage report
npm run test:coverage
# Coverage report available at backend/coverage/index.html
```

**Expected Coverage Targets**:
- Unit tests: ≥80% code coverage
- All tests: <5s execution time for unit suite

### Frontend Tests

```bash
cd frontend

# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests (requires both backend and frontend running)
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run accessibility tests
npm run test:a11y

# Run all tests with coverage
npm run test:coverage
# Coverage report available at frontend/coverage/index.html
```

**Expected Coverage Targets**:
- Unit tests: ≥80% code coverage
- E2E tests: All P1 user stories (4 stories) covered
- Accessibility: axe-core tests passing (WCAG 2.1 Level AA)

### Run All Tests (CI Simulation)

```bash
# From repository root
npm run test:all

# This runs:
# 1. Backend linting & type checking
# 2. Backend unit + integration + contract tests
# 3. Frontend linting & type checking
# 4. Frontend unit tests
# 5. Frontend E2E tests
# 6. Accessibility tests
```

---

## Linting and Formatting

### Backend

```bash
cd backend

# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Prettier formatting
npm run format

# Type checking
npm run type-check
```

### Frontend

```bash
cd frontend

# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Prettier formatting
npm run format

# Type checking
npm run type-check
```

---

## Building for Production

### Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run build

# Output: backend/dist/

# Start production server
npm run start
```

### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Output: frontend/dist/

# Preview production build locally
npm run preview
```

**Production Performance Targets**:
- Frontend bundle: JS <200KB (gzipped), CSS <50KB (gzipped)
- Lighthouse CI score: ≥90
- Web Vitals: LCP ≤2.5s, FID ≤100ms, CLS ≤0.1, INP ≤200ms

---

## Common Development Tasks

### Add a New Database Migration

```bash
cd backend

# Create a new migration file
npm run migrate:create -- add_new_field_to_table

# Edit the generated migration file in backend/src/migrations/
# Run the migration
npm run migrate:up
```

### Reset Database (Caution: Deletes All Data)

```bash
cd backend

# Roll back all migrations
npm run migrate:down:all

# Re-run all migrations
npm run migrate:up

# Reseed with sample data
npm run seed
```

### Generate API Documentation

```bash
cd backend

# Generate Swagger UI documentation from OpenAPI spec
npm run docs:generate

# Serve documentation locally
npm run docs:serve
# Documentation available at http://localhost:8080
```

### Check Performance Budget

```bash
cd frontend

# Run Lighthouse CI
npm run lighthouse

# Check bundle size
npm run analyze
```

---

## Troubleshooting

### Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check connection details in `backend/.env`
3. Ensure database exists: `psql -U postgres -l | grep agiemme_planner_dev`

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
1. Find process using port: `lsof -ti:3000`
2. Kill process: `kill -9 <PID>`
3. Or change port in `backend/.env`: `PORT=3001`

### Frontend API Connection Errors

**Problem**: CORS errors or API calls failing

**Solution**:
1. Verify backend is running on correct port (3000)
2. Check `VITE_API_BASE_URL` in `frontend/.env` matches backend URL
3. Verify CORS configuration in backend allows `http://localhost:5173`

### Migration Failures

**Problem**: Migration fails with constraint violation

**Solution**:
1. Check migration SQL syntax
2. Ensure dependencies are migrated first (e.g., create table before adding foreign key)
3. Roll back failed migration: `npm run migrate:down`
4. Fix migration file
5. Re-run: `npm run migrate:up`

### Test Failures

**Problem**: Tests fail locally but should pass

**Solution**:
1. Ensure database is in clean state: `npm run test:db:reset`
2. Clear test cache: `npm run test:clear-cache`
3. Check environment variables in `.env.test` (if using separate test env)
4. Verify all dependencies installed: `npm install`

---

## Development Tools

### Recommended VS Code Extensions

- **ESLint**: Linting for TypeScript/JavaScript
- **Prettier**: Code formatting
- **Thunder Client** or **REST Client**: API testing
- **PostgreSQL**: Database management
- **GitLens**: Git integration
- **Error Lens**: Inline error highlighting
- **React Developer Tools**: React debugging (browser extension)
- **axe Accessibility Linter**: Accessibility checking

### Database GUI Tools

- **pgAdmin**: Full-featured PostgreSQL GUI
- **DBeaver**: Universal database tool
- **Postico** (macOS): Lightweight PostgreSQL client
- **TablePlus**: Modern database GUI

### API Testing

- **Swagger UI**: Auto-generated from OpenAPI spec (see `npm run docs:serve`)
- **Postman**: Import `specs/001-personal-growth-planner/contracts/openapi.yaml`
- **Insomnia**: REST client alternative

---

## Key File Locations

### Backend

- **Entry point**: `backend/src/index.ts`
- **API routes**: `backend/src/api/`
- **Models**: `backend/src/models/`
- **Services**: `backend/src/services/`
- **Migrations**: `backend/src/migrations/`
- **Tests**: `backend/tests/`

### Frontend

- **Entry point**: `frontend/src/main.tsx`
- **Pages**: `frontend/src/pages/`
- **Components**: `frontend/src/components/`
- **API client**: `frontend/src/services/api.ts`
- **Tests**: `frontend/tests/`

### Configuration

- **TypeScript**: `tsconfig.json` (backend & frontend)
- **ESLint**: `.eslintrc.js` (backend & frontend)
- **Prettier**: `.prettierrc.js` (root)
- **Vitest**: `vitest.config.ts` (backend & frontend)
- **Playwright**: `playwright.config.ts` (frontend)

---

## Next Steps After Setup

Once the application is running:

1. **Register a user**: Navigate to registration page and create an account
2. **Create your first objective**: Add an objective with 2-5 key results
3. **Create a learning path**: Define resources to support a key result
4. **Schedule learning time**: Add calendar events for study sessions
5. **Track progress**: Update key result progress and view dashboard

For implementation details, see:
- [plan.md](./plan.md): Implementation architecture
- [data-model.md](./data-model.md): Database schema
- [contracts/openapi.yaml](./contracts/openapi.yaml): API specification
- [research.md](./research.md): Technology decisions

---

## Getting Help

- **Feature Specification**: See [spec.md](./spec.md) for requirements and user stories
- **Architecture**: See [plan.md](./plan.md) for system design
- **API Docs**: Run `npm run docs:serve` in backend
- **Constitution**: See `.specify/memory/constitution.md` for quality standards
- **Report Issues**: Create issue in repository with detailed description and logs

---

## Performance Benchmarks

Expected performance for local development:

- **Backend API**:
  - Read operations: <50ms (local DB)
  - Write operations: <100ms (local DB)

- **Frontend**:
  - Hot reload: <200ms
  - Full page load: <1s (development mode)

- **Tests**:
  - Backend unit tests: <5s total
  - Frontend unit tests: <10s total
  - E2E tests: <2min total

Production performance targets are defined in [plan.md](./plan.md) Technical Context section.
