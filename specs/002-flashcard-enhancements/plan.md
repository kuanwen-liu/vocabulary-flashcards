# Implementation Plan: Enhanced Flashcard Linguistic Metadata

**Branch**: `002-flashcard-enhancements` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-flashcard-enhancements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add three linguistic enhancements to flashcards: part of speech categorization (displayed on back), example sentences (displayed on back), and text-to-speech pronunciation using Web Speech API (speaker icon button on front). All new fields are optional and must maintain backward compatibility with existing flashcards. Technical approach uses TypeScript interface extension, React Context state updates, and browser-native speech synthesis.

**User Requirements Summary**:
- Part of speech selector (noun, verb, adjective, etc.) on card back
- Example sentence input and display on card back
- Speaker icon button on card front that reads the term aloud using Web Speech API
- All fields optional and user-provided

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with React 19.x
**Primary Dependencies**: React 19.2.0, Vite 7.x, Tailwind CSS 3.x, Web Speech API (browser native)
**Storage**: Browser LocalStorage (all flashcard data persisted client-side)
**Testing**: Vitest + React Testing Library (if tests required per constitution)
**Target Platform**: Modern web browsers with Web Speech API support (Chrome 33+, Edge 14+, Safari 7+, Firefox 49+)
**Project Type**: Single-page web application (frontend-only)
**Performance Goals**: Card flip animations maintain 60fps, First Contentful Paint < 1.5s, Time to Interactive < 3s
**Constraints**: Bundle size < 200KB gzipped, LocalStorage quota management, offline-capable
**Scale/Scope**: Single-user client-side application, ~100-1000 flashcards per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: React + Vite + Tailwind Stack
**Status**: ✅ PASS
**Compliance**: Feature uses existing React 19.x + Vite 7.x + Tailwind CSS 3.x stack. No new framework dependencies introduced.

### Principle II: CSS 3D Transform Animations
**Status**: ✅ PASS
**Compliance**: Feature maintains existing 3D flip card animations. No changes to animation architecture. New content (part of speech, examples) simply displays on existing flip card back face.

### Principle III: React Context API State Management
**Status**: ✅ PASS
**Compliance**: Feature extends existing CardContext with new optional fields. No external state management libraries needed. State updates use existing reducer pattern.

### Principle IV: LocalStorage Persistence (NON-NEGOTIABLE)
**Status**: ✅ PASS
**Compliance**: All new fields (partOfSpeech, exampleSentences, pronunciation via Web Speech API) persist to LocalStorage. Schema migration handled gracefully for backward compatibility.

### Principle V: Frontend-Design Aesthetic
**Status**: ✅ PASS
**Compliance**: New UI elements (part of speech label, example sentences display, speaker icon button) follow cyberpunk dark mode + vibrant accents + glow effects aesthetic. Speaker icon uses existing button styling patterns.

**Overall Gate Status**: ✅ ALL GATES PASSED - No violations, no complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-flashcard-enhancements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── flashcard-schema.ts  # TypeScript interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── flashcard.ts          # Extended Flashcard interface with new optional fields
├── components/
│   ├── FlashCard.tsx         # Updated to display part of speech, examples, speaker button
│   ├── AddCardForm.tsx       # Updated with part of speech selector + example input
│   ├── CardLibrary.tsx       # Updated edit mode for new fields
│   ├── StudyView.tsx         # No changes (just displays FlashCard component)
│   └── SpeakerButton.tsx     # NEW: Text-to-speech button component
├── contexts/
│   └── CardContext.tsx       # Updated reducer to handle new optional fields
├── utils/
│   ├── bulkImport.ts         # Updated to parse new fields from import format
│   ├── localStorage.ts       # Updated schema version for migration
│   └── speechSynthesis.ts    # NEW: Web Speech API wrapper utility
└── hooks/
    └── useSpeechSynthesis.ts # NEW: Custom hook for TTS functionality

tests/
├── components/
│   ├── FlashCard.test.tsx
│   ├── SpeakerButton.test.tsx
│   └── AddCardForm.test.tsx
└── utils/
    ├── bulkImport.test.tsx
    └── speechSynthesis.test.tsx
```

**Structure Decision**: This is a single-project React web application. All source code lives under `src/` with clear separation between types, components, contexts, utils, and hooks. The existing structure supports this feature with minimal additions: one new component (SpeakerButton), one new utility (speechSynthesis), and one new hook (useSpeechSynthesis). All other files are extensions of existing code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section intentionally left empty.
