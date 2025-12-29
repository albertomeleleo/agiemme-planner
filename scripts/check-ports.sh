#!/usr/bin/env bash
set -e

# Port Conflict Detection Script for Agiemme Planner
# Purpose: Check if required ports are available before starting Docker Compose
# Reference: research.md section 3, spec.md Edge Cases

# Required ports for Agiemme Planner
PORTS=(3000 5173 5432)
PORT_NAMES=("Backend API" "Frontend Dev Server" "PostgreSQL")
OCCUPIED_PORTS=()

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
# Returns 0 if port is in use, 1 if free
check_port() {
    local port=$1
    local os=$(uname -s)
    
    case "$os" in
        Darwin)
            # macOS: use lsof
            lsof -iTCP:$port -sTCP:LISTEN -t >/dev/null 2>&1
            ;;
        Linux)
            # Linux: try ss first, fall back to netstat
            if command -v ss >/dev/null 2>&1; then
                ss -ln | grep -q ":$port "
            elif command -v netstat >/dev/null 2>&1; then
                netstat -ln | grep -q ":$port "
            else
                echo "❌ Error: Neither 'ss' nor 'netstat' command found"
                exit 1
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            # Windows (Git Bash, MSYS2, Cygwin)
            netstat -ano | grep -q ":$port.*LISTENING"
            ;;
        *)
            echo "❌ Unsupported operating system: $os"
            exit 1
            ;;
    esac
}

# Function to get process info for an occupied port
get_process_info() {
    local port=$1
    local os=$(uname -s)
    
    case "$os" in
        Darwin)
            lsof -iTCP:$port -sTCP:LISTEN -P | tail -n +2
            ;;
        Linux)
            if command -v ss >/dev/null 2>&1; then
                ss -ltnp | grep ":$port "
            else
                netstat -ltnp 2>/dev/null | grep ":$port " || echo "  Unable to determine process (may need sudo)"
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            netstat -ano | grep ":$port.*LISTENING"
            ;;
    esac
}

echo "🔍 Checking port availability for Agiemme Planner..."
echo ""

# Check each required port
for i in "${!PORTS[@]}"; do
    port="${PORTS[$i]}"
    name="${PORT_NAMES[$i]}"
    
    if check_port $port; then
        echo -e "${RED}❌ Port $port${NC} ($name) is ${RED}OCCUPIED${NC}"
        OCCUPIED_PORTS+=($port)
        
        echo "   Process details:"
        get_process_info $port | sed 's/^/   /'
        echo ""
    else
        echo -e "${GREEN}✓${NC}  Port $port ($name) is available"
    fi
done

echo ""

# If any ports are occupied, provide remediation instructions
if [ ${#OCCUPIED_PORTS[@]} -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}ERROR: Cannot start Docker Compose - ports are occupied${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "The following ports are required but currently in use:"
    for port in "${OCCUPIED_PORTS[@]}"; do
        echo "  • Port $port"
    done
    echo ""
    echo -e "${YELLOW}Remediation steps:${NC}"
    echo ""
    echo "1. Identify the process using the port (shown above)"
    echo "2. Stop the process using one of these methods:"
    echo ""
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   ${YELLOW}macOS:${NC}"
        echo "   # Find the PID from the output above, then:"
        echo "   kill <PID>           # Graceful stop"
        echo "   kill -9 <PID>        # Force stop if needed"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   ${YELLOW}Linux:${NC}"
        echo "   # Find the PID from the output above, then:"
        echo "   kill <PID>           # Graceful stop"
        echo "   kill -9 <PID>        # Force stop if needed"
        echo "   sudo kill <PID>      # If permission denied"
    else
        echo "   ${YELLOW}Windows:${NC}"
        echo "   # Find the PID from the output above, then:"
        echo "   taskkill /PID <PID>  # Stop process"
        echo "   taskkill /F /PID <PID>  # Force stop if needed"
    fi
    
    echo ""
    echo "3. Run this script again to verify ports are free"
    echo "4. Start Docker Compose: ${GREEN}docker compose up${NC}"
    echo ""
    
    exit 1
else
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All required ports are available!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "You can now start Docker Compose:"
    echo "  ${GREEN}docker compose up${NC}"
    echo ""
    exit 0
fi
