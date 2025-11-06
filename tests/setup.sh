#!/bin/bash

# Voice Practice E2E Tests - Setup Script
# 
# This script sets up the environment for running E2E tests

set -e

echo "🚀 Setting up Voice Practice E2E Test Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps chromium

# Create test-results directory
mkdir -p test-results
mkdir -p tests/integration

# Set up environment variables
if [ ! -f ".env.test" ]; then
    echo "📝 Creating .env.test file..."
    cat > .env.test << EOF
# E2E Test Environment Variables
E2E_BASE_URL=http://localhost:5173
E2E_API_URL=http://localhost:3001
NODE_ENV=test
VITE_API_URL=http://localhost:3001
VITE_ELEVENLABS_API_KEY=test_key_123
VITE_USE_ELEVENLABS=false
EOF
    echo "✅ Created .env.test file"
else
    echo "✅ .env.test file already exists"
fi

# Verify environment setup
echo ""
echo "🔍 Verifying setup..."
echo "  - Node.js: ✅"
echo "  - Dependencies: ✅"
echo "  - Playwright: ✅"
echo "  - Test directory: ✅"
echo ""
echo "✅ Setup complete! Run 'npm run test:e2e' to start tests."
echo ""

