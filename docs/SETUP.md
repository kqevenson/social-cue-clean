# Setup Guide

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- Anthropic Claude API key
- ElevenLabs API key (optional, falls back to browser TTS)

## API Keys Setup

### Claude API Key
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Generate a new key
5. Copy the key
6. Create a `.env` file in the project root
7. Add the key: `VITE_CLAUDE_API_KEY=your_key_here`

### ElevenLabs API Key (Optional)
1. Go to https://elevenlabs.io/
2. Sign up for an account (free tier available)
3. Go to Profile → API Keys
4. Copy your key
5. Add to `.env` as `VITE_ELEVENLABS_API_KEY=your_key_here`

**Note**: Without ElevenLabs, the app will use the browser's built-in Web Speech API for text-to-speech.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kqevenson/social-cue-clean.git
cd social-cue-clean
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```bash
touch .env
```

4. Add your API keys to `.env`:
```env
VITE_CLAUDE_API_KEY=your_claude_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```

5. Start the development server:
```bash
npm run dev
```

6. In another terminal, start the backend server:
```bash
node server.js
```

7. Open your browser to `http://localhost:5173`

## Project Structure

```
social-cue-clean/
├── src/
│   ├── components/
│   │   ├── socialcue/       # Main app components
│   │   └── voice/           # Voice practice components
│   ├── services/            # API and service integrations
│   ├── utils/               # Utility functions
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── server.js                # Backend API server
├── package.json
├── .env                     # Environment variables (not in git)
└── README.md
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will automatically try the next available port.

### Audio Not Playing
1. Check browser permissions for microphone
2. Allow audio autoplay in browser settings
3. Check ElevenLabs API key is correct

### Speech Recognition Not Working
1. Ensure microphone permissions are granted
2. Try a different browser (Chrome recommended)
3. Check microphone is working in other applications

### Claude API Errors
1. Verify API key is correct in `.env`
2. Check API quota hasn't been exceeded
3. Verify internet connection

## Next Steps

1. Complete onboarding with grade level selection
2. Try voice practice with Cue
3. Explore different scenarios
4. Track your progress in the Progress tab
5. Adjust settings in Settings tab

