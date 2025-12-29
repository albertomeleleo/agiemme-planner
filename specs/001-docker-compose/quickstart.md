# Quick Start Guide: Docker Compose Development Environment

**Feature**: `001-docker-compose`
**Last Updated**: 2025-12-29

This guide will get you up and running with the Agiemme Planner development environment in under 5 minutes.

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

---

## Quick Start (3 Steps)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agiemme-planner
```

### 2. Start the Environment

```bash
docker compose up
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
| **PostgreSQL** | localhost:5432 | Database (use psql or GUI client) |

---

## Common Commands

### Start Services

```bash
# Start in foreground (see logs in terminal)
docker compose up

# Start in background (detached mode)
docker compose up -d

# Start specific service only
docker compose up backend

# Rebuild images before starting (after Dockerfile changes)
docker compose up --build
```

### Stop Services

```bash
# Stop services (keeps data)
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v

# Stop specific service
docker compose stop backend
```

### View Logs

```bash
# All services, follow mode
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100

# Since specific time
docker compose logs --since 2h
```

### Execute Commands in Containers

```bash
# Open shell in backend container
docker compose exec backend sh

# Run npm command
docker compose exec backend npm run migrate:status

# Access PostgreSQL
docker compose exec postgres psql -U agiemme_user -d agiemme_planner_dev

# Check backend health
docker compose exec backend curl localhost:3000/api/health
```

### Manage Data

```bash
# Backup database
docker compose exec postgres pg_dump -U agiemme_user agiemme_planner_dev > backup.sql

# Restore database
docker compose exec -T postgres psql -U agiemme_user agiemme_planner_dev < backup.sql

# View volume info
docker volume ls
docker volume inspect agiemme-planner_postgres_data
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
3. Check logs: `docker compose logs -f backend`

### Adding Dependencies

**Option 1: Automatic (Recommended)**
1. Edit `package.json` or `package-lock.json`
2. Restart the service: `docker compose restart backend`
3. Entrypoint script auto-runs `npm ci`

**Option 2: Manual**
```bash
# Install new package
docker compose exec backend npm install <package-name>

# Or for frontend
docker compose exec frontend npm install <package-name>
```

### Running Database Migrations

Migrations run automatically on backend startup, but you can also run them manually:

```bash
# Check migration status
docker compose exec backend npm run migrate:status

# Run pending migrations
docker compose exec backend npm run migrate:up

# Rollback last migration
docker compose exec backend npm run migrate:down
```

### Running Tests

```bash
# Backend tests
docker compose exec backend npm test

# Frontend tests
docker compose exec frontend npm test

# E2E tests (frontend)
docker compose exec frontend npm run test:e2e
```

---

## Troubleshooting

### Port Conflicts

**Error**: `Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use`

**Solution**:
```bash
# Find what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill <PID>

# Or use the check-ports script
npm run docker:check-ports
```

### Migrations Failing

**Error**: `ERROR: Migrations failed with exit code 1`

**Solution**:
```bash
# View detailed error
docker compose logs backend

# Fix the migration file in backend/src/migrations/
# Then restart
docker compose restart backend
```

### Slow Performance on macOS/Windows

**Symptoms**: File changes take >5 seconds to trigger reload

**Solutions**:
1. Ensure you're using named volumes for `node_modules` (not bind mounts)
2. Check Docker Desktop settings: Resources → Increase CPUs/Memory
3. On Windows: Store project files inside WSL2 filesystem, not Windows drive

### Database Connection Errors

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:
```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Ensure backend waits for postgres health check (already configured)
# Restart backend
docker compose restart backend
```

### Changes Not Appearing

**Frontend not updating**:
```bash
# Clear Vite cache
docker compose exec frontend rm -rf node_modules/.vite
docker compose restart frontend
```

**Backend not restarting**:
```bash
# Check if tsx watch is running
docker compose logs backend | grep "tsx"

# Ensure CHOKIDAR_USEPOLLING is false
docker compose exec backend printenv | grep CHOKIDAR
```

### Complete Reset

If something is completely broken, start fresh:

```bash
# Nuclear option: remove everything and start over
docker compose down -v --remove-orphans
docker system prune -a  # Warning: removes ALL unused Docker data
docker compose up --build
```

---

## Environment Configuration

### Default Values

All services come with sensible defaults for local development. No `.env` file is required.

### Customizing Configuration

If you need to override defaults:

1. Create `.env` file in project root:
```bash
cp .env.docker.example .env
```

2. Edit `.env` with your values:
```env
JWT_SECRET=my_custom_secret
DATABASE_PASSWORD=my_custom_password
```

3. Restart services:
```bash
docker compose down
docker compose up
```

### Security Warnings

You'll see warnings on startup for insecure defaults:

```
⚠️  SECURITY WARNING: Insecure Default Configuration
  • JWT_SECRET is using default value
  • DATABASE_PASSWORD is using default value

This is OK for local development, but NEVER use these
defaults in production environments.
```

These are **informational only** and won't block startup. It's safe to ignore them for local development.

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
docker compose up
```

### Optimizing macOS/Windows Performance

1. **Use Docker Desktop's new features**:
   - Enable VirtioFS (macOS)
   - Use WSL2 backend (Windows)

2. **Increase resources**:
   - Docker Desktop → Settings → Resources
   - Recommended: 4 CPUs, 8GB RAM

3. **Store project in optimized location**:
   - macOS: Anywhere (VirtioFS handles it)
   - Windows: Inside WSL2 filesystem (`/home/user/projects`)

---

## Next Steps

Now that your environment is running:

1. **Explore the API**: Visit http://localhost:3000/api/health
2. **Access the Frontend**: Open http://localhost:5173 in your browser
3. **Check the Database**: Connect with psql or a GUI client (DBeaver, TablePlus, pgAdmin)
4. **Review Documentation**: See `README-DOCKER.md` for detailed information
5. **Start Coding**: Make changes to `frontend/src` or `backend/src` and watch them reload!

---

## Getting Help

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Agiemme Planner Docs**: See `CLAUDE.md` for architecture details
- **Report Issues**: Create an issue in the repository

---

## Cheat Sheet

```bash
# Essential commands
docker compose up -d              # Start everything in background
docker compose down               # Stop everything (keep data)
docker compose logs -f            # View all logs
docker compose ps                 # List running services
docker compose exec backend sh    # Shell into backend

# Data management
docker compose down -v            # Remove all data (fresh start)
docker volume ls                  # List volumes
docker system df                  # Check disk usage

# Development
npm run docker:check-ports        # Check port availability
docker compose restart backend    # Restart after package.json change
docker compose up --build         # Rebuild after Dockerfile change

# Troubleshooting
docker compose logs <service>     # View service logs
docker compose exec <service> sh  # Debug inside container
docker system prune               # Clean up Docker resources
```

---

**Happy Coding! 🚀**

All systems ready for hot-reload development with zero configuration.
