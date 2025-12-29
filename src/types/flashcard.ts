/**
 * Flashcard Application Type Definitions
 *
 * Core types for the flashcard learning application with LocalStorage persistence.
 * Follows the data model specification from specs/001-flashcards-app/data-model.md
 */

/**
 * Represents a single flashcard with term (front) and definition (back)
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
        updates: Partial<Pick<Flashcard, 'term' | 'definition'>>;
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
