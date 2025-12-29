# Quickstart Guide: Enhanced Flashcard Linguistic Metadata

**Feature**: 002-flashcard-enhancements
**Date**: 2025-12-29
**For**: Developers implementing this feature

## Overview

This guide provides a quick walkthrough of implementing the three enhanced flashcard features:
1. Part of speech categorization (displayed on back)
2. Example sentences (displayed on back)
3. Text-to-speech pronunciation (speaker button on front)

**Estimated Implementation Time**: 4-6 hours for experienced React/TypeScript developer

---

## Prerequisites

- Existing flashcard application running (React 19.x + TypeScript 5.x + Vite 7.x + Tailwind CSS 3.x)
- Familiarity with React hooks, Context API, and TypeScript
- Understanding of browser Web Speech API (or willingness to learn)

---

## Quick Implementation Checklist

### Phase 1: Update Data Model (30 minutes)

- [ ] Extend `Flashcard` interface in `src/types/flashcard.ts`
- [ ] Add optional `partOfSpeech?: string` field
- [ ] Add optional `exampleSentences?: string[]` field
- [ ] Update type exports for `CreateFlashcardInput` and `UpdateFlashcardInput`

### Phase 2: Update CardContext Reducer (15 minutes)

- [ ] No changes needed to `CardAction` types (Partial updates already supported)
- [ ] Verify `UPDATE_CARD` action handles new optional fields
- [ ] Test backward compatibility with existing cards

### Phase 3: Create Text-to-Speech Infrastructure (60 minutes)

- [ ] Create `src/hooks/useSpeechSynthesis.ts` custom hook
- [ ] Implement voice loading with `onvoiceschanged` event handler
- [ ] Add speak/pause/resume/stop functions
- [ ] Implement error handling for TTS errors
- [ ] Create `src/components/SpeakerButton.tsx` component
- [ ] Add keyboard shortcuts (Alt+R to speak)
- [ ] Add ARIA labels for accessibility

### Phase 4: Update AddCardForm Component (45 minutes)

- [ ] Add part of speech dropdown/combobox
- [ ] Use recommended values from `RECOMMENDED_PARTS_OF_SPEECH`
- [ ] Allow custom part of speech input
- [ ] Add example sentences input (dynamic list, max 5)
- [ ] Add "Add Another Example" button
- [ ] Implement character count indicators
- [ ] Update form validation
- [ ] Update submit handler to include new fields

### Phase 5: Update FlashCard Display Component (60 minutes)

- [ ] Add `SpeakerButton` to front side (top-right corner)
- [ ] Position using absolute positioning within card
- [ ] Display part of speech badge on back side (below definition)
- [ ] Style badge with cyberpunk aesthetic (glow effect)
- [ ] Display example sentences on back side (bulleted list)
- [ ] Style examples with proper spacing and readability
- [ ] Ensure mobile responsive layout
- [ ] Test 3D flip animation still works correctly

### Phase 6: Update CardLibrary Edit Mode (45 minutes)

- [ ] Add part of speech input to edit form
- [ ] Add example sentences editing (dynamic list)
- [ ] Update save handler to persist new fields
- [ ] Add validation feedback
- [ ] Test inline editing with new fields

### Phase 7: Update Bulk Import Utility (30 minutes)

- [ ] Extend parser to support new format: `term, definition, partOfSpeech, example1 | example2`
- [ ] Maintain backward compatibility with old format
- [ ] Add error handling for malformed lines
- [ ] Update import documentation/tooltip
- [ ] Test with mixed old/new format imports

### Phase 8: Testing & Refinement (60 minutes)

- [ ] Test creating new cards with all fields populated
- [ ] Test creating new cards with only required fields
- [ ] Test editing existing old cards (backward compatibility)
- [ ] Test TTS in Chrome, Firefox, Safari, Edge
- [ ] Test keyboard shortcuts (Alt+R, Space, Escape)
- [ ] Test mobile responsiveness
- [ ] Verify LocalStorage persistence
- [ ] Check accessibility with screen reader
- [ ] Verify no console errors or warnings

---

## Code Snippets

### 1. Extended Flashcard Interface

