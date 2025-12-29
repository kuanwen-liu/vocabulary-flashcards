/**
 * FlashCard Component - 3D Flip Card with Cyberpunk Aesthetic
 *
 * Features:
 * - CSS 3D transform-based flip animation (rotateY 180deg)
 * - Hardware-accelerated with will-change and translateZ
 * - Click to flip between term (front) and definition (back)
 * - Mastery toggle button with visual indicator
 * - Holographic shine effect on hover
 * - Glow effects matching cyberpunk theme
 * - ARIA labels for screen reader accessibility
 * - Reduced motion support via prefers-reduced-motion
 *
 * Constitutional Compliance:
 * - Principle II: CSS 3D Transforms (perspective, preserve-3d, rotateY)
 * - Principle V: Dark mode, vibrant accents, glow effects
 */

import { useState } from 'react';
import type { FlashCardProps } from '../types/flashcard';
import { SpeakerButton } from './SpeakerButton';

export function FlashCard({
  term,
  definition,
  mastered,
  onToggleMastered,
  partOfSpeech,
  exampleSentences,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleMasteredClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flip when clicking mastered button
    onToggleMastered();
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      {/* 3D Flip Card Container */}
      <div
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? `Meaning: ${definition}. Click to see vocabulary.` : `Vocabulary: ${term}. Click to see meaning.`}
        aria-pressed={isFlipped}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* Front Face - Word */}
        <div className="flip-card-face flip-card-front">
          <div className="card-content group relative">
            {/* Holographic shine effect */}
            <div className="card-holographic" />

            {/* Speaker Button - Top Right Corner */}
            <div className="absolute top-4 right-4 z-10">
              <SpeakerButton text={term} />
            </div>

            {/* Card header with mastered badge */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-mono text-accent-primary uppercase tracking-wider">
                Vocabulary
              </span>
              {mastered && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-success/20 border border-accent-success/40">
                  <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse-glow" />
                  <span className="text-xs font-mono text-accent-success uppercase">
                    Mastered
                  </span>
                </div>
              )}
            </div>

            {/* Word text */}
            <div className="flex-1 flex items-center justify-center px-8">
              <h2 className="text-4xl md:text-5xl font-bold text-center leading-tight tracking-tight">
                {term}
              </h2>
            </div>

            {/* Footer with flip hint */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-mono">
              <svg
                className="w-4 h-4 animate-bounce-slow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span>Click to reveal meaning</span>
            </div>
          </div>
        </div>

        {/* Back Face - Meaning */}
        <div className="flip-card-face flip-card-back">
          <div className="card-content group">
            {/* Holographic shine effect */}
            <div className="card-holographic" />

            {/* Card header */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-mono text-accent-secondary uppercase tracking-wider">
                Meaning
              </span>
              {mastered && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-success/20 border border-accent-success/40">
                  <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse-glow" />
                  <span className="text-xs font-mono text-accent-success uppercase">
                    Mastered
                  </span>
                </div>
              )}
            </div>

            {/* Meaning text */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-6">
              <p className="text-2xl md:text-3xl text-center leading-relaxed text-gray-200">
                {definition}
              </p>

              {/* Part of Speech Badge */}
              {partOfSpeech && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="text-sm font-mono text-cyan-300 uppercase tracking-wide">
                    {partOfSpeech}
                  </span>
                </div>
              )}

              {/* Example Sentences */}
              {exampleSentences && exampleSentences.length > 0 && (
                <div className="w-full max-w-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-mono text-purple-400 uppercase tracking-wider">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Examples
                  </div>
                  <ul className="space-y-2">
                    {exampleSentences.map((example, index) => (
                      <li
                        key={index}
                        className="pl-4 pr-2 py-2 text-sm text-gray-300 border-l-4 border-purple-500/60 bg-purple-500/10 rounded-r-lg"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer with flip hint */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-mono">
              <svg
                className="w-4 h-4 animate-bounce-slow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span>Click to see vocabulary</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mastered Toggle Button - Below Card */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleMasteredClick}
          className={`
            group relative px-8 py-4 rounded-xl font-mono text-sm uppercase tracking-wider
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${
              mastered
                ? 'bg-accent-success/20 text-accent-success border-2 border-accent-success/60 shadow-glow-green hover:shadow-glow-green-intense'
                : 'bg-dark-card text-gray-300 border-2 border-dark-border hover:border-accent-success/60 hover:text-accent-success'
            }
          `}
          aria-label={mastered ? 'Mark as not mastered' : 'Mark as mastered'}
          aria-pressed={mastered}
        >
          <div className="flex items-center gap-3">
            {/* Checkmark icon */}
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center border-2
                transition-all duration-300
                ${
                  mastered
                    ? 'bg-accent-success border-accent-success scale-110'
                    : 'bg-transparent border-gray-500 group-hover:border-accent-success'
                }
              `}
            >
              {mastered && (
                <svg
                  className="w-4 h-4 text-dark-bg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span>{mastered ? 'Mastered' : 'Mark as Mastered'}</span>
          </div>

          {/* Glow effect on hover */}
          <div
            className={`
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${mastered ? 'bg-accent-success/10' : 'bg-accent-success/5'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
