#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend-nextjs"

# Process IDs
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
  fi
  exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Function to start backend
start_backend() {
  echo -e "${BLUE}Starting Backend (port 3001)...${NC}"
  cd "$BACKEND_DIR"
  node app.js &
  BACKEND_PID=$!
  echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend
start_frontend() {
  echo -e "${BLUE}Starting Frontend (port 3000)...${NC}"
  cd "$FRONTEND_DIR"
  npm run dev &
  FRONTEND_PID=$!
  echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
}

# Function to check if process is alive
is_alive() {
  if ps -p $1 > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Function to restart both services
restart_services() {
  echo -e "\n${RED}⚠ Service died, restarting both...${NC}"
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
  fi
  sleep 2
  start_backend
  sleep 3
  start_frontend
}

# Main startup
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Easyvate Car Selling - Full Stack   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Kill any existing processes on ports 3000 and 3001
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# Start both services
start_backend
sleep 3
start_frontend

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Backend running at: http://localhost:3001${NC}"
echo -e "${GREEN}✓ Frontend running at: http://localhost:3000${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Monitor processes
while true; do
  sleep 5
  
  if ! is_alive $BACKEND_PID; then
    echo -e "${RED}✗ Backend crashed${NC}"
    restart_services
  elif ! is_alive $FRONTEND_PID; then
    echo -e "${RED}✗ Frontend crashed${NC}"
    restart_services
  fi
done
