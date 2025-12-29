# Data Model: Flashcards Application

**Feature**: Flashcards Application
**Branch**: `001-flashcards-app`
**Date**: 2025-12-29

## Overview

This document defines the data entities, their attributes, relationships, validation rules, and state transitions for the flashcards application. All entities are stored client-side in browser LocalStorage with no backend persistence.

---

## Entities

### Flashcard

Represents a single study card with a term (front) and definition (back).

**Attributes:**

| Attribute | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|------------------|
| `id` | `string` | Yes | Unique identifier (UUID v4) | Auto-generated, immutable |
| `term` | `string` | Yes | Front of card (question) | 1-500 characters, non-empty after trim |
| `definition` | `string` | Yes | Back of card (answer) | 1-2000 characters, non-empty after trim |
| `mastered` | `boolean` | Yes | Learning progress status | Default: `false` |
| `createdAt` | `string` | Yes | ISO 8601 timestamp | Auto-generated, immutable |

**Example:**
```json
{
  "id": "a3b2c1d4-e5f6-7890-ab12-cd34ef567890",
  "term": "Photosynthesis",
  "definition": "The process by which plants use sunlight to synthesize nutrients from carbon dioxide and water.",
  "mastered": false,
  "createdAt": "2025-12-29T14:30:00.000Z"
}
```

**Validation Rules:**
- `term` and `definition` MUST be non-empty after trimming whitespace (enforced in AddCardForm)
- `term` length MUST be ≤ 500 characters (reasonable limit for flashcard questions)
- `definition` length MUST be ≤ 2000 characters (allows detailed explanations)
- `id` MUST be unique within collection (enforced by UUID v4 generation)
- `createdAt` MUST be valid ISO 8601 format (enforced by `new Date().toISOString()`)

**State Transitions:**
```
[Created] → mastered: false
    ↓
[User marks mastered] → mastered: true
    ↓
[User unmarks mastered] → mastered: false
```

**Invariants:**
- Once created, `id` and `createdAt` NEVER change
- `term` and `definition` can be updated via edit action
- `mastered` toggles between `true` and `false` only

---

### CardCollection

Wrapper entity representing the user's complete set of flashcards with metadata.

**Attributes:**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `cards` | `Flashcard[]` | Yes | Array of flashcard entities |
| `version` | `string` | Yes | Schema version (e.g., "1.0") |
| `lastModified` | `string` | Yes | ISO 8601 timestamp of last change |

**Example:**
```json
{
  "version": "1.0",
  "cards": [
    { "id": "...", "term": "...", "definition": "...", "mastered": false, "createdAt": "..." },
    { "id": "...", "term": "...", "definition": "...", "mastered": true, "createdAt": "..." }
  ],
  "lastModified": "2025-12-29T15:45:00.000Z"
}
```

**Validation Rules:**
- `cards` MUST be an array (can be empty)
- `version` MUST match current schema version ("1.0")
- `lastModified` MUST update on every create/update/delete/toggle action
- Maximum 10,000 cards (soft limit based on LocalStorage 5MB constraint)

**Derived Properties (Computed in UI, not stored):**
- `totalCards`: `cards.length`
- `masteredCount`: `cards.filter(c => c.mastered).length`
- `needsReviewCount`: `cards.filter(c => !c.mastered).length`

---

### CardState (Context State)

Represents the runtime application state managed by React Context API.

**Attributes:**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `cards` | `Flashcard[]` | Yes | Current card collection |
| `filter` | `'all' \| 'needsReview'` | Yes | Active filter mode |
| `currentCardIndex` | `number` | Yes | Index of card being studied |

**Example:**
```typescript
{
  cards: [/* Flashcard objects */],
  filter: 'needsReview',
  currentCardIndex: 0
}
```

**Validation Rules:**
- `currentCardIndex` MUST be ≥ 0 and < `cards.length` (or 0 if `cards` is empty)
- `filter` MUST be one of: `'all'` or `'needsReview'`
- When `filter` changes, `currentCardIndex` resets to 0

