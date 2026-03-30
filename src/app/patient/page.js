'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiClipboard, FiCalendar, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientById, getRecoveryPlanByPatient, getMedicationsByPatient,
  getSymptomLogsByPatient, getAlertsByPatient
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { daysSince } from '@/utils/dateHelpers';
import RecoveryScore from '@/components/patient/RecoveryScore';
import DailyChecklist from '@/components/patient/DailyChecklist';
import MedicationList from '@/components/patient/MedicationList';
import SymptomChart from '@/components/patient/SymptomChart';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.patientId) return;
    const patient = getPatientById(user.patientId);
    const plan = getRecoveryPlanByPatient(user.patientId);
    const medications = getMedicationsByPatient(user.patientId);
    const symptomLogs = getSymptomLogsByPatient(user.patientId);
    const alerts = getAlertsByPatient(user.patientId).filter(a => !a.acknowledged);

    const allTasks = plan?.phases.flatMap(p => p.tasks) || [];
    const score = computeRecoveryScore(patient, symptomLogs, medications, allTasks);

    setData({ patient, plan, medications, symptomLogs, alerts, score });
  }, [user]);

  if (!data) return <AppLayout title="Dashboard" requiredRole="patient"><div /></AppLayout>;

  const { patient, plan, medications, symptomLogs, alerts, score } = data;
  const latestLog = symptomLogs[symptomLogs.length - 1];
  const activePhase = plan?.phases.find(p => p.status === 'active');

  return (
    <AppLayout title={`Welcome back, ${patient?.name?.split(' ')[0]}`} requiredRole="patient">
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
                You have {alerts.length} unread alert{alerts.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600">{alerts[0].title}</p>
            </div>
            <Badge variant="warning">{alerts.length}</Badge>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiTrendingUp}
            label="Day of Recovery"
            value={daysSince(patient?.dischargeDate)}
            sublabel={`Since ${patient?.dischargeDate}`}
            color="text-primary"
            bgColor="bg-primary-light"
          />
          <StatCard
            icon={FiActivity}
            label="Pain Level"
            value={latestLog ? `${latestLog.painLevel}/10` : 'N/A'}
            sublabel="Latest reading"
            color="text-accent"
            bgColor="bg-red-50"
          />
          <StatCard
            icon={FiClipboard}
            label="Medications"
            value={medications.length}
            sublabel="Active prescriptions"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={FiCalendar}
            label="Current Phase"
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
            <SymptomChart logs={symptomLogs} />
            <DailyChecklist plan={plan} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <RecoveryScore score={score} />
            <MedicationList medications={medications} />

            {/* Patient Info */}
            <Card>
              <h3 className="font-semibold text-text mb-3">Patient Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Condition</span>
                  <span className="text-text font-medium">{patient?.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Age</span>
                  <span className="text-text">{patient?.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Blood Group</span>
                  <span className="text-text">{patient?.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Risk Level</span>
                  <Badge variant={patient?.riskLevel}>{patient?.riskLevel}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <VoiceAssistant />
    </AppLayout>
  );
}
