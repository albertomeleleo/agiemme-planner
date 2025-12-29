#!/usr/bin/env bash
set -e

# Cleanup Script for Agiemme Planner Docker Environment  
# Purpose: Gracefully stop services and optionally clean up volumes
# Reference: spec.md User Story 2

echo "🧹 Agiemme Planner - Cleanup Script"
echo ""

# Default options
REMOVE_VOLUMES=false
REMOVE_ORPHANS=false
CONFIRM=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
    --all)
      REMOVE_VOLUMES=true
      REMOVE_ORPHANS=true
      shift
      ;;
    -y|--yes)
      CONFIRM=false
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -v, --volumes    Remove volumes (deletes all database data)"
      echo "  --all            Remove volumes and orphaned containers"
      echo "  -y, --yes        Skip confirmation prompts"
      echo "  -h, --help       Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                # Stop services, keep data"
      echo "  $0 -v             # Stop services and remove all data"
      echo "  $0 --all -y       # Complete cleanup without confirmation"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Check if containers are running
if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q .; then
  CONTAINERS_RUNNING=true
else
  CONTAINERS_RUNNING=false
fi

# Build docker compose command
COMPOSE_CMD="docker compose down"

if [ "$REMOVE_VOLUMES" = true ]; then
  COMPOSE_CMD="$COMPOSE_CMD -v"
fi

if [ "$REMOVE_ORPHANS" = true ]; then
  COMPOSE_CMD="$COMPOSE_CMD --remove-orphans"
fi

# Display what will happen
echo "This will perform the following actions:"
echo ""
if [ "$CONTAINERS_RUNNING" = true ]; then
  echo "  • Stop all running containers"
else
  echo "  • No running containers detected"
fi
echo "  • Remove stopped containers"
echo "  • Remove networks"

if [ "$REMOVE_VOLUMES" = true ]; then
  echo "  • ⚠️  DELETE ALL VOLUMES (database data will be lost!)"
fi

if [ "$REMOVE_ORPHANS" = true ]; then
  echo "  • Remove orphaned containers"
fi

echo ""

# Confirmation prompt
if [ "$CONFIRM" = true ]; then
  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠️  WARNING: This will delete all database data!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " response
    if [ "$response" != "yes" ]; then
      echo "Cleanup cancelled."
      exit 0
    fi
  else
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cleanup cancelled."
      exit 0
    fi
  fi
fi

# Execute cleanup
echo ""
echo "🔄 Running cleanup..."
echo "Command: $COMPOSE_CMD"
echo ""

if eval "$COMPOSE_CMD"; then
  echo ""
  echo "✅ Cleanup completed successfully!"
  
  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "   All data has been removed. Next startup will create fresh database."
  else
    echo "   Data has been preserved. Next startup will use existing database."
  fi
else
  echo ""
  echo "❌ Cleanup failed!"
  exit 1
fi
