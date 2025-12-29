# Data Model: Enhanced Flashcard Linguistic Metadata

**Feature**: 002-flashcard-enhancements
**Date**: 2025-12-29
**Purpose**: Define data structures and state transitions for enhanced flashcard fields

## Core Entities

### Flashcard (Enhanced)

The enhanced flashcard entity extends the existing flashcard structure with three new optional fields for linguistic metadata.

**Entity Name**: `Flashcard`

**Description**: Represents a single vocabulary flashcard with term, definition, mastery status, and optional linguistic enhancements (part of speech, example sentences, pronunciation via TTS).

**Fields**:

| Field Name | Type | Required | Constraints | Description |
|------------|------|----------|-------------|-------------|
| `id` | string | Yes | UUID v4, immutable | Unique identifier for the flashcard |
| `term` | string | Yes | 1-100 characters | The vocabulary word or phrase (front of card) |
| `definition` | string | Yes | 1-500 characters | The meaning or translation (back of card) |
| `mastered` | boolean | Yes | true/false | Whether user has mastered this card |
| `createdAt` | string | Yes | ISO 8601 timestamp, immutable | When the card was created |
| `partOfSpeech` | string | No | 1-50 characters | Grammatical category (noun, verb, adjective, etc.) |
| `exampleSentences` | string[] | No | 0-5 items, each 1-500 chars | Usage examples demonstrating the term in context |

**Relationships**:
- Flashcard belongs to CardState (one-to-many: CardState contains array of Flashcards)
- No relationships with other entities (self-contained data structure)

**Validation Rules**:
1. `id` must be unique across all flashcards in the collection
2. `term` cannot be empty string, must trim whitespace
3. `definition` cannot be empty string, must trim whitespace
4. `mastered` defaults to false on creation
5. `createdAt` set once on creation, never modified
6. `partOfSpeech` if provided, must be trimmed, can be custom value
7. `exampleSentences` if provided:
   - Maximum 5 sentences
   - Each sentence must be 1-500 characters
   - Empty strings filtered out
   - Duplicates allowed (same example can appear twice)

**TypeScript Interface**:
```typescript
export interface Flashcard {
  /** Unique identifier (UUID v4) - immutable once created */
  id: string;

  /** Front of the card (question/term) - 1-100 characters */
  term: string;

  /** Back of the card (answer/definition) - 1-500 characters */
  definition: string;

  /** Whether the user has mastered this card - toggleable */
  mastered: boolean;

  /** ISO 8601 timestamp of when card was created - immutable */
  createdAt: string;

  /** Part of speech (optional) - grammatical category like noun, verb, adjective */
  partOfSpeech?: string;

  /** Example sentences (optional) - 0-5 contextual usage examples */
  exampleSentences?: string[];
}
```

**Backward Compatibility**:
- Old flashcards (without new fields) remain valid
- `partOfSpeech` and `exampleSentences` are optional (undefined for old cards)
- No schema version field needed
- JSON serialization handles undefined gracefully

---

### CardState (Updated)

**Entity Name**: `CardState`

**Description**: Global application state containing all flashcards and UI state (filter, current index, shuffle order).

**Fields**:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `cards` | Flashcard[] | Yes | Array of all flashcards (includes enhanced cards) |
| `filter` | FilterType | Yes | Current filter ('all' or 'needsReview') |
| `currentIndex` | number | Yes | Index of currently displayed card in study mode |
| `shuffleOrder` | number[] | Yes | Shuffled indices for study mode |

**No changes to CardState structure** - it already contains an array of Flashcards, which now support optional enhanced fields.

---

### SpeechSynthesisState (New)

**Entity Name**: `SpeechSynthesisState`

**Description**: Ephemeral state for text-to-speech functionality (not persisted to LocalStorage).

**Fields**:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `isSpeaking` | boolean | Yes | Whether TTS is currently speaking |
| `isPaused` | boolean | Yes | Whether TTS is paused |
| `isSupported` | boolean | Yes | Whether browser supports Web Speech API |
| `voices` | SpeechSynthesisVoice[] | Yes | Available TTS voices from browser |
| `currentUtterance` | SpeechSynthesisUtterance \| null | Yes | Currently speaking utterance (or null) |
| `error` | string \| null | Yes | Error message (or null if no error) |

