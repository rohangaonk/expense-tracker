'use client';

import { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface VoiceButtonProps {
  onTranscriptChange: (transcript: string) => void;
  onRecordingComplete: (transcript: string) => void;
  className?: string;
}

export default function VoiceButton({ 
  onTranscriptChange, 
  onRecordingComplete,
  className = '' 
}: VoiceButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  // Update parent component with transcript changes
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Notify parent when recording completes
  useEffect(() => {
    if (!isListening && transcript && transcript.trim()) {
      onRecordingComplete(transcript);
      resetTranscript();
    }
  }, [isListening, transcript, onRecordingComplete, resetTranscript]);

  // Update parent with interim results
  useEffect(() => {
    if (interimTranscript) {
      onTranscriptChange(interimTranscript);
    }
  }, [interimTranscript, onTranscriptChange]);

  if (!isSupported) {
    return (
      <button
        disabled
        className={`p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed ${className}`}
        title="Voice input not supported in this browser"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
          <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          relative p-3 rounded-full transition-all duration-300 
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white scale-110 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
          ${className}
        `}
        title={isListening ? 'Stop recording' : 'Start voice input'}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {/* Ripple effect when listening */}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      {/* Status indicator */}
      {isListening && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
            Listening...
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
