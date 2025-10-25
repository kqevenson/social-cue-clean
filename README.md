# Social Cue - AI-Powered Social Skills Learning Platform

A comprehensive React-based application designed to help students develop essential social skills through AI-powered practice sessions, adaptive learning, and personalized feedback.

## 🚀 Current Status

**Phase:** 3 - Advanced Features  
**Week:** 12 - Voice Chatbot Implementation  
**Progress:** Ready to start voice chatbot development

## ✨ Key Features

### ✅ Completed Features
- **AI-Powered Practice Sessions**: Dynamic scenario generation using Claude API
- **Adaptive Learning Engine**: Personalized difficulty adjustment based on performance
- **Progress Tracking**: Comprehensive analytics and mastery tracking
- **Goals System**: Auto-generated learning goals with AI recommendations
- **Parent Dashboard**: Real-time progress monitoring for parents
- **Session History**: Detailed practice session analytics and replay
- **Settings & Preferences**: Customizable learning experience
- **Real-World Challenges**: AI-generated practical exercises

### 🔄 In Development
- **Live AI Voice Chatbot**: Real-time voice conversations for social skills practice
- **Speech-to-Text Integration**: Voice input for natural interaction
- **Text-to-Speech System**: AI-powered voice responses
- **Voice Practice Interface**: Immersive conversation practice

## 📚 Documentation

Implementation guides and project documentation can be found in the [docs](./docs) folder.

### Current Development Phase

**Week 12: Live AI Voice Chatbot** 🎤
- [View Implementation Guide](./docs/implementation-guides/Week-12-Voice-Chatbot-Implementation-Guide.md)
- Status: Ready to start
- Timeline: 10 days

See [docs/README.md](./docs/README.md) for complete documentation index.

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Lucide React** for consistent iconography
- **Firebase/Firestore** for real-time data
- **Web Speech API** for voice functionality

### Backend
- **Express.js** server with Claude API integration
- **Firebase/Firestore** for data persistence
- **Anthropic Claude API** for AI-powered content generation
- **RESTful API** design with comprehensive error handling

### Development Tools
- **Vite** for fast build and hot reload
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **Git** for version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Anthropic Claude API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd social-cue-clean

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Start development server
npm run dev

# Start backend server (in separate terminal)
node server.js
```

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
ANTHROPIC_API_KEY=your_claude_api_key
```

## 📁 Project Structure

```
social-cue-clean/
├── docs/                           # Documentation
│   ├── implementation-guides/      # Development guides
│   ├── phase-plans/               # Project phase documentation
│   └── README.md                  # Documentation index
├── src/
│   ├── components/
│   │   ├── socialcue/            # Main app components
│   │   └── LandingPage.tsx       # Landing page
│   ├── services/                 # API and utility services
│   ├── hooks/                    # Custom React hooks
│   └── utils/                    # Utility functions
├── server.js                     # Backend API server
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🎯 Development Phases

### Phase 1: Core MVP (Weeks 1-4) ✅ COMPLETE
- Foundation screens and navigation
- Practice session system
- Progress tracking
- Onboarding flow

### Phase 2: AI-Powered Learning (Weeks 5-8) ✅ COMPLETE
- Backend infrastructure
- Claude API integration
- Firebase/Firestore setup
- AI scenario generation
- Adaptive learning engine
- Goals auto-generation

### Phase 3: Advanced Features (Weeks 9-12) 🔄 IN PROGRESS
- **Week 11**: Teacher Portal
- **Week 12**: Live AI Voice Chatbot ⬅️ CURRENT
- **Week 13+**: Multi-language support, advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude AI API
- **Firebase** for backend infrastructure
- **React** and **Vite** communities for excellent tooling
- **Tailwind CSS** for rapid UI development

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
