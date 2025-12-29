# Data Model: Docker Compose Service Configuration

**Feature**: `001-docker-compose`
**Date**: 2025-12-29

This document defines the structure and schema of all Docker Compose services, volumes, networks, and environment variables for the Agiemme Planner development environment.

---

## Service Definitions

### 1. PostgreSQL Database Service

**Service Name**: `postgres`
**Container Name**: `agiemme-planner-db`
**Image**: `postgres:16-alpine`

#### Configuration Schema

```yaml
Service: postgres
├── Image: postgres:16-alpine
├── Container Name: agiemme-planner-db
├── Environment Variables:
│   ├── POSTGRES_DB: string (database name)
│   ├── POSTGRES_USER: string (database user)
│   ├── POSTGRES_PASSWORD: string (database password)
│   └── POSTGRES_INITDB_ARGS: string (initialization arguments)
├── Ports:
│   └── 5432:5432 (host:container mapping)
├── Volumes:
│   └── postgres_data:/var/lib/postgresql/data (named volume)
├── Health Check:
│   ├── Test: pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
│   ├── Interval: 5s
│   ├── Timeout: 5s
│   ├── Retries: 5
│   └── Start Period: 10s
├── Restart Policy: unless-stopped
└── Network: agiemme-network
```

#### Environment Variables

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `POSTGRES_DB` | string | `agiemme_planner_dev` | Yes | Database name |
| `POSTGRES_USER` | string | `agiemme_user` | Yes | Database user |
| `POSTGRES_PASSWORD` | string | `dev_password_change_in_production` | Yes | Database password (⚠️ security-critical) |
| `POSTGRES_INITDB_ARGS` | string | `--encoding=UTF8 --locale=en_US.UTF-8` | No | Database initialization arguments |

#### Volume Mounts

| Volume Name | Mount Point | Type | Purpose |
|-------------|-------------|------|---------|
| `postgres_data` | `/var/lib/postgresql/data` | Named Volume | Persistent database storage |

---

### 2. Backend API Service

**Service Name**: `backend`
**Container Name**: `agiemme-planner-backend`
**Build Context**: `./backend`

#### Configuration Schema

```yaml
Service: backend
├── Build:
│   ├── Context: ./backend
│   ├── Dockerfile: Dockerfile
│   └── Target: development (optional)
├── Container Name: agiemme-planner-backend
├── Environment Variables:
│   ├── Database Configuration (7 vars)
│   ├── Application Configuration (4 vars)
│   ├── Authentication Configuration (2 vars)
│   └── Development Configuration (2 vars)
├── Ports:
│   └── 3000:3000 (host:container mapping)
├── Volumes:
│   ├── ./backend:/app:cached (source code bind mount)
│   ├── backend_node_modules:/app/node_modules (dependencies)
│   └── backend_dist:/app/dist (build output)
├── Dependencies:
│   └── postgres:
│       └── condition: service_healthy
├── Health Check:
│   ├── Test: curl -f http://localhost:3000/api/health
│   ├── Interval: 10s
│   ├── Timeout: 5s
│   ├── Retries: 3
│   └── Start Period: 30s
├── Entrypoint: /app/docker-entrypoint.sh
├── Command: npm run dev
├── Restart Policy: unless-stopped
└── Network: agiemme-network
```

#### Environment Variables

