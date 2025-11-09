# Social Cue Project Backups

This directory contains backup archives of the Social Cue project at key development milestones.

## Available Backups

### Pre-Voice-Chatbot (Week 12 Start)
- **File**: `social-cue-backup-pre-voice-chatbot-20251025.zip`
- **Size**: 358K
- **Date**: October 25, 2025
- **Version**: v0.2.0
- **Features**: Core MVP, AI-Powered Adaptive Learning, Progress tracking, Goals generation

## Restoration Instructions

### Quick Restore
```bash
cd backups
./restore.sh
```

### Manual Restore
```bash
# Extract backup
unzip social-cue-backup-pre-voice-chatbot-20251025.zip -d ../social-cue-restored/

# Install dependencies
cd ../social-cue-restored
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Backup Contents

Each backup includes:
- ✅ All source code (`src/`)
- ✅ Configuration files
- ✅ Documentation
- ✅ Package dependencies list
- ✅ Test files and utilities

Excludes:
- ❌ `node_modules/` (restore with `npm install`)
- ❌ `.git/` (use git repository)
- ❌ Build artifacts (`dist/`, `build/`)
- ❌ Environment files (`.env*`)

## Development History

- **Weeks 1-4**: Core MVP Prototype
- **Weeks 5-7**: AI-Powered Adaptive Learning
- **Week 8**: Deployment & Beta Testing
- **Week 11**: Teacher Portal
- **Week 12**: Live AI Voice Chatbot ← Current

## Git Information

- **Current Branch**: `main`
- **Last Commit**: `617de6c feat: Add auto-goal generation after practice sessions`
- **Backup Branch**: `backup-pre-voice-chatbot`
- **Feature Branch**: `feature/week-12-voice-chatbot`
