#!/usr/bin/env bash
set -e

# Backup Script for Agiemme Planner Docker Environment
# Purpose: Backup database using pg_dump or volume tar
# Reference: data-model.md Backup Strategy

# Create backups directory if it doesn't exist
mkdir -p backups

# Default backup type
BACKUP_TYPE="sql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --volume)
      BACKUP_TYPE="volume"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --volume      Backup using volume tar (filesystem-level)"
      echo "  (default)     Backup using pg_dump (SQL dump - recommended)"
      echo "  -h, --help    Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                # SQL dump backup (recommended)"
      echo "  $0 --volume       # Volume tar backup"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Check if postgres container is running
if ! docker compose ps postgres | grep -q "Up"; then
  echo "❌ PostgreSQL container is not running!"
  echo "   Start it with: docker compose up -d postgres"
  exit 1
fi

if [ "$BACKUP_TYPE" = "sql" ]; then
  # SQL dump backup (recommended)
  BACKUP_FILE="backups/agiemme_planner_${TIMESTAMP}.sql"
  
  echo "💾 Creating SQL dump backup..."
  echo "   File: $BACKUP_FILE"
  echo ""
  
  docker compose exec -T postgres pg_dump \
    -U agiemme_user \
    -d agiemme_planner_dev \
    --clean --if-exists \
    > "$BACKUP_FILE"
  
  echo "✅ SQL backup completed successfully!"
  echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
  
else
  # Volume tar backup
  BACKUP_FILE="backups/postgres_volume_${TIMESTAMP}.tar.gz"
  
  echo "💾 Creating volume tar backup..."
  echo "   File: $BACKUP_FILE"
  echo ""
  
  docker run --rm \
    -v agiemme-planner_postgres_data:/source:ro \
    -v "$(pwd)/backups:/backup" \
    alpine tar czf "/backup/postgres_volume_${TIMESTAMP}.tar.gz" -C /source .
  
  echo "✅ Volume backup completed successfully!"
  echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
fi

echo ""
echo "📁 Backup saved to: $BACKUP_FILE"
echo "   Restore with: ./scripts/restore.sh $BACKUP_FILE"
