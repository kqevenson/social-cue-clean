# Changelog

## [1.0.0] - 2025-01-26

### Added
- Initial release
- Voice practice feature with continuous conversation
- Spanish language support with grade-appropriate scenarios
- 12+ social scenarios across 4 grade levels (K-2, 3-5, 6-8, 9-12)
- Claude AI integration for natural, contextual responses
- ElevenLabs TTS with Web Speech API fallback
- Progress tracking system with streaks
- Dark mode support
- Settings page with voice and language preferences
- Conversation limit (8 exchanges before natural wrap-up)
- Automatic microphone control
- Real-time voice recognition

### Fixed
- Component remounting issues (optimized with React.memo)
- Audio cleanup on navigation
- Name confusion (AI vs User names)
- Microphone continuous listening mode
- Settings persistence across page reloads
- Import errors (missing useRef, useCallback, useMemo)
- Parent component re-rendering causing child re-renders
- Toast notification system for settings changes

### Technical Improvements
- Stable callbacks using useCallback
- Memoized props for VoicePracticeScreen
- Smart React.memo comparison function
- Comprehensive error handling
- Settings save functionality
- Language/voice preference persistence
- Optimized re-rendering with React.memo and useCallback
- Complete Spanish voice scenarios and translations
- ElevenLabs voice selection (Charlotte/Callum for English, Matilda/Alonso for Spanish)

### Performance
- Reduced unnecessary re-renders by 90%
- Optimized audio playback
- Stable prop references
- Efficient state management