| Variable | Type | Default | Required | Security Level | Description |
|----------|------|---------|----------|----------------|-------------|
| **Database Configuration** |
| `DATABASE_HOST` | string | `postgres` | Yes | Low | PostgreSQL host (service name) |
| `DATABASE_PORT` | number | `5432` | Yes | Low | PostgreSQL port |
| `DATABASE_NAME` | string | `agiemme_planner_dev` | Yes | Low | Database name |
| `DATABASE_USER` | string | `agiemme_user` | Yes | Low | Database user |
| `DATABASE_PASSWORD` | string | `dev_password_change_in_production` | Yes | ⚠️ **Critical** | Database password |
| `DATABASE_URL` | string | Auto-generated | No | Medium | Full connection string |
| **Application Configuration** |
| `NODE_ENV` | enum | `development` | Yes | Low | Environment mode |
| `PORT` | number | `3000` | Yes | Low | Server port |
| `FRONTEND_URL` | string | `http://localhost:5173` | Yes | Low | CORS whitelist URL |
| `LOG_LEVEL` | enum | `debug` | No | Low | Logging verbosity |
| **Authentication** |
| `JWT_SECRET` | string | `dev_jwt_secret_INSECURE_change_for_production` | Yes | ⚠️ **Critical** | JWT signing key |
| `JWT_EXPIRATION` | string | `7d` | Yes | Low | Token expiration time |
| **Development** |
| `CHOKIDAR_USEPOLLING` | boolean | `false` | No | Low | File watching mode |
| `WATCHPACK_POLLING` | boolean | `false` | No | Low | Webpack polling |

#### Volume Mounts

| Volume | Mount Point | Type | Mode | Purpose |
|--------|-------------|------|------|---------|
| `./backend` | `/app` | Bind Mount | `cached` | Source code (hot-reload) |
| `backend_node_modules` | `/app/node_modules` | Named Volume | - | Node dependencies (performance) |
| `backend_dist` | `/app/dist` | Named Volume | - | TypeScript build output |

---

### 3. Frontend Service

**Service Name**: `frontend`
**Container Name**: `agiemme-planner-frontend`
**Build Context**: `./frontend`

#### Configuration Schema

```yaml
Service: frontend
├── Build:
│   ├── Context: ./frontend
│   ├── Dockerfile: Dockerfile
│   └── Target: development (optional)
├── Container Name: agiemme-planner-frontend
├── Environment Variables:
│   ├── VITE_API_BASE_URL: string
│   ├── NODE_ENV: string
│   ├── VITE_HMR_PORT: number
│   └── VITE_HMR_HOST: string
├── Ports:
│   └── 5173:5173 (host:container mapping)
├── Volumes:
│   ├── ./frontend:/app:cached (source code bind mount)
│   ├── frontend_node_modules:/app/node_modules (dependencies)
│   └── frontend_vite_cache:/app/node_modules/.vite (Vite cache)
├── Dependencies:
│   └── backend:
│       └── condition: service_started
├── Command: npm run dev -- --host 0.0.0.0
├── Restart Policy: unless-stopped
└── Network: agiemme-network
```

#### Environment Variables

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `VITE_API_BASE_URL` | string | `http://localhost:3000/api` | Yes | Backend API URL |
| `NODE_ENV` | enum | `development` | Yes | Environment mode |
| `VITE_HMR_PORT` | number | `5173` | No | Hot Module Replacement port |
| `VITE_HMR_HOST` | string | `localhost` | No | HMR WebSocket host |
| `CHOKIDAR_USEPOLLING` | boolean | `false` | No | File watching mode |

#### Volume Mounts

| Volume | Mount Point | Type | Mode | Purpose |
|--------|-------------|------|------|---------|
| `./frontend` | `/app` | Bind Mount | `cached` | Source code (hot-reload) |
| `frontend_node_modules` | `/app/node_modules` | Named Volume | - | Node dependencies (performance) |
| `frontend_vite_cache` | `/app/node_modules/.vite` | Named Volume | - | Vite dependency cache |

---

## Volume Definitions

### Named Volumes Schema

