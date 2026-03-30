'use client';

import { useState, useCallback, useRef } from 'react';

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(result);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
  }, []);

  const processCommand = useCallback((text) => {
    const lower = text.toLowerCase().trim();

    if (lower.includes('pain') && /\d/.test(lower)) {
      const num = parseInt(lower.match(/\d+/)[0]);
      return { action: 'log_pain', value: Math.min(10, num), response: `Logging pain level ${Math.min(10, num)}` };
    }
    if (lower.includes('medication') || lower.includes('medicine')) {
      return { action: 'show_medications', response: 'Opening your medications' };
    }
    if (lower.includes('recovery') || lower.includes('score') || lower.includes('progress')) {
      return { action: 'show_recovery', response: 'Showing your recovery progress' };
    }
    if (lower.includes('symptom') || lower.includes('check-in') || lower.includes('checkin')) {
      return { action: 'show_symptoms', response: 'Opening symptom check-in' };
    }
    if (lower.includes('help')) {
      return {
        action: 'help',
        response: 'You can say: log pain followed by a number, show medications, show recovery progress, or do a symptom check-in'
      };
    }
    return { action: 'unknown', response: 'I didn\'t understand that. Say help for available commands.' };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    processCommand,
    isSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
}
