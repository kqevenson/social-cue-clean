# Social Cue - AI-Powered Social Skills Practice App

An interactive application helping students practice real-world social interactions through voice conversations with AI.

## 🌟 Features

- **Voice Practice Sessions**: Real-time conversation practice with AI coach "Cue"
- **Multi-Language Support**: English and Spanish
- **Grade-Adaptive Content**: K-2, 3-5, 6-8, and 9-12 scenarios
- **Continuous Conversation**: Natural back-and-forth dialogue with conversation limits
- **Progress Tracking**: Streaks, confidence scores, and session history
- **Scenario Library**: 12+ real-world social situations
- **Dark Mode**: Eye-friendly interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Anthropic Claude API key
- ElevenLabs API key (optional, falls back to browser TTS)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/social-cue-clean.git
cd social-cue-clean
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Start the backend server (in another terminal):
```bash
node server.js
```

6. Open your browser to `http://localhost:5173`

## 📁 Project Structure

```
social-cue-clean/
├── src/
│   ├── components/
│   │   ├── socialcue/        # Main app components
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── LessonsScreen.jsx
│   │   │   ├── ProgressScreen.jsx
│   │   │   └── SettingsScreen.jsx
│   │   └── voice/            # Voice practice components
│   │       ├── VoicePracticeScreen.jsx
│   │       ├── VoiceInput.jsx
│   │       └── VoiceOutput.jsx
│   ├── services/             # API and service integrations
│   ├── utils/                # Utility functions
│   └── main.jsx              # App entry point
├── server.js                 # Backend API server
├── package.json
└── README.md
```

## 🎯 Core Features

### Voice Practice
- Practice social skills through natural voice conversations
- AI coach "Cue" provides guidance and feedback
- Conversation automatically wraps up after 8 exchanges
- Supports both English and Spanish

### Lessons
- Browse and complete interactive lessons
- Multiple choice scenarios with AI feedback
- Progress tracking across topics

### Progress Tracking
- Visual progress dashboard
- Streak tracking
- Session history
- Mastery indicators

### Settings
- Language selection (English/Spanish)
- Voice gender preference (Male/Female)
- Dark mode toggle
- Sound effects and notifications

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Anthropic Claude API
- **Voice**: ElevenLabs API (with Web Speech API fallback)
- **Storage**: LocalStorage (Firebase integration in progress)

## 📝 Development

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Anthropic for Claude API
- ElevenLabs for voice synthesis
- React community
