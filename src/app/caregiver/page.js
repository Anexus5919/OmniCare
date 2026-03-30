'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiAlertTriangle, FiActivity, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import StatCard from '@/components/common/StatCard';
import ProgressRing from '@/components/common/ProgressRing';
import SymptomChart from '@/components/patient/SymptomChart';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientsByIds, getAlertsByPatient, getSymptomLogsByPatient,
  getMedicationsByPatient, getRecoveryPlanByPatient, acknowledgeAlert
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { getRelativeTime, daysSince } from '@/utils/dateHelpers';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!user?.assignedPatients) return;
    const pats = getPatientsByIds(user.assignedPatients);
    setPatients(pats);
    if (pats.length > 0) setSelectedPatient(pats[0].id);

    const alerts = pats.flatMap(p => getAlertsByPatient(p.id)).filter(a => !a.acknowledged);
    setAllAlerts(alerts);
  }, [user]);

  function getPatientData(patientId) {
    const patient = patients.find(p => p.id === patientId);
    const logs = getSymptomLogsByPatient(patientId);
    const meds = getMedicationsByPatient(patientId);
    const plan = getRecoveryPlanByPatient(patientId);
    const allTasks = plan?.phases.flatMap(p => p.tasks) || [];
    const score = computeRecoveryScore(patient, logs, meds, allTasks);
    const alerts = getAlertsByPatient(patientId).filter(a => !a.acknowledged);
    return { patient, logs, meds, plan, score, alerts };
  }

  function handleAcknowledge(alertId) {
    acknowledgeAlert(alertId, user.id);
    setAllAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');

  return (
    <AppLayout title="Caregiver Dashboard" requiredRole="caregiver">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Assigned Patients" value={patients.length} color="text-primary" bgColor="bg-primary-light" />
          <StatCard icon={FiAlertTriangle} label="Active Alerts" value={allAlerts.length} color="text-danger" bgColor="bg-red-50" />
          <StatCard icon={FiActivity} label="Critical" value={criticalAlerts.length} color="text-red-600" bgColor="bg-red-50" />
          <StatCard icon={FiHeart} label="Your Role" value="Caregiver" color="text-secondary" bgColor="bg-secondary-light" />
        </div>

        {/* Alert banner */}
        {criticalAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <FiAlertTriangle /> Critical Alerts
            </h3>
            <div className="space-y-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-800">{alert.title}</p>
                    <p className="text-xs text-red-600">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Patient cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(pat => {
            const data = getPatientData(pat.id);
            const latestLog = data.logs[data.logs.length - 1];

            return (
              <motion.div
                key={pat.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedPatient(pat.id)}
                className={`cursor-pointer`}
              >
                <Card className={`${selectedPatient === pat.id ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-sm font-semibold">
                        {pat.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text text-sm">{pat.name}</h3>
                        <p className="text-xs text-text-light">{pat.condition}</p>
                      </div>
                    </div>
                    <Badge variant={pat.riskLevel}>{pat.riskLevel}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{data.score}</p>
                      <p className="text-xs text-text-light">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-text">{daysSince(pat.dischargeDate)}</p>
                      <p className="text-xs text-text-light">Day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent">{latestLog?.painLevel || 'N/A'}</p>
                      <p className="text-xs text-text-light">Pain</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-600">{data.alerts.length}</p>
                      <p className="text-xs text-text-light">Alerts</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected patient detail */}
        {selectedPatient && (() => {
          const data = getPatientData(selectedPatient);
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SymptomChart logs={data.logs} />
              </div>
              <div>
                <Card>
                  <h3 className="font-semibold text-text mb-4">Recovery Progress</h3>
                  <div className="flex justify-center mb-4">
                    <ProgressRing score={data.score} size={120} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-light">Recent Alerts</h4>
                    {data.alerts.length === 0 ? (
                      <p className="text-sm text-text-light">No active alerts</p>
                    ) : (
                      data.alerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted">
                          <Badge variant={alert.severity} className="shrink-0 mt-0.5">{alert.severity}</Badge>
                          <div>
                            <p className="text-xs font-medium text-text">{alert.title}</p>
                            <p className="text-xs text-text-light">{getRelativeTime(alert.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          );
        })()}
      </div>
    </AppLayout>
  );
}
