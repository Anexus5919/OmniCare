'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiX, FiPrinter, FiDownload, FiUser, FiAlertTriangle, FiActivity, FiClipboard, FiTrendingUp } from 'react-icons/fi';
import { getPatientById, getSymptomLogsByPatient, getMedicationsByPatient, getAlerts, getRecoveryPlanByPatient } from '@/services/storageService';
import { computeRecoveryScore, getScoreLabel } from '@/utils/recoveryScoring';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SummaryReport({ patientId, doctorName, onClose }) {
  const [reportType, setReportType] = useState('daily'); // daily | weekly

  const patient = getPatientById(patientId);
  const symptoms = getSymptomLogsByPatient(patientId);
  const medications = getMedicationsByPatient(patientId);
  const alerts = getAlerts().filter(a => a.patientId === patientId);
  const plan = getRecoveryPlanByPatient(patientId);

  if (!patient) return null;

  const today = new Date().toISOString().split('T')[0];
  const daysSinceDischarge = Math.floor((Date.now() - new Date(patient.dischargeDate).getTime()) / (1000 * 60 * 60 * 24));
  const allTasks = plan?.phases?.flatMap(p => p.tasks) || [];
  const scoreNum = computeRecoveryScore(patient, symptoms, medications, allTasks);
  const scoreLabel = getScoreLabel(scoreNum);

  // Get recent symptoms
  const recentSymptoms = symptoms.slice(-7);
  const latestSymptom = symptoms[symptoms.length - 1];

  // Medication adherence
  const totalDoses = medications.reduce((acc, med) => {
    const log = med.takenLog || {};
    Object.values(log).forEach(dayDoses => {
      acc.total += dayDoses.length;
      acc.taken += dayDoses.filter(Boolean).length;
    });
    return acc;
  }, { total: 0, taken: 0 });
  const adherenceRate = totalDoses.total > 0 ? Math.round((totalDoses.taken / totalDoses.total) * 100) : 100;

  // Active phase
  const activePhase = plan?.phases?.find(p => p.status === 'active');
  const completedTasks = activePhase?.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = activePhase?.tasks?.length || 0;

  // Recent alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
  const warningAlerts = alerts.filter(a => a.severity === 'warning' && !a.acknowledged);

  // Recommendations (auto-generated based on data)
  const recommendations = [];
  if (latestSymptom?.painLevel > 6) recommendations.push('Pain levels are elevated — consider adjusting analgesic dosage.');
  if (adherenceRate < 80) recommendations.push('Medication adherence below target — reinforce importance during next visit.');
  if (criticalAlerts.length > 0) recommendations.push(`${criticalAlerts.length} critical alert(s) pending review.`);
  if (latestSymptom?.temperature > 100) recommendations.push('Elevated temperature detected — monitor for signs of infection.');
  if (scoreNum < 50) recommendations.push('Recovery score below 50 — may need plan adjustment.');
  if (recommendations.length === 0) recommendations.push('Patient is recovering well. Continue current plan.');

  function handlePrint() {
    window.print();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl print:shadow-none print:rounded-none"
        >
          {/* Header — hidden on print */}
          <div className="flex items-center justify-between p-5 border-b border-border print:hidden">
            <div className="flex items-center gap-3">
              <FiFileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Patient Summary Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-muted rounded-lg p-0.5">
                {['daily', 'weekly'].map(t => (
                  <button
                    key={t}
                    onClick={() => setReportType(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      reportType === t ? 'bg-white text-text shadow-sm' : 'text-text-light'
                    }`}
                  >
                    {t === 'daily' ? 'Daily' : 'Weekly'}
                  </button>
                ))}
              </div>
              <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Print">
                <FiPrinter className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report body */}
          <div className="p-6 space-y-6 text-sm">
            {/* Report header */}
            <div className="text-center border-b border-border pb-4">
              <h1 className="text-xl font-bold text-text">OmniCare — {reportType === 'daily' ? 'Daily' : 'Weekly'} Patient Report</h1>
              <p className="text-text-light mt-1">Generated on {formatDate(today)} • Prepared for {doctorName}</p>
            </div>

            {/* Patient info */}
            <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {patient.avatar}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div><span className="text-text-light">Name:</span> <span className="font-medium">{patient.name}</span></div>
                <div><span className="text-text-light">Age:</span> <span className="font-medium">{patient.age} years, {patient.gender}</span></div>
                <div><span className="text-text-light">Condition:</span> <span className="font-medium">{patient.condition}</span></div>
                <div><span className="text-text-light">Risk Level:</span> <span className={`font-medium capitalize ${patient.riskLevel === 'high' ? 'text-danger' : patient.riskLevel === 'medium' ? 'text-warning' : 'text-success'}`}>{patient.riskLevel}</span></div>
                <div><span className="text-text-light">Discharged:</span> <span className="font-medium">{formatDate(patient.dischargeDate)}</span></div>
                <div><span className="text-text-light">Day of Recovery:</span> <span className="font-medium">Day {daysSinceDischarge}</span></div>
              </div>
            </div>

            {/* Key metrics */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-text mb-3">
                <FiTrendingUp className="w-4 h-4 text-primary" /> Key Metrics
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Recovery Score', value: `${scoreNum}/100`, sub: scoreLabel.label },
                  { label: 'Pain Level', value: latestSymptom ? `${latestSymptom.painLevel}/10` : 'N/A', sub: 'Latest' },
                  { label: 'Med Adherence', value: `${adherenceRate}%`, sub: `${totalDoses.taken}/${totalDoses.total} doses` },
                  { label: 'Task Completion', value: totalTasks > 0 ? `${Math.round((completedTasks/totalTasks)*100)}%` : 'N/A', sub: `${completedTasks}/${totalTasks} tasks` },
                ].map(m => (
                  <div key={m.label} className="p-3 bg-muted rounded-xl text-center">
                    <div className="text-lg font-bold text-text">{m.value}</div>
                    <div className="text-xs text-text-light">{m.label}</div>
                    <div className="text-[10px] text-text-light mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptom overview */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-text mb-3">
                <FiActivity className="w-4 h-4 text-primary" /> Symptom Overview
              </h3>
              {recentSymptoms.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-text-light border-b border-border">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Pain</th>
                        <th className="py-2 pr-3">Mobility</th>
                        <th className="py-2 pr-3">Mood</th>
                        <th className="py-2 pr-3">Temp (°F)</th>
                        <th className="py-2">Flagged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSymptoms.map(s => (
                        <tr key={s.id} className="border-b border-border/50">
                          <td className="py-2 pr-3">{formatDate(s.timestamp)}</td>
                          <td className={`py-2 pr-3 font-medium ${s.painLevel > 6 ? 'text-danger' : 'text-text'}`}>{s.painLevel}</td>
                          <td className="py-2 pr-3">{s.mobility}</td>
                          <td className="py-2 pr-3">{s.mood}</td>
                          <td className={`py-2 pr-3 ${s.temperature > 100 ? 'text-danger font-medium' : ''}`}>{s.temperature}</td>
                          <td className="py-2">{s.flagged ? '⚠️' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-light">No symptom data available for this period.</p>
              )}
            </div>

            {/* Alerts summary */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-text mb-3">
                <FiAlertTriangle className="w-4 h-4 text-warning" /> Alerts Summary
              </h3>
              <div className="flex gap-3 mb-2">
                <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                  {criticalAlerts.length} Critical
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                  {warningAlerts.length} Warning
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  {alerts.filter(a => a.acknowledged).length} Acknowledged
                </span>
              </div>
              {alerts.filter(a => !a.acknowledged).slice(0, 5).map((a, idx) => (
                <div key={`${a.id}_${idx}`} className={`p-2.5 rounded-lg border mb-1.5 ${a.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{a.title}</span>
                    <span className="text-[10px] text-text-light">{formatDate(a.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-text-light mt-0.5">{a.message}</p>
                </div>
              ))}
            </div>

            {/* Medications */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-text mb-3">
                <FiClipboard className="w-4 h-4 text-primary" /> Active Medications
              </h3>
              <div className="space-y-1.5">
                {medications.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{med.name}</span>
                      <span className="text-xs text-text-light ml-2">{med.dosage} • {med.frequency.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-text-light">{med.times.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-primary-light rounded-xl border border-primary/20">
              <h3 className="text-base font-semibold text-primary mb-2">AI Recommendations</h3>
              <ul className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-text-light pt-4 border-t border-border">
              <p>This report was generated by OmniCare Smart Recovery Platform</p>
              <p className="mt-0.5">Report ID: RPT-{Date.now().toString(36).toUpperCase()} • {new Date().toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
