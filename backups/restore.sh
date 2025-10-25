#!/bin/bash
echo "Restoring Social Cue backup..."

# Find latest backup
LATEST_BACKUP=$(ls -t social-cue-backup-*.zip | head -1)

echo "Found backup: $LATEST_BACKUP"
echo "Extracting..."

# Create restore directory
mkdir -p ../social-cue-restored

# Extract
unzip "$LATEST_BACKUP" -d ../social-cue-restored/

echo "Installing dependencies..."
cd ../social-cue-restored
npm install

echo "Restore complete!"
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Configure environment variables"
echo "3. Run: npm run dev"
