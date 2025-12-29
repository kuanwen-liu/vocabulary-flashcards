# Tasks: Enhanced Flashcard Linguistic Metadata

**Input**: Design documents from `/specs/002-flashcard-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per constitution - not included in this task list

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Repository structure (single-project React web application):
- Source code: `src/`
- Tests (if added): `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project infrastructure and prepare for enhancements

- [x] T001 Verify TypeScript strict mode configuration in tsconfig.json
- [x] T002 [P] Verify React 19.x, Vite 7.x, and Tailwind CSS 3.x dependencies in package.json
- [x] T003 [P] Verify Web Speech API browser compatibility (document supported browsers in README if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extend Flashcard interface with optional partOfSpeech and exampleSentences fields in src/types/flashcard.ts
- [x] T005 [P] Add RECOMMENDED_PARTS_OF_SPEECH constant array in src/types/flashcard.ts
- [x] T006 [P] Add FLASHCARD_CONSTRAINTS validation constants in src/types/flashcard.ts
- [x] T007 [P] Update CreateFlashcardInput type to include new optional fields in src/types/flashcard.ts
- [x] T008 [P] Update UpdateFlashcardInput type to include new optional fields in src/types/flashcard.ts
- [x] T009 Verify CardContext reducer UPDATE_CARD action handles new optional fields in src/contexts/CardContext.tsx
- [x] T010 Test backward compatibility: verify existing flashcards without new fields still render correctly

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - Add Text-to-Speech Pronunciation (Priority: P3) 🎯 MVP

**Goal**: Enable users to hear vocabulary terms pronounced aloud by clicking a speaker button on the front of flashcards

**Why MVP First**: TTS is implemented first because it's independent and uses only browser-native Web Speech API. Part of speech and examples require UI form changes that depend on TTS button placement testing.

**Independent Test**: Create any flashcard, verify speaker button appears on front, click it, hear term spoken aloud. Test pause/resume/stop controls work correctly.

**User Requirements** (from `/speckit.plan` args):
- Speaker icon button on card front
- Clicking button reads the English word aloud
- Uses browser's native Web Speech API

### Implementation for User Story 3

- [x] T011 [P] [US3] Create useSpeechSynthesis custom hook in src/hooks/useSpeechSynthesis.ts with speak/pause/resume/stop functions
- [x] T012 [P] [US3] Implement voice loading with onvoiceschanged event handler in src/hooks/useSpeechSynthesis.ts
- [x] T013 [P] [US3] Add error handling for TTS errors (cancelled, interrupted, audio-unavailable) in src/hooks/useSpeechSynthesis.ts
- [x] T014 [P] [US3] Create SpeakerButton component with speaker icon SVG in src/components/SpeakerButton.tsx
- [x] T015 [US3] Integrate useSpeechSynthesis hook into SpeakerButton component in src/components/SpeakerButton.tsx
- [x] T016 [US3] Add ARIA labels (aria-label="Read term aloud") to SpeakerButton in src/components/SpeakerButton.tsx
- [x] T017 [US3] Add keyboard shortcut support (Alt+R to speak, Space to pause/resume, Escape to stop) in src/components/SpeakerButton.tsx
- [x] T018 [US3] Style SpeakerButton with cyberpunk aesthetic (purple glow, dark background) in src/components/SpeakerButton.tsx
- [x] T019 [US3] Add SpeakerButton to FlashCard front side (top-right corner, absolute positioning) in src/components/FlashCard.tsx
- [x] T020 [US3] Implement disabled state when Web Speech API not supported in src/components/SpeakerButton.tsx
- [x] T021 [US3] Test speaker button on mobile devices (responsive positioning, touch targets)
- [x] T022 [US3] Verify 3D flip animation still works correctly after adding speaker button to front side

**Checkpoint**: ✅ Speaker button functional on all flashcards, reads terms aloud with Web Speech API

---

## Phase 4: User Story 1 - Add Part of Speech to Vocabulary Cards (Priority: P1)

**Goal**: Enable users to categorize flashcards by grammatical category (noun, verb, adjective, etc.)

**Independent Test**: Create a new flashcard with part of speech "noun", verify it saves and displays as a badge on the back. Edit an existing card to change part of speech from "verb" to "adjective", verify persistence.

**User Requirements** (from `/speckit.plan` args):
- Part of speech selector with options: noun, verb, adjective
- Displayed on back side of flashcard

### Implementation for User Story 1

- [x] T023 [P] [US1] Add part of speech input to AddCardForm (datalist dropdown with RECOMMENDED_PARTS_OF_SPEECH) in src/components/AddCardForm.tsx
- [x] T024 [P] [US1] Add character count indicator (max 50 chars) for part of speech input in src/components/AddCardForm.tsx
- [x] T025 [US1] Update AddCardForm submit handler to include partOfSpeech in CreateFlashcardInput in src/components/AddCardForm.tsx
- [x] T026 [US1] Add part of speech display badge on FlashCard back side (below definition) in src/components/FlashCard.tsx
- [x] T027 [US1] Style part of speech badge with cyberpunk aesthetic (cyan glow, rounded pill shape) in src/components/FlashCard.tsx
- [x] T028 [US1] Add conditional rendering for part of speech (hide if undefined) in src/components/FlashCard.tsx
- [x] T029 [US1] Add part of speech edit input to CardLibrary edit mode in src/components/CardLibrary.tsx
- [x] T030 [US1] Update CardLibrary save handler to persist partOfSpeech changes in src/components/CardLibrary.tsx
- [x] T031 [US1] Test creating flashcard with part of speech "noun" and verify display
- [x] T032 [US1] Test editing existing flashcard to add/change/remove part of speech
- [x] T033 [US1] Test backward compatibility: verify old flashcards without partOfSpeech display correctly (no badge shown)

**Checkpoint**: ✅ Part of speech fully functional for create, display, and edit operations

---

## Phase 5: User Story 2 - Add Example Sentences for Context (Priority: P2)

**Goal**: Enable users to add contextual usage examples (up to 5) to demonstrate vocabulary in real sentences

**Independent Test**: Create a flashcard for "ephemeral" with example "Cherry blossoms are ephemeral", verify it saves and displays as bulleted list on back. Add 3 more examples, verify all display correctly. Edit to remove one example, verify persistence.

**User Requirements** (from `/speckit.plan` args):
- Example sentence input (multiple sentences supported)
- Displayed on back side of flashcard

### Implementation for User Story 2

- [x] T034 [P] [US2] Add dynamic example sentences input to AddCardForm (array of text inputs, max 5) in src/components/AddCardForm.tsx
- [x] T035 [P] [US2] Add "Add Another Example" button to AddCardForm (disabled when 5 examples reached) in src/components/AddCardForm.tsx
- [x] T036 [P] [US2] Add "Remove" button for each example input in AddCardForm in src/components/AddCardForm.tsx
- [x] T037 [US2] Add character count indicator (max 500 chars per example) for each input in src/components/AddCardForm.tsx
- [x] T038 [US2] Update AddCardForm submit handler to filter empty examples and include exampleSentences in CreateFlashcardInput in src/components/AddCardForm.tsx
- [x] T039 [US2] Add example sentences display section on FlashCard back side (below part of speech badge) in src/components/FlashCard.tsx
- [x] T040 [US2] Style example sentences as bulleted list with purple border-left accent in src/components/FlashCard.tsx
- [x] T041 [US2] Add conditional rendering for examples section (hide if undefined or empty array) in src/components/FlashCard.tsx
- [x] T042 [US2] Add example sentences edit inputs to CardLibrary edit mode (dynamic list like AddCardForm) in src/components/CardLibrary.tsx
- [x] T043 [US2] Update CardLibrary save handler to persist exampleSentences changes in src/components/CardLibrary.tsx
- [x] T044 [US2] Test creating flashcard with 1 example sentence and verify display
- [x] T045 [US2] Test creating flashcard with 5 example sentences (max) and verify all display
- [x] T046 [US2] Test editing flashcard to add/modify/remove example sentences
- [x] T047 [US2] Test mobile responsiveness: verify examples list doesn't cause excessive scrolling
- [x] T048 [US2] Test backward compatibility: verify old flashcards without exampleSentences display correctly (no examples section shown)

**Checkpoint**: ✅ Example sentences fully functional for create, display, and edit operations

---

## Phase 6: Bulk Import Enhancement

**Purpose**: Extend bulk import to support new optional fields (part of speech and example sentences)

**Dependencies**: Requires User Story 1 and 2 implementation complete

- [x] T049 Update parseBulkImport function to parse partOfSpeech from 3rd comma-separated field in src/utils/bulkImport.ts
- [x] T050 Update parseBulkImport function to parse exampleSentences from 4th field (pipe-delimited: example1 | example2) in src/utils/bulkImport.ts
- [x] T051 Add error handling for malformed bulk import lines with new fields in src/utils/bulkImport.ts
- [x] T052 Update BulkImport component documentation/tooltip with new format example in src/components/BulkImport.tsx
- [x] T053 Test bulk import with old format (term, definition only) - verify backward compatibility
- [x] T054 Test bulk import with new format including part of speech: "ephemeral, lasting briefly, adjective"
- [x] T055 Test bulk import with new format including examples: "ephemeral, lasting briefly, adjective, Cherry blossoms are ephemeral | Morning dew is ephemeral"
- [x] T056 Test bulk import with mixed old and new format lines - verify all parse correctly

**Checkpoint**: ✅ Bulk import supports all optional fields while maintaining backward compatibility

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and validation

- [x] T057 [P] Verify all new UI elements follow cyberpunk aesthetic (dark mode, vibrant accents, glow effects)
- [x] T058 [P] Test keyboard navigation: Tab through all new inputs (part of speech, examples, speaker button)
- [x] T059 [P] Test screen reader: verify ARIA labels for speaker button and new inputs
- [x] T060 [P] Verify WCAG AA color contrast for all new text (part of speech badge, examples)
- [x] T061 Test LocalStorage persistence: create card with all fields, refresh page, verify all data persists
- [x] T062 Test LocalStorage with large dataset: create 50+ cards with all fields, verify no quota errors
- [x] T063 Verify bundle size remains < 200KB gzipped after all changes
- [x] T064 Test card flip animation performance: ensure 60fps maintained with new content on back
- [x] T065 Cross-browser testing: verify TTS works in Chrome, Firefox, Safari, Edge
- [x] T066 Mobile testing: verify responsive layout on small screens (iPhone SE, Pixel 5)
- [x] T067 Verify StudyView component still works correctly (no changes needed, but validate)
- [x] T068 Code review: ensure no console warnings, proper TypeScript types, consistent styling
- [x] T069 Run quickstart.md validation checklist
- [x] T070 Final end-to-end test: create→edit→study→delete flashcard with all new fields

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 3 - TTS (Phase 3)**: Depends on Foundational (Phase 2) - Independent of other stories
- **User Story 1 - Part of Speech (Phase 4)**: Depends on Foundational (Phase 2) - Independent of other stories
- **User Story 2 - Examples (Phase 5)**: Depends on Foundational (Phase 2) - Independent of other stories
- **Bulk Import (Phase 6)**: Depends on US1 and US2 completion (needs to parse new fields)
- **Polish (Phase 7)**: Depends on all desired features being complete

### User Story Dependencies

- **User Story 3 (P3 - TTS)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1 (P1 - Part of Speech)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - Examples)**: Can start after Foundational (Phase 2) - No dependencies on other stories

