'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiClipboard, FiCalendar, FiTrendingUp, FiAlertTriangle, FiZap } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientById, getRecoveryPlanByPatient, getMedicationsByPatient,
  getSymptomLogsByPatient, getAlertsByPatient, getDoctorNotes
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { daysSince } from '@/utils/dateHelpers';
import { useLanguage } from '@/context/LanguageContext';
import RecoveryScore from '@/components/patient/RecoveryScore';
import DailyChecklist from '@/components/patient/DailyChecklist';
import SymptomChart from '@/components/patient/SymptomChart';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import QuickCheckIn from '@/components/patient/QuickCheckIn';
import MilestoneTracker from '@/components/patient/MilestoneTracker';
import ActivityLog from '@/components/patient/ActivityLog';
import MedicationReminder from '@/components/patient/MedicationReminder';
import TutorialTour from '@/components/common/TutorialTour';
import { patientTourSteps } from '@/data/tourSteps';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);

  useEffect(() => {
    if (!user?.patientId) return;
    loadData();
  }, [user]);

  function loadData() {
    const patient = getPatientById(user.patientId);
    const plan = getRecoveryPlanByPatient(user.patientId);
    const medications = getMedicationsByPatient(user.patientId);
    const symptomLogs = getSymptomLogsByPatient(user.patientId);
    const alerts = getAlertsByPatient(user.patientId).filter(a => !a.acknowledged);

    const allTasks = plan?.phases.flatMap(p => p.tasks) || [];
    const score = computeRecoveryScore(patient, symptomLogs, medications, allTasks);

    setData({ patient, plan, medications, symptomLogs, alerts, score });
  }

  if (!data) return <AppLayout title="Dashboard" requiredRole="patient"><div /></AppLayout>;

  const { patient, plan, medications, symptomLogs, alerts, score } = data;
  const latestLog = symptomLogs[symptomLogs.length - 1];
  const activePhase = plan?.phases.find(p => p.status === 'active');

  return (
    <AppLayout title={`${t('welcome')}, ${patient?.name?.split(' ')[0]}`} requiredRole="patient">
      <div className="space-y-6">
        {/* Alert banner */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <FiAlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {t('youHave')} {alerts.length} {t('unreadAlerts')}
              </p>
              <p className="text-xs text-amber-600">{alerts[0].title}</p>
            </div>
            <Badge variant="warning">{alerts.length}</Badge>
          </motion.div>
        )}

        {/* Quick Check-in bar */}
        <motion.div
          data-tour="quick-checkin"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-4 flex items-center justify-between text-white"
        >
          <div>
            <p className="text-sm font-semibold">{t('howAreYouFeeling')}</p>
            <p className="text-xs text-white/60">{t('quickCheckIn')} — 30s</p>
          </div>
          <button
            onClick={() => setShowQuickCheckIn(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all"
          >
            <FiZap className="w-4 h-4" /> Quick Check-in
          </button>
        </motion.div>

        {/* Stats row */}
        <div data-tour="stats-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiTrendingUp}
            label={t('dayOfRecovery')}
            value={daysSince(patient?.dischargeDate)}
            sublabel={`${t('since')} ${patient?.dischargeDate}`}
            color="text-primary"
            bgColor="bg-primary-light"
          />
          <StatCard
            icon={FiActivity}
            label={t('painLevel')}
            value={latestLog ? `${latestLog.painLevel}/10` : 'N/A'}
            sublabel={t('latestReading')}
            color="text-accent"
            bgColor="bg-red-50"
          />
          <StatCard
            icon={FiClipboard}
            label={t('activeMedications')}
            value={medications.length}
            sublabel={t('activePrescriptions')}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={FiCalendar}
            label={t('currentPhase')}
            value={activePhase?.name || 'N/A'}
            sublabel={`Week ${activePhase?.weekStart}-${activePhase?.weekEnd}`}
            color="text-secondary"
            bgColor="bg-secondary-light"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div data-tour="symptom-chart"><SymptomChart logs={symptomLogs} /></div>
            <div data-tour="daily-tasks"><DailyChecklist plan={plan} /></div>
            {/* Activity Log */}
            <ActivityLog patientId={user?.patientId} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div data-tour="recovery-score"><RecoveryScore score={score} /></div>
            <MilestoneTracker patientId={user?.patientId} />

            {/* Doctor's Notes & Recommendations */}
            {(() => {
              const doctorNotes = getDoctorNotes(user?.patientId);
              if (doctorNotes.length === 0) return null;
              return (
                <div data-tour="doctor-notes" className="bg-white rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-text mb-3 text-sm">Doctor&apos;s Recommendations</h3>
                  <div className="space-y-2.5">
                    {[...doctorNotes].reverse().slice(0, 4).map(note => (
                      <div key={note.id} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{note.type}</span>
                          <span className="text-[10px] text-text-light">{new Date(note.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-blue-900">{note.title}</h4>
                        <p className="text-[11px] text-blue-800/70 mt-0.5 leading-relaxed line-clamp-2">{note.content}</p>
                        <p className="text-[10px] text-blue-600 mt-1">— {note.doctorName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Medication Reminder */}
      <MedicationReminder medications={medications} />

      {/* Quick Check-in Modal */}
      <AnimatePresence>
        {showQuickCheckIn && (
          <QuickCheckIn
            patientId={user?.patientId}
            onClose={() => setShowQuickCheckIn(false)}
            onComplete={loadData}
          />
        )}
      </AnimatePresence>

      <VoiceAssistant recoveryScore={score?.score} />
      <TutorialTour steps={patientTourSteps} storageKey="omnicare_tour_patient" />
    </AppLayout>
  );
}
