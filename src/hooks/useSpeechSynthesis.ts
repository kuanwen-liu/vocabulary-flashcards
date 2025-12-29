/**
 * useSpeechSynthesis Hook - Text-to-Speech via Web Speech API
 *
 * Provides text-to-speech functionality using the browser-native Web Speech API.
 * Features:
 * - Speak/pause/resume/stop controls
 * - Voice loading with async onvoiceschanged event handler
 * - Comprehensive error handling for TTS failures
 * - State tracking (isSpeaking, isPaused, isSupported)
 * - Available voices from browser
 *
 * Browser Support:
 * - Chrome 33+, Edge 14+, Safari 7+, Firefox 49+
 * - Works offline with local voices
 *
 * Constitutional Compliance:
 * - Zero bundle size impact (native browser API)
 * - No external dependencies
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Options for speech synthesis
 */
export interface SpeechSynthesisOptions {
  /** BCP 47 language tag (e.g., 'en-US', 'es-ES') */
  lang?: string;
  /** Pitch (0.1 to 10.0, default 1.0) */
  pitch?: number;
  /** Speaking rate (0.1 to 10.0, default 1.0) */
  rate?: number;
  /** Volume (0.0 to 1.0, default 1.0) */
  volume?: number;
}

/**
 * Return type for useSpeechSynthesis hook
 */
export interface UseSpeechSynthesisReturn {
  /** Function to speak text with optional configuration */
  speak: (text: string, options?: SpeechSynthesisOptions) => void;
  /** Function to pause ongoing speech */
  pause: () => void;
  /** Function to resume paused speech */
  resume: () => void;
  /** Function to stop and cancel speech */
  stop: () => void;
  /** Whether TTS is currently speaking */
  isSpeaking: boolean;
  /** Whether TTS is currently paused */
  isPaused: boolean;
  /** Whether browser supports Web Speech API */
  isSupported: boolean;
  /** Array of available TTS voices */
  voices: SpeechSynthesisVoice[];
  /** Current error message (or null if no error) */
  error: string | null;
}

/**
 * Custom hook for text-to-speech functionality
 *
 * @returns Object with speak/pause/resume/stop functions and state
 *
 * @example
 * ```tsx
 * function SpeakerButton({ text }: { text: string }) {
 *   const { speak, isSpeaking, isSupported } = useSpeechSynthesis();
 *
 *   if (!isSupported) {
 *     return <p>Speech synthesis not supported</p>;
 *   }
 *
 *   return (
 *     <button onClick={() => speak(text)} disabled={isSpeaking}>
 *       {isSpeaking ? 'Speaking...' : 'Read Aloud'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if browser supports Web Speech API
  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  /**
   * Load available voices (handles async loading in Chrome)
   * Chrome requires onvoiceschanged event handler for async voice loading
   */
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately
    loadVoices();

    // Handle async voice loading (Chrome)
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Cleanup: remove event handler
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  /**
   * Speak text with optional configuration
   * Cancels any ongoing speech before starting new utterance
   */
  const speak = useCallback(
    (text: string, options: SpeechSynthesisOptions = {}) => {
      if (!isSupported) {
        setError('Speech synthesis not supported in this browser');
        return;
      }

      // Cancel any ongoing speech to prevent queue buildup
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options with defaults
      utterance.lang = options.lang || 'en-US';
      utterance.pitch = options.pitch ?? 1.0;
      utterance.rate = options.rate ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Event handlers for state tracking
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      /**
       * Error handling for speech synthesis failures
       * Possible error types:
       * - 'cancelled': User clicked cancel before speech started
       * - 'interrupted': User interrupted mid-speech
       * - 'audio-unavailable': Cannot access audio output device
       * - 'network': Network error (if using online voices)
       * - 'synthesis-unavailable': Service unavailable
       */
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const errorMessages: Record<string, string> = {
          cancelled: 'Speech was cancelled',
          interrupted: 'Speech was interrupted',
          'audio-unavailable': 'Audio output device unavailable',
          network: 'Network error occurred',
          'synthesis-unavailable': 'Speech synthesis service unavailable',
        };

        const errorMessage =
          errorMessages[event.error] || `Speech error: ${event.error}`;
        setError(errorMessage);
        setIsSpeaking(false);
        setIsPaused(false);

        console.error('[useSpeechSynthesis] Error:', errorMessage);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  /**
   * Pause ongoing speech
   */
  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking, isPaused]);

  /**
   * Resume paused speech
   */
  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking, isPaused]);

  /**
   * Stop and cancel speech
   * Clears the speech queue and resets state
   */
  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    error,
  };
}