**Lifecycle**: Created on component mount, destroyed on unmount. Never persisted.

**TypeScript Interface**:
```typescript
export interface SpeechSynthesisState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentUtterance: SpeechSynthesisUtterance | null;
  error: string | null;
}
```

---

## State Transitions

### Flashcard Lifecycle

```
┌─────────────┐
│   CREATE    │ ──────> New flashcard with id, term, definition, mastered=false, createdAt=now
└─────────────┘         Optional: partOfSpeech, exampleSentences
      │
      ▼
┌─────────────┐
│   ACTIVE    │ ──────> User can view, edit, toggle mastered, delete
└─────────────┘
      │
      ├─────> UPDATE (term, definition, partOfSpeech, exampleSentences)
      │
      ├─────> TOGGLE_MASTERED (mastered = !mastered)
      │
      └─────> DELETE (remove from cards array)
```

**State Transitions**:

1. **CREATE**: User submits AddCardForm
   - Validation: term and definition required, not empty
   - Generate UUID v4 for id
   - Set createdAt to current ISO 8601 timestamp
   - Set mastered to false
   - Optionally include partOfSpeech and exampleSentences if provided
   - Add to cards array
   - Persist to LocalStorage

2. **UPDATE**: User edits card in CardLibrary
   - Validation: term and definition still required
   - Validation: exampleSentences max 5 items, each max 500 chars
   - Update only changed fields (id, mastered, createdAt immutable)
   - Persist to LocalStorage

3. **TOGGLE_MASTERED**: User marks card as mastered/unmastered
   - Toggle mastered boolean
   - Persist to LocalStorage

4. **DELETE**: User deletes card
   - Remove from cards array
   - Persist to LocalStorage

---

### Text-to-Speech Lifecycle

```
┌─────────────┐
│    IDLE     │ ──────> isSpeaking=false, isPaused=false
└─────────────┘
      │
      │ User clicks speaker button
      ▼
┌─────────────┐
│  SPEAKING   │ ──────> isSpeaking=true, isPaused=false
└─────────────┘
      │
      ├─────> User clicks pause ──────> PAUSED (isSpeaking=true, isPaused=true)
      │                                     │
      │                                     └─────> User clicks resume ──────> SPEAKING
      │
      ├─────> User clicks stop ──────> IDLE
      │
      ├─────> Speech ends naturally ──────> IDLE
      │
      └─────> Error occurs ──────> IDLE (with error message)
```

**State Transitions**:

1. **SPEAK**: User clicks speaker button
   - Cancel any ongoing speech
   - Create SpeechSynthesisUtterance with card term
   - Set language to 'en-US' (default)
   - Attach event handlers (onstart, onend, onerror, onpause, onresume)
   - Call window.speechSynthesis.speak()
   - Transition to SPEAKING state

2. **PAUSE**: User pauses during speech
   - Call window.speechSynthesis.pause()
   - Set isPaused to true
   - Remain in SPEAKING state (isSpeaking still true)

3. **RESUME**: User resumes paused speech
   - Call window.speechSynthesis.resume()
   - Set isPaused to false
   - Remain in SPEAKING state

4. **STOP**: User stops speech or error occurs
   - Call window.speechSynthesis.cancel()
   - Set isSpeaking to false
   - Set isPaused to false
   - Clear currentUtterance
   - Transition to IDLE state

5. **COMPLETE**: Speech ends naturally
   - Browser fires 'end' event
   - Set isSpeaking to false
   - Set isPaused to false
   - Transition to IDLE state

---

## Data Validation

### Client-Side Validation (TypeScript)