**Computed Properties:**
- `visibleCards`: Filtered cards based on `filter` value
  - If `filter === 'all'`: return all `cards`
  - If `filter === 'needsReview'`: return `cards.filter(c => !c.mastered)`

---

## Relationships

```
CardContext
    │
    ├─ contains → CardState
    │               │
    │               └─ contains → cards: Flashcard[]
    │
    └─ syncs with → LocalStorage
                        │
                        └─ stores → CardCollection
                                       │
                                       └─ contains → cards: Flashcard[]
```

**Key Relationships:**
1. **CardContext → CardState**: One-to-one (Context wraps state)
2. **CardState → Flashcard**: One-to-many (state contains array of cards)
3. **CardContext → LocalStorage**: Synchronization (every state update persists to storage)
4. **LocalStorage → CardCollection**: One-to-one (single storage key holds collection)

---

## Operations & Actions

### Create Card

**Input:**
```typescript
{
  term: string;      // 1-500 chars, non-empty
  definition: string; // 1-2000 chars, non-empty
}
```

**Process:**
1. Validate `term` and `definition` (non-empty, length constraints)
2. Generate `id` via `crypto.randomUUID()`
3. Set `createdAt` to `new Date().toISOString()`
4. Set `mastered` to `false`
5. Append to `cards` array
6. Persist to LocalStorage
7. Update `lastModified` timestamp

**Output:** New `Flashcard` object

---

### Update Card

**Input:**
```typescript
{
  id: string;
  updates: {
    term?: string;       // Optional, 1-500 chars
    definition?: string; // Optional, 1-2000 chars
  }
}
```

**Process:**
1. Find card by `id`
2. Validate updated fields (if provided)
3. Merge updates into existing card
4. Persist to LocalStorage
5. Update `lastModified` timestamp

**Constraints:**
- CANNOT update `id`, `createdAt`, or `mastered` via this action
- MUST provide at least one of `term` or `definition`

---

### Delete Card

**Input:**
```typescript
{
  id: string;
}
```

**Process:**
1. Find card by `id`
2. Remove from `cards` array
3. Adjust `currentCardIndex` if necessary (if deleted card was active)
4. Persist to LocalStorage
5. Update `lastModified` timestamp

**Edge Cases:**
- If deleting the last card, `currentCardIndex` resets to 0
- If deleting currently viewed card, move to next card (or previous if last)

---

### Toggle Mastered

**Input:**
```typescript
{
  id: string;
}
```

**Process:**
1. Find card by `id`
2. Toggle `mastered` field: `!card.mastered`
3. Persist to LocalStorage
4. Update `lastModified` timestamp

**State Transition:**
- `mastered: false` → `mastered: true` → `mastered: false` (cycle)

---

### Bulk Import

**Input:**
```typescript
{
  cards: Array<{
    term: string;
    definition: string;
  }>;
}
```

**Process:**
1. Parse input text (e.g., "term1, def1; term2, def2")
2. Validate each card's `term` and `definition`
3. Generate `id` and `createdAt` for each valid card
4. Set `mastered: false` for all imported cards
5. Append all cards to `cards` array
6. Persist to LocalStorage
7. Update `lastModified` timestamp

**Error Handling:**
- Invalid cards (empty term/definition) are skipped
- Return list of successfully imported vs. failed entries
- Display user feedback for partial imports

---

### Shuffle Cards

**Input:** None

**Process:**
1. Apply Fisher-Yates shuffle to `cards` array
2. Reset `currentCardIndex` to 0
3. Persist shuffled order to LocalStorage
4. Update `lastModified` timestamp

**Algorithm:**
```typescript
for (let i = cards.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [cards[i], cards[j]] = [cards[j], cards[i]];
}
```

---

### Set Filter

**Input:**
```typescript
{
  filter: 'all' | 'needsReview';
}
```

**Process:**
1. Update `filter` in state
2. Reset `currentCardIndex` to 0
3. Recompute `visibleCards` based on new filter

