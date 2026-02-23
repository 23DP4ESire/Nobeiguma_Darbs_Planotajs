#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Starting Frontend & Backend Servers  ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

SCRIPT_DIR="$(dirname "$0")"

# Start backend in background
echo -e "${YELLOW}Starting Backend...${NC}"
bash "$SCRIPT_DIR/run-backend.sh" > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  Log: tail -f /tmp/backend.log"

# Small delay to let backend start
sleep 2

# Start frontend in background
echo -e "${YELLOW}Starting Frontend...${NC}"
bash "$SCRIPT_DIR/run-frontend.sh" > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "  Log: tail -f /tmp/frontend.log"

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Both servers running!${NC}"
echo ""
echo "Frontend: http://localhost:5173 (check log if different port)"
echo "Backend:  http://localhost:8000"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID  (backend)"
echo "  kill $FRONTEND_PID (frontend)"
echo "  Or: pkill -f 'php -S' && pkill -f 'vite'"
echo ""
echo "View logs:"
echo "  tail -f /tmp/backend.log"
echo "  tail -f /tmp/frontend.log"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
