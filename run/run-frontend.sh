#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project root (2 levels up from script location)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT/frontend"

echo -e "${YELLOW}Frontend Server${NC}"
echo "===================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW} Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo " Installation failed"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Start dev server
echo -e "${YELLOW} Starting frontend dev server...${NC}"
npm run dev