**Note**: User stories can be implemented in parallel or in any order after Foundational phase completes.

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Tasks without [P] should complete sequentially (same file edits)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All 3 tasks can run in parallel
- **Phase 2 (Foundational)**: Tasks T005-T008 can run in parallel (all in same file but different sections)
- **Phase 3 (US3)**: Tasks T011-T014 can run in parallel (different files)
- **Phase 4 (US1)**: Tasks T023-T024 can run in parallel (same file but different sections)
- **Phase 5 (US2)**: Tasks T034-T037 can run in parallel (same file but different sections)
- **Phase 7 (Polish)**: Tasks T057-T060 can run in parallel (different validation areas)
- **After Foundational completes**: All user stories (US1, US2, US3) can be worked on in parallel by different developers

---

## Parallel Example: User Story 3 (TTS)

```bash
# Launch hook and component creation together:
Task: "Create useSpeechSynthesis custom hook in src/hooks/useSpeechSynthesis.ts"
Task: "Implement voice loading with onvoiceschanged event handler in src/hooks/useSpeechSynthesis.ts"
Task: "Add error handling for TTS errors in src/hooks/useSpeechSynthesis.ts"
Task: "Create SpeakerButton component in src/components/SpeakerButton.tsx"

# After hook complete, integrate and style:
Task: "Integrate useSpeechSynthesis hook into SpeakerButton component"
Task: "Add ARIA labels to SpeakerButton"
Task: "Add keyboard shortcut support to SpeakerButton"
Task: "Style SpeakerButton with cyberpunk aesthetic"
```

