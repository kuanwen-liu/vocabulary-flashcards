/**
 * Flashcard Application Type Definitions
 *
 * Core types for the flashcard learning application with LocalStorage persistence.
 * Follows the data model specification from specs/001-flashcards-app/data-model.md
 * Enhanced with optional linguistic metadata per specs/002-flashcard-enhancements/data-model.md
 */

/**
 * Recommended part of speech values for flashcards
 * Users can also enter custom values not in this list
 */
export const RECOMMENDED_PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'other',
] as const;

export type RecommendedPartOfSpeech =
  (typeof RECOMMENDED_PARTS_OF_SPEECH)[number];

/**
 * Validation constraints for flashcard fields
 * Based on specs/002-flashcard-enhancements/data-model.md
 */
export const FLASHCARD_CONSTRAINTS = {
  TERM_MIN_LENGTH: 1,
  TERM_MAX_LENGTH: 500,
  DEFINITION_MIN_LENGTH: 1,
  DEFINITION_MAX_LENGTH: 2000,
  PART_OF_SPEECH_MAX_LENGTH: 50,
  EXAMPLE_SENTENCE_MIN_LENGTH: 1,
  EXAMPLE_SENTENCE_MAX_LENGTH: 500,
  MAX_EXAMPLE_SENTENCES: 5,
} as const;

/**
 * Represents a single flashcard with term (front) and definition (back)
 * Enhanced with optional linguistic metadata: part of speech and example sentences
 */
export interface Flashcard {
  /** Unique identifier (UUID v4) - immutable once created */
  id: string;

  /** Front of the card (question/term) - 1-500 characters */
  term: string;

  /** Back of the card (answer/definition) - 1-2000 characters */
  definition: string;

  /** Whether the user has mastered this card - toggleable */
  mastered: boolean;

  /** ISO 8601 timestamp of when card was created - immutable */
  createdAt: string;

  /** Part of speech (optional) - grammatical category like noun, verb, adjective - 1-50 characters */
  partOfSpeech?: string;

  /** Example sentences (optional) - 0-5 contextual usage examples, each max 500 characters */
  exampleSentences?: string[];
}

/**
 * Application state managed by React Context
 */
export interface CardState {
  /** Array of all flashcards in the collection */
  cards: Flashcard[];

  /** Active filter: show all cards or only unmastered cards */
  filter: 'all' | 'needsReview';

  /** Index of the currently displayed card in study mode */
  currentCardIndex: number;
}

/**
 * Discriminated union of all possible reducer actions
 * Used with React's useReducer for type-safe state management
 */
export type CardAction =
  | {
      type: 'ADD_CARD';
      payload: Omit<Flashcard, 'id' | 'createdAt'>;
    }
  | {
      type: 'UPDATE_CARD';
      payload: {
        id: string;
        updates: UpdateFlashcardInput;
      };
    }
  | {
      type: 'DELETE_CARD';
      payload: string; // card ID
    }
  | {
      type: 'TOGGLE_MASTERED';
      payload: string; // card ID
    }
  | {
      type: 'SET_FILTER';
      payload: 'all' | 'needsReview';
    }
  | {
      type: 'NAVIGATE';
      payload: number; // new index
    }
  | {
      type: 'SHUFFLE_CARDS';
    }
  | {
      type: 'BULK_IMPORT';
      payload: Flashcard[];
    }
  | {
      type: 'LOAD_CARDS';
      payload: Flashcard[];
    };

/**
 * LocalStorage schema for persisting flashcard data
 * Matches contracts/storage-api.md specification
 */
export interface StorageSchema {
  /** Schema version for data migration support */
  version: '1.0';

  /** Array of all flashcards */
  cards: Flashcard[];

  /** ISO 8601 timestamp of last modification */
  lastModified: string;
}

/**
 * Bulk import parsing result
 * Used for providing feedback on import success/failures
 */
export interface BulkImportResult {
  /** Successfully imported cards */
  successful: Flashcard[];

  /** Failed entries with error messages */
  failed: Array<{
    rawText: string;
    error: string;
  }>;
}

/**
 * Props for FlashCard component
 */
export interface FlashCardProps {
  term: string;
  definition: string;
  mastered: boolean;
  onToggleMastered: () => void;
  partOfSpeech?: string;
  exampleSentences?: string[];
}

/**
 * Props for StudyView component
 */
export interface StudyViewProps {
  /** Optional initial card index */
  initialIndex?: number;
}

/**
 * Props for CardLibrary component
 */
export interface CardLibraryProps {
  /** Optional callback when user navigates to study mode */
  onNavigateToStudy?: () => void;
}

/**
 * Props for AddCardForm component
 */
export interface AddCardFormProps {
  /** Optional callback after successful card creation */
  onCardAdded?: (card: Flashcard) => void;
}

/**
 * Props for BulkImport component
 */
export interface BulkImportProps {
  /** Optional callback after successful bulk import */
  onImportComplete?: (result: BulkImportResult) => void;
}

/**
 * Props for FilterToggle component
 */
export interface FilterToggleProps {
  /** Current filter state */
  filter: 'all' | 'needsReview';

  /** Callback when filter changes */
  onFilterChange: (filter: 'all' | 'needsReview') => void;

  /** Count of unmastered cards for "Needs Review" badge */
  needsReviewCount?: number;
}

/**
 * Input type for creating a new flashcard
 * Omits auto-generated fields (id, createdAt) and defaults (mastered)
 * Includes optional enhanced fields (partOfSpeech, exampleSentences)
 */
export type CreateFlashcardInput = Omit<
  Flashcard,
  'id' | 'createdAt' | 'mastered'
> & {
  mastered?: boolean; // Optional override for mastered status
};

/**
 * Input type for updating an existing flashcard
 * Only user-editable fields can be updated (immutable fields excluded)
 * Includes optional enhanced fields (partOfSpeech, exampleSentences)
 */
export type UpdateFlashcardInput = Partial<
  Pick<Flashcard, 'term' | 'definition' | 'partOfSpeech' | 'exampleSentences'>
>;
