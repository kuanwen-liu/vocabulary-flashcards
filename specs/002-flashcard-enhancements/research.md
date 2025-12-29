# Research: Enhanced Flashcard Linguistic Metadata

**Feature**: 002-flashcard-enhancements
**Date**: 2025-12-29
**Purpose**: Research technical decisions for implementing part of speech, example sentences, and text-to-speech pronunciation

## Research Questions & Decisions

### 1. Web Speech API for Text-to-Speech Pronunciation

**Question**: How should we implement text-to-speech pronunciation for flashcards? Should we use Web Speech API or a third-party library?

**Decision**: Use browser-native Web Speech API (SpeechSynthesis interface)

**Rationale**:
- **Zero bundle size impact**: Native browser API requires no npm dependencies
- **Excellent browser support**: Chrome 33+, Edge 14+, Safari 7+, Firefox 49+ (covers 95%+ of users)
- **Works offline**: Unlike recognition API, synthesis works without network connection
- **Stable API**: Standardized since 2018, no breaking changes expected
- **Performance**: Runs on separate system thread, doesn't block main thread
- **Free**: No API keys, usage limits, or pricing tiers

**Alternatives Considered**:
- **Google Cloud Text-to-Speech API**: Rejected due to API key requirement, network dependency, cost, and unnecessary complexity
- **Amazon Polly**: Rejected for same reasons as Google Cloud
- **ResponsiveVoice.js**: Rejected due to commercial licensing and bundle size
- **SpeechSynthesisRecorder**: Rejected as it's built on top of Web Speech API anyway

**Implementation Details**:
```typescript
// Basic pattern
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
utterance.pitch = 1.0;
utterance.rate = 1.0;
utterance.volume = 1.0;
window.speechSynthesis.speak(utterance);
```

**Key Considerations**:
- Handle async voice loading in Chrome using `onvoiceschanged` event
- Implement error handling for cancelled/interrupted/audio-unavailable errors
- Cancel previous utterances before speaking new text to avoid queue buildup
- Provide pause/resume/stop controls for better UX

---

### 2. React Integration Pattern for TTS

**Question**: Should we use a custom hook, a component, or a utility function for TTS?

**Decision**: Custom React hook (`useSpeechSynthesis`) + dedicated component (`SpeakerButton`)

**Rationale**:
- **Separation of concerns**: Hook handles state/logic, component handles UI
- **Reusability**: Hook can be reused across different components
- **React best practices**: Hooks are idiomatic React for side effects and state
- **Type safety**: TypeScript interfaces for options and return values
- **Testing**: Easier to mock and test hooks independently

**Alternatives Considered**:
- **Pure utility function**: Rejected due to inability to track speaking state in React
- **HOC (Higher-Order Component)**: Rejected as outdated pattern, hooks are preferred
- **Global singleton**: Rejected due to poor React integration and state management issues

**Implementation Pattern**:
```typescript
// Custom hook
export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const speak = useCallback((text: string, options) => {
    // Implementation
  }, []);

  return { speak, pause, resume, stop, isSpeaking, isPaused, voices };
};

// Component usage
export const SpeakerButton = ({ text }: { text: string }) => {
  const { speak, isSpeaking } = useSpeechSynthesis();
  return <button onClick={() => speak(text)}>🔊</button>;
};
```

---

### 3. Part of Speech Data Structure

**Question**: How should we store part of speech data? String enum? Fixed list? Custom types allowed?

**Decision**: Optional string field with predefined recommended values (not enforced)

**Rationale**:
- **Flexibility**: Users can enter custom grammatical categories if needed (e.g., "phrasal verb", "idiom")
- **Simplicity**: No complex validation or error handling
- **Backward compatibility**: Easy to add/remove recommended options without breaking changes
- **Localization friendly**: No hardcoded enums that might not translate to other languages

**Alternatives Considered**:
- **TypeScript enum**: Rejected as too rigid and prevents custom values
- **Union type of string literals**: Rejected as requires code changes to add new types
- **Database of all grammatical categories**: Rejected as over-engineered for this use case

**Implementation**:
```typescript
interface Flashcard {
  // ... existing fields
  partOfSpeech?: string; // Recommended: noun, verb, adjective, adverb, etc.
}

// UI provides dropdown with common values but allows custom input
const RECOMMENDED_PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'other'
] as const;
```

---

### 4. Example Sentences Storage Format

**Question**: Should we store example sentences as a single string, array of strings, or structured objects?

**Decision**: Array of strings (maximum 5 recommended)

**Rationale**:
- **Simple to serialize**: JSON.stringify/parse works natively
- **Easy to iterate**: Map over array for rendering
- **Flexible**: Easy to add/remove individual examples
- **Sufficient for use case**: No need for metadata (author, source, etc.)
- **LocalStorage friendly**: Minimal storage overhead

**Alternatives Considered**:
- **Single string with delimiter**: Rejected due to difficulty editing individual examples
- **Array of objects with metadata**: Rejected as over-engineered (no need for source/attribution)
- **Unlimited array**: Rejected due to UX concerns (scrolling, performance, storage)

**Implementation**:
```typescript
interface Flashcard {
  // ... existing fields
  exampleSentences?: string[]; // Max 5 recommended, each max 500 chars
}

// Validation
const MAX_EXAMPLE_SENTENCES = 5;
const MAX_EXAMPLE_LENGTH = 500;
```

---

### 5. Display Layout for New Fields

**Question**: Where should part of speech, examples, and speaker button appear on the flashcard?

**Decision**:
- **Speaker button**: Front side (top-right corner, icon-only)
- **Part of speech**: Back side (under definition, styled as badge)
- **Example sentences**: Back side (below part of speech, bulleted list)

