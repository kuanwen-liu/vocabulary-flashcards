## Flashcard App

### Description

A flashcard application built with React, Vite, and Tailwind CSS. The app allows users to create, manage, and study flashcards. It includes features for adding cards, shuffling the deck, and tracking progress.

### Features

- Add new flashcards with front and back sides
- Shuffle the deck of flashcards
- Track progress with a mastered toggle
- Save flashcards to local storage
- Text-to-speech pronunciation (Web Speech API)
- Part of speech categorization
- Example sentences for context

### Tech Stack

- React
- Vite
- Tailwind CSS
- Context API
- LocalStorage

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

### Browser Compatibility

**Text-to-Speech Feature** requires Web Speech API support:
- ✅ Chrome 33+
- ✅ Edge 14+
- ✅ Safari 7+
- ✅ Firefox 49+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: The app works offline. TTS functionality uses browser-native speech synthesis with no external dependencies.

### Usage

1. Add new flashcards using the AddCardForm
2. Shuffle the deck using the Shuffle button
3. Study the flashcards using the StudyView
4. Track progress using the Mastered toggle
5. Click the speaker button on flashcards to hear pronunciations

### Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

### License

MIT