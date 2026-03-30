'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiCheck, FiBell } from 'react-icons/fi';

export default function MedicationReminder({ medications, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);

  useEffect(() => {
    if (!medications || medications.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const nowMinutes = currentHour * 60 + currentMin;

    // Find the closest upcoming medication
    let closest = null;
    let closestDiff = Infinity;

    const today = now.toISOString().split('T')[0];

    for (const med of medications) {
      const todayLog = med.takenLog?.[today] || [];
      med.times.forEach((time, idx) => {
        const [h, m] = time.split(':').map(Number);
        const timeMinutes = h * 60 + m;
        const diff = timeMinutes - nowMinutes;

        // Show reminder for meds within next 30 min or past 15 min and not taken
        if (diff >= -15 && diff <= 30 && !todayLog[idx]) {
          if (Math.abs(diff) < closestDiff) {
            closestDiff = Math.abs(diff);
            closest = {
              name: med.name,
              dosage: med.dosage,
              time,
              isPast: diff < 0,
              minutesAway: diff,
            };
          }
        }
      });
    }

    if (closest) {
      setCurrentReminder(closest);
      // Show after a brief delay for natural feel
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [medications]);

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <AnimatePresence>
      {visible && currentReminder && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-20 left-1/2 z-50 w-[360px] max-w-[90vw]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Colored top bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <FiBell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text">Medication Reminder</h4>
                  <p className="text-sm text-text mt-1">
                    {currentReminder.isPast
                      ? `Time to take your ${currentReminder.name}`
                      : `${currentReminder.name} due in ${currentReminder.minutesAway} min`
                    }
                  </p>
                  <p className="text-xs text-text-light mt-0.5">
                    {currentReminder.dosage} — Scheduled at {
                      (() => {
                        const [h, m] = currentReminder.time.split(':');
                        const hr = parseInt(h);
                        return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                      })()
                    }
                  </p>
                </div>
                <button onClick={dismiss} className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0">
                  <FiX className="w-4 h-4 text-text-light" />
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={dismiss}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                >
                  <FiCheck className="w-3.5 h-3.5" /> Mark as Taken
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 py-2 bg-muted text-text-light rounded-xl text-xs font-medium hover:bg-slate-200 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