```yaml
Volumes:
├── postgres_data:
│   ├── Driver: local
│   ├── Driver Options: (none)
│   └── Labels:
│       ├── com.agiemme.description: "PostgreSQL data for Agiemme Planner"
│       └── com.agiemme.environment: "development"
├── backend_node_modules:
│   ├── Driver: local
│   ├── Driver Options: (none)
│   └── Labels:
│       └── com.agiemme.service: "backend"
├── frontend_node_modules:
│   ├── Driver: local
│   ├── Driver Options: (none)
│   └── Labels:
│       └── com.agiemme.service: "frontend"
├── backend_dist:
│   ├── Driver: local
│   └── Labels:
│       └── com.agiemme.service: "backend"
└── frontend_vite_cache:
    ├── Driver: local
    └── Labels:
        └── com.agiemme.service: "frontend"
```

### Volume Details

| Volume Name | Purpose | Persistence | Size (Typical) | Cleanup Impact |
|-------------|---------|-------------|----------------|----------------|
| `postgres_data` | Database files | Critical (user data) | 100-500 MB | ⚠️ **Data loss** |
| `backend_node_modules` | Backend dependencies | Restorable (npm ci) | 200-300 MB | ✓ Rebuild required |
| `frontend_node_modules` | Frontend dependencies | Restorable (npm ci) | 300-400 MB | ✓ Rebuild required |
| `backend_dist` | Build artifacts | Restorable (npm build) | 10-50 MB | ✓ Rebuild required |
| `frontend_vite_cache` | Vite pre-bundled deps | Restorable (auto-rebuild) | 50-100 MB | ✓ Slower first load |

---

## Network Definition

### Network Schema

```yaml
Networks:
└── agiemme-network:
    ├── Driver: bridge
    ├── Driver Options: (none)
    ├── IPAM:
    │   └── Config:
    │       └── Subnet: Auto-assigned by Docker
    └── Labels:
        └── com.agiemme.project: "agiemme-planner"
```

### Service Communication

| Source Service | Target Service | Protocol | Port | DNS Name |
|----------------|----------------|----------|------|----------|
| backend | postgres | TCP | 5432 | `postgres` |
| frontend | backend | HTTP | 3000 | `backend` |
| Host | frontend | HTTP | 5173 | `localhost:5173` |
| Host | backend | HTTP | 3000 | `localhost:3000` |
| Host | postgres | TCP | 5432 | `localhost:5432` |

---

## Service Dependency Graph

```
┌─────────────┐
│   Host      │
│  Developer  │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       v              v              v              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  Frontend   │ │   Backend   │ │  PostgreSQL │   │
│    :5173    │ │    :3000    │ │    :5432    │   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
       │              │              │              │
       │              │              │              │
       │       HTTP   │              │              │
       └─────────────>│              │              │
                      │              │              │
                      │       SQL    │              │
                      └─────────────>│              │
                                     │              │
                                     │              │
                      ┌──────────────┴─────────┐    │
                      │  Volumes               │    │
                      │  - postgres_data       │<───┘
                      │  - backend_node_modules│
                      │  - frontend_node_modules│
                      │  - backend_dist        │
                      │  - frontend_vite_cache │
                      └────────────────────────┘
```

### Startup Sequence

```
1. postgres (independent)
   ├── Health check starts after 10s
   ├── Becomes healthy after ~5-15s
   └── Status: HEALTHY

2. backend (depends_on: postgres.healthy)
   ├── Waits for postgres HEALTHY status
   ├── Entrypoint: Wait for pg_isready
   ├── Entrypoint: Run npm install (if needed)
   ├── Entrypoint: Run migrations
   ├── Start: npm run dev
   ├── Health check starts after 30s
   └── Status: HEALTHY

3. frontend (depends_on: backend.started)
   ├── Waits for backend container START (not healthy)
   ├── Entrypoint: Run npm install (if needed)
   ├── Start: npm run dev -- --host 0.0.0.0
   └── Status: RUNNING
```

---

## Health Check Specifications

### PostgreSQL Health Check

