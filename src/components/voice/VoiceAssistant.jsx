'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiVolume2 } from 'react-icons/fi';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useRouter } from 'next/navigation';

export default function VoiceAssistant() {
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, processCommand, isSupported } = useVoiceAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!isListening && transcript) {
      const result = processCommand(transcript);
      setMessages(prev => [
        ...prev,
        { type: 'user', text: transcript },
        { type: 'assistant', text: result.response },
      ]);
      speak(result.response);

      if (result.action === 'show_medications') router.push('/patient/medications');
      if (result.action === 'show_recovery') router.push('/patient/recovery-plan');
      if (result.action === 'show_symptoms') router.push('/patient/symptoms');
    }
  }, [isListening, transcript]);

  if (!isSupported) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white ${
          isListening ? 'bg-danger' : 'bg-gradient-to-br from-primary to-blue-700'
        }`}
      >
        {isListening ? (
          <div className="relative">
            <FiMic className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse-ring" />
          </div>
        ) : (
          <FiMic className="w-6 h-6" />
        )}
      </motion.button>

      {/* Voice Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiVolume2 className="w-5 h-5" />
                <span className="font-semibold text-sm">Voice Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-48 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-text-light py-8">
                  <p className="mb-2">Tap the mic and speak</p>
                  <p className="text-xs">Try: "Show medications" or "Log pain 5"</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-text'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mic button */}
            <div className="p-4 border-t border-border flex justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => isListening ? stopListening() : startListening()}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isListening
                    ? 'bg-danger text-white'
                    : 'bg-muted text-text hover:bg-slate-200'
                }`}
              >
                {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
              </motion.button>
            </div>
            {isListening && (
              <div className="px-4 pb-3 text-center">
                <p className="text-xs text-text-light animate-pulse">Listening...</p>
                {transcript && <p className="text-xs text-primary mt-1">{transcript}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
