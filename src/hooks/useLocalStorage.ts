/**
 * LocalStorage Persistence Hook
 *
 * Implements the storage contract defined in contracts/storage-api.md
 * Provides type-safe, error-resilient LocalStorage operations with:
 * - Versioned schema support for data migration
 * - Quota exceeded error handling
 * - Corrupted data recovery with automatic backup
 * - Graceful degradation when LocalStorage unavailable
 */

import type { Flashcard, StorageSchema } from '../types/flashcard';

const STORAGE_KEY = 'flashcards-app-data';
const CURRENT_VERSION = '1.0';

/**
 * Load flashcards from LocalStorage
 *
 * @returns Array of flashcards, or empty array if none exist or on error
 *
 * Error Handling:
 * - JSON parse errors → backup corrupted data, return empty array
 * - Invalid schema → filter out invalid cards, log warnings
 * - SecurityError (storage disabled) → warn user, return empty array
 */
export function loadFromLocalStorage(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    // No data stored yet
    if (!raw) {
      return [];
    }

    // Parse stored data
    const data = JSON.parse(raw) as StorageSchema;

    // Version migration (if schema changes in future)
    if (data.version !== CURRENT_VERSION) {
      console.warn(
        `[Storage] Schema version mismatch: expected ${CURRENT_VERSION}, got ${data.version}`
      );
      return migrateData(data);
    }

    // Validate cards array exists
    if (!Array.isArray(data.cards)) {
      console.error('[Storage] Invalid data structure: cards is not an array');
      return [];
    }

    // Filter out any invalid cards
    const validCards = data.cards.filter((card) => {
      const isValid =
        card.id &&
        typeof card.term === 'string' &&
        typeof card.definition === 'string' &&
        typeof card.mastered === 'boolean' &&
        typeof card.createdAt === 'string';

      if (!isValid) {
        console.warn('[Storage] Skipping invalid card:', card);
      }

      return isValid;
    });

    console.log(`[Storage] Loaded ${validCards.length} cards from LocalStorage`);
    return validCards;
  } catch (error) {
    // Handle JSON parse errors (corrupted data)
    if (error instanceof SyntaxError) {
      console.error('[Storage] Corrupted data detected, creating backup');

      // Save corrupted data for potential recovery
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const backupKey = `${STORAGE_KEY}-corrupted-${Date.now()}`;
        try {
          localStorage.setItem(backupKey, raw);
          console.log(`[Storage] Backup saved to ${backupKey}`);
        } catch (backupError) {
          console.error('[Storage] Failed to create backup:', backupError);
        }
      }

      return [];
    }

    // Handle SecurityError (LocalStorage disabled in private browsing)
    if (error instanceof DOMException && error.name === 'SecurityError') {
      console.warn(
        '[Storage] LocalStorage is disabled. Your cards will not persist across sessions.'
      );
      return [];
    }

    // Unknown error
    console.error('[Storage] Failed to load cards:', error);
    return [];
  }
}

/**
 * Save flashcards to LocalStorage
 *
 * @param cards - Array of flashcards to persist
 * @throws Error with user-friendly message if quota exceeded
 * @throws Error if LocalStorage unavailable
 *
 * Error Handling:
 * - QuotaExceededError → throw with helpful message for user
 * - SecurityError → throw with warning about data loss
 */
export function saveToLocalStorage(cards: Flashcard[]): void {
  try {
    const data: StorageSchema = {
      version: CURRENT_VERSION,
      cards,
      lastModified: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonString);

    console.log(`[Storage] Saved ${cards.length} cards to LocalStorage`);
  } catch (error) {
    // Handle quota exceeded (storage full)
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error(
        'Storage limit exceeded. You have too many flashcards. ' +
          'Please delete some cards or export your collection. ' +
          `(Current: ${cards.length} cards)`
      );
    }

    // Handle storage disabled
    if (error instanceof DOMException && error.name === 'SecurityError') {
      throw new Error(
        'Browser storage is disabled. Your flashcards will not be saved. ' +
          'Please enable storage or check your browser privacy settings.'
      );
    }

    // Unknown error
    console.error('[Storage] Failed to save cards:', error);
    throw error;
  }
}

/**
 * Clear all flashcard data from LocalStorage
 *
 * @param createBackup - Whether to create a backup before clearing (default: false)
 */
export function clearAllData(createBackup = false): void {
  try {
    if (createBackup) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const backupKey = `${STORAGE_KEY}-backup-${Date.now()}`;
        localStorage.setItem(backupKey, raw);
        console.log(`[Storage] Backup created at ${backupKey}`);
      }
    }

    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] All data cleared');
  } catch (error) {
    console.error('[Storage] Failed to clear data:', error);
  }
}

/**
 * Migrate data from older schema versions
 *
 * @param data - Data with unknown/old schema version
 * @returns Migrated flashcards in current format
 *
 * Future versions can add migration logic here:
 * - v1.0 → v1.1: Add 'tags' field with default []
 * - v1.1 → v1.2: Add 'difficulty' field with default 'medium'
 */
function migrateData(data: any): Flashcard[] {
  // For now, we only have v1.0, so unknown versions are discarded
  console.warn(
    `[Storage] Unknown schema version: ${data.version}. Starting fresh.`
  );

  // Future migration logic would go here:
  /*
  if (data.version === '1.0') {
    // Migrate v1.0 → v1.1
    return data.cards.map((card: any) => ({
      ...card,
      tags: [], // New field in v1.1
    }));
  }
  */

  return [];
}

/**
 * Check if LocalStorage is available and functional
 *
 * @returns true if LocalStorage can be used, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current storage usage information
 *
 * @returns Object with current cards count and estimated size in bytes
 */
export function getStorageInfo(): {
  cardsCount: number;
  estimatedSizeBytes: number;
  estimatedSizeMB: number;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cardsCount = raw ? (JSON.parse(raw) as StorageSchema).cards.length : 0;
    const estimatedSizeBytes = raw ? new Blob([raw]).size : 0;
    const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);

    return {
      cardsCount,
      estimatedSizeBytes,
      estimatedSizeMB: Number(estimatedSizeMB.toFixed(2)),
    };
  } catch (error) {
    console.error('[Storage] Failed to get storage info:', error);
    return {
      cardsCount: 0,
      estimatedSizeBytes: 0,
      estimatedSizeMB: 0,
    };
  }
}
