/**
 * CardContext - Global State Management for Flashcards
 *
 * Implements React Context API pattern with useReducer for type-safe state management.
 * Provides global access to flashcard collection with automatic LocalStorage synchronization.
 *
 * Architecture:
 * - CardState: Application state shape (cards, filter, currentCardIndex)
 * - CardAction: Discriminated union of all reducer actions
 * - cardReducer: Pure function handling all state transformations
 * - CardProvider: Component wrapping app with context
 * - useCards: Custom hook for consuming context
 *
 * Constitutional Compliance:
 * - Principle III: React Context API (no Redux/Zustand)
 * - Principle IV: LocalStorage persistence on every state change
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { CardState, CardAction, Flashcard } from '../types/flashcard';
import { loadFromLocalStorage, saveToLocalStorage } from '../hooks/useLocalStorage';

/**
 * Context value shape
 */
interface CardContextValue {
  state: CardState;
  dispatch: React.Dispatch<CardAction>;
}

/**
 * Create context with undefined initial value
 * Will be populated by CardProvider
 */
const CardContext = createContext<CardContextValue | undefined>(undefined);

/**
 * Initial state for new sessions
 */
const initialState: CardState = {
  cards: [],
  filter: 'all',
  currentCardIndex: 0,
};

/**
 * Card Reducer - Pure state transformation function
 *
 * Handles all state mutations with immutable updates.
 * Each action returns a new state object.
 *
 * @param state - Current state
 * @param action - Action to perform
 * @returns New state after applying action
 */
function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'ADD_CARD': {
      // Generate new card with ID and timestamp
      const newCard: Flashcard = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        cards: [...state.cards, newCard],
      };
    }

    case 'UPDATE_CARD': {
      const { id, updates } = action.payload;

      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === id
            ? { ...card, ...updates }
            : card
        ),
      };
    }

    case 'DELETE_CARD': {
      const cardId = action.payload;
      const newCards = state.cards.filter((card) => card.id !== cardId);

      // Adjust currentCardIndex if needed
      let newIndex = state.currentCardIndex;
      if (newIndex >= newCards.length && newCards.length > 0) {
        newIndex = newCards.length - 1;
      } else if (newCards.length === 0) {
        newIndex = 0;
      }

      return {
        ...state,
        cards: newCards,
        currentCardIndex: newIndex,
      };
    }

    case 'TOGGLE_MASTERED': {
      const cardId = action.payload;

      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === cardId
            ? { ...card, mastered: !card.mastered }
            : card
        ),
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload,
        currentCardIndex: 0, // Reset to first card when filter changes
      };
    }

    case 'NAVIGATE': {
      const newIndex = action.payload;
      const maxIndex = state.cards.length - 1;

      // Clamp index to valid range
      const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));

      return {
        ...state,
        currentCardIndex: clampedIndex,
      };
    }

    case 'SHUFFLE_CARDS': {
      // Fisher-Yates shuffle algorithm
      const shuffled = [...state.cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return {
        ...state,
        cards: shuffled,
        currentCardIndex: 0, // Reset to first card after shuffle
      };
    }

    case 'BULK_IMPORT': {
      return {
        ...state,
        cards: [...state.cards, ...action.payload],
      };
    }

    case 'LOAD_CARDS': {
      return {
        ...state,
        cards: action.payload,
      };
    }

    default:
      // TypeScript ensures exhaustive case handling
      return state;
  }
}

/**
 * CardProvider Component
 *
 * Wraps application to provide global flashcard state.
 * Features:
 * - Loads cards from LocalStorage on mount
 * - Saves cards to LocalStorage on every state change
 * - Memoizes context value to prevent unnecessary re-renders
 * - Handles storage errors gracefully with user-friendly messages
 *
 * @param children - Child components to wrap
 */
export function CardProvider({ children }: { children: ReactNode }) {
  // Initialize reducer with lazy state initialization
  // This loads cards from LocalStorage only once on mount
  const [state, dispatch] = useReducer(
    cardReducer,
    initialState,
    (initial) => ({
      ...initial,
      cards: loadFromLocalStorage(),
    })
  );

  // Sync cards to LocalStorage whenever they change
  // This ensures persistence on every state mutation
  useEffect(() => {
    try {
      saveToLocalStorage(state.cards);
    } catch (error) {
      // Display user-friendly error message
      if (error instanceof Error) {
        // In a real app, this would trigger a toast notification
        console.error('[CardContext] Storage error:', error.message);
        alert(error.message);
      }
    }
  }, [state.cards]);

  // Memoize context value to prevent unnecessary re-renders
  // Only updates when state or dispatch changes
  const value = useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

/**
 * useCards Hook - Consumer hook for CardContext
 *
 * Provides type-safe access to flashcard state and dispatch.
 * Must be used within a CardProvider component tree.
 *
 * @throws Error if used outside CardProvider
 * @returns Context value with state and dispatch
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, dispatch } = useCards();
 *
 *   const addCard = () => {
 *     dispatch({
 *       type: 'ADD_CARD',
 *       payload: {
 *         term: 'React',
 *         definition: 'A JavaScript library',
 *         mastered: false,
 *       },
 *     });
 *   };
 *
 *   return <div>{state.cards.length} cards</div>;
 * }
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCards(): CardContextValue {
  const context = useContext(CardContext);

  if (context === undefined) {
    throw new Error(
      'useCards must be used within a CardProvider. ' +
        'Wrap your component tree with <CardProvider>...</CardProvider>'
    );
  }

  return context;
}

/**
 * Re-export utility functions from cardSelectors
 * (Moved to separate file to support React Fast Refresh)
 */
// eslint-disable-next-line react-refresh/only-export-components
export { getVisibleCards, getCurrentCard, getCardStats } from '../utils/cardSelectors';
