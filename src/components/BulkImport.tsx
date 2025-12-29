/**
 * BulkImport Component - Quick Vocabulary Card Creation from Text
 *
 * Features:
 * - Large textarea for paste input
 * - Supports semicolon-separated and newline-separated formats
 * - Real-time character count
 * - Duplicate detection with warnings
 * - Success/failure feedback with detailed results
 * - Example format hints
 * - Cyberpunk aesthetic with neon accents and glows
 * - ARIA labels for accessibility
 *
 * Input Formats:
 * - Semicolon-separated: "word, meaning; word2, meaning2"
 * - Newline-separated: "word, meaning\nword2, meaning2"
 * - Mixed format: Combination of both
 *
 * Constitutional Compliance:
 * - Principle III: Uses React Context API (useCards hook)
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import { useState, useCallback } from 'react';
import { useCards } from '../contexts/CardContext';
import { parseBulkImportText, checkExistingDuplicates } from '../utils/bulkImport';
import type { BulkImportProps, BulkImportResult } from '../types/flashcard';

export function BulkImport({ onImportComplete }: BulkImportProps) {
  const { state, dispatch } = useCards();
  const [inputText, setInputText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [duplicatesSkipped, setDuplicatesSkipped] = useState<string[]>([]);

  /**
   * Handle bulk import submission
   */
  const handleImport = useCallback(() => {
    // Clear previous results
    setImportResult(null);
    setDuplicatesSkipped([]);

    // Validate non-empty input
    if (!inputText.trim()) {
      setImportResult({
        successful: [],
        failed: [{ rawText: '', error: 'Please enter some text to import' }],
      });
      return;
    }

    setIsImporting(true);

    // Parse input text
    const result = parseBulkImportText(inputText);

    // Filter out duplicates
    let cardsToImport = result.successful;
    const skipped: string[] = [];

    if (result.successful.length > 0) {
      const existingTermsLowercase = new Set(
        state.cards.map((card) => card.term.toLowerCase())
      );

      // Separate duplicates from new cards
      cardsToImport = result.successful.filter((card) => {
        const isDuplicate = existingTermsLowercase.has(card.term.toLowerCase());
        if (isDuplicate) {
          skipped.push(card.term);
          return false; // Filter out duplicates
        }
        return true; // Keep non-duplicates
      });

      // Set skipped duplicates for display
      if (skipped.length > 0) {
        setDuplicatesSkipped(skipped);
      }

      // Only dispatch if there are cards to import
      if (cardsToImport.length > 0) {
        dispatch({
          type: 'BULK_IMPORT',
          payload: cardsToImport,
        });

        // Clear textarea on success
        setInputText('');
      }

      // Update result to reflect filtered cards
      const finalResult: BulkImportResult = {
        successful: cardsToImport,
        failed: result.failed,
      };

      // Callback
      onImportComplete?.(finalResult);
      setImportResult(finalResult);
    } else {
      setImportResult(result);
    }

    setIsImporting(false);
  }, [inputText, state.cards, dispatch, onImportComplete]);

  /**
   * Handle Enter key in textarea (Cmd+Enter to import)
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleImport();
      }
    },
    [handleImport]
  );

  /**
   * Clear all feedback and input
   */
  const handleClear = useCallback(() => {
    setInputText('');
    setImportResult(null);
    setDuplicatesSkipped([]);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">
          Bulk Import Vocabulary
        </h2>
        <p className="text-gray-400 text-sm">
          Quickly add multiple vocabulary cards from formatted text
        </p>
      </div>

      {/* Format Examples */}
      <div className="mb-6 p-4 bg-dark-card border-2 border-dark-border rounded-xl">
        <h3 className="text-sm font-mono uppercase tracking-wider text-accent-primary mb-3">
          Supported Formats
        </h3>
        <div className="space-y-2 text-sm text-gray-400 font-mono">
          <div>
            <span className="text-accent-secondary">One entry per line:</span>
            <code className="block ml-4 mt-1 text-gray-300 whitespace-pre-line">
              eloquent, fluent or persuasive; 流暢的
              ephemeral, lasting for a short time; 短暫的
            </code>
          </div>
          <div>
            <span className="text-accent-secondary">Single line (semicolon-separated):</span>
            <code className="block ml-4 mt-1 text-gray-300">
              eloquent, fluent; ephemeral, short-lived; ubiquitous, everywhere
            </code>
          </div>
          <div className="text-xs text-gray-500 mt-3">
            💡 Tip: Press <kbd className="px-2 py-1 bg-dark-bg rounded border border-dark-border">Cmd+Enter</kbd> to import
          </div>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="mb-6">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your vocabulary list here...&#10;&#10;Example:&#10;Eloquent, fluent or persuasive in speaking or writing; 流暢的&#10;Ephemeral, lasting for a very short time; 短暫的&#10;Ubiquitous, present everywhere; 無處不在的"
            className="w-full h-64 px-6 py-4 bg-dark-card border-2 border-dark-border rounded-xl text-white placeholder-gray-500 font-mono text-sm resize-none focus:border-accent-primary focus:shadow-glow transition-all duration-300 outline-none"
            aria-label="Bulk import text input"
          />
          {/* Character Count */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
            {inputText.length} characters
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleImport}
          disabled={isImporting || !inputText.trim()}
          className="btn-neon px-8 py-4 bg-accent-primary text-white rounded-xl font-mono text-sm uppercase tracking-wider shadow-glow hover:shadow-glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-glow"
          aria-label="Import vocabulary cards"
        >
          {isImporting ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Importing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import Cards
            </span>
          )}
        </button>

        {inputText.trim() && (
          <button
            onClick={handleClear}
            className="px-6 py-4 bg-dark-card border-2 border-dark-border text-gray-400 rounded-xl font-mono text-sm uppercase tracking-wider hover:border-accent-warning hover:text-accent-warning transition-all duration-300"
            aria-label="Clear input and results"
          >
            Clear
          </button>
        )}
      </div>

      {/* Duplicates Skipped Info */}
      {duplicatesSkipped.length > 0 && (
        <div className="mb-6 p-6 bg-blue-500/10 border-2 border-blue-500/40 rounded-xl animate-fade-in-up">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-blue-400 font-mono font-bold mb-2">
                Duplicates Skipped
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                The following vocabulary words already exist and were not imported:
              </p>
              <ul className="space-y-1">
                {duplicatesSkipped.map((term, index) => (
                  <li key={index} className="text-sm text-gray-400 font-mono">
                    • {term}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                {duplicatesSkipped.length} duplicate{duplicatesSkipped.length !== 1 ? 's' : ''} filtered out to prevent duplicates in your collection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="space-y-4 animate-fade-in-up stagger-1">
          {/* Success Summary */}
          {importResult.successful.length > 0 && (
            <div className="p-6 bg-accent-success/10 border-2 border-accent-success/40 rounded-xl">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-accent-success flex-shrink-0 mt-0.5"
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
                <div className="flex-1">
                  <h4 className="text-accent-success font-mono font-bold mb-1">
                    Import Successful
                  </h4>
                  <p className="text-sm text-gray-300">
                    Successfully imported <span className="font-bold text-accent-success">{importResult.successful.length}</span> vocabulary card{importResult.successful.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Failure Summary */}
          {importResult.failed.length > 0 && (
            <div className="p-6 bg-red-500/10 border-2 border-red-500/40 rounded-xl">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-red-400 font-mono font-bold mb-3">
                    {importResult.failed.length} Error{importResult.failed.length !== 1 ? 's' : ''}
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {importResult.failed.map((failure, index) => (
                      <div
                        key={index}
                        className="p-3 bg-dark-bg/50 rounded-lg border border-red-500/20"
                      >
                        <p className="text-xs text-red-400 font-mono mb-1">
                          {failure.error}
                        </p>
                        {failure.rawText && (
                          <code className="text-xs text-gray-400 block truncate">
                            "{failure.rawText}"
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty Result */}
          {importResult.successful.length === 0 && importResult.failed.length === 0 && (
            <div className="p-6 bg-dark-card border-2 border-dark-border rounded-xl text-center">
              <p className="text-gray-400 text-sm">
                No valid entries found. Please check the format and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
