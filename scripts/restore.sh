#!/usr/bin/env bash
set -e

# Restore Script for Agiemme Planner Docker Environment
# Purpose: Restore database from pg_dump SQL or volume tar
# Reference: data-model.md Backup Strategy

# Check if backup file is provided
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <backup-file>"
  echo ""
  echo "Examples:"
  echo "  $0 backups/agiemme_planner_20251229.sql"
  echo "  $0 backups/postgres_volume_20251229.tar.gz"
  echo ""
  echo "Available backups:"
  if [ -d "backups" ] && [ "$(ls -A backups 2>/dev/null)" ]; then
    ls -lh backups/
  else
    echo "  No backups found in backups/ directory"
  fi
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Detect backup type
if [[ "$BACKUP_FILE" == *.sql ]]; then
  BACKUP_TYPE="sql"
elif [[ "$BACKUP_FILE" == *.tar.gz ]]; then
  BACKUP_TYPE="volume"
else
  echo "❌ Unknown backup file type: $BACKUP_FILE"
  echo "   Expected: .sql or .tar.gz"
  exit 1
fi

# Warning prompt
echo "⚠️  WARNING: This will replace all existing database data!"
echo "   Backup file: $BACKUP_FILE"
echo "   Type: $BACKUP_TYPE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " response
if [ "$response" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

if [ "$BACKUP_TYPE" = "sql" ]; then
  # SQL dump restore
  echo ""
  echo "📥 Restoring from SQL dump..."
  
  # Check if postgres is running
  if ! docker compose ps postgres | grep -q "Up"; then
    echo "   Starting PostgreSQL..."
    docker compose up -d postgres
    echo "   Waiting for PostgreSQL to be ready..."
    sleep 5
  fi
  
  docker compose exec -T postgres psql \
    -U agiemme_user \
    -d agiemme_planner_dev \
    < "$BACKUP_FILE"
  
  echo "✅ SQL restore completed successfully!"
  
else
  # Volume tar restore
  echo ""
  echo "📥 Restoring from volume tar..."
  echo "   This requires stopping containers and removing the volume."
  echo ""
  
  # Stop containers
  echo "   Stopping containers..."
  docker compose down
  
  # Remove existing volume
  echo "   Removing existing volume..."
  docker volume rm agiemme-planner_postgres_data 2>/dev/null || true
  
  # Create new volume
  echo "   Creating new volume..."
  docker volume create agiemme-planner_postgres_data
  
  # Restore data
  echo "   Restoring data..."
  docker run --rm \
    -v agiemme-planner_postgres_data:/target \
    -v "$(pwd)/$(dirname "$BACKUP_FILE"):/backup:ro" \
    alpine sh -c "cd /target && tar xzf /backup/$(basename "$BACKUP_FILE")"
  
  echo ""
  echo "✅ Volume restore completed successfully!"
  echo "   Start services with: docker compose up"
fi
