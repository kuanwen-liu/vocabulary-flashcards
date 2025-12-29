# Quickstart Guide: Flashcards Application

**Feature**: Flashcards Application
**Branch**: `001-flashcards-app`
**Date**: 2025-12-29

## Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later
- **Git**: For branch management
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (last 2 versions)

---

## 1. Setup Development Environment

### Clone and Checkout Branch

```bash
# If starting fresh
git clone <repository-url>
cd flashcards

# Checkout feature branch
git checkout 001-flashcards-app
```

### Install Dependencies

```bash
# Install existing dependencies
npm install

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss@latest postcss autoprefixer

# Initialize Tailwind (if config doesn't exist)
npx tailwindcss init -p
```

### Configure Tailwind CSS

**File: `tailwind.config.js`**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          card: '#1a1f35',
          border: '#2a3150',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#ec4899',
          success: '#10b981',
          warning: '#f59e0b',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
    },
  },
  plugins: [],
}
```

**File: `src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  @apply dark;
}

body {
  @apply bg-dark-bg text-white antialiased;
}
```

### Enable TypeScript Strict Mode

**File: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

---

## 2. Run Development Server

```bash
# Start Vite dev server
npm run dev
```

**Expected Output:**
```
VITE v7.2.4  ready in 342 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

Open browser to `http://localhost:5173/` to see the application.

---

## 3. Project Structure

```
flashcards/
├── src/
│   ├── components/
│   │   ├── FlashCard.tsx          # 3D flip card component
│   │   ├── StudyView.tsx          # Study mode interface
│   │   ├── CardLibrary.tsx        # Card management dashboard
│   │   ├── AddCardForm.tsx        # Create/edit card form
│   │   ├── BulkImport.tsx         # Bulk import UI
│   │   └── FilterToggle.tsx       # All/Needs Review toggle
│   ├── contexts/
│   │   └── CardContext.tsx        # Global state + LocalStorage
│   ├── hooks/
│   │   └── useLocalStorage.ts     # Storage persistence hook
│   ├── types/
│   │   └── flashcard.ts           # TypeScript interfaces
│   ├── utils/
│   │   └── bulkImport.ts          # Parse bulk import text
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Vite entry point
│   └── index.css                  # Tailwind + custom styles
├── public/
├── specs/
│   └── 001-flashcards-app/
│       ├── spec.md                # Feature specification
│       ├── plan.md                # This implementation plan
│       ├── research.md            # Technical decisions
│       ├── data-model.md          # Entity definitions
│       ├── contracts/
│       │   └── storage-api.md     # LocalStorage contract
│       └── quickstart.md          # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 4. Core Component Usage

### CardContext Provider

**Purpose:** Wrap app to provide global flashcard state.

**File: `src/contexts/CardContext.tsx`**
```tsx
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
  mastered: boolean;
  createdAt: string;
}

interface CardState {
  cards: Flashcard[];
  filter: 'all' | 'needsReview';
  currentCardIndex: number;
}

type CardAction =
  | { type: 'ADD_CARD'; payload: Omit<Flashcard, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<Flashcard> } }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'TOGGLE_MASTERED'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'needsReview' }
  | { type: 'NAVIGATE'; payload: number }
  | { type: 'SHUFFLE_CARDS' }
  | { type: 'BULK_IMPORT'; payload: Flashcard[] };

const CardContext = createContext<{
  state: CardState;
  dispatch: React.Dispatch<CardAction>;
} | null>(null);

export function useCards() {
  const context = useContext(CardContext);
  if (!context) throw new Error('useCards must be used within CardProvider');
  return context;
}

export function CardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cardReducer, initialState, (initial) => ({
    ...initial,
    cards: loadFromLocalStorage(),
  }));

  useEffect(() => {
    saveToLocalStorage(state.cards);
  }, [state.cards]);

  return (
    <CardContext.Provider value={{ state, dispatch }}>
      {children}
    </CardContext.Provider>
  );
}
```

**Usage in `App.tsx`:**
```tsx
import { CardProvider } from './contexts/CardContext';

function App() {
  return (
    <CardProvider>
      <div className="min-h-screen bg-dark-bg">
        {/* App content */}
      </div>
    </CardProvider>
  );
}
```

---

### FlashCard Component (3D Flip)

**Purpose:** Render a single flashcard with 3D flip animation.

**File: `src/components/FlashCard.tsx`**
```tsx
import { useState } from 'react';

interface FlashCardProps {
  term: string;
  definition: string;
  mastered: boolean;
  onToggleMastered: () => void;
}