```typescript
// src/types/flashcard.ts
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  mastered: boolean;
  createdAt: string;

  // NEW: Enhanced linguistic metadata
  partOfSpeech?: string;
  exampleSentences?: string[];
}
```

### 2. SpeechSynthesis Custom Hook (Simplified)

```typescript
// src/hooks/useSpeechSynthesis.ts
import { useState, useCallback, useEffect, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  // Load voices (handles async loading)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, lang = 'en-US') => {
      if (!isSupported) {
        setError('Speech synthesis not supported');
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = (e) => setError(`Error: ${e.error}`);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  return { speak, pause, resume, stop, isSpeaking, isPaused, isSupported, voices, error };
};
```

### 3. SpeakerButton Component

```tsx
// src/components/SpeakerButton.tsx
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface SpeakerButtonProps {
  text: string;
  className?: string;
}

export const SpeakerButton = ({ text, className = '' }: SpeakerButtonProps) => {
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <button
      onClick={() => speak(text)}
      disabled={isSpeaking}
      className={`p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 transition-colors disabled:opacity-50 ${className}`}
      aria-label="Read term aloud"
      title="Read aloud (Alt+R)"
    >
      <svg
        className="w-5 h-5 text-purple-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    </button>
  );
};
```

### 4. Enhanced FlashCard Display

