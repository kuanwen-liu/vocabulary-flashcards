/**
 * FilterToggle Component - Filter Cards by Mastery Status
 *
 * Features:
 * - Toggle between "All Cards" and "Needs Review" (unmastered only)
 * - Badge showing count of cards needing review
 * - Dispatches SET_FILTER action to update global filter state
 * - Cyberpunk aesthetic with neon highlights
 * - Smooth toggle animation
 * - ARIA labels for accessibility
 *
 * Constitutional Compliance:
 * - Principle III: Uses React Context API (SET_FILTER action)
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import type { FilterToggleProps } from '../types/flashcard';

export function FilterToggle({
  filter,
  onFilterChange,
  needsReviewCount = 0,
}: FilterToggleProps) {
  return (
    <div className="inline-flex items-center gap-4 p-1 bg-dark-card border-2 border-dark-border rounded-xl">
      {/* All Cards Button */}
      <button
        onClick={() => onFilterChange('all')}
        className={`
          relative px-6 py-2.5 rounded-lg font-mono text-sm uppercase tracking-wider
          transition-all duration-300
          ${
            filter === 'all'
              ? 'bg-accent-primary text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
          }
        `}
        aria-label="Show all vocabulary cards"
        aria-pressed={filter === 'all'}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>All Cards</span>
        </div>
      </button>

      {/* Needs Review Button */}
      <button
        onClick={() => onFilterChange('needsReview')}
        className={`
          relative px-6 py-2.5 rounded-lg font-mono text-sm uppercase tracking-wider
          transition-all duration-300
          ${
            filter === 'needsReview'
              ? 'bg-accent-warning text-dark-bg shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
          }
        `}
        aria-label={`Show ${needsReviewCount} vocabulary cards needing review`}
        aria-pressed={filter === 'needsReview'}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Needs Review</span>
          {needsReviewCount > 0 && (
            <span
              className={`
                ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                ${
                  filter === 'needsReview'
                    ? 'bg-dark-bg text-accent-warning'
                    : 'bg-accent-warning/20 text-accent-warning'
                }
              `}
            >
              {needsReviewCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