export function FlashCard({ term, definition, mastered, onToggleMastered }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-64 bg-dark-card rounded-2xl p-8 shadow-glow flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h2 className="text-3xl font-bold text-center">{term}</h2>
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-64 bg-dark-card rounded-2xl p-8 shadow-glow-pink flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-xl text-center">{definition}</p>
        </div>
      </div>

      {/* Mastered Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMastered();
        }}
        className={`mt-4 px-6 py-2 rounded-xl ${
          mastered
            ? 'bg-accent-success shadow-glow-green'
            : 'bg-dark-border'
        }`}
      >
        {mastered ? '✓ Mastered' : 'Mark as Mastered'}
      </button>
    </div>
  );
}
```

**Usage:**
```tsx
<FlashCard
  term={card.term}
  definition={card.definition}
  mastered={card.mastered}
  onToggleMastered={() => dispatch({ type: 'TOGGLE_MASTERED', payload: card.id })}
/>
```

---

### AddCardForm Component

**Purpose:** Create or edit flashcards.

**File: `src/components/AddCardForm.tsx`**
```tsx
import { useState } from 'react';
import { useCards } from '../contexts/CardContext';

export function AddCardForm() {
  const { dispatch } = useCards();
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim() && definition.trim()) {
      dispatch({
        type: 'ADD_CARD',
        payload: { term: term.trim(), definition: definition.trim(), mastered: false },
      });
      setTerm('');
      setDefinition('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Term (e.g., Photosynthesis)"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full px-4 py-3 bg-dark-card rounded-xl border border-dark-border focus:border-accent-primary focus:outline-none"
        maxLength={500}
      />
      <textarea
        placeholder="Definition"
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        className="w-full px-4 py-3 bg-dark-card rounded-xl border border-dark-border focus:border-accent-primary focus:outline-none resize-none"
        rows={4}
        maxLength={2000}
      />
      <button
        type="submit"
        className="w-full py-3 bg-accent-primary rounded-xl shadow-glow font-semibold hover:opacity-90"
      >
        Add Card
      </button>
    </form>
  );
}
```

---

## 5. Build for Production

```bash
# Create optimized production build
npm run build
```

**Output:** `dist/` directory with bundled files.

### Preview Production Build

```bash
npm run preview
```

### Build Performance Validation

```bash
# Check bundle size
ls -lh dist/assets/*.js
```

**Target:** < 200KB gzipped per constitution.

---

## 6. Testing LocalStorage Manually

### Inspect Stored Data

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage** → `http://localhost:5173`
4. Find key: `flashcards-app-data`
5. View JSON value

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **Local Storage** → `http://localhost:5173`
4. Find key: `flashcards-app-data`

### Simulate Quota Exceeded

```javascript
// Run in browser console
const hugeArray = new Array(10000).fill({
  id: '123',
  term: 'x'.repeat(1000),
  definition: 'y'.repeat(1000),
  mastered: false,
  createdAt: new Date().toISOString()
});
localStorage.setItem('flashcards-app-data', JSON.stringify({ version: '1.0', cards: hugeArray, lastModified: new Date().toISOString() }));
```

**Expected:** Error message displayed to user.

---

## 7. Development Workflow

### Adding a New Component

1. Create file in `src/components/`
2. Define TypeScript interfaces for props
3. Implement component with Tailwind classes
4. Export from component file
5. Import and use in parent component

### Modifying State

1. Add new action type to `CardAction` union in `CardContext.tsx`
2. Implement action handler in `cardReducer` switch statement
3. Dispatch action from UI component via `dispatch({ type: 'ACTION_NAME', payload: ... })`

### Testing Changes

1. Save file → Vite auto-reloads browser
2. Verify UI update
3. Check browser DevTools console for errors
4. Inspect LocalStorage for data persistence
5. Test edge cases (empty state, quota exceeded, etc.)

---

## 8. Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting errors
npm run lint -- --fix
```

---

## 9. Troubleshooting

### Issue: Tailwind styles not applying

**Solution:**
- Verify `@tailwind` directives in `src/index.css`
- Check `content` paths in `tailwind.config.js`
- Restart dev server

### Issue: TypeScript errors in strict mode

**Solution:**
- Add explicit type annotations
- Handle null/undefined cases
- Use type guards or optional chaining

### Issue: LocalStorage not persisting

**Solution:**
- Check browser privacy settings (incognito may disable storage)
- Verify `useEffect` dependency array includes `state.cards`
- Check console for storage errors

### Issue: Card flip animation stuttering

**Solution:**
- Ensure `will-change: transform` is applied
- Check for excessive re-renders (use React DevTools Profiler)
- Verify GPU acceleration in browser settings

---

## 10. Next Steps

After development environment is ready:

1. Run `/speckit.tasks` to generate implementation task list
2. Follow tasks.md to implement features in priority order (P1 → P2 → P3 → P4)
3. Test each user story independently before moving to next
4. Verify constitutional compliance (60fps animations, TypeScript strict, bundle size)

---

## Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vite.dev
- **Tailwind CSS Docs**: https://tailwindcss.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **LocalStorage MDN**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

**Happy Coding! 🚀**