```tsx
// src/components/FlashCard.tsx (snippet showing new elements)
export const FlashCard = ({ card, isFlipped, onFlip }: FlashCardProps) => {
  return (
    <div className="flashcard-container" onClick={onFlip}>
      {/* Front side */}
      <div className="flashcard-front">
        <SpeakerButton
          text={card.term}
          className="absolute top-4 right-4"
        />
        <h2>{card.term}</h2>
      </div>

      {/* Back side */}
      <div className="flashcard-back">
        <h3>Meaning</h3>
        <p>{card.definition}</p>

        {/* NEW: Part of speech badge */}
        {card.partOfSpeech && (
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium shadow-lg shadow-cyan-500/50">
            {card.partOfSpeech}
          </span>
        )}

        {/* NEW: Example sentences */}
        {card.exampleSentences && card.exampleSentences.length > 0 && (
          <div className="mt-4">
            <h4 className="text-purple-300 text-sm font-semibold mb-2">Examples:</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              {card.exampleSentences.map((example, i) => (
                <li key={i} className="pl-4 border-l-2 border-purple-500/50">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. Enhanced AddCardForm

```tsx
// src/components/AddCardForm.tsx (snippet showing new inputs)
export const AddCardForm = ({ onSubmit }: AddCardFormProps) => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);

  const handleAddExample = () => {
    if (examples.length < 5) {
      setExamples([...examples, '']);
    }
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredExamples = examples
      .map(e => e.trim())
      .filter(e => e.length > 0);

    onSubmit({
      term: term.trim(),
      definition: definition.trim(),
      partOfSpeech: partOfSpeech.trim() || undefined,
      exampleSentences: filteredExamples.length > 0 ? filteredExamples : undefined,
    });

    // Reset form
    setTerm('');
    setDefinition('');
    setPartOfSpeech('');
    setExamples(['']);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Existing term and definition inputs */}

      {/* NEW: Part of speech input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Part of Speech (optional)
        </label>
        <input
          type="text"
          value={partOfSpeech}
          onChange={(e) => setPartOfSpeech(e.target.value)}
          placeholder="e.g., noun, verb, adjective"
          list="pos-suggestions"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
        <datalist id="pos-suggestions">
          {RECOMMENDED_PARTS_OF_SPEECH.map((pos) => (
            <option key={pos} value={pos} />
          ))}
        </datalist>
      </div>

      {/* NEW: Example sentences */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Example Sentences (optional)
        </label>
        {examples.map((example, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={example}
              onChange={(e) => {
                const newExamples = [...examples];
                newExamples[index] = e.target.value;
                setExamples(newExamples);
              }}
              placeholder={`Example ${index + 1}`}
              maxLength={500}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            {examples.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveExample(index)}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {examples.length < 5 && (
          <button
            type="button"
            onClick={handleAddExample}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            + Add another example
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!term.trim() || !definition.trim()}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50"
      >
        Add Card
      </button>
    </form>
  );
};
```

### 6. Bulk Import Parser (Enhanced)

```typescript
// src/utils/bulkImport.ts
export const parseBulkImport = (text: string): Flashcard[] => {
  const lines = text.split(/[;\n]/).filter((line) => line.trim());

  return lines.map((line) => {
    const parts = line.split(',').map((p) => p.trim());

    const term = parts[0];
    const definition = parts[1];
    const partOfSpeech = parts[2] || undefined;
    const exampleSentences = parts[3]
      ? parts[3].split('|').map((e) => e.trim()).filter((e) => e.length > 0)
      : undefined;

    return {
      id: crypto.randomUUID(),
      term,
      definition,
      mastered: false,
      createdAt: new Date().toISOString(),
      partOfSpeech,
      exampleSentences,
    };
  });
};
```

---

## Testing Checklist

### Functional Testing

- [ ] **Create new card with all fields**: Verify term, definition, part of speech, and examples all save correctly
- [ ] **Create new card with only required fields**: Verify optional fields are undefined, not empty strings
- [ ] **Edit existing card**: Add part of speech and examples to old card
- [ ] **TTS on front side**: Click speaker button, hear term spoken aloud
- [ ] **TTS keyboard shortcut**: Press Alt+R, hear term spoken
- [ ] **Pause/resume TTS**: Test pause and resume during playback
- [ ] **Display on back side**: See part of speech badge and examples list
- [ ] **Bulk import old format**: Import cards with only term and definition
- [ ] **Bulk import new format**: Import cards with all fields
- [ ] **LocalStorage persistence**: Refresh page, verify all data persists

### Browser Compatibility Testing

- [ ] **Chrome**: TTS works, UI renders correctly
- [ ] **Firefox**: TTS works, UI renders correctly
- [ ] **Safari**: TTS works, UI renders correctly
- [ ] **Edge**: TTS works, UI renders correctly
- [ ] **Mobile Chrome**: Responsive layout, TTS works
- [ ] **Mobile Safari**: Responsive layout, TTS works

### Accessibility Testing

- [ ] **Keyboard navigation**: Tab through all interactive elements
- [ ] **Screen reader**: Speaker button announces purpose
- [ ] **ARIA labels**: All buttons have descriptive labels
- [ ] **Color contrast**: WCAG AA compliance for all text
- [ ] **Focus indicators**: Visible focus outlines

---

## Common Pitfalls & Solutions

### Issue 1: Voices Not Loading in Chrome

**Problem**: `window.speechSynthesis.getVoices()` returns empty array

**Solution**: Use `onvoiceschanged` event handler
```typescript
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  setVoices(voices);
};
```

### Issue 2: TTS Queue Buildup

**Problem**: Clicking speaker button multiple times queues speech

**Solution**: Cancel previous speech before speaking new text
```typescript
window.speechSynthesis.cancel(); // Clear queue
window.speechSynthesis.speak(utterance);
```

### Issue 3: Part of Speech Not Persisting

**Problem**: Part of speech disappears after refresh

**Solution**: Verify LocalStorage save includes optional fields
```typescript
// BAD: Optional fields stripped
const saved = { id, term, definition, mastered, createdAt };

// GOOD: Spread operator preserves all fields
const saved = { ...card };
```

### Issue 4: Examples Not Rendering

**Problem**: Example sentences don't show on card back

**Solution**: Check for undefined vs empty array
```tsx
{/* BAD: Empty array renders empty list */}
{card.exampleSentences && ...}

{/* GOOD: Check length too */}
{card.exampleSentences && card.exampleSentences.length > 0 && ...}
```

---

## Next Steps

After completing this implementation:

1. **Generate tasks**: Run `/speckit.tasks` to create detailed task breakdown
2. **Code review**: Review all changes for consistency and quality
3. **User testing**: Get feedback on UX and design
4. **Performance audit**: Verify bundle size < 200KB gzipped
5. **Documentation**: Update user-facing documentation and tooltips

---

## Support & Resources

- **Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/flashcard-schema.ts](./contracts/flashcard-schema.ts)
- **Research**: [research.md](./research.md)
- **MDN Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **React Hooks**: https://react.dev/reference/react
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Questions?** Refer to research.md for detailed technical decisions and rationale.
