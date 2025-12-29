/**
 * SpeakerButton Component - Text-to-Speech Control
 *
 * Features:
 * - Speaker icon button to trigger text-to-speech
 * - Integrates useSpeechSynthesis hook for TTS functionality
 * - ARIA labels for accessibility (screen readers)
 * - Keyboard shortcuts (Alt+R to speak, Space to pause/resume, Escape to stop)
 * - Cyberpunk aesthetic (purple glow, dark background)
 * - Disabled state when Web Speech API not supported
 * - Visual feedback for speaking/paused states
 *
 * Constitutional Compliance:
 * - Principle V: Cyberpunk aesthetic with glow effects
 * - WCAG AA accessibility compliance
 */

import { useEffect } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

/**
 * Props for SpeakerButton component
 */
export interface SpeakerButtonProps {
  /** The text to speak when button is clicked */
  text: string;
  /** Optional className for custom styling */
  className?: string;
  /** Optional aria-label override */
  ariaLabel?: string;
}

/**
 * SpeakerButton Component
 *
 * Renders a speaker icon button that reads text aloud using Web Speech API.
 * Includes keyboard shortcuts and accessibility features.
 *
 * @param text - The text to speak when clicked
 * @param className - Optional additional CSS classes
 * @param ariaLabel - Optional custom ARIA label
 *
 * @example
 * ```tsx
 * <SpeakerButton text="ephemeral" />
 * ```
 */
export function SpeakerButton({
  text,
  className = '',
  ariaLabel,
}: SpeakerButtonProps) {
  const { speak, pause, resume, stop, isSpeaking, isPaused, isSupported } =
    useSpeechSynthesis();

  /**
   * Keyboard shortcuts for TTS control
   * - Alt+R: Speak/read aloud
   * - Space: Pause/resume (when speaking)
   * - Escape: Stop speaking
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+R to speak
      if (event.altKey && event.key.toLowerCase() === 'r' && !isSpeaking) {
        event.preventDefault();
        speak(text);
      }

      // Space to pause/resume (only when speaking)
      if (event.code === 'Space' && isSpeaking) {
        event.preventDefault();
        if (isPaused) {
          resume();
        } else {
          pause();
        }
      }

      // Escape to stop
      if (event.key === 'Escape' && isSpeaking) {
        event.preventDefault();
        stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isSpeaking, isPaused, speak, pause, resume, stop]);

  /**
   * If browser doesn't support Web Speech API, hide the button
   * This ensures graceful degradation
   */
  if (!isSupported) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking speaker button

    if (!isSpeaking) {
      speak(text);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isSupported}
      className={`
        group relative p-2 rounded-lg
        bg-purple-600/20 hover:bg-purple-600/40
        border border-purple-500/40 hover:border-purple-400/60
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSpeaking ? 'shadow-glow-purple' : ''}
        ${className}
      `}
      aria-label={
        ariaLabel ||
        (isSpeaking
          ? isPaused
            ? 'Resume reading'
            : 'Pause reading'
          : 'Read term aloud')
      }
      aria-pressed={isSpeaking}
      aria-keyshortcuts="alt+r"
      title={
        isSpeaking
          ? isPaused
            ? 'Resume (Space)'
            : 'Pause (Space)'
          : 'Read aloud (Alt+R)'
      }
    >
      {/* Speaker Icon SVG */}
      {!isSpeaking ? (
        // Speaker icon - default state
        <svg
          className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      ) : isPaused ? (
        // Play icon - paused state
        <svg
          className="w-5 h-5 text-purple-300 animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        // Pause icon - speaking state
        <svg
          className="w-5 h-5 text-purple-300 animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      )}

      {/* Glow effect - animated when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-lg bg-purple-500/20 animate-pulse-glow pointer-events-none" />
      )}
    </button>
  );
}