---

## Implementation Strategy

### MVP First (User Story 3 - TTS Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010) - CRITICAL
3. Complete Phase 3: User Story 3 - TTS (T011-T022)
4. **STOP and VALIDATE**: Test TTS independently on existing flashcards
5. Deploy/demo if ready - users can now hear pronunciations

### Incremental Delivery

1. **Foundation**: Setup + Foundational → Data model ready
2. **Increment 1**: Add User Story 3 (TTS) → Test independently → Deploy (MVP!)
   - ✅ Speaker button on front, reads terms aloud
3. **Increment 2**: Add User Story 1 (Part of Speech) → Test independently → Deploy
   - ✅ Part of speech categorization on back
4. **Increment 3**: Add User Story 2 (Examples) → Test independently → Deploy
   - ✅ Example sentences on back
5. **Increment 4**: Add Bulk Import Enhancement → Test independently → Deploy
   - ✅ Import cards with all new fields
6. **Increment 5**: Polish & validation → Deploy final version

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T010)
2. **Once Foundational done, split work**:
   - Developer A: User Story 3 - TTS (T011-T022)
   - Developer B: User Story 1 - Part of Speech (T023-T033)
   - Developer C: User Story 2 - Examples (T034-T048)
3. **Reconvene**: Bulk Import Enhancement (T049-T056) - requires US1 + US2
4. **Together**: Polish & Cross-Cutting (T057-T070)

