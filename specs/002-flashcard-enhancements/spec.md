# Feature Specification: Enhanced Flashcard Linguistic Metadata

**Feature Branch**: `002-flashcard-enhancements`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "Add new features in FlashCard: 1. Part of speech (noun, verb, adjective) 2. Example sentences 3. Pronunciation guide"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Part of Speech to Vocabulary Cards (Priority: P1)

Users studying vocabulary want to know the grammatical category of each word to better understand its usage and context. When creating or editing a flashcard, they should be able to specify whether the term is a noun, verb, adjective, or other part of speech.

**Why this priority**: Part of speech is fundamental to language learning and provides immediate context for how a word functions in sentences. This is the most basic linguistic enhancement that enables better vocabulary comprehension without requiring additional examples or complex formatting.

**Independent Test**: Can be fully tested by creating a new flashcard with a part of speech selection, verifying it displays correctly on the card, and editing it. Delivers immediate value by categorizing vocabulary grammatically.

**Acceptance Scenarios**:

1. **Given** a user is creating a new flashcard, **When** they enter a term and select "noun" as the part of speech, **Then** the flashcard is saved with the part of speech metadata and displays it when viewing the card
2. **Given** a user is editing an existing flashcard, **When** they change the part of speech from "verb" to "adjective", **Then** the change is persisted and reflected immediately
3. **Given** a user is viewing a flashcard in study mode, **When** they flip the card, **Then** the part of speech is clearly visible on the appropriate side
4. **Given** a flashcard has no part of speech specified, **When** the card is displayed, **Then** it appears without a part of speech label (optional field)

---

### User Story 2 - Add Example Sentences for Context (Priority: P2)

Users want to see vocabulary words used in realistic sentences to understand practical usage and context. When creating or viewing a flashcard, they should be able to add one or more example sentences that demonstrate the term in action.

**Why this priority**: Example sentences bridge the gap between knowing a definition and using a word correctly. This is the second most valuable enhancement as it provides practical context but requires more input effort than part of speech.

**Independent Test**: Can be tested independently by creating a flashcard with example sentences, viewing them in study mode, and editing them. Delivers value by showing real-world usage patterns.

**Acceptance Scenarios**:

1. **Given** a user is creating a flashcard for the term "ephemeral", **When** they add the example sentence "The beauty of cherry blossoms is ephemeral, lasting only a few weeks", **Then** the example is saved and displays on the flashcard
2. **Given** a flashcard has multiple example sentences, **When** the user views the card, **Then** all examples are clearly visible and distinguishable from the definition
3. **Given** a user is editing a flashcard, **When** they add, modify, or remove example sentences, **Then** the changes are immediately persisted
4. **Given** a flashcard has no example sentences, **When** the card is displayed, **Then** it functions normally without showing an empty examples section

---

### User Story 3 - Add Pronunciation Guide for Proper Speech (Priority: P3)

Users learning new vocabulary want to know how to pronounce words correctly. When creating or viewing a flashcard, they should be able to see a pronunciation guide that helps them speak the term accurately.

**Why this priority**: While pronunciation is valuable, it's less critical than part of speech and examples for written comprehension. Many users may not use this feature, making it lower priority than the other enhancements.

**Independent Test**: Can be tested independently by creating a flashcard with a pronunciation guide, viewing it on the card, and editing it. Delivers value by supporting correct verbal usage.

**Acceptance Scenarios**:

1. **Given** a user is creating a flashcard for "quinoa", **When** they add the pronunciation guide "KEEN-wah", **Then** the pronunciation is saved and displays on the flashcard
2. **Given** a flashcard has a pronunciation guide, **When** the user views the card in study mode, **Then** the pronunciation is clearly visible and distinguishable from other text
3. **Given** a user is bulk importing flashcards, **When** the import data includes pronunciation guides, **Then** the pronunciations are parsed and stored correctly
4. **Given** a flashcard has no pronunciation guide, **When** the card is displayed, **Then** it appears without pronunciation information (optional field)

---

### Edge Cases

