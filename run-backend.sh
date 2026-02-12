#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/backend"

echo -e "${YELLOW}Backend Server${NC}"
echo "===================="

# Check if vendor exists
if [ ! -d "vendor" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    composer install
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📄 Creating .env file...${NC}"
    cp .env.example .env
fi

# Generate key if APP_KEY is empty
if grep -q "APP_KEY=$" ".env"; then
    echo -e "${YELLOW}🔑 Generating APP_KEY...${NC}"
    KEY=$(openssl rand -base64 32)
    sed -i "s/APP_KEY=$/APP_KEY=base64:$KEY/" .env
fi

# Start PHP dev server
echo -e "${YELLOW}🚀 Starting backend on http://localhost:8000${NC}"
cd public
php -S localhost:8000
