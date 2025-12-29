/**
 * StudyView Component - Main Study Interface
 *
 * Features:
 * - Displays current flashcard with navigation controls
 * - Next/Previous navigation with visual indicators
 * - Keyboard support (Arrow keys for navigation, Spacebar for flip)
 * - Progress indicator showing position in deck
 * - Empty state when no cards available
 * - Filter support (All Cards vs Needs Review)
 * - Card counter and progress bar
 * - ARIA labels for accessibility
 * - Cyberpunk aesthetic with neon accents
 *
 * Constitutional Compliance:
 * - Principle III: Uses React Context API (useCards hook)
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import { useEffect, useCallback } from 'react';
import { useCards, getVisibleCards, getCurrentCard, getCardStats } from '../contexts/CardContext';
import { FlashCard } from './FlashCard';
import { FilterToggle } from './FilterToggle';

export function StudyView() {
  const { state, dispatch } = useCards();
  const visibleCards = getVisibleCards(state);
  const currentCard = getCurrentCard(state);
  const stats = getCardStats(state);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (visibleCards.length === 0) return;
    const nextIndex = (state.currentCardIndex + 1) % visibleCards.length;
    dispatch({ type: 'NAVIGATE', payload: nextIndex });
  }, [state.currentCardIndex, visibleCards.length, dispatch]);

  const handlePrevious = useCallback(() => {
    if (visibleCards.length === 0) return;
    const prevIndex =
      state.currentCardIndex === 0
        ? visibleCards.length - 1
        : state.currentCardIndex - 1;
    dispatch({ type: 'NAVIGATE', payload: prevIndex });
  }, [state.currentCardIndex, visibleCards.length, dispatch]);

  const handleToggleMastered = useCallback(() => {
    if (!currentCard) return;
    dispatch({ type: 'TOGGLE_MASTERED', payload: currentCard.id });
  }, [currentCard, dispatch]);

  const handleShuffle = useCallback(() => {
    dispatch({ type: 'SHUFFLE_CARDS' });
  }, [dispatch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          // Spacebar is handled by FlashCard component for flipping
          // Don't prevent default to allow natural behavior
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleToggleMastered();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleShuffle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleToggleMastered, handleShuffle]);

  // Empty state - No cards
  if (state.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-fade-in-up">
          <div className="mb-8">
            <div className="inline-block p-8 rounded-full bg-dark-card border-2 border-dark-border">
              <svg
                className="w-24 h-24 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            No Flashcards Yet
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Create your first flashcard to start studying.
          </p>
          <button className="btn-neon px-8 py-4 bg-accent-primary text-white rounded-xl font-mono text-sm uppercase tracking-wider shadow-glow hover:shadow-glow-pink transition-all duration-300">
            Create Card
          </button>
        </div>
      </div>
    );
  }

  // Empty state - All cards mastered (when filter is needsReview)
  if (state.filter === 'needsReview' && visibleCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-fade-in-up">
          <div className="mb-8">
            <div className="inline-block p-8 rounded-full bg-accent-success/20 border-2 border-accent-success/40">
              <svg
                className="w-24 h-24 text-accent-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-accent-success">
            All Cards Mastered!
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            You've mastered all your flashcards. Great work!
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
            className="btn-neon px-8 py-4 bg-accent-primary text-white rounded-xl font-mono text-sm uppercase tracking-wider shadow-glow hover:shadow-glow-pink transition-all duration-300"
          >
            View All Cards
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const currentPosition = state.currentCardIndex + 1;
  const totalCards = visibleCards.length;
  const progressPercentage = (currentPosition / totalCards) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Header with Progress and Filter */}
        <div className="mb-8 animate-fade-in-up space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Study Mode
              </h1>
              <p className="text-sm text-gray-400 font-mono mt-1">
                Card {currentPosition} of {totalCards}
                {state.filter === 'needsReview' && ' (Needs Review)'}
              </p>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500 font-mono space-y-1">
                <span className="block">← → Navigate</span>
                <span className="block">SPACE Flip</span>
                <span className="block">M Toggle Mastered</span>
                <span className="block">S Shuffle</span>
              </p>
            </div>
          </div>

          {/* Filter Toggle and Shuffle */}
          <div className="flex justify-center items-center gap-4">
            <FilterToggle
              filter={state.filter}
              onFilterChange={(filter) => dispatch({ type: 'SET_FILTER', payload: filter })}
              needsReviewCount={stats.needsReview}
            />

            {/* Shuffle Button */}
            <button
              onClick={handleShuffle}
              disabled={state.cards.length === 0}
              className="group relative p-3 rounded-xl bg-dark-card border-2 border-dark-border hover:border-accent-secondary transition-all duration-300 hover:shadow-glow-pink disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-dark-border disabled:hover:shadow-none"
              aria-label="Shuffle cards for randomized study"
              title="Shuffle cards"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-accent-secondary transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Shuffle
              </span>
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="h-1 bg-dark-card rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentPosition}
            aria-valuemin={1}
            aria-valuemax={totalCards}
            aria-label={`Progress: ${currentPosition} of ${totalCards} cards`}
          >
            <div
              className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-success transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* FlashCard */}
        <div className="mb-8 animate-fade-in-up stagger-1">
          {currentCard && (
            <FlashCard
              term={currentCard.term}
              definition={currentCard.definition}
              mastered={currentCard.mastered}
              onToggleMastered={handleToggleMastered}
              partOfSpeech={currentCard.partOfSpeech}
              exampleSentences={currentCard.exampleSentences}
            />
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 animate-fade-in-up stagger-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="group relative p-4 rounded-xl bg-dark-card border-2 border-dark-border hover:border-accent-primary transition-all duration-300 hover:shadow-glow"
            aria-label="Previous card (Left arrow key)"
            disabled={totalCards === 0}
          >
            <svg
              className="w-6 h-6 text-gray-400 group-hover:text-accent-primary transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Previous
            </span>
          </button>

          {/* Card Counter Display */}
          <div className="px-8 py-3 rounded-xl bg-dark-card border-2 border-dark-border">
            <span className="font-mono text-lg">
              <span className="text-accent-primary font-bold">
                {currentPosition}
              </span>
              <span className="text-gray-500 mx-2">/</span>
              <span className="text-gray-400">{totalCards}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="group relative p-4 rounded-xl bg-dark-card border-2 border-dark-border hover:border-accent-primary transition-all duration-300 hover:shadow-glow"
            aria-label="Next card (Right arrow key)"
            disabled={totalCards === 0}
          >
            <svg
              className="w-6 h-6 text-gray-400 group-hover:text-accent-primary transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