- What happens when a user selects "Other" as part of speech and the predefined options don't cover the term?
- How does the system handle very long example sentences that exceed display area limits?
- What happens when a user enters pronunciation using phonetic symbols or special characters?
- How are these new fields displayed on mobile devices with limited screen space?
- What happens when a user bulk imports cards with missing or inconsistent formatting for the new fields?
- How does the system handle flashcards created before this feature was implemented (backward compatibility)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to optionally specify a part of speech when creating a flashcard
- **FR-002**: System MUST support at least these part of speech categories: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection, and other
- **FR-003**: System MUST display the part of speech on the flashcard when present
- **FR-004**: System MUST allow users to optionally add example sentences to a flashcard
- **FR-005**: System MUST support multiple example sentences per flashcard (minimum 1, maximum 5 recommended)
- **FR-006**: System MUST clearly distinguish example sentences from the main definition when displaying the card
- **FR-007**: System MUST allow users to optionally add a pronunciation guide to a flashcard
- **FR-008**: System MUST display the pronunciation guide prominently on the flashcard when present
- **FR-009**: System MUST persist all new fields (part of speech, example sentences, pronunciation) in local storage
- **FR-010**: System MUST maintain backward compatibility with existing flashcards that lack these new fields
- **FR-011**: System MUST allow users to edit part of speech, example sentences, and pronunciation on existing cards
- **FR-012**: System MUST allow users to leave any or all of these new fields empty (all are optional)
- **FR-013**: System MUST support bulk import that can parse these new fields when present
- **FR-014**: Example sentences MUST be limited to 500 characters each to maintain readability
- **FR-015**: Pronunciation guide MUST be limited to 100 characters to keep it concise

### Key Entities

- **Flashcard**: The core vocabulary item, now enhanced with:
  - **Part of Speech** (optional): Grammatical category (noun, verb, adjective, etc.) - helps users understand word function
  - **Example Sentences** (optional): Array of 0-5 contextual usage examples - demonstrates practical application
  - **Pronunciation Guide** (optional): Text-based pronunciation hint (e.g., "KEEN-wah", /kɪˈnoʊə/) - supports correct verbal usage
  - Existing fields remain: id, term, definition, mastered, createdAt

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a flashcard with all three new fields (part of speech, example sentence, pronunciation) in under 3 minutes
- **SC-002**: Users can view all enhanced metadata clearly on a flashcard without scrolling excessively (content fits within 2 screen heights maximum)
- **SC-003**: 100% of existing flashcards continue to function without errors after the enhancement is deployed
- **SC-004**: Users can successfully bulk import at least 20 flashcards with enhanced fields in under 1 minute
- **SC-005**: The flashcard display remains readable and aesthetically consistent with the current cyberpunk design theme
- **SC-006**: Users can complete vocabulary study sessions using enhanced cards at the same pace as standard cards (no performance degradation)

## Assumptions

- Users are familiar with basic grammatical terminology (noun, verb, adjective)
- Pronunciation guides will be text-based phonetic approximations, not IPA symbols or audio (though IPA support can be added if users provide it)
- The majority of users will not fill out all three fields for every card - these are optional enhancements
- Example sentences will be manually entered by users, not auto-generated
- The current 3D flip card design has sufficient space to accommodate additional fields on the back
- Users studying multiple languages may use different pronunciation notation systems (this is acceptable)
- Mobile users may need to scroll to see all enhanced fields on smaller screens
- The bulk import format will be enhanced but maintain backward compatibility with the current semicolon/comma format

## Dependencies

- None - this feature builds on the existing flashcard infrastructure without external dependencies

## Out of Scope

- Audio pronunciation playback (text-based guide only)
- Automatic generation of example sentences or definitions
- Integration with external dictionaries or translation APIs
- Filtering or searching flashcards by part of speech
- Multi-language support for parts of speech labels
- IPA (International Phonetic Alphabet) input assistance
- Conjugation tables or grammar rule references
- Image or video examples
- Spaced repetition algorithm integration
- Export functionality for enhanced flashcards
