/**
 * App Component - Main Application Entry Point
 *
 * Features:
 * - Navigation between Study Mode and Manage Cards views
 * - Responsive header with view toggle
 * - Cyberpunk aesthetic navigation
 * - Smooth view transitions
 *
 * Phase 4: Study Mode + Card Management with navigation
 */

import { useState } from 'react';
import { StudyView } from './components/StudyView';
import { CardLibrary } from './components/CardLibrary';
import { AddCardForm } from './components/AddCardForm';
import './App.css';

type View = 'study' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<View>('study');

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-dark-bg/80 border-b-2 border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Vocabulary Builder</h1>
            </div>

            {/* View Toggle Navigation */}
            <nav className="flex gap-2 p-1 bg-dark-card rounded-xl border-2 border-dark-border">
              <button
                onClick={() => setCurrentView('study')}
                className={`
                  px-6 py-2 rounded-lg font-mono text-sm uppercase tracking-wider
                  transition-all duration-300
                  ${
                    currentView === 'study'
                      ? 'bg-accent-primary text-white shadow-glow'
                      : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                  }
                `}
                aria-label="Switch to study view"
                aria-current={currentView === 'study' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Study
                </div>
              </button>
              <button
                onClick={() => setCurrentView('manage')}
                className={`
                  px-6 py-2 rounded-lg font-mono text-sm uppercase tracking-wider
                  transition-all duration-300
                  ${
                    currentView === 'manage'
                      ? 'bg-accent-secondary text-white shadow-glow-pink'
                      : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                  }
                `}
                aria-label="Switch to manage cards view"
                aria-current={currentView === 'manage' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  Manage
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
        {currentView === 'study' ? (
          <StudyView />
        ) : (
          <div className="py-8 space-y-8">
            {/* Add Word Section */}
            <section className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Add New Vocabulary</h2>
                <p className="text-gray-400 font-mono text-sm">
                  Add a new word to your vocabulary collection
                </p>
              </div>
              <div className="p-6 bg-dark-card border-2 border-dark-border rounded-xl">
                <AddCardForm />
              </div>
            </section>

            {/* Vocabulary Library Section */}
            <section className="animate-fade-in-up stagger-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your Vocabulary</h2>
                <p className="text-gray-400 font-mono text-sm">
                  View, edit, and manage your vocabulary collection
                </p>
              </div>
              <CardLibrary onNavigateToStudy={() => setCurrentView('study')} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
