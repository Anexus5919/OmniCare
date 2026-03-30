'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiVolume2, FiHeart } from 'react-icons/fi';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getDoctorNotes } from '@/services/storageService';

const quickCommands = [
  { label: 'How am I doing?', icon: '📊' },
  { label: 'Show medications', icon: '💊' },
  { label: 'Log pain 5', icon: '🩺' },
  { label: 'Open calendar', icon: '📅' },
  { label: 'Show doctor notes', icon: '📝' },
];

export default function VoiceAssistant({ recoveryScore }) {
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, processCommand, isSupported } = useVoiceAssistant();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'assistant', text: "Hello! I'm your OmniCare recovery companion. How can I help you today?" },
  ]);
  const router = useRouter();

  // Get doctor notes for context
  const doctorNotes = user?.patientId ? getDoctorNotes(user.patientId) : [];
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isListening && transcript) {
      handleCommand(transcript);
    }
  }, [isListening, transcript]);

  function handleCommand(text) {
    const result = processCommand(text, { recoveryScore: recoveryScore || 0, doctorNotes, lang });

    setMessages(prev => [
      ...prev,
      { type: 'user', text },
      { type: 'assistant', text: result.response },
    ]);
    speak(result.response);

    // Route actions
    setTimeout(() => {
      if (result.action === 'show_medications') router.push('/patient/medications');
      if (result.action === 'show_recovery') router.push('/patient/recovery-plan');
      if (result.action === 'show_symptoms' || result.action === 'log_feeling_bad') router.push('/patient/symptoms');
      if (result.action === 'show_calendar') router.push('/patient/calendar');
      if (result.action === 'show_followups') router.push('/patient/follow-ups');
    }, 1500);
  }

  function handleQuickCommand(cmd) {
    handleCommand(cmd);
  }

  if (!isSupported) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        data-tour="voice-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors ${
          isListening ? 'bg-danger' : isSpeaking ? 'bg-secondary' : 'bg-gradient-to-br from-primary to-primary-dark'
        }`}
      >
        {isListening ? (
          <div className="relative">
            <FiMic className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse-ring" />
          </div>
        ) : isSpeaking ? (
          <FiVolume2 className="w-6 h-6 animate-pulse" />
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
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiHeart className="w-4 h-4" />
                <div>
                  <span className="font-semibold text-sm">{t('recoveryCompanion')}</span>
                  <span className="block text-[10px] text-white/60">{t('voicePowered')}</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-52 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-text'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick commands */}
            <div className="px-4 pb-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {quickCommands.map(cmd => (
                  <button
                    key={cmd.label}
                    onClick={() => handleQuickCommand(cmd.label)}
                    className="shrink-0 px-2.5 py-1 bg-muted rounded-lg text-[11px] text-text hover:bg-slate-200 transition-colors"
                  >
                    {cmd.icon} {cmd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic button */}
            <div className="p-3 border-t border-border flex items-center justify-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => isListening ? stopListening() : startListening(lang === 'hi' ? 'hi-IN' : 'en-US')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isListening
                    ? 'bg-danger text-white'
                    : 'bg-primary-light text-primary hover:bg-primary/10'
                }`}
              >
                {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
              </motion.button>
              {isListening && (
                <div className="flex-1">
                  <p className="text-xs text-danger font-medium animate-pulse">{t('listening')}</p>
                  {transcript && <p className="text-xs text-primary mt-0.5 truncate">{transcript}</p>}
                </div>
              )}
              {!isListening && (
                <p className="text-xs text-text-light">{t('tapToSpeak')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
