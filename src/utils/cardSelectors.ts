/**
 * Card Selectors - Derived state utilities
 *
 * Pure functions for computing derived data from CardState.
 * Extracted from CardContext to support React Fast Refresh.
 */

import type { CardState, Flashcard } from '../types/flashcard';

/**
 * Get visible cards based on current filter
 *
 * @param state - Current card state
 * @returns Filtered array of cards based on active filter
 */
export function getVisibleCards(state: CardState): Flashcard[] {
  if (state.filter === 'needsReview') {
    return state.cards.filter((card) => !card.mastered);
  }
  return state.cards;
}

/**
 * Get current card being studied (or null if none)
 *
 * @param state - Current card state
 * @returns The current flashcard or null if no cards available
 */
export function getCurrentCard(state: CardState): Flashcard | null {
  const visibleCards = getVisibleCards(state);
  return visibleCards[state.currentCardIndex] || null;
}

/**
 * Get statistics about card collection
 *
 * @param state - Current card state
 * @returns Statistics object with counts and percentages
 */
export function getCardStats(state: CardState) {
  const total = state.cards.length;
  const mastered = state.cards.filter((card) => card.mastered).length;
  const needsReview = total - mastered;
  const masteredPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return {
    total,
    mastered,
    needsReview,
    masteredPercentage,
  };
}
