#!/bin/bash

# Voice Practice E2E Tests - Teardown Script
# 
# This script cleans up after E2E tests

set -e

echo "🧹 Cleaning up E2E Test Environment..."

# Stop any running servers
echo "🛑 Stopping test servers..."
pkill -f "vite" || true
pkill -f "node server.js" || true
sleep 2

# Clean up test artifacts (optional)
if [ "$1" == "--clean-artifacts" ]; then
    echo "🗑️  Removing test artifacts..."
    rm -rf test-results/
    rm -rf playwright-report/
    echo "✅ Test artifacts removed"
fi

# Clean up browser downloads (optional)
if [ "$1" == "--clean-browsers" ]; then
    echo "🗑️  Removing Playwright browsers..."
    npx playwright uninstall || true
    echo "✅ Browsers removed"
fi

echo "✅ Teardown complete!"