**Rationale**:
- **Front side focus**: Keep front clean for quick term recognition, only add speaker icon
- **Back side enrichment**: Stack linguistic metadata on back where user reviews definition
- **Visual hierarchy**: Definition → Part of Speech → Examples (order of importance)
- **Mobile compatibility**: Vertical stacking works on small screens
- **Existing 3D flip**: No changes to flip animation, just add content to back face

**Alternatives Considered**:
- **Third face (triple flip)**: Rejected as too complex for CSS 3D transforms
- **Expandable sections**: Rejected as adds unnecessary interaction complexity
- **Modal/tooltip**: Rejected as poor UX for core content
- **Speaker button on back**: Rejected as users should pronounce before seeing definition

**Layout Mockup**:
```
FRONT SIDE                    BACK SIDE
┌─────────────────┐          ┌─────────────────┐
│ Vocabulary  [🔊]│          │ Meaning         │
│                 │          │ Lorem ipsum...  │
│   EPHEMERAL     │          │                 │
│                 │          │ [adjective]     │
│                 │          │                 │
│                 │   FLIP   │ Examples:       │
│                 │  <====>  │ • Cherry blos...│
│                 │          │ • Morning dew...│
│                 │          │                 │
│   [MASTERED]    │          │   [MASTERED]    │
└─────────────────┘          └─────────────────┘
```

---

### 6. Accessibility Requirements for TTS

**Question**: What accessibility features should the speaker button have?

**Decision**: Full keyboard support + ARIA labels + screen reader announcements

**Rationale**:
- **WCAG 2.1 Level AA compliance**: Required for accessible web applications
- **Keyboard-only users**: Must be able to trigger TTS without mouse
- **Screen reader users**: Must understand button purpose and state
- **Visual indicators**: Must show speaking/paused/stopped state

**Implementation Requirements**:
- `aria-label="Read vocabulary term aloud"`
- `aria-pressed` state for speaking/not speaking
- Keyboard shortcut (e.g., Alt+R to read)
- Focus visible indicator (outline)
- Disabled state when not supported
- Error announcements via `aria-live` region

**Keyboard Shortcuts**:
- **Alt+R**: Read/speak current card
- **Space**: Pause/resume (when speaking)
- **Escape**: Stop speaking

---

### 7. LocalStorage Schema Migration

**Question**: How should we handle backward compatibility when adding new optional fields?

**Decision**: Graceful degradation with optional field checking

**Rationale**:
- **No version bump needed**: Optional fields don't break existing data
- **TypeScript optional properties**: `partOfSpeech?: string` allows undefined
- **JSON serialization**: LocalStorage stringify/parse handles undefined/missing fields
- **Forward compatible**: Future additions can follow same pattern

**Implementation**:
```typescript
interface Flashcard {
  id: string;
  term: string;
  definition: string;
  mastered: boolean;
  createdAt: string;

  // New optional fields (v2)
  partOfSpeech?: string;
  exampleSentences?: string[];
}

// No migration needed - TypeScript handles undefined gracefully
const card: Flashcard = JSON.parse(localStorage.getItem('card'));
// card.partOfSpeech is undefined for old cards, string for new cards ✅
```

**Alternatives Considered**:
- **Schema version field**: Rejected as unnecessary for optional fields
- **Migration function**: Rejected as old cards work fine without new fields
- **Separate storage keys**: Rejected as fragments data unnecessarily

---

### 8. Bulk Import Format Enhancement

**Question**: How should bulk import handle the new fields?

**Decision**: Extended semicolon-delimited format with backward compatibility

**Rationale**:
- **Backward compatible**: Old format (term, definition) still works
- **Progressive enhancement**: New fields optional in import
- **Simple parsing**: Split by semicolon then by comma
- **Clear format**: Easy to document and use

**Import Format**:
```
Format: term, definition, partOfSpeech, example1 | example2 | example3

Examples:
ephemeral, lasting for a very short time, adjective, Cherry blossoms are ephemeral | Morning dew is ephemeral
quinoa, a grain crop grown for its edible seeds, noun, Quinoa is high in protein

Old format still works:
run, to move quickly, verb
```

**Parsing Logic**:
```typescript
const parseLine = (line: string): Partial<Flashcard> => {
  const parts = line.split(',').map(p => p.trim());

  return {
    term: parts[0],
    definition: parts[1],
    partOfSpeech: parts[2] || undefined,
    exampleSentences: parts[3]?.split('|').map(e => e.trim()) || undefined,
  };
};
```

---

## Best Practices Summary

### Web Speech API
- Use `onvoiceschanged` event for async voice loading (Chrome)
- Cancel previous utterances before speaking new text
- Implement comprehensive error handling
- Provide pause/resume/stop controls
- Prefer local/offline voices for better performance

### React Patterns
- Custom hooks for TTS state and logic
- Separate components for UI elements
- TypeScript for type safety
- useCallback for memoized functions
- useEffect for voice loading side effects

### Data Modeling
- Optional fields for backward compatibility
- String arrays for example sentences
- Flexible string type for part of speech
- No schema version needed

### Accessibility
- Full keyboard navigation support
- ARIA labels and states
- Screen reader announcements
- Visual state indicators
- Minimum WCAG AA contrast ratios

### Performance
- Zero bundle size impact (native API)
- No runtime performance penalty
- LocalStorage-friendly data structures
- Efficient rendering with React.memo where appropriate

---

## Open Questions (Resolved)

All research questions have been resolved. No blockers remain for Phase 1 design.

---

## References

- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [MDN: SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [MDN: SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)
- [Can I Use: Speech Synthesis](https://caniuse.com/speech-synthesis)
- [W3C: WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1: Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React: Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
