/**
 * AddCardForm Component - Create New Flashcards
 *
 * Features:
 * - Term and definition input fields with character limits
 * - Real-time validation (non-empty, max length 500/2000)
 * - Form submit handler dispatching ADD_CARD action
 * - Visual feedback for successful card creation (success toast)
 * - Auto-clear form after successful submission
 * - Keyboard shortcuts (Enter to submit from term field)
 * - Cyberpunk aesthetic with neon borders and glow effects
 * - Error states with visual indicators
 * - Character count displays
 * - ARIA labels for accessibility
 *
 * Constitutional Compliance:
 * - Principle III: Uses React Context API (useCards hook)
 * - Principle IV: Persists via ADD_CARD action → LocalStorage
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import { useState, useRef, useEffect } from 'react';
import { useCards } from '../contexts/CardContext';
import type { AddCardFormProps } from '../types/flashcard';

const MAX_WORD_LENGTH = 100;
const MAX_MEANING_LENGTH = 500;

export function AddCardForm({ onCardAdded }: AddCardFormProps = {}) {
  const { dispatch } = useCards();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validateForm = (): boolean => {
    const newErrors: { word?: string; meaning?: string } = {};

    // Validate word
    if (!word.trim()) {
      newErrors.word = 'Vocabulary is required';
    } else if (word.length > MAX_WORD_LENGTH) {
      newErrors.word = `Vocabulary must be ${MAX_WORD_LENGTH} characters or less`;
    }

    // Validate meaning
    if (!meaning.trim()) {
      newErrors.meaning = 'Meaning is required';
    } else if (meaning.length > MAX_MEANING_LENGTH) {
      newErrors.meaning = `Meaning must be ${MAX_MEANING_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Dispatch ADD_CARD action
    const newCard = {
      term: word.trim(),
      definition: meaning.trim(),
      mastered: false,
    };

    dispatch({
      type: 'ADD_CARD',
      payload: newCard,
    });

    // Visual feedback
    setShowSuccess(true);

    // Clear form
    setWord('');
    setMeaning('');
    setErrors({});

    // Focus back on word input for quick successive additions
    wordInputRef.current?.focus();

    // Callback for parent component
    if (onCardAdded) {
      onCardAdded({
        ...newCard,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }
  };

  const getWordCharCount = () => word.length;
  const getMeaningCharCount = () => meaning.length;

  const isWordValid = word.trim().length > 0 && word.length <= MAX_WORD_LENGTH;
  const isMeaningValid =
    meaning.trim().length > 0 && meaning.length <= MAX_MEANING_LENGTH;
  const canSubmit = isWordValid && isMeaningValid;

  return (
    <div className="relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-6 py-4 bg-accent-success/20 border-2 border-accent-success/60 rounded-xl shadow-glow-green backdrop-blur-sm">
            <svg
              className="w-6 h-6 text-accent-success"
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
            <span className="font-mono text-accent-success">
              Vocabulary added successfully!
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Word Input */}
        <div className="space-y-2">
          <label
            htmlFor="word"
            className="flex items-center justify-between text-sm font-mono uppercase tracking-wider"
          >
            <span className="text-accent-primary">Vocabulary</span>
            <span
              className={`text-xs ${
                getWordCharCount() > MAX_WORD_LENGTH
                  ? 'text-red-400'
                  : getWordCharCount() > MAX_WORD_LENGTH * 0.9
                  ? 'text-accent-warning'
                  : 'text-gray-500'
              }`}
            >
              {getWordCharCount()} / {MAX_WORD_LENGTH}
            </span>
          </label>
          <input
            ref={wordInputRef}
            type="text"
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onBlur={validateForm}
            className={`
              w-full px-4 py-3 bg-dark-card border-2 rounded-xl
              font-sans text-lg text-white placeholder-gray-500
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg
              ${
                errors.word
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                  : word.length > 0
                  ? 'border-accent-primary/60 focus:border-accent-primary focus:ring-accent-primary/50 shadow-glow'
                  : 'border-dark-border focus:border-accent-primary focus:ring-accent-primary/50'
              }
            `}
            placeholder="Enter vocabulary (e.g., Eloquent)"
            aria-label="Vocabulary"
            aria-invalid={!!errors.word}
            aria-describedby={errors.word ? 'word-error' : undefined}
            maxLength={MAX_WORD_LENGTH + 50} // Allow typing slightly over for better UX
          />
          {errors.word && (
            <p
              id="word-error"
              className="text-sm text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.word}
            </p>
          )}
        </div>

        {/* Meaning Textarea */}
        <div className="space-y-2">
          <label
            htmlFor="meaning"
            className="flex items-center justify-between text-sm font-mono uppercase tracking-wider"
          >
            <span className="text-accent-secondary">Meaning</span>
            <span
              className={`text-xs ${
                getMeaningCharCount() > MAX_MEANING_LENGTH
                  ? 'text-red-400'
                  : getMeaningCharCount() > MAX_MEANING_LENGTH * 0.9
                  ? 'text-accent-warning'
                  : 'text-gray-500'
              }`}
            >
              {getMeaningCharCount()} / {MAX_MEANING_LENGTH}
            </span>
          </label>
          <textarea
            id="meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            onBlur={validateForm}
            rows={4}
            className={`
              w-full px-4 py-3 bg-dark-card border-2 rounded-xl
              font-sans text-lg text-white placeholder-gray-500
              transition-all duration-300 resize-none
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg
              ${
                errors.meaning
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                  : meaning.length > 0
                  ? 'border-accent-secondary/60 focus:border-accent-secondary focus:ring-accent-secondary/50 shadow-glow-pink'
                  : 'border-dark-border focus:border-accent-secondary focus:ring-accent-secondary/50'
              }
            `}
            placeholder="Enter meaning (e.g., Fluent or persuasive in speaking or writing; 流暢的、有說服力的)"
            aria-label="Meaning"
            aria-invalid={!!errors.meaning}
            aria-describedby={errors.meaning ? 'meaning-error' : undefined}
            maxLength={MAX_MEANING_LENGTH + 100}
          />
          {errors.meaning && (
            <p
              id="meaning-error"
              className="text-sm text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.meaning}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            w-full px-6 py-4 rounded-xl font-mono text-sm uppercase tracking-wider
            transition-all duration-300 transform
            ${
              canSubmit
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow hover:shadow-glow-pink hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-dark-card text-gray-600 border-2 border-dark-border cursor-not-allowed'
            }
          `}
          aria-label={canSubmit ? 'Add vocabulary' : 'Fill in both fields to add vocabulary'}
        >
          <div className="flex items-center justify-center gap-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Vocabulary
          </div>
        </button>

        {/* Helper Text */}
        <div className="text-center text-sm text-gray-500 font-mono">
          <p>Press Enter in vocabulary field to submit</p>
        </div>
      </form>
    </div>
  );
}
