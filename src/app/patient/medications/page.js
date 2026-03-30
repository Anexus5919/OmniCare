'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiClock, FiCalendar, FiPieChart, FiClipboard } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { useAuth } from '@/context/AuthContext';
import { getMedicationsByPatient, toggleMedicationTaken } from '@/services/storageService';
import { formatTime, formatDate, getToday } from '@/utils/dateHelpers';

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [, forceUpdate] = useState(0);
  const today = getToday();

  useEffect(() => {
    if (user?.patientId) {
      setMedications(getMedicationsByPatient(user.patientId));
    }
  }, [user]);

  function handleToggle(medId, timeIndex) {
    toggleMedicationTaken(medId, today, timeIndex);
    setMedications(getMedicationsByPatient(user.patientId));
  }

  // Calculate adherence
  let totalDoses = 0, takenDoses = 0;
  medications.forEach(med => {
    if (med.takenLog) {
      Object.values(med.takenLog).forEach(day => {
        totalDoses += day.length;
        takenDoses += day.filter(Boolean).length;
      });
    }
  });
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  const todayDoses = medications.reduce((sum, med) => sum + med.times.length, 0);
  const todayTaken = medications.reduce((sum, med) => {
    const log = med.takenLog?.[today] || [];
    return sum + log.filter(Boolean).length;
  }, 0);

  return (
    <AppLayout title="Medications" requiredRole="patient">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiClipboard}
            label="Active Medications"
            value={medications.length}
            color="text-primary"
            bgColor="bg-primary-light"
          />
          <StatCard
            icon={FiPieChart}
            label="Adherence Rate"
            value={`${adherenceRate}%`}
            sublabel={`${takenDoses}/${totalDoses} doses`}
            color={adherenceRate > 80 ? 'text-secondary' : 'text-amber-600'}
            bgColor={adherenceRate > 80 ? 'bg-secondary-light' : 'bg-amber-50'}
          />
          <StatCard
            icon={FiCheckCircle}
            label="Today's Progress"
            value={`${todayTaken}/${todayDoses}`}
            sublabel="doses taken"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={FiCalendar}
            label="Next Dose"
            value={medications[0]?.times[0] ? formatTime(medications[0].times[0]) : 'N/A'}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Medication cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => {
            const todayLog = med.takenLog?.[today] || med.times.map(() => false);
            const medTaken = todayLog.filter(Boolean).length;
            const medTotal = med.times.length;

            return (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text">{med.name}</h3>
                      <p className="text-sm text-text-light">{med.dosage}</p>
                    </div>
                    <Badge variant={medTaken === medTotal ? 'success' : 'warning'}>
                      {medTaken}/{medTotal} today
                    </Badge>
                  </div>

                  <p className="text-xs text-text-light mb-3">{med.instructions}</p>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {med.times.map((time, idx) => {
                      const taken = todayLog[idx];
                      return (
                        <motion.button
                          key={idx}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggle(med.id, idx)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            taken
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-muted text-text-light border border-border hover:border-primary/30'
                          }`}
                        >
                          {taken ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiCircle className="w-3.5 h-3.5" />}
                          {formatTime(time)}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs text-text-light">
                    <span>From: {formatDate(med.startDate)}</span>
                    <span>To: {formatDate(med.endDate)}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
