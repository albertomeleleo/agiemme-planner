# Docker Development Environment - Agiemme Planner

Complete guide for running Agiemme Planner in Docker containers for local development.

**Quick Start**: `npm run docker:up` → Access http://localhost:5173

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Common Commands](#common-commands)
- [Development Workflow](#development-workflow)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Data Management](#data-management)
- [Platform-Specific Notes](#platform-specific-notes)

---

## Prerequisites

Before starting, ensure you have the following installed:

| Requirement | Minimum Version | Check Command | Installation |
|-------------|----------------|---------------|--------------|
| **Docker Engine** | 24.0+ | `docker --version` | [Install Docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | V2 (2.0+) | `docker compose version` | Included with Docker Desktop |
| **Git** | 2.0+ | `git --version` | [Install Git](https://git-scm.com/downloads) |

**Platform Support**:
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)
- ✅ Windows (WSL2 required)

**System Requirements**:
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space
- Ports 3000, 5173, 5432 available

---

## Quick Start

Get the entire stack running in 3 steps:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agiemme-planner
```

### 2. Start the Environment

```bash
npm run docker:up
```

That's it! The command will:
- ✅ Check if required ports (3000, 5173, 5432) are available
- ✅ Pull Docker images (first time only)
- ✅ Install dependencies automatically
- ✅ Run database migrations
- ✅ Start all services with hot-reload enabled

**First Run**: ~90-120 seconds (downloads images + installs dependencies)  
**Subsequent Runs**: ~5-10 seconds

### 3. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:3000/api | REST API endpoints |
| **API Health** | http://localhost:3000/api/health | Health check endpoint |
| **PostgreSQL** | localhost:5432 | Database (credentials below) |

**Default Database Credentials** (development only):
- Host: `localhost`
- Port: `5432`
- Database: `agiemme_planner_dev`
- User: `agiemme_user`
- Password: `dev_password_change_in_production`

---

## Common Commands

### Start Services

```bash
# Start in foreground (see logs in terminal)
npm run docker:up

# Start in background (detached mode)
npm run docker:up:d

# Start with rebuild (after Dockerfile changes)
npm run docker:up:build

# Check port availability before starting
npm run docker:check-ports
```

### Stop Services

```bash
# Stop services (keeps data)
npm run docker:down

# Stop and remove all data (fresh start)
npm run docker:clean:volumes

# Complete cleanup (volumes + orphaned containers)
npm run docker:clean:all
```

### View Logs

```bash
# All services, follow mode
npm run docker:logs:follow

# Specific service
npm run docker:logs:backend
npm run docker:logs:frontend
npm run docker:logs:db

# Last 100 lines from all services
docker compose logs --tail=100

# Logs since specific time
docker compose logs --since 2h
```

### Database Migrations

```bash
# Check migration status
npm run docker:migrate:status

# Run pending migrations (usually automatic on startup)
npm run docker:migrate:up

# Rollback last migration
npm run docker:migrate:down
```

### Container Management

```bash
# View running containers
npm run docker:ps

# Restart all services
npm run docker:restart

# Restart specific service
npm run docker:restart:backend
npm run docker:restart:frontend

# Execute commands in containers
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev
```

---

## Development Workflow

### Making Code Changes

**Frontend** (React/TypeScript):
1. Edit files in `frontend/src/`
2. Changes auto-reload in browser within **<2 seconds**
3. No manual refresh needed (Vite HMR)

**Backend** (Express/TypeScript):
1. Edit files in `backend/src/`
2. Server auto-restarts within **<3 seconds**
3. Check logs: `npm run docker:logs:backend`

### Adding Dependencies

**Option 1: Automatic (Recommended)**
1. Edit `package.json` or `package-lock.json` in backend/ or frontend/
2. Restart the service: `npm run docker:restart:backend`
3. Entrypoint script auto-runs `npm ci`

**Option 2: Manual**
```bash
# Install new package in backend
docker compose exec backend npm install <package-name>

# Install new package in frontend
docker compose exec frontend npm install <package-name>
```

### Running Tests

```bash
# Backend tests
docker compose exec backend npm test

# Frontend tests
docker compose exec frontend npm test

# E2E tests (frontend)
docker compose exec frontend npm run test:e2e

# With coverage
docker compose exec backend npm test -- --coverage
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev

# Run SQL query
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev -c "SELECT * FROM users;"

# Check database size
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev -c "\l+"

# List all tables
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev -c "\dt"
```

---

## Environment Configuration

### Default Configuration

All services come with sensible defaults for local development. **No `.env` file is required** to get started.

### Customizing Configuration

If you need to override defaults:

1. **Create `.env` file** in project root:
   ```bash
   cp .env.docker.example .env
   ```

2. **Edit `.env`** with your custom values:
   ```env
   # Example: Change database password
   DATABASE_PASSWORD=my_secure_password
   
   # Example: Change JWT secret
   JWT_SECRET=my_random_secret_key_here
   
   # Example: Change API port
   PORT=8080
   ```

3. **Restart services** to apply changes:
   ```bash
   npm run docker:down
   npm run docker:up
   ```

### Available Environment Variables

See `.env.docker.example` for the complete list of configurable variables.

**Most Common**:
- `DATABASE_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - Authentication secret key
- `JWT_EXPIRATION` - Token expiration time (default: 7d)
- `PORT` - Backend API port (default: 3000)
- `VITE_API_BASE_URL` - Frontend → Backend connection

### Security Warnings

You'll see warnings on startup for insecure defaults:

```
⚠️  SECURITY WARNING: Insecure Default Configuration
  • JWT_SECRET is using default value
  • DATABASE_PASSWORD is using default value
```

These are **informational only** and won't block startup. It's **safe to ignore** them for local development, but **NEVER use default secrets in production**.

---

## Troubleshooting

### Port Conflicts

**Error**: `Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use`

**Solution**:
```bash
# Check which ports are occupied
npm run docker:check-ports

# Find what's using the port (macOS/Linux)
lsof -i :3000

# Find what's using the port (Windows)
netstat -ano | findstr :3000

# Kill the process
kill <PID>           # macOS/Linux
taskkill /PID <PID>  # Windows
```

### Migrations Failing

**Error**: `ERROR: Migrations failed with exit code 1`

**Solution**:
```bash
# View detailed error
npm run docker:logs:backend

# Check migration status
npm run docker:migrate:status

# Fix the migration file in backend/src/migrations/
# Then restart
npm run docker:restart:backend
```

### Slow Performance (macOS/Windows)

**Symptoms**: File changes take >5 seconds to trigger reload

**Solutions**:
1. Ensure Docker Desktop is using:
   - **macOS**: VirtioFS file sharing (Docker Desktop → Settings → General)
   - **Windows**: WSL2 backend (not Hyper-V)
2. Increase Docker resources:
   - Docker Desktop → Settings → Resources
   - Recommended: 4 CPUs, 8GB RAM
3. **Windows only**: Store project files inside WSL2 filesystem (`/home/user/projects`), not Windows drive (`/mnt/c/`)

### Database Connection Errors

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:
```bash
# Check if postgres is healthy
npm run docker:ps

# View postgres logs
npm run docker:logs:db

# Restart backend (waits for postgres health check)
npm run docker:restart:backend
```

### Changes Not Appearing

**Frontend not updating**:
```bash
# Clear Vite cache
docker compose exec frontend rm -rf node_modules/.vite
npm run docker:restart:frontend
```

**Backend not restarting**:
```bash
# Check if tsx watch is running
npm run docker:logs:backend | grep "tsx"

# Verify file watching is enabled
docker compose exec backend printenv | grep CHOKIDAR
# Should show: CHOKIDAR_USEPOLLING=false
```

### Complete Reset

If something is completely broken, start fresh:

```bash
# Nuclear option: remove everything and start over
npm run docker:clean:all

# Remove all Docker data (WARNING: affects ALL Docker projects)
docker system prune -a --volumes

# Rebuild from scratch
npm run docker:up:build
```

---

## Data Management

### Backup Database

```bash
# SQL dump backup (recommended)
npm run docker:backup

# Volume-level backup
npm run docker:backup:volume

# Backups are saved to: backups/agiemme_planner_YYYYMMDD_HHMMSS.sql
```

### Restore Database

```bash
# Restore from SQL dump
npm run docker:restore backups/agiemme_planner_20251229.sql

# Restore from volume tar
npm run docker:restore backups/postgres_volume_20251229.tar.gz
```

### Data Persistence

| Scenario | Command | Data Preserved? |
|----------|---------|-----------------|
| Stop services | `npm run docker:down` | ✅ Yes |
| Restart services | `npm run docker:restart` | ✅ Yes |
| Clean shutdown | `docker compose stop` | ✅ Yes |
| Remove containers | `docker compose rm` | ✅ Yes (volumes remain) |
| Clean with volumes | `npm run docker:clean:volumes` | ❌ No (fresh start) |

**Data Location**: All database data is stored in the `postgres_data` Docker volume. This persists across container restarts unless explicitly removed with `-v` flag.

### Managing Volumes

```bash
# List all volumes
docker volume ls

# Inspect postgres data volume
docker volume inspect agiemme-planner_postgres_data

# Check volume size
docker system df -v

# Remove unused volumes (BE CAREFUL!)
docker volume prune
```

---

## Platform-Specific Notes

### macOS

**Performance Optimization**:
- Docker Desktop 4.6+ uses VirtioFS by default (fast file sharing)
- Enable in: Docker Desktop → Settings → General → "VirtioFS"
- Recommended resources: 4 CPUs, 8GB RAM

**File Watching**:
- Native file watching works out of the box (CHOKIDAR_USEPOLLING=false)
- Hot-reload should be <2s for frontend, <3s for backend

### Linux

**Best Performance**:
- Native Docker Engine (not Docker Desktop) is fastest
- File watching and hot-reload work natively
- No special configuration needed

**Permissions**:
- If you encounter permission errors, add your user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### Windows (WSL2)

**Critical Setup**:
1. **Use WSL2** (not Hyper-V):
   - Docker Desktop → Settings → General → "Use WSL2 based engine"
2. **Store project in WSL2 filesystem**:
   - Clone inside WSL: `/home/username/projects/agiemme-planner`
   - **NOT** on Windows drive: `/mnt/c/Users/...` (10-50x slower!)

**Access from Windows**:
- WSL2 filesystem: `\\wsl$\Ubuntu\home\username\projects\`
- Services accessible at: localhost:5173, localhost:3000, localhost:5432

**Performance**:
- Properly configured WSL2 performs similar to Linux
- File watching works with `CHOKIDAR_USEPOLLING=false`

---

## Performance Tips

### Speeding Up First Run

```bash
# Pull images in advance
docker compose pull

# Pre-install dependencies (optional)
docker compose up -d postgres
docker compose run --rm backend npm ci
docker compose run --rm frontend npm ci
docker compose down
npm run docker:up
```

### Optimizing Development

1. **Keep containers running**: Use `npm run docker:up:d` to start in background
2. **Selective restarts**: Restart only changed service (`npm run docker:restart:backend`)
3. **Monitor resources**: Use `docker stats` to check CPU/memory usage
4. **Clean periodically**: Run `docker system prune` weekly to free disk space

---

## Next Steps

Now that your environment is running:

1. **Explore the API**: Visit http://localhost:3000/api/health
2. **Access the Frontend**: Open http://localhost:5173 in your browser
3. **Check the Database**: Connect with psql, DBeaver, TablePlus, or pgAdmin
4. **Review Architecture**: See main `README.md` and `CLAUDE.md` for codebase details
5. **Start Coding**: Make changes to `frontend/src` or `backend/src` and watch them reload!

---

## Getting Help

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Agiemme Planner Architecture**: See `CLAUDE.md`
- **Report Issues**: Create an issue in the repository
- **Quick Reference**: See [Cheat Sheet](#cheat-sheet) below

---

## Cheat Sheet

```bash
# Essential Commands
npm run docker:up                    # Start everything
npm run docker:up:d                  # Start in background
npm run docker:down                  # Stop everything (keep data)
npm run docker:clean:volumes         # Stop and delete all data
npm run docker:logs:follow           # View all logs
npm run docker:ps                    # List running services
docker compose exec backend sh       # Shell into backend
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev

# Data Management
npm run docker:backup                # Backup database
npm run docker:restore <file>        # Restore database
npm run docker:migrate:status        # Check migrations

# Development
npm run docker:restart:backend       # After package.json change
npm run docker:up:build              # After Dockerfile change
npm run docker:check-ports           # Check port availability

# Troubleshooting
npm run docker:logs:backend          # View backend logs
docker compose exec backend sh       # Debug inside backend container
docker system df                     # Check disk usage
docker system prune                  # Clean up Docker resources
```

---

**Happy Coding! 🚀**

All systems ready for hot-reload development with zero configuration.
