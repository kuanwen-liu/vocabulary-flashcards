# Storage API Contract: LocalStorage Interface

**Feature**: Flashcards Application
**Branch**: `001-flashcards-app`
**Date**: 2025-12-29
**Version**: 1.0

## Overview

This contract defines the interface between the React application and browser LocalStorage for persisting flashcard data. Since this is a frontend-only application with no HTTP APIs, this contract serves as the "API specification" for data persistence operations.

---

## Storage Key

**Primary Key:** `flashcards-app-data`

**Purpose:** Store the complete flashcard collection with versioning metadata.

**Namespace:** Single key strategy (all data in one JSON blob for simplicity).

---

## Data Schema

### Version 1.0 Schema

```typescript
interface StorageSchema {
  version: '1.0';
  cards: Flashcard[];
  lastModified: string; // ISO 8601 timestamp
}

interface Flashcard {
  id: string;           // UUID v4
  term: string;         // 1-500 characters
  definition: string;   // 1-2000 characters
  mastered: boolean;
  createdAt: string;    // ISO 8601 timestamp
}
```

### Example Stored Value

```json
{
  "version": "1.0",
  "cards": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "term": "API",
      "definition": "Application Programming Interface - a set of protocols for building software",
      "mastered": false,
      "createdAt": "2025-12-29T10:00:00.000Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "term": "React",
      "definition": "A JavaScript library for building user interfaces",
      "mastered": true,
      "createdAt": "2025-12-29T10:05:00.000Z"
    }
  ],
  "lastModified": "2025-12-29T10:05:30.000Z"
}
```

---

## Operations

### 1. Initialize Storage (Load)

**Operation:** `loadFromLocalStorage()`

**Input:** None

**Process:**
1. Retrieve value from `localStorage.getItem('flashcards-app-data')`
2. If key doesn't exist → return empty array `[]`
3. Parse JSON string to `StorageSchema` object
4. Validate schema version
5. If version mismatch → apply migration
6. Return `cards` array

**Output:** `Flashcard[]`

**Error Handling:**

| Error Type | Cause | Handling |
|------------|-------|----------|
| `SyntaxError` (JSON parse) | Corrupted data | Backup to `flashcards-app-data-corrupted-{timestamp}`, return `[]` |
| `TypeError` (missing fields) | Invalid schema | Log warning, filter out invalid cards, return valid subset |
| `SecurityError` | LocalStorage disabled | Show warning message, run in memory-only mode |

**Example Implementation:**
```typescript
function loadFromLocalStorage(): Flashcard[] {
  try {
    const raw = localStorage.getItem('flashcards-app-data');
    if (!raw) return [];

    const data = JSON.parse(raw) as StorageSchema;

    // Version check
    if (data.version !== '1.0') {
      return migrateData(data);
    }

    // Validate cards
    return data.cards.filter(card =>
      card.id && card.term && card.definition && typeof card.mastered === 'boolean'
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Corrupted data detected, resetting storage');
      const raw = localStorage.getItem('flashcards-app-data');
      if (raw) {
        localStorage.setItem(
          `flashcards-app-data-corrupted-${Date.now()}`,
          raw
        );
      }
    }
    return [];
  }
}
```

---

### 2. Save to Storage (Persist)

**Operation:** `saveToLocalStorage(cards: Flashcard[])`

**Input:** `Flashcard[]` - current card collection

**Process:**
1. Create `StorageSchema` object with current version and timestamp
2. Serialize to JSON string via `JSON.stringify()`
3. Write to `localStorage.setItem('flashcards-app-data', jsonString)`
4. Handle quota exceeded errors

**Output:** `void` (or throws error)

**Error Handling:**

| Error Type | Cause | Handling |
|------------|-------|----------|
| `QuotaExceededError` | Storage limit reached | Throw custom error with user-friendly message |
| `SecurityError` | LocalStorage disabled | Throw error, notify user data won't persist |

**Example Implementation:**
```typescript
function saveToLocalStorage(cards: Flashcard[]): void {
  try {
    const data: StorageSchema = {
      version: '1.0',
      cards,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem('flashcards-app-data', JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error(
        'Storage limit exceeded. You have too many flashcards. ' +
        'Please delete some cards or export your collection.'
      );
    }
    throw error;
  }
}
```

---

### 3. Clear All Data

**Operation:** `clearAllData()`

**Input:** None

**Process:**
1. Remove key via `localStorage.removeItem('flashcards-app-data')`
2. Optionally backup before clearing

**Output:** `void`

**Use Cases:**
- User requests "Delete All Cards"
- Factory reset during development
- Data corruption recovery

**Example Implementation:**
```typescript
function clearAllData(backup: boolean = false): void {
  if (backup) {
    const raw = localStorage.getItem('flashcards-app-data');
    if (raw) {
      localStorage.setItem(
        `flashcards-app-data-backup-${Date.now()}`,
        raw
      );
    }
  }
  localStorage.removeItem('flashcards-app-data');
}
```

---

## Data Versioning & Migration

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-29 | Initial schema with `id`, `term`, `definition`, `mastered`, `createdAt` |

### Migration Function

**Purpose:** Handle schema evolution when users upgrade to new app versions.

**Signature:** `migrateData(data: unknown): Flashcard[]`

**Process:**
1. Detect source version from `data.version` field
2. Apply transformation functions sequentially (e.g., v1.0 → v1.1 → v1.2)
3. Return migrated data in current schema format

