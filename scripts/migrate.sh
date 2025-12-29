#!/usr/bin/env bash
set -e

# Migration Script for Agiemme Planner Docker Environment
# Purpose: Manually run database migrations
# Reference: spec.md User Story 4

# Default command
COMMAND=""

# Parse command line arguments
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 {up|down|status}"
  echo ""
  echo "Commands:"
  echo "  up        Run all pending migrations"
  echo "  down      Rollback the last migration"
  echo "  status    Show migration status"
  echo ""
  echo "Examples:"
  echo "  $0 up       # Apply pending migrations"
  echo "  $0 down     # Rollback last migration"
  echo "  $0 status   # Check migration state"
  exit 1
fi

COMMAND="$1"

# Validate command
case "$COMMAND" in
  up|down|status)
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Use one of: up, down, status"
    exit 1
    ;;
esac

# Check if backend container is running
if ! docker compose ps backend | grep -q "Up"; then
  echo "❌ Backend container is not running!"
  echo "   Start it with: docker compose up -d backend"
  exit 1
fi

# Execute migration command
echo "🗄️  Running database migration: $COMMAND"
echo ""

docker compose exec backend npm run migrate:$COMMAND
