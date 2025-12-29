#!/bin/sh
set -e

# Backend Docker Entrypoint Script
# Purpose: Wait for database, install dependencies, run migrations, start dev server
# Reference: research.md sections 6 (migrations) and 7 (node modules caching)

echo "🚀 Agiemme Planner Backend - Starting..."

# ==============================================================================
# STEP 1: Security Validation Warnings (research.md section 4)
# ==============================================================================

echo ""
echo "🔒 Security Configuration Check..."

if [ "$JWT_SECRET" = "dev_jwt_secret_INSECURE_change_for_production" ]; then
  echo "⚠️  SECURITY WARNING: Insecure Default Configuration"
  echo "  • JWT_SECRET is using default value"
  echo ""
  echo "  This is OK for local development, but NEVER use these"
  echo "  defaults in production environments."
  echo ""
  sleep 2
fi

if [ "$DATABASE_PASSWORD" = "dev_password_change_in_production" ]; then
  echo "⚠️  SECURITY WARNING: Insecure Database Password"
  echo "  • DATABASE_PASSWORD is using default value"
  echo ""
  echo "  This is OK for local development, but NEVER use this"
  echo "  password in production environments."
  echo ""
  sleep 2
fi

# ==============================================================================
# STEP 2: Wait for PostgreSQL Readiness (research.md section 6)
# ==============================================================================

echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -q; do
  echo "   PostgreSQL is unavailable - sleeping..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# ==============================================================================
# STEP 3: Smart Dependency Installation (research.md section 7)
# ==============================================================================

MARKER_FILE="/app/node_modules/.package-lock-marker"

needs_install() {
  # No node_modules directory
  [ ! -d "/app/node_modules" ] && return 0
  
  # No marker file
  [ ! -f "$MARKER_FILE" ] && return 0
  
  # package-lock.json newer than marker
  [ "/app/package-lock.json" -nt "$MARKER_FILE" ] && return 0
  
  # package.json newer than marker
  [ "/app/package.json" -nt "$MARKER_FILE" ] && return 0
  
  return 1
}

if needs_install; then
  echo ""
  echo "📦 Dependencies changed, running npm ci..."
  npm ci
  touch "$MARKER_FILE"
  echo "✅ Dependencies installed successfully"
else
  echo ""
  echo "✅ Dependencies up to date, skipping npm install"
fi

# ==============================================================================
# STEP 4: Database Migrations (research.md section 6)
# ==============================================================================

echo ""
echo "🗄️  Running database migrations..."
if npm run migrate:up; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ ERROR: Migrations failed with exit code $?"
  echo ""
  echo "   Check the migration files in backend/src/migrations/"
  echo "   View logs: docker compose logs backend"
  echo "   Fix the issue and restart: docker compose restart backend"
  echo ""
  exit 1
fi

# ==============================================================================
# STEP 5: Start Application (research.md section 6)
# ==============================================================================

echo ""
echo "🎯 Starting backend development server..."
echo "   - API available at: http://localhost:${PORT:-3000}"
echo "   - Health check: http://localhost:${PORT:-3000}/api/health"
echo "   - Hot-reload enabled (tsx watch)"
echo ""

# Execute the command passed to the entrypoint (default: npm run dev)
exec "$@"
