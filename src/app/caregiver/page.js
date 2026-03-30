'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiAlertTriangle, FiActivity, FiUsers, FiCheckCircle,
  FiFileText, FiClipboard, FiCalendar, FiMessageSquare, FiDownload,
  FiClock, FiCheck, FiX
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import StatCard from '@/components/common/StatCard';
import ProgressRing from '@/components/common/ProgressRing';
import SymptomChart from '@/components/patient/SymptomChart';
import SummaryReport from '@/components/doctor/SummaryReport';
import MilestoneTracker from '@/components/patient/MilestoneTracker';
import FollowUpTracker from '@/components/patient/FollowUpTracker';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  getPatientsByIds, getAlertsByPatient, getSymptomLogsByPatient,
  getMedicationsByPatient, getRecoveryPlanByPatient, acknowledgeAlert,
  getDoctorNotes, getPendingTasks, approveTask, rejectTask
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { getRelativeTime, daysSince, formatDate } from '@/utils/dateHelpers';
import { getEscalationSummary } from '@/services/escalationService';

const noteTypeConfig = {
  recommendation: { badge: 'bg-blue-100 text-blue-700', label: 'Recommendation' },
  medication:     { badge: 'bg-purple-100 text-purple-700', label: 'Medication' },
  comment:        { badge: 'bg-slate-100 text-slate-600', label: 'Comment' },
  alert_response: { badge: 'bg-amber-100 text-amber-700', label: 'Alert Response' },
};

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showReport, setShowReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | medications | notes | followups
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    if (!user?.assignedPatients) return;
    const pats = getPatientsByIds(user.assignedPatients);
    setPatients(pats);
    if (pats.length > 0) setSelectedPatient(pats[0].id);

    const alerts = pats.flatMap(p => getAlertsByPatient(p.id)).filter(a => !a.acknowledged);
    setAllAlerts(alerts);

    const pending = getPendingTasks(user.assignedPatients);
    setPendingTasks(pending);
  }, [user]);

  function getPatientData(patientId) {
    const patient = patients.find(p => p.id === patientId);
    const logs = getSymptomLogsByPatient(patientId);
    const meds = getMedicationsByPatient(patientId);
    const plan = getRecoveryPlanByPatient(patientId);
    const allTasks = plan?.phases.flatMap(p => p.tasks) || [];
    const score = computeRecoveryScore(patient, logs, meds, allTasks);
    const alerts = getAlertsByPatient(patientId).filter(a => !a.acknowledged);
    const notes = getDoctorNotes(patientId);
    const escalation = getEscalationSummary(patientId);
    return { patient, logs, meds, plan, score, alerts, notes, escalation };
  }

  function handleAcknowledge(alertId) {
    acknowledgeAlert(alertId, user.id);
    setAllAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');

  return (
    <AppLayout title={t('dashboard')} requiredRole="caregiver">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label={t('myPatients')} value={patients.length} color="text-primary" bgColor="bg-primary-light" />
          <StatCard icon={FiAlertTriangle} label={t('unacknowledged')} value={allAlerts.length} color="text-danger" bgColor="bg-red-50" />
          <StatCard icon={FiActivity} label={t('critical')} value={criticalAlerts.length} color="text-red-600" bgColor="bg-red-50" />
          <StatCard icon={FiHeart} label={t('portal')} value={t('caregiver')} color="text-secondary" bgColor="bg-secondary-light" />
        </div>

        {/* Pending Task Approvals */}
        {pendingTasks.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <FiClock className="w-4 h-4" /> {t('pending')} Task Approvals ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map(pt => (
                <div key={pt.task.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xs font-bold">{pt.patientAvatar}</div>
                    <div>
                      <p className="text-sm font-medium text-text">{pt.task.title}</p>
                      <p className="text-xs text-text-light">{pt.patientName} • {pt.phaseName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        approveTask(pt.planId, pt.phaseId, pt.task.id, user.id);
                        setPendingTasks(prev => prev.filter(p => p.task.id !== pt.task.id));
                      }}
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      title="Approve"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        rejectTask(pt.planId, pt.phaseId, pt.task.id);
                        setPendingTasks(prev => prev.filter(p => p.task.id !== pt.task.id));
                      }}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      title="Reject"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Critical alert banner */}
        {criticalAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <FiAlertTriangle /> {t('criticalAlerts')}
            </h3>
            <div className="space-y-2">
              {criticalAlerts.map((alert, idx) => (
                <div key={`${alert.id}_${idx}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-800">{alert.title}</p>
                    <p className="text-xs text-red-600">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    {t('acknowledged')}
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
                onClick={() => { setSelectedPatient(pat.id); setActiveTab('overview'); }}
                className="cursor-pointer"
              >
                <Card className={`${selectedPatient === pat.id ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-sm font-semibold">
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
                      <p className="text-xs text-text-light">{t('score')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-text">{daysSince(pat.dischargeDate)}</p>
                      <p className="text-xs text-text-light">{t('day')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent">{latestLog?.painLevel || 'N/A'}</p>
                      <p className="text-xs text-text-light">{t('pain')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-600">{data.alerts.length}</p>
                      <p className="text-xs text-text-light">{t('alerts')}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected patient detail — rich view */}
        {selectedPatient && (() => {
          const data = getPatientData(selectedPatient);
          return (
            <>
              {/* Tabs */}
              <div className="flex gap-1 bg-muted rounded-xl p-1">
                {[
                  { key: 'overview', label: t('overview'), icon: FiActivity },
                  { key: 'medications', label: t('medications'), icon: FiClipboard },
                  { key: 'notes', label: t('doctorNotes'), icon: FiMessageSquare },
                  { key: 'followups', label: t('followUps'), icon: FiCalendar },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.key ? 'bg-white text-text shadow-sm' : 'text-text-light hover:text-text'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {/* Overview tab */}
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <SymptomChart logs={data.logs} />
                        <MilestoneTracker patientId={selectedPatient} />
                      </div>
                      <div className="space-y-4">
                        <Card>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-text">{t('recoveryProgress')}</h3>
                            <button
                              onClick={() => setShowReport(selectedPatient)}
                              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <FiFileText className="w-3.5 h-3.5" /> {t('generateReport')}
                            </button>
                          </div>
                          <div className="flex justify-center mb-4">
                            <ProgressRing score={data.score} size={120} />
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-text-light">{t('condition')}</span><span className="font-medium text-text">{data.patient?.condition}</span></div>
                            <div className="flex justify-between"><span className="text-text-light">{t('age')}</span><span>{data.patient?.age} years</span></div>
                            <div className="flex justify-between"><span className="text-text-light">{t('discharge')}</span><span>{formatDate(data.patient?.dischargeDate)}</span></div>
                            <div className="flex justify-between"><span className="text-text-light">{t('bloodGroup')}</span><span>{data.patient?.bloodGroup}</span></div>
                            <div className="flex justify-between"><span className="text-text-light">{t('riskLevel')}</span><Badge variant={data.patient?.riskLevel}>{data.patient?.riskLevel}</Badge></div>
                          </div>
                        </Card>

                        {/* Recent alerts */}
                        <Card>
                          <h4 className="text-sm font-semibold text-text mb-3">{t('recentAlerts')}</h4>
                          {data.alerts.length === 0 ? (
                            <p className="text-sm text-text-light">{t('noActiveAlerts')}</p>
                          ) : (
                            <div className="space-y-2">
                              {data.alerts.slice(0, 5).map((alert, idx) => (
                                <div key={`${alert.id}_${idx}`} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted">
                                  <Badge variant={alert.severity} className="shrink-0 mt-0.5">{alert.severity}</Badge>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-text">{alert.title}</p>
                                    <p className="text-[10px] text-text-light">{getRelativeTime(alert.timestamp)}</p>
                                  </div>
                                  <button onClick={() => handleAcknowledge(alert.id)} className="shrink-0 p-1 rounded hover:bg-white"><FiCheckCircle className="w-3.5 h-3.5 text-secondary" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Medications tab */}
                {activeTab === 'medications' && (
                  <motion.div key="medications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <h3 className="font-semibold text-text mb-4 flex items-center gap-2"><FiClipboard className="w-5 h-5 text-primary" /> {data.patient?.name} — {t('medicationSchedule')}</h3>
                      <div className="space-y-3">
                        {data.meds.map(med => {
                          const today = new Date().toISOString().split('T')[0];
                          const todayLog = med.takenLog?.[today] || [];
                          const takenCount = todayLog.filter(Boolean).length;
                          return (
                            <div key={med.id} className="p-4 rounded-xl border border-border bg-muted/50">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-text">{med.name}</h4>
                                  <p className="text-xs text-text-light">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                                </div>
                                <Badge variant={takenCount === med.times.length ? 'success' : takenCount > 0 ? 'warning' : 'danger'}>
                                  {takenCount}/{med.times.length} {t('today')}
                                </Badge>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {med.times.map((time, idx) => {
                                  const taken = todayLog[idx];
                                  return (
                                    <span key={idx} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${taken ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                      {time} {taken ? '✓' : '✗'}
                                    </span>
                                  );
                                })}
                              </div>
                              {med.instructions && <p className="text-xs text-text-light mt-2">{med.instructions}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Doctor Notes tab */}
                {activeTab === 'notes' && (
                  <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                        <FiMessageSquare className="w-5 h-5 text-primary" /> {t('doctorNotes')} — {data.patient?.name}
                      </h3>
                      {data.notes.length === 0 ? (
                        <p className="text-sm text-text-light text-center py-8">{t('noDoctorNotes')}</p>
                      ) : (
                        <div className="space-y-3">
                          {[...data.notes].reverse().map(note => {
                            const cfg = noteTypeConfig[note.type] || noteTypeConfig.comment;
                            return (
                              <div key={note.id} className="p-4 rounded-xl border border-border bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-medium">{note.category}</span>
                                  </div>
                                  <span className="text-[10px] text-text-light">{getRelativeTime(note.timestamp)}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-text mb-1">{note.title}</h4>
                                <p className="text-xs text-text-light leading-relaxed">{note.content}</p>
                                <p className="text-[10px] mt-2 text-text-light">— {note.doctorName}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Follow-ups tab */}
                {activeTab === 'followups' && (
                  <motion.div key="followups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FollowUpTracker patientId={selectedPatient} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </div>

      {/* Summary Report Modal */}
      <AnimatePresence>
        {showReport && (
          <SummaryReport patientId={showReport} doctorName={user?.name || 'Caregiver'} onClose={() => setShowReport(null)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