```typescript
// Validation utility for enhanced flashcard fields
export const validateFlashcard = (
  card: Partial<Flashcard>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!card.term || card.term.trim().length === 0) {
    errors.push('Term is required');
  } else if (card.term.length > 100) {
    errors.push('Term must be 100 characters or less');
  }

  if (!card.definition || card.definition.trim().length === 0) {
    errors.push('Definition is required');
  } else if (card.definition.length > 500) {
    errors.push('Definition must be 500 characters or less');
  }

  // Optional fields
  if (card.partOfSpeech && card.partOfSpeech.length > 50) {
    errors.push('Part of speech must be 50 characters or less');
  }

  if (card.exampleSentences) {
    if (card.exampleSentences.length > 5) {
      errors.push('Maximum 5 example sentences allowed');
    }

    card.exampleSentences.forEach((example, index) => {
      if (example.length > 500) {
        errors.push(`Example sentence ${index + 1} exceeds 500 characters`);
      }
      if (example.trim().length === 0) {
        errors.push(`Example sentence ${index + 1} is empty`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

### Sanitization

```typescript
// Sanitize user input before persisting
export const sanitizeFlashcard = (
  card: Partial<Flashcard>
): Partial<Flashcard> => {
  return {
    ...card,
    term: card.term?.trim(),
    definition: card.definition?.trim(),
    partOfSpeech: card.partOfSpeech?.trim() || undefined,
    exampleSentences: card.exampleSentences
      ?.map((s) => s.trim())
      .filter((s) => s.length > 0) || undefined,
  };
};
```

---

## LocalStorage Schema

### Storage Structure

```typescript
// LocalStorage key: 'flashcards-v1'
interface StorageSchema {
  cards: Flashcard[];
  version: number; // For future migrations if needed
}

// Example stored data
{
  "version": 1,
  "cards": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "term": "ephemeral",
      "definition": "lasting for a very short time",
      "mastered": false,
      "createdAt": "2025-12-29T10:30:00.000Z",
      "partOfSpeech": "adjective",
      "exampleSentences": [
        "The beauty of cherry blossoms is ephemeral.",
        "Morning dew is ephemeral, vanishing as the sun rises."
      ]
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "term": "run",
      "definition": "to move quickly on foot",
      "mastered": true,
      "createdAt": "2025-12-20T08:15:00.000Z"
      // No partOfSpeech or exampleSentences (old card)
    }
  ]
}
```

### Storage Operations

```typescript
// Save to LocalStorage
export const saveCards = (cards: Flashcard[]): void => {
  const data: StorageSchema = {
    version: 1,
    cards,
  };
  localStorage.setItem('flashcards-v1', JSON.stringify(data));
};

// Load from LocalStorage
export const loadCards = (): Flashcard[] => {
  const stored = localStorage.getItem('flashcards-v1');
  if (!stored) return [];

  try {
    const data: StorageSchema = JSON.parse(stored);
    return data.cards || [];
  } catch (error) {
    console.error('Failed to parse stored cards:', error);
    return [];
  }
};
```

---

## Migration Strategy

**Current State**: No migration needed for Phase 1

**Reason**: New fields are optional, existing cards remain valid

**Future Considerations**:
- If we add required fields in the future, implement version-based migration
- Use `version` field in StorageSchema to detect old data
- Run migration function on load if version < current version
- Preserve user data during migration

**Example Future Migration**:
```typescript
const migrateCards = (cards: Flashcard[], fromVersion: number): Flashcard[] => {
  if (fromVersion < 2) {
    // Example: Add default partOfSpeech if missing
    return cards.map(card => ({
      ...card,
      partOfSpeech: card.partOfSpeech || 'unknown',
    }));
  }
  return cards;
};
```

---

## Summary

### New Data Structures
1. **Enhanced Flashcard interface** with `partOfSpeech` and `exampleSentences`
2. **SpeechSynthesisState** for TTS ephemeral state

### Key Design Decisions
1. **Optional fields**: Backward compatible, no migration needed
2. **Array for examples**: Simple, flexible, LocalStorage-friendly
3. **String for partOfSpeech**: Flexible, allows custom values
4. **TTS state separate**: Ephemeral, not persisted
5. **Client-side validation**: Immediate feedback, better UX

### Validation Constraints
- Term: 1-100 characters, required
- Definition: 1-500 characters, required
- Part of Speech: 1-50 characters, optional
- Example Sentences: 0-5 items, each 1-500 characters, optional

### No Breaking Changes
All existing flashcards continue to work without modification. New fields are additive and optional.
