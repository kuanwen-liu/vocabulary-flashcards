/**
 * TypeScript Contracts: Enhanced Flashcard Linguistic Metadata
 *
 * Feature: 002-flashcard-enhancements
 * Date: 2025-12-29
 *
 * This file defines the TypeScript interfaces and types for the enhanced
 * flashcard feature, including part of speech, example sentences, and
 * text-to-speech functionality.
 */

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Enhanced Flashcard interface with linguistic metadata
 *
 * Extends the original flashcard with three optional fields:
 * - partOfSpeech: Grammatical category (noun, verb, adjective, etc.)
 * - exampleSentences: Array of usage examples
 *
 * All new fields are optional for backward compatibility.
 */
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

  /** Example sentences (optional) - 0-5 contextual usage examples, each max 500 chars */
  exampleSentences?: string[];
}

/**
 * Input type for creating a new flashcard
 *
 * Omits auto-generated fields (id, createdAt) and defaults (mastered)
 */
export type CreateFlashcardInput = Omit<
  Flashcard,
  'id' | 'createdAt' | 'mastered'
> & {
  mastered?: boolean; // Optional override for mastered status
};

/**
 * Input type for updating an existing flashcard
 *
 * Only user-editable fields can be updated (immutable fields excluded)
 */
export type UpdateFlashcardInput = Partial<
  Pick<
    Flashcard,
    'term' | 'definition' | 'partOfSpeech' | 'exampleSentences'
  >
>;

// ============================================================================
// Validation & Constants
// ============================================================================

/**
 * Validation constraints for flashcard fields
 */
export const FLASHCARD_CONSTRAINTS = {
  TERM_MIN_LENGTH: 1,
  TERM_MAX_LENGTH: 100,
  DEFINITION_MIN_LENGTH: 1,
  DEFINITION_MAX_LENGTH: 500,
  PART_OF_SPEECH_MAX_LENGTH: 50,
  EXAMPLE_SENTENCE_MIN_LENGTH: 1,
  EXAMPLE_SENTENCE_MAX_LENGTH: 500,
  MAX_EXAMPLE_SENTENCES: 5,
} as const;

/**
 * Recommended part of speech values
 *
 * These are suggestions; users can enter custom values
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
 * Validation result returned by validation functions
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for FlashCard component
 */
export interface FlashCardProps {
  /** The flashcard to display */
  card: Flashcard;

  /** Whether the card is currently flipped */
  isFlipped: boolean;

  /** Callback when card is clicked (flip) */
  onFlip: () => void;

  /** Callback when mastered status is toggled */
  onToggleMastered: (id: string) => void;

  /** Optional callback when speaker button is clicked */
  onSpeak?: (text: string) => void;

  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for SpeakerButton component
 */
export interface SpeakerButtonProps {
  /** The text to speak when button is clicked */
  text: string;

  /** Whether TTS is currently speaking */
  isSpeaking: boolean;

  /** Whether TTS is paused */
  isPaused: boolean;

  /** Whether browser supports Web Speech API */
  isSupported: boolean;

  /** Callback to speak the text */
  onSpeak: (text: string) => void;

  /** Callback to pause speech */
  onPause?: () => void;

  /** Callback to resume speech */
  onResume?: () => void;

  /** Callback to stop speech */
  onStop?: () => void;

  /** Optional className for custom styling */
  className?: string;

  /** Optional aria-label override */
  ariaLabel?: string;
}

/**
 * Props for AddCardForm component (enhanced)
 */
export interface AddCardFormProps {
  /** Callback when new card is submitted */
  onSubmit: (input: CreateFlashcardInput) => void;

  /** Optional callback when form is cancelled */
  onCancel?: () => void;

  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for CardLibrary component (enhanced edit mode)
 */
export interface CardLibraryProps {
  /** Array of flashcards to display */
  cards: Flashcard[];

  /** Callback when card is updated */
  onUpdate: (id: string, updates: UpdateFlashcardInput) => void;

  /** Callback when card is deleted */
  onDelete: (id: string) => void;

  /** Callback when mastered status is toggled */
  onToggleMastered: (id: string) => void;

  /** Optional className for custom styling */
  className?: string;
}

// ============================================================================
// Text-to-Speech Contracts
// ============================================================================

/**
 * Options for text-to-speech synthesis
 */
export interface SpeechSynthesisOptions {
  /** BCP 47 language tag (e.g., 'en-US', 'es-ES') */
  lang?: string;