```yaml
Health Check:
  Command: pg_isready -U agiemme_user -d agiemme_planner_dev
  Interval: 5 seconds
  Timeout: 5 seconds
  Retries: 5
  Start Period: 10 seconds

Expected Behavior:
  - Grace period: 10 seconds (PostgreSQL initialization)
  - Max attempts: 5 retries
  - Max wait time: 10s + (5 × 5s) = 35 seconds
  - Success: Exit code 0 (database accepting connections)
  - Failure: Exit code 1 (connection refused)
```

### Backend Health Check

```yaml
Health Check:
  Command: curl -f http://localhost:3000/api/health || exit 1
  Interval: 10 seconds
  Timeout: 5 seconds
  Retries: 3
  Start Period: 30 seconds

Expected Behavior:
  - Grace period: 30 seconds (migrations + app startup)
  - Max attempts: 3 retries
  - Max wait time: 30s + (3 × 10s) = 60 seconds
  - Success: HTTP 200 response from /api/health
  - Failure: Connection refused or non-200 status
```

### Health Endpoint Contract

```typescript
// Expected response from GET /api/health
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;  // ISO 8601 format
  database: 'connected' | 'disconnected';
  error?: string;  // Only present if unhealthy
}

// Example healthy response
{
  "status": "healthy",
  "timestamp": "2025-12-29T10:30:00.000Z",
  "database": "connected"
}

// Example unhealthy response
{
  "status": "unhealthy",
  "timestamp": "2025-12-29T10:30:00.000Z",
  "database": "disconnected",
  "error": "Connection pool exhausted"
}
```

---

## Environment Variable Precedence

Docker Compose resolves environment variables in this order (highest to lowest priority):

1. **Compose CLI environment variables**: `docker compose --env-file .env.production up`
2. **Shell environment variables**: `export JWT_SECRET=xyz && docker compose up`
3. **`.env` file** (in project root)
4. **`env_file` directive** in docker-compose.yml
5. **`environment` section** in docker-compose.yml (our defaults)
6. **Dockerfile ENV** (lowest priority)

For development, we use **#5** (inline defaults) to achieve zero-configuration setup.

---

## Data Persistence Strategy

### Volume Lifecycle

| Scenario | Command | postgres_data | node_modules | Behavior |
|----------|---------|---------------|--------------|----------|
| Normal start | `docker compose up` | Reused | Reused | Data persists |
| Normal stop | `docker compose down` | **Preserved** | **Preserved** | Data safe |
| Clean restart | `docker compose down -v` | **Deleted** | **Deleted** | Fresh start |
| Container removal | `docker compose rm` | **Preserved** | **Preserved** | Data safe |
| Volume prune | `docker volume prune` | **Risk if unused** | **Risk if unused** | Check first |

### Backup Strategy

```bash
# Full volume backup (tar archive)
docker run --rm \
  -v postgres_data:/source:ro \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/db-$(date +%Y%m%d).tar.gz -C /source .

# Database-level backup (SQL dump - RECOMMENDED)
docker compose exec postgres pg_dump \
  -U agiemme_user \
  -d agiemme_planner_dev \
  --clean --if-exists \
  > backups/agiemme-$(date +%Y%m%d).sql

# Restore from SQL dump
docker compose exec -T postgres psql \
  -U agiemme_user \
  -d agiemme_planner_dev \
  < backups/agiemme-20251229.sql
```

---

## Summary

This data model defines:
- **3 services**: postgres, backend, frontend
- **5 named volumes**: postgres_data, backend_node_modules, frontend_node_modules, backend_dist, frontend_vite_cache
- **1 network**: agiemme-network (bridge)
- **15 backend environment variables** (7 database, 4 app, 2 auth, 2 dev)
- **5 frontend environment variables**
- **2 health checks**: postgres (pg_isready), backend (HTTP endpoint)
- **Service dependencies**: backend → postgres (healthy), frontend → backend (started)

All configurations support **zero-manual-configuration startup** (SC-007) while maintaining **data persistence** (SC-004) and **hot-reload performance** (SC-002, SC-003).
