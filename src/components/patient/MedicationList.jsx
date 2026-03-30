'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import Card from '@/components/common/Card';
import { toggleMedicationTaken } from '@/services/storageService';
import { formatTime, getToday } from '@/utils/dateHelpers';

export default function MedicationList({ medications }) {
  const [, forceUpdate] = useState(0);
  const today = getToday();

  if (!medications || medications.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold text-text mb-2">Today's Medications</h3>
        <p className="text-sm text-text-light">No medications scheduled</p>
      </Card>
    );
  }

  function handleToggle(medId, timeIndex) {
    toggleMedicationTaken(medId, today, timeIndex);
    forceUpdate(n => n + 1);
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Today's Medications</h3>
        <FiClock className="w-4 h-4 text-text-light" />
      </div>
      <div className="space-y-3">
        {medications.map((med) => {
          const todayLog = med.takenLog?.[today] || med.times.map(() => false);
          return (
            <div key={med.id} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-text text-sm">{med.name}</p>
                  <p className="text-xs text-text-light">{med.dosage} &middot; {med.instructions}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {med.times.map((time, idx) => {
                  const [h, m] = time.split(':').map(Number);
                  const isPast = h < currentHour || (h === currentHour && m <= currentMin);
                  const taken = todayLog[idx];

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggle(med.id, idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        taken
                          ? 'bg-emerald-100 text-emerald-700'
                          : isPast
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-muted text-text-light'
                      }`}
                    >
                      {taken ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiCircle className="w-3.5 h-3.5" />}
                      {formatTime(time)}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