**Behavior:**
- `'all'`: Show all cards regardless of `mastered` status
- `'needsReview'`: Show only cards where `mastered === false`

---

## Storage Schema (LocalStorage)

**Key:** `flashcards-app-data`

**Value (JSON):**
```json
{
  "version": "1.0",
  "cards": [
    {
      "id": "uuid",
      "term": "string",
      "definition": "string",
      "mastered": boolean,
      "createdAt": "ISO 8601 string"
    }
  ],
  "lastModified": "ISO 8601 string"
}
```

**Size Estimation:**
- Average card: ~200 bytes (50 char term + 150 char definition)
- 1,000 cards: ~200 KB
- 5,000 cards: ~1 MB
- LocalStorage limit: 5-10 MB (browser-dependent)
- **Safe capacity**: 10,000 cards (~2 MB)

---

## Migration Strategy

### Version 1.0 → Future Version

When schema changes are needed:

1. Detect version mismatch on load
2. Apply migration function based on stored version
3. Update `version` field to current
4. Persist migrated data

**Example Migration (hypothetical v1.1 adding `tags` field):**
```typescript
function migrateToV1_1(data: V1_0Schema): V1_1Schema {
  return {
    ...data,
    version: '1.1',
    cards: data.cards.map(card => ({
      ...card,
      tags: [], // New field with default value
    })),
  };
}
```

---

## Indexes & Lookups

**Primary Lookup:** By `id` (O(n) linear search in array)

**Rationale:**
- Collection size (500-1000 cards) doesn't justify Map/index overhead
- Linear search is sufficient for typical operations
- Keep data structure simple per constitution

**Filter Operations:**
- `cards.filter(c => !c.mastered)`: O(n) - acceptable for <1000 cards
- Results cached in component `useMemo` to avoid redundant filtering

---

## Constraints & Invariants

**Hard Constraints:**
1. `id` MUST be unique across all cards
2. `term` and `definition` MUST NOT be empty strings (after trim)
3. `mastered` MUST be boolean (`true` or `false` only)
4. `createdAt` MUST be valid ISO 8601 timestamp

**Soft Constraints:**
1. Collection size SHOULD NOT exceed 10,000 cards (performance degradation)
2. Individual card size SHOULD NOT exceed 3 KB (term + definition combined)

**Invariants:**
1. `cards` array order is preserved across sessions (unless explicitly shuffled)
2. `lastModified` timestamp ALWAYS updates when `cards` array changes
3. `currentCardIndex` is ALWAYS valid (0 ≤ index < visibleCards.length) or 0 if empty

---

## Edge Cases & Error Handling

**Empty Collection:**
- `cards = []` → Show "No cards yet" message
- `currentCardIndex = 0` → Study view disabled

**All Cards Mastered + "Needs Review" Filter:**
- `visibleCards = []` → Show "All cards mastered! Great job!" message
- Provide button to switch to "All Cards" filter

**LocalStorage Quota Exceeded:**
- Catch `QuotaExceededError` exception
- Display error: "Storage limit reached. Please delete some cards."
- Prevent further card additions until space freed

**Corrupted Data:**
- JSON parse error → Log error, backup corrupted data, start with empty collection
- Missing required fields → Skip invalid cards, log warnings

**Concurrent Tab Edits:**
- NOT SUPPORTED in v1.0 (single-tab assumption)
- Future enhancement: Listen to `storage` event for cross-tab sync

---

## Summary

| Entity | Purpose | Storage Location | Lifecycle |
|--------|---------|-----------------|-----------|
| **Flashcard** | Single study card | LocalStorage (in `cards` array) | Created → Updated → Deleted |
| **CardCollection** | Wrapper for all cards | LocalStorage (`flashcards-app-data` key) | Persistent across sessions |
| **CardState** | Runtime UI state | React Context (in-memory) | Created on mount → Updated during session |

**All entities align with functional requirements FR-001 through FR-015 and constitutional principles.**
