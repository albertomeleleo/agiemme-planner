#!/usr/bin/env bash
set -e

# Logs Script for Agiemme Planner Docker Environment
# Purpose: View logs from Docker Compose services
# Reference: spec.md User Story 3

# Default options
SERVICE=""
FOLLOW=false
TAIL=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--follow)
      FOLLOW=true
      shift
      ;;
    --tail)
      TAIL="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS] [SERVICE]"
      echo ""
      echo "Services:"
      echo "  postgres          PostgreSQL database logs"
      echo "  backend           Backend API logs"
      echo "  frontend          Frontend dev server logs"
      echo "  (none)            All services (default)"
      echo ""
      echo "Options:"
      echo "  -f, --follow      Follow log output (real-time)"
      echo "  --tail N          Show last N lines (default: all)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                    # All logs"
      echo "  $0 -f                 # Follow all logs"
      echo "  $0 backend            # Backend logs only"
      echo "  $0 -f backend         # Follow backend logs"
      echo "  $0 --tail 100         # Last 100 lines from all services"
      exit 0
      ;;
    postgres|backend|frontend)
      SERVICE="$1"
      shift
      ;;
    *)
      echo "Unknown service or option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Build docker compose logs command
LOGS_CMD="docker compose logs"

if [ "$FOLLOW" = true ]; then
  LOGS_CMD="$LOGS_CMD -f"
fi

if [ -n "$TAIL" ]; then
  LOGS_CMD="$LOGS_CMD --tail=$TAIL"
fi

if [ -n "$SERVICE" ]; then
  LOGS_CMD="$LOGS_CMD $SERVICE"
fi

# Execute logs command
echo "📋 Viewing logs..."
echo "Command: $LOGS_CMD"
echo ""
echo "Press Ctrl+C to exit"
echo ""

exec $LOGS_CMD
