#!/bin/sh
set -e

# Frontend Docker Entrypoint Script
# Purpose: Install dependencies if needed, start Vite dev server
# Reference: research.md section 7 (node modules caching)

echo "🎨 Agiemme Planner Frontend - Starting..."

# ==============================================================================
# Smart Dependency Installation (research.md section 7)
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
  echo "📦 Dependencies changed, running npm ci..."
  npm ci
  touch "$MARKER_FILE"
  echo "✅ Dependencies installed successfully"
else
  echo "✅ Dependencies up to date, skipping npm install"
fi

# ==============================================================================
# Start Vite Development Server
# ==============================================================================

echo ""
echo "🚀 Starting Vite development server..."
echo "   - Frontend available at: http://localhost:${VITE_HMR_PORT:-5173}"
echo "   - Hot Module Replacement (HMR) enabled"
echo ""

# Execute the command passed to the entrypoint (default: npm run dev -- --host 0.0.0.0)
exec "$@"
