/**
 * CardLibrary Component - Manage Flashcard Collection
 *
 * Features:
 * - Display list of all cards with term and definition
 * - Inline editing mode for term and definition
 * - Delete button with confirmation dialog
 * - Empty state when no cards exist
 * - Card count and mastered statistics
 * - Search/filter capability (future enhancement)
 * - Cyberpunk aesthetic with card grid layout
 * - Smooth animations for add/edit/delete operations
 * - ARIA labels for accessibility
 *
 * Constitutional Compliance:
 * - Principle III: Uses React Context API (useCards hook)
 * - Principle IV: UPDATE_CARD and DELETE_CARD persist via LocalStorage
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import { useState } from 'react';
import { useCards, getCardStats } from '../contexts/CardContext';
import type { CardLibraryProps } from '../types/flashcard';
import { RECOMMENDED_PARTS_OF_SPEECH, FLASHCARD_CONSTRAINTS } from '../types/flashcard';

interface EditingCard {
  id: string;
  term: string;
  definition: string;
  partOfSpeech?: string;
  exampleSentences?: string[];
}

export function CardLibrary({ onNavigateToStudy }: CardLibraryProps = {}) {
  const { state, dispatch } = useCards();
  const stats = getCardStats(state);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Start editing a card
  const handleStartEdit = (id: string, term: string, definition: string, partOfSpeech?: string, exampleSentences?: string[]) => {
    setEditingCard({
      id,
      term,
      definition,
      partOfSpeech,
      exampleSentences: exampleSentences && exampleSentences.length > 0 ? [...exampleSentences] : ['']
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  // Handle example sentence changes in edit mode
  const handleEditExampleChange = (index: number, value: string) => {
    if (!editingCard) return;
    const newExamples = [...(editingCard.exampleSentences || [''])];
    newExamples[index] = value;
    setEditingCard({ ...editingCard, exampleSentences: newExamples });
  };

  const handleAddEditExample = () => {
    if (!editingCard) return;
    const currentExamples = editingCard.exampleSentences || [''];
    if (currentExamples.length < FLASHCARD_CONSTRAINTS.MAX_EXAMPLE_SENTENCES) {
      setEditingCard({ ...editingCard, exampleSentences: [...currentExamples, ''] });
    }
  };

  const handleRemoveEditExample = (index: number) => {
    if (!editingCard) return;
    const currentExamples = editingCard.exampleSentences || [''];
    if (currentExamples.length > 1) {
      const newExamples = currentExamples.filter((_, i) => i !== index);
      setEditingCard({ ...editingCard, exampleSentences: newExamples });
    } else {
      setEditingCard({ ...editingCard, exampleSentences: [''] });
    }
  };

  // Save edited card
  const handleSaveEdit = () => {
    if (!editingCard) return;

    const trimmedTerm = editingCard.term.trim();
    const trimmedDefinition = editingCard.definition.trim();
    const trimmedPartOfSpeech = editingCard.partOfSpeech?.trim();
    const filteredExamples = (editingCard.exampleSentences || [])
      .map(ex => ex.trim())
      .filter(ex => ex.length > 0);

    // Validation
    if (!trimmedTerm || !trimmedDefinition) {
      alert('Both vocabulary and meaning are required');
      return;
    }

    if (trimmedTerm.length > 100) {
      alert('Vocabulary must be 100 characters or less');
      return;
    }

    if (trimmedDefinition.length > 500) {
      alert('Meaning must be 500 characters or less');
      return;
    }

    if (trimmedPartOfSpeech && trimmedPartOfSpeech.length > FLASHCARD_CONSTRAINTS.PART_OF_SPEECH_MAX_LENGTH) {
      alert(`Part of speech must be ${FLASHCARD_CONSTRAINTS.PART_OF_SPEECH_MAX_LENGTH} characters or less`);
      return;
    }

    // Validate example sentences
    for (const example of filteredExamples) {
      if (example.length > FLASHCARD_CONSTRAINTS.EXAMPLE_SENTENCE_MAX_LENGTH) {
        alert(`Each example must be ${FLASHCARD_CONSTRAINTS.EXAMPLE_SENTENCE_MAX_LENGTH} characters or less`);
        return;
      }
    }

    // Dispatch UPDATE_CARD action
    dispatch({
      type: 'UPDATE_CARD',
      payload: {
        id: editingCard.id,
        updates: {
          term: trimmedTerm,
          definition: trimmedDefinition,
          ...(trimmedPartOfSpeech && { partOfSpeech: trimmedPartOfSpeech }),
          ...(filteredExamples.length > 0 && { exampleSentences: filteredExamples }),
        },
      },
    });

    setEditingCard(null);
  };

  // Show delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Confirm delete
  const handleConfirmDelete = (id: string) => {
    dispatch({
      type: 'DELETE_CARD',
      payload: id,
    });
    setDeleteConfirmId(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Toggle mastered status
  const handleToggleMastered = (id: string) => {
    dispatch({
      type: 'TOGGLE_MASTERED',
      payload: id,
    });
  };

  // Empty state
  if (state.cards.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-block p-8 rounded-full bg-dark-card border-2 border-dark-border mb-6">
          <svg
            className="w-16 h-16 text-gray-500"
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
        <h2 className="text-2xl font-bold mb-3 gradient-text">
          No Flashcards Yet
        </h2>
        <p className="text-gray-400 mb-6">
          Create your first flashcard using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="flex items-center justify-between p-4 bg-dark-card border-2 border-dark-border rounded-xl">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm font-mono text-gray-400 uppercase">Total Cards</p>
            <p className="text-3xl font-bold text-accent-primary">{stats.total}</p>
          </div>
          <div className="w-px h-12 bg-dark-border" />
          <div>
            <p className="text-sm font-mono text-gray-400 uppercase">Mastered</p>
            <p className="text-3xl font-bold text-accent-success">{stats.mastered}</p>
          </div>
          <div className="w-px h-12 bg-dark-border" />
          <div>
            <p className="text-sm font-mono text-gray-400 uppercase">Needs Review</p>
            <p className="text-3xl font-bold text-accent-warning">{stats.needsReview}</p>
          </div>
          <div className="w-px h-12 bg-dark-border" />
          <div>
            <p className="text-sm font-mono text-gray-400 uppercase">Progress</p>
            <p className="text-3xl font-bold gradient-text">{stats.masteredPercentage}%</p>
          </div>
        </div>

        {onNavigateToStudy && (
          <button
            onClick={onNavigateToStudy}
            className="px-6 py-3 bg-accent-primary text-white rounded-xl font-mono text-sm uppercase tracking-wider shadow-glow hover:shadow-glow-pink transition-all duration-300 hover:scale-105"
          >
            Study Cards
          </button>
        )}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.cards.map((card, index) => {
          const isEditing = editingCard?.id === card.id;
          const isDeleting = deleteConfirmId === card.id;

          return (
            <div
              key={card.id}
              className={`
                relative p-6 bg-dark-card border-2 rounded-xl
                transition-all duration-300 animate-fade-in-up
                ${isDeleting ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-dark-border hover:border-accent-primary/60'}
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Mastered Badge */}
              {card.mastered && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-accent-success/20 border-2 border-accent-success/60 rounded-full">
                  <span className="text-xs font-mono text-accent-success uppercase flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Mastered
                  </span>
                </div>
              )}

              {/* Delete Confirmation Overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-dark-bg/95 rounded-xl flex flex-col items-center justify-center gap-4 z-10 backdrop-blur-sm">
                  <svg
                    className="w-12 h-12 text-red-500"
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
                  <p className="text-white font-bold text-center">Delete this card?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmDelete(card.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-mono text-sm uppercase hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-4 py-2 bg-dark-card border-2 border-dark-border text-white rounded-lg font-mono text-sm uppercase hover:border-accent-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Card Content */}
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-accent-primary uppercase mb-1">
                      Vocabulary
                    </label>
                    <input
                      type="text"
                      value={editingCard.term}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, term: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-dark-bg border-2 border-accent-primary/60 rounded-lg text-white focus:outline-none focus:border-accent-primary"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-accent-secondary uppercase mb-1">
                      Meaning
                    </label>
                    <textarea
                      value={editingCard.definition}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, definition: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-bg border-2 border-accent-secondary/60 rounded-lg text-white resize-none focus:outline-none focus:border-accent-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 uppercase mb-1">
                      Part of Speech (Optional)
                    </label>
                    <input
                      type="text"
                      list="partsOfSpeechEdit"
                      value={editingCard.partOfSpeech || ''}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, partOfSpeech: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-dark-bg border-2 border-cyan-400/60 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="noun, verb, adjective, etc."
                    />
                    <datalist id="partsOfSpeechEdit">
                      {RECOMMENDED_PARTS_OF_SPEECH.map((pos) => (
                        <option key={pos} value={pos} />
                      ))}
                    </datalist>
                  </div>

                  {/* Example Sentences Edit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono text-purple-400 uppercase">
                        Examples (Optional)
                      </label>
                      <span className="text-xs text-gray-500 font-mono">
                        {(editingCard.exampleSentences || ['']).filter(ex => ex.trim()).length} / {FLASHCARD_CONSTRAINTS.MAX_EXAMPLE_SENTENCES}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(editingCard.exampleSentences || ['']).map((example, index) => (
                        <div key={index} className="flex gap-1">
                          <input
                            type="text"
                            value={example}
                            onChange={(e) => handleEditExampleChange(index, e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-dark-bg border-2 border-purple-400/60 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
                            placeholder={`Example ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditExample(index)}
                            className="px-2 py-1 bg-dark-bg border-2 border-dark-border hover:border-red-500 hover:text-red-500 rounded-lg transition-all text-xs"
                            aria-label={`Remove example ${index + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {(editingCard.exampleSentences || ['']).length < FLASHCARD_CONSTRAINTS.MAX_EXAMPLE_SENTENCES && (
                      <button
                        type="button"
                        onClick={handleAddEditExample}
                        className="w-full px-2 py-1.5 rounded-lg border-2 border-purple-400/40 text-purple-400 hover:border-purple-400 hover:bg-purple-400/10 transition-all text-xs font-mono uppercase"
                      >
                        + Add Example
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 bg-accent-success text-white rounded-lg font-mono text-sm uppercase hover:bg-accent-success/80 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-dark-bg border-2 border-dark-border text-white rounded-lg font-mono text-sm uppercase hover:border-accent-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-mono text-accent-primary uppercase mb-1">
                      Vocabulary
                    </p>
                    <p className="text-lg font-semibold text-white break-words">
                      {card.term}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-accent-secondary uppercase mb-1">
                      Meaning
                    </p>
                    <p className="text-sm text-gray-300 break-words line-clamp-3">
                      {card.definition}
                    </p>
                  </div>

                  {/* Part of Speech Badge */}
                  {card.partOfSpeech && (
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40">
                        <svg
                          className="w-3 h-3 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span className="text-xs font-mono text-cyan-300 uppercase">
                          {card.partOfSpeech}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Example Sentences */}
                  {card.exampleSentences && card.exampleSentences.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-purple-400 uppercase">
                        Examples ({card.exampleSentences.length})
                      </p>
                      <div className="space-y-1">
                        {card.exampleSentences.slice(0, 2).map((example, index) => (
                          <p key={index} className="text-xs text-gray-400 pl-2 border-l-2 border-purple-500/60 line-clamp-1">
                            {example}
                          </p>
                        ))}
                        {card.exampleSentences.length > 2 && (
                          <p className="text-xs text-gray-500 pl-2">
                            +{card.exampleSentences.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-dark-border">
                    <button
                      onClick={() => handleToggleMastered(card.id)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg font-mono text-xs uppercase
                        transition-all duration-300
                        ${
                          card.mastered
                            ? 'bg-accent-success/20 text-accent-success border-2 border-accent-success/60'
                            : 'bg-dark-bg text-gray-400 border-2 border-dark-border hover:border-accent-success/60'
                        }
                      `}
                      aria-label={card.mastered ? 'Mark as not mastered' : 'Mark as mastered'}
                    >
                      {card.mastered ? 'Mastered' : 'Mark Mastered'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(card.id, card.term, card.definition, card.partOfSpeech, card.exampleSentences)}
                      className="px-3 py-2 bg-dark-bg border-2 border-dark-border text-gray-400 rounded-lg hover:border-accent-primary hover:text-accent-primary transition-all"
                      aria-label="Edit card"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(card.id)}
                      className="px-3 py-2 bg-dark-bg border-2 border-dark-border text-gray-400 rounded-lg hover:border-red-500 hover:text-red-500 transition-all"
                      aria-label="Delete card"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
