'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import { addSymptomLog } from '@/services/storageService';
import { useNotifications } from '@/context/NotificationContext';
import { useLanguage } from '@/context/LanguageContext';

export default function QuickCheckIn({ patientId, onClose, onComplete }) {
  const { t } = useLanguage();

  const moods = [
    { key: 'great',   emoji: '😊', label: t('great'),    painDefault: 2, moodVal: 8 },
    { key: 'okay',    emoji: '😐', label: t('okay'),     painDefault: 5, moodVal: 5 },
    { key: 'notgood', emoji: '😞', label: t('notGood'), painDefault: 7, moodVal: 3 },
  ];
  const [step, setStep] = useState(1); // 1=mood, 2=pain, 3=note, 4=done
  const [feeling, setFeeling] = useState(null);
  const [pain, setPain] = useState(5);
  const [note, setNote] = useState('');
  const { addToast } = useNotifications();

  function handleMoodSelect(mood) {
    setFeeling(mood);
    setPain(mood.painDefault);
    setStep(2);
  }

  function handleSubmit() {
    const log = {
      id: `sym_quick_${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      painLevel: pain,
      swelling: pain > 5 ? 4 : 2,
      mobility: 10 - pain,
      mood: feeling.moodVal,
      temperature: 98.4,
      fatigue: pain > 5 ? 6 : 3,
      appetite: feeling.moodVal,
      breathing: 8,
      notes: note || `Quick check-in: Feeling ${feeling.label.toLowerCase()}`,
      flagged: pain >= 7,
    };
    addSymptomLog(log);
    addToast('Check-in complete! Stay strong! 💪', 'success');
    setStep(4);
    setTimeout(() => {
      onComplete?.();
      onClose?.();
    }, 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold text-text">{t('quickCheckIn')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Mood */}
            {step === 1 && (
              <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-text-light text-center mb-5">{t('howAreYouFeeling')}</p>
                <div className="flex justify-center gap-4">
                  {moods.map(m => (
                    <button
                      key={m.key}
                      onClick={() => handleMoodSelect(m)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary-light transition-all active:scale-95"
                    >
                      <span className="text-4xl">{m.emoji}</span>
                      <span className="text-xs font-medium text-text">{m.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Pain */}
            {step === 2 && (
              <motion.div key="pain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-text-light text-center mb-4">{t('painLevelToday')}</p>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-5xl font-bold text-text">{pain}</span>
                  <span className="text-lg text-text-light ml-1">/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={pain}
                  onChange={e => setPain(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2a9d8f ${pain * 10}%, #e2e8f0 ${pain * 10}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-text-light mt-1 mb-5">
                  <span>{t('noPain')}</span>
                  <span>{t('severePain')}</span>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  {t('next')}
                </button>
              </motion.div>
            )}

            {/* Step 3: Note */}
            {step === 3 && (
              <motion.div key="note" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-text-light text-center mb-4">{t('anyWorries')}</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t('anyWorriesPlaceholder')}
                  className="w-full p-3 rounded-xl border border-border text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 bg-muted text-text rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                  >
                    {t('back')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    {t('submitCheckIn')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                >
                  <FiCheck className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h4 className="text-lg font-semibold text-text mb-1">{t('checkInComplete')}</h4>
                <p className="text-sm text-text-light">{t('thankYou')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        {step < 4 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-slate-200'}`} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
