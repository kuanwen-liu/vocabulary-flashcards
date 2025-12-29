<!--
SYNC IMPACT REPORT
===================
Version Change: NONE → 1.0.0
Rationale: Initial constitution ratification for Flashcards project

Modified Principles: N/A (initial creation)

Added Sections:
- Core Principles (5 principles)
- Design Philosophy
- Quality Standards
- Governance

Templates Status:
✅ plan-template.md - Reviewed, Constitution Check section will reference these principles
✅ spec-template.md - Reviewed, aligns with user-centric testing approach
✅ tasks-template.md - Reviewed, aligns with incremental delivery philosophy
⚠️ No command files found in .specify/templates/commands/ (commands exist in .claude/commands/)

Follow-up TODOs: None - all placeholders filled
-->

# Flashcards Constitution

## Core Principles

### I. React + Vite + Tailwind Stack

The project MUST use React as the UI framework, Vite as the build tool, and Tailwind CSS for styling. This stack provides:
- Fast development experience with HMR (Hot Module Replacement)
- Modern build tooling optimized for production
- Utility-first CSS approach for rapid UI development
- Type safety through TypeScript integration

**Rationale**: This combination represents the current best practice for modern web application development, providing excellent developer experience, performance, and maintainability.

### II. CSS 3D Transform Animations

All card flip animations MUST use CSS 3D transforms (`transform: rotateY()`, `perspective`, `transform-style: preserve-3d`) rather than JavaScript-driven animations or 2D transforms.

**Requirements**:
- Use `transform: rotateY()` for card flipping
- Apply `perspective` to parent containers
- Set `transform-style: preserve-3d` for 3D context
- Leverage hardware acceleration via `will-change` or `transform: translateZ(0)`
- Avoid JavaScript animation libraries for card flips

**Rationale**: CSS 3D transforms are hardware-accelerated, provide smoother 60fps animations, reduce JavaScript bundle size, and ensure optimal performance across devices.

### III. React Context API State Management

Card collections and application state MUST be managed globally using React Context API. No external state management libraries (Redux, Zustand, MobX, etc.) are permitted unless explicitly justified.

**Requirements**:
- Create context providers for card collection state
- Implement reducer pattern for complex state updates if needed
- Maintain single source of truth for card data
- Ensure state changes trigger appropriate re-renders
- Keep context scoped appropriately (avoid unnecessary global state)

**Rationale**: React Context API is built-in, eliminates external dependencies, provides sufficient functionality for this application's scope, and reduces bundle size and complexity.

### IV. LocalStorage Persistence (NON-NEGOTIABLE)

ALL flashcard data MUST be persisted to browser LocalStorage. No server-side storage, databases, or external APIs are permitted for card persistence.

**Requirements**:
- Save card collection to LocalStorage on every create/update/delete operation
- Load card collection from LocalStorage on application mount
- Implement serialization/deserialization for complex card objects
- Handle LocalStorage quota errors gracefully
- Provide fallback behavior if LocalStorage is unavailable
- Clear strategy for versioning persisted data schema

**Rationale**: LocalStorage ensures the application works completely offline, eliminates backend dependencies, provides instant persistence, and keeps the application simple and portable.

### V. Frontend-Design Aesthetic

The application design MUST follow the frontend-design skill aesthetic: Dark mode, Vibrant accents, Playful UI, and Glow effects.

**Requirements**:
- **Dark Mode**: Dark background colors as the primary theme (no light mode required)
- **Vibrant Accents**: Use bright, saturated colors for interactive elements and highlights
- **Playful UI**: Friendly, engaging visual elements (rounded corners, smooth animations, delightful micro-interactions)
- **Glow Effects**: CSS `box-shadow` glows, gradient borders, luminous effects for cards and buttons
- Maintain WCAG AA contrast ratios despite dark theme
- Ensure glow effects enhance rather than distract from usability

**Rationale**: A distinctive, polished aesthetic differentiates this flashcard app from generic alternatives, creates an engaging learning experience, and demonstrates production-grade frontend design quality.

## Design Philosophy

### Simplicity First

- Keep component structure simple and flat
- Avoid premature abstraction
- No utility functions for one-time operations
- Delete unused code completely (no commented-out code)

### Progressive Enhancement

- Core flashcard viewing/flipping works without JavaScript animations
- Graceful degradation if LocalStorage unavailable
- Mobile-first responsive design

### Performance Targets

- First Contentful Paint (FCP) < 1.5s
- Card flip animations maintain 60fps
- Time to Interactive (TTI) < 3s
- Bundle size < 200KB (gzipped)

## Quality Standards

### Code Quality

- **TypeScript**: All code MUST use TypeScript with strict mode enabled
- **Linting**: ESLint rules MUST pass before commit
- **Formatting**: Code MUST be formatted consistently (Prettier or built-in formatter)
- **No console warnings**: Production builds MUST have zero console warnings

### Testing Philosophy

Testing is OPTIONAL unless explicitly requested in feature specifications. When tests are required:
- Write tests that verify user journeys, not implementation details
- Integration tests preferred over unit tests
- Test files colocated with components or in dedicated `tests/` directory

### Accessibility

- Semantic HTML required
- Keyboard navigation support for all interactive elements
- ARIA labels where semantic HTML insufficient
- Minimum WCAG AA contrast ratios (even with dark theme + glow effects)

## Governance

### Amendment Process

1. Proposed constitution changes MUST be documented with rationale
2. Version number MUST be incremented per semantic versioning:
   - **MAJOR**: Breaking changes to core principles or removed principles
   - **MINOR**: New principles added or significant expansions
   - **PATCH**: Clarifications, wording improvements, non-semantic changes
3. All dependent templates MUST be reviewed and updated for consistency
4. Sync Impact Report MUST be generated and prepended to constitution file

### Compliance

- All pull requests MUST verify compliance with constitution principles
- Violations of NON-NEGOTIABLE principles are blocking
- Complexity or deviation from principles MUST be justified in plan.md Complexity Tracking section
- Constitution supersedes all other practices and conventions

### Versioning

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29
