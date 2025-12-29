/**
 * Bulk Import Utility - Parse Text into Flashcards
 *
 * Supports multiple input formats for quickly creating vocabulary cards:
 * - Semicolon-separated: "word, meaning; word2, meaning2; word3, meaning3"
 * - Newline-separated: "word, meaning\nword2, meaning2\nword3, meaning3"
 * - Mixed format: Combination of both
 *
 * Validation Rules:
 * - Vocabulary: 1-100 characters
 * - Meaning: 1-500 characters
 * - Both fields must be non-empty after trimming
 *
 * Returns BulkImportResult with successful and failed entries for user feedback.
 */

import type { Flashcard, BulkImportResult } from '../types/flashcard';

/**
 * Character limits matching AddCardForm validation
 */
const MAX_VOCABULARY_LENGTH = 100;
const MAX_MEANING_LENGTH = 500;

/**
 * Parses bulk import text and returns successful/failed entries
 *
 * @param rawText - User input text with vocabulary entries
 * @returns BulkImportResult with successful Flashcard[] and failed entries with errors
 *
 * @example
 * ```typescript
 * const text = "eloquent, fluent; ephemeral, short-lived";
 * const result = parseBulkImportText(text);
 * // result.successful = [{id: '...', term: 'eloquent', definition: 'fluent', ...}, ...]
 * // result.failed = []
 * ```
 */
export function parseBulkImportText(rawText: string): BulkImportResult {
  const successful: Flashcard[] = [];
  const failed: Array<{ rawText: string; error: string }> = [];

  if (!rawText || rawText.trim().length === 0) {
    return { successful, failed };
  }

  // Determine delimiter strategy:
  // - If text contains newlines, treat each line as one entry (semicolons are allowed within entries)
  // - If text has no newlines, split by semicolons (for single-line format)
  const hasNewlines = rawText.includes('\n');

  let allEntries: string[];

  if (hasNewlines) {
    // Newline-separated format - each line is one entry
    // Semicolons can be used within entries (e.g., for Chinese translations)
    allEntries = rawText.split('\n');
  } else {
    // Single-line semicolon-separated format
    allEntries = rawText.split(';');
  }

  // Process each entry
  for (const entry of allEntries) {
    const trimmedEntry = entry.trim();

    // Skip empty lines
    if (!trimmedEntry) {
      continue;
    }

    // Try to parse as "vocabulary, meaning" format
    const commaIndex = trimmedEntry.indexOf(',');

    if (commaIndex === -1) {
      // No comma found - invalid format
      failed.push({
        rawText: trimmedEntry,
        error: 'Missing comma separator. Expected format: "vocabulary, meaning"',
      });
      continue;
    }

    // Split by first comma only (meaning may contain commas)
    const vocabulary = trimmedEntry.substring(0, commaIndex).trim();
    const meaning = trimmedEntry.substring(commaIndex + 1).trim();

    // Validate vocabulary
    if (!vocabulary) {
      failed.push({
        rawText: trimmedEntry,
        error: 'Vocabulary cannot be empty',
      });
      continue;
    }

    if (vocabulary.length > MAX_VOCABULARY_LENGTH) {
      failed.push({
        rawText: trimmedEntry,
        error: `Vocabulary exceeds ${MAX_VOCABULARY_LENGTH} characters (${vocabulary.length} chars)`,
      });
      continue;
    }

    // Validate meaning
    if (!meaning) {
      failed.push({
        rawText: trimmedEntry,
        error: 'Meaning cannot be empty',
      });
      continue;
    }

    if (meaning.length > MAX_MEANING_LENGTH) {
      failed.push({
        rawText: trimmedEntry,
        error: `Meaning exceeds ${MAX_MEANING_LENGTH} characters (${meaning.length} chars)`,
      });
      continue;
    }

    // Create flashcard
    const card: Flashcard = {
      id: crypto.randomUUID(),
      term: vocabulary,
      definition: meaning,
      mastered: false,
      createdAt: new Date().toISOString(),
    };

    successful.push(card);
  }

  return { successful, failed };
}

/**
 * Detects duplicate vocabulary terms within a set of cards
 *
 * @param cards - Array of flashcards to check
 * @returns Array of duplicate terms (case-insensitive)
 *
 * @example
 * ```typescript
 * const cards = [
 *   { term: 'Eloquent', ... },
 *   { term: 'eloquent', ... },
 *   { term: 'Unique', ... }
 * ];
 * const dupes = detectDuplicates(cards);
 * // dupes = ['eloquent'] (case-insensitive match)
 * ```
 */
export function detectDuplicates(cards: Flashcard[]): string[] {
  const seen = new Map<string, number>(); // lowercase term -> count
  const duplicates: string[] = [];

  for (const card of cards) {
    const normalized = card.term.toLowerCase();
    const count = seen.get(normalized) || 0;

    if (count === 1) {
      // Second occurrence - add to duplicates
      duplicates.push(card.term);
    }

    seen.set(normalized, count + 1);
  }

  return duplicates;
}

/**
 * Checks if imported cards would create duplicates with existing cards
 *
 * @param existingCards - Cards already in the collection
 * @param newCards - Cards being imported
 * @returns Array of new card terms that conflict with existing cards
 *
 * @example
 * ```typescript
 * const existing = [{ term: 'Eloquent', ... }];
 * const newCards = [{ term: 'eloquent', ... }, { term: 'Unique', ... }];
 * const conflicts = checkExistingDuplicates(existing, newCards);
 * // conflicts = ['eloquent']
 * ```
 */
export function checkExistingDuplicates(
  existingCards: Flashcard[],
  newCards: Flashcard[]
): string[] {
  const existingTerms = new Set(
    existingCards.map((card) => card.term.toLowerCase())
  );

  const conflicts: string[] = [];

  for (const newCard of newCards) {
    if (existingTerms.has(newCard.term.toLowerCase())) {
      conflicts.push(newCard.term);
    }
  }

  return conflicts;
}