---

## Task Summary

- **Total Tasks**: 70
- **Setup Tasks**: 3
- **Foundational Tasks**: 7 (BLOCKING)
- **User Story 3 (TTS) Tasks**: 12
- **User Story 1 (Part of Speech) Tasks**: 11
- **User Story 2 (Examples) Tasks**: 15
- **Bulk Import Tasks**: 8
- **Polish Tasks**: 14

### Parallelizable Tasks

- **Phase 1**: 3 tasks (100% parallel)
- **Phase 2**: 4 tasks (57% parallel)
- **Phase 3 (US3)**: 4 tasks (33% parallel)
- **Phase 4 (US1)**: 2 tasks (18% parallel)
- **Phase 5 (US2)**: 4 tasks (27% parallel)
- **Phase 7 (Polish)**: 4 tasks (29% parallel)

**Total Parallelizable**: 21 out of 70 tasks (30%)

### Independent Test Criteria

- **User Story 3 (TTS)**: Click speaker button on any flashcard → hear term spoken aloud → pause/resume/stop controls work
- **User Story 1 (Part of Speech)**: Create flashcard with "noun" → see badge on back → edit to "verb" → verify persistence
- **User Story 2 (Examples)**: Create flashcard with 3 examples → see bulleted list on back → edit to add/remove → verify persistence

### Suggested MVP Scope

**Minimum Viable Product**: User Story 3 (TTS) only
- Delivers immediate value: users can hear pronunciations
- Smallest surface area for testing and validation
- Independent of form UI changes
- Uses only browser-native API (zero dependencies)

**Recommended MVP**: User Story 3 (TTS) + User Story 1 (Part of Speech)
- Combines pronunciation with grammatical categorization
- Both features enhance vocabulary learning meaningfully
- Minimal UI complexity (one dropdown, one speaker button)

---

## Notes

- [P] tasks work on different files or independent sections - can run in parallel
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story is independently completable and testable without others
- All new fields (partOfSpeech, exampleSentences) are optional - backward compatible
- TTS uses browser-native Web Speech API - zero bundle size impact
- All UI follows cyberpunk aesthetic per constitution
- Stop at any checkpoint to validate story independently
- Bulk import backward compatible: old format still works
- Mobile-first responsive design validated at end