**Example (Hypothetical v1.1 Migration):**
```typescript
function migrateData(data: any): Flashcard[] {
  if (data.version === '1.0') {
    // Hypothetical v1.1 adds 'tags' field
    return data.cards.map((card: any) => ({
      ...card,
      tags: [], // Default value for new field
    }));
  }

  // Unknown version - discard and start fresh
  console.warn(`Unknown schema version: ${data.version}`);
  return [];
}
```

---

## Constraints

### Size Limits

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max collection size | 10,000 cards | LocalStorage 5-10MB limit, ~200 bytes/card |
| Max term length | 500 characters | Reasonable flashcard question size |
| Max definition length | 2,000 characters | Allows detailed explanations without bloat |
| Max total storage | 5 MB | Safe threshold before quota errors |

### Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Load on mount | < 100ms | For 1,000 cards |
| Save after edit | < 50ms | For 1,000 cards |
| Bulk import 50 cards | < 500ms | Including serialization + write |

---

## Synchronization Strategy

### Write Strategy

**Approach:** Write-through caching

**Trigger:** Every state mutation (create, update, delete, toggle mastered, shuffle)

**Implementation:**
```typescript
useEffect(() => {
  saveToLocalStorage(state.cards);
}, [state.cards]);
```

**Rationale:**
- Ensures data consistency (no stale data)
- Simple implementation (no debouncing complexity)
- Acceptable performance (writes are fast for <1000 cards)

### Read Strategy

**Approach:** Load once on application mount

**Trigger:** `CardProvider` initialization

**Implementation:**
```typescript
const [state, dispatch] = useReducer(
  cardReducer,
  initialState,
  (initial) => ({
    ...initial,
    cards: loadFromLocalStorage(),
  })
);
```

**Rationale:**
- Single-tab assumption (no concurrent edits)
- Avoid unnecessary reads during session
- Reduces localStorage access overhead

---

## Cross-Tab Synchronization (Future Enhancement)

**Status:** NOT IMPLEMENTED in v1.0

**Future Approach:**
Listen to `storage` event for cross-tab updates:

```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'flashcards-app-data' && e.newValue) {
      const data = JSON.parse(e.newValue) as StorageSchema;
      dispatch({ type: 'LOAD_CARDS', payload: data.cards });
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Challenges:**
- Merge conflicts if both tabs edit simultaneously
- User experience of sudden card list changes
- Complexity vs. benefit trade-off

---

## Error Messages

### User-Facing Messages

| Error Scenario | Message | Action |
|----------------|---------|--------|
| Quota exceeded | "Storage limit reached. Please delete some cards to continue." | Disable add/import, show delete UI |
| Corrupted data | "Your flashcard data was corrupted. Starting fresh. (Backup saved)" | Load empty state, save backup |
| Storage disabled | "Browser storage is disabled. Your cards won't be saved across sessions." | Run in memory-only mode |
| Invalid import | "3 cards failed to import due to missing information." | Show partial success message |

### Developer Logging

```typescript
// Success
console.log('[Storage] Loaded 245 cards from localStorage');
console.log('[Storage] Saved 246 cards to localStorage');

// Warnings
console.warn('[Storage] Corrupted card skipped:', invalidCard);
console.warn('[Storage] Unknown schema version:', data.version);

// Errors
console.error('[Storage] Failed to save:', error);
console.error('[Storage] Quota exceeded at', cards.length, 'cards');
```

---

## Testing Contract Compliance

### Unit Tests (Optional)

```typescript
describe('LocalStorage Contract', () => {
  beforeEach(() => localStorage.clear());

  test('saves and loads cards correctly', () => {
    const cards = [{ id: '123', term: 'Test', definition: 'A test', mastered: false, createdAt: '2025-12-29' }];
    saveToLocalStorage(cards);
    const loaded = loadFromLocalStorage();
    expect(loaded).toEqual(cards);
  });

  test('handles corrupted data gracefully', () => {
    localStorage.setItem('flashcards-app-data', 'invalid json');
    const loaded = loadFromLocalStorage();
    expect(loaded).toEqual([]);
  });

  test('throws on quota exceeded', () => {
    const hugeCard = { id: '1', term: 'x'.repeat(1000000), definition: 'y'.repeat(1000000), mastered: false, createdAt: '2025-12-29' };
    expect(() => saveToLocalStorage([hugeCard])).toThrow('Storage limit exceeded');
  });
});
```

---

## Security Considerations

### Data Privacy

- **No sensitive data:** Flashcards are educational content, not PII
- **Client-side only:** No transmission to servers
- **Browser isolation:** Each browser profile has separate storage

### Tampering Protection

- **Not implemented in v1.0:** LocalStorage is user-accessible
- **Mitigation:** Validate all loaded data, skip invalid entries
- **Future:** Add checksum field for integrity verification

### XSS Protection

- **Risk:** Malicious HTML in term/definition fields
- **Mitigation:** React auto-escapes all rendered content
- **Additional:** Use `textContent` instead of `innerHTML` if manual DOM manipulation needed

---

## Summary

| Aspect | Decision |
|--------|----------|
| **Storage Key** | `flashcards-app-data` (single key) |
| **Schema Version** | 1.0 (extensible for future changes) |
| **Write Strategy** | Write-through on every state change |
| **Read Strategy** | Load once on mount |
| **Error Handling** | Graceful degradation with user-friendly messages |
| **Size Limit** | 10,000 cards (~2MB) before soft cap |
| **Migration** | Versioned schema with migration functions |

**This contract satisfies constitutional Principle IV (LocalStorage Persistence) and functional requirements FR-008, FR-013, FR-015.**