  /** Pitch (0.1 to 10.0, default 1.0) */
  pitch?: number;

  /** Speaking rate (0.1 to 10.0, default 1.0) */
  rate?: number;

  /** Volume (0.0 to 1.0, default 1.0) */
  volume?: number;

  /** Optional specific voice to use */
  voice?: SpeechSynthesisVoice;
}

/**
 * Return type for useSpeechSynthesis custom hook
 */
export interface UseSpeechSynthesisReturn {
  /** Function to speak text with optional configuration */
  speak: (text: string, options?: SpeechSynthesisOptions) => void;

  /** Function to pause ongoing speech */
  pause: () => void;

  /** Function to resume paused speech */
  resume: () => void;

  /** Function to stop and cancel speech */
  stop: () => void;

  /** Whether TTS is currently speaking */
  isSpeaking: boolean;

  /** Whether TTS is currently paused */
  isPaused: boolean;

  /** Whether browser supports Web Speech API */
  isSupported: boolean;

  /** Array of available TTS voices */
  voices: SpeechSynthesisVoice[];

  /** Current utterance being spoken (or null) */
  currentUtterance: SpeechSynthesisUtterance | null;

  /** Current error message (or null if no error) */
  error: string | null;
}

// ============================================================================
// Context & State Management
// ============================================================================

/**
 * Filter type for card filtering
 */
export type FilterType = 'all' | 'needsReview';

/**
 * Global card state (managed by CardContext)
 */
export interface CardState {
  /** Array of all flashcards */
  cards: Flashcard[];

  /** Current filter setting */
  filter: FilterType;

  /** Current card index in study mode */
  currentIndex: number;

  /** Shuffled indices for study mode */
  shuffleOrder: number[];
}

/**
 * Actions for CardContext reducer
 */
export type CardAction =
  | { type: 'ADD_CARD'; card: Flashcard }
  | { type: 'UPDATE_CARD'; id: string; updates: UpdateFlashcardInput }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'TOGGLE_MASTERED'; id: string }
  | { type: 'SET_FILTER'; filter: FilterType }
  | { type: 'NAVIGATE'; direction: 'next' | 'prev' }
  | { type: 'SHUFFLE_CARDS' }
  | { type: 'BULK_IMPORT'; cards: Flashcard[] }
  | { type: 'LOAD_CARDS'; cards: Flashcard[] };

// ============================================================================
// LocalStorage Schema
// ============================================================================

/**
 * LocalStorage persistence schema
 */
export interface StorageSchema {
  /** Schema version for future migrations */
  version: number;

  /** Array of persisted flashcards */
  cards: Flashcard[];
}

/**
 * LocalStorage key constant
 */
export const STORAGE_KEY = 'flashcards-v1' as const;

// ============================================================================
// Bulk Import
// ============================================================================

/**
 * Input format for bulk import
 *
 * Format: "term, definition, partOfSpeech, example1 | example2 | example3"
 * Backward compatible: "term, definition" still works
 */
export interface BulkImportInput {
  /** Raw text input from user */
  rawText: string;
}

/**
 * Result of bulk import operation
 */
export interface BulkImportResult {
  /** Successfully imported cards */
  imported: Flashcard[];

  /** Errors encountered during import */
  errors: Array<{
    line: number;
    message: string;
    rawLine: string;
  }>;

  /** Summary statistics */
  summary: {
    totalLines: number;
    successCount: number;
    errorCount: number;
    duplicateCount: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard to check if a value is a valid Flashcard
 */
export const isFlashcard = (value: unknown): value is Flashcard => {
  if (typeof value !== 'object' || value === null) return false;

  const card = value as Flashcard;

  return (
    typeof card.id === 'string' &&
    typeof card.term === 'string' &&
    typeof card.definition === 'string' &&
    typeof card.mastered === 'boolean' &&
    typeof card.createdAt === 'string' &&
    (card.partOfSpeech === undefined || typeof card.partOfSpeech === 'string') &&
    (card.exampleSentences === undefined ||
      (Array.isArray(card.exampleSentences) &&
        card.exampleSentences.every((s) => typeof s === 'string')))
  );
};

/**
 * Type guard to check if browser supports Web Speech API
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  );
};
