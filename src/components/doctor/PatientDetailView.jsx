'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiClipboard, FiMessageSquare, FiCalendar,
  FiFileText, FiSend, FiArrowLeft, FiTrendingUp, FiCheckCircle
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ProgressRing from '@/components/common/ProgressRing';
import SymptomChart from '@/components/patient/SymptomChart';
import MilestoneTracker from '@/components/patient/MilestoneTracker';
import ActivityLog from '@/components/patient/ActivityLog';
import FollowUpTracker from '@/components/patient/FollowUpTracker';
import SummaryReport from '@/components/doctor/SummaryReport';
import {
  getSymptomLogsByPatient, getMedicationsByPatient, getRecoveryPlanByPatient,
  getAlertsByPatient, getDoctorNotes, addDoctorNote, addMedication
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { daysSince, formatDate, getRelativeTime } from '@/utils/dateHelpers';

const noteTypeConfig = {
  recommendation: { badge: 'bg-blue-100 text-blue-700', label: 'Recommendation' },
  medication:     { badge: 'bg-purple-100 text-purple-700', label: 'Medication' },
  comment:        { badge: 'bg-slate-100 text-slate-600', label: 'Comment' },
  alert_response: { badge: 'bg-amber-100 text-amber-700', label: 'Alert Response' },
};

export default function PatientDetailView({ patient, user, onBack }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReport, setShowReport] = useState(false);
  const [notes, setNotes] = useState(getDoctorNotes(patient.id));
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ type: 'recommendation', category: 'general', title: '', content: '' });
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: 'once_daily', times: ['08:00'], instructions: '' });
  const [patientMeds, setPatientMeds] = useState(null);

  const logs = getSymptomLogsByPatient(patient.id);
  const meds = getMedicationsByPatient(patient.id);
  const plan = getRecoveryPlanByPatient(patient.id);
  const allTasks = plan?.phases?.flatMap(p => p.tasks) || [];
  const score = computeRecoveryScore(patient, logs, meds, allTasks);
  const alerts = getAlertsByPatient(patient.id);
  const latestLog = logs[logs.length - 1];
  const activePhase = plan?.phases?.find(p => p.status === 'active');
  const isDoctor = user?.role === 'doctor';

  // Medication adherence
  const today = new Date().toISOString().split('T')[0];

  function handleAddNote() {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    const newNotes = addDoctorNote({
      patientId: patient.id,
      doctorId: user.id,
      doctorName: user.name,
      type: noteForm.type,
      category: noteForm.category,
      title: noteForm.title,
      content: noteForm.content,
    });
    setNotes(newNotes);
    setNoteForm({ type: 'recommendation', category: 'general', title: '', content: '' });
    setShowNoteForm(false);
  }

  function handleAddMed() {
    if (!medForm.name.trim() || !medForm.dosage.trim()) return;
    const newMeds = addMedication({
      patientId: patient.id,
      name: medForm.name,
      dosage: medForm.dosage,
      frequency: medForm.frequency,
      times: medForm.times,
      instructions: medForm.instructions,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setPatientMeds(newMeds);
    setMedForm({ name: '', dosage: '', frequency: 'once_daily', times: ['08:00'], instructions: '' });
    setShowMedForm(false);
  }

  // Use patientMeds if set (after adding), otherwise use meds from props
  const activeMeds = patientMeds || meds;

  const tabs = [
    { key: 'overview', label: t('overview'), icon: FiActivity },
    { key: 'medications', label: t('medications'), icon: FiClipboard },
    { key: 'notes', label: t('notesAndRecs'), icon: FiMessageSquare },
    { key: 'followups', label: t('followUps'), icon: FiCalendar },
    { key: 'milestones', label: t('milestones'), icon: FiTrendingUp },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <FiArrowLeft className="w-5 h-5 text-text" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-lg font-bold">
              {patient.avatar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">{patient.name}</h2>
              <p className="text-sm text-text-light">{patient.condition} • Day {daysSince(patient.dischargeDate)}</p>
            </div>
          </div>
          <Badge variant={patient.riskLevel}>{patient.riskLevel} risk</Badge>
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
        >
          <FiFileText className="w-4 h-4" /> {t('generateReport')}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('score'), value: score, color: 'text-primary' },
          { label: t('pain'), value: latestLog ? `${latestLog.painLevel}/10` : 'N/A', color: latestLog?.painLevel > 6 ? 'text-red-600' : 'text-text' },
          { label: t('recoveryProgress'), value: activePhase?.name || 'N/A', color: 'text-secondary' },
          { label: t('meds'), value: meds.length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-text-light">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap px-2 ${
              activeTab === tab.key ? 'bg-white text-text shadow-sm' : 'text-text-light hover:text-text'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SymptomChart logs={logs} />
                <ActivityLog patientId={patient.id} />
              </div>
              <div className="space-y-4">
                <Card>
                  <div className="flex justify-center mb-3">
                    <ProgressRing score={score} size={110} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-light">{t('age')}</span><span>{patient.age} yrs, {patient.gender}</span></div>
                    <div className="flex justify-between"><span className="text-text-light">{t('surgery')}</span><span className="text-right max-w-[60%]">{patient.surgeryType}</span></div>
                    <div className="flex justify-between"><span className="text-text-light">{t('discharge')}</span><span>{formatDate(patient.dischargeDate)}</span></div>
                    <div className="flex justify-between"><span className="text-text-light">{t('bloodGroup')}</span><span>{patient.bloodGroup}</span></div>
                    <div className="flex justify-between"><span className="text-text-light">{t('allergies')}</span><span>{patient.allergies?.join(', ') || 'None'}</span></div>
                  </div>
                </Card>
                {/* Recent alerts */}
                <Card>
                  <h4 className="text-sm font-semibold text-text mb-2">{t('recentAlerts')}</h4>
                  {alerts.filter(a => !a.acknowledged).length === 0 ? (
                    <p className="text-xs text-text-light py-2">{t('noActiveAlerts')}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {alerts.filter(a => !a.acknowledged).slice(0, 4).map((a, idx) => (
                        <div key={`${a.id}_${idx}`} className="p-2 rounded-lg bg-muted text-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge variant={a.severity}>{a.severity}</Badge>
                            <span className="text-text-light">{getRelativeTime(a.timestamp)}</span>
                          </div>
                          <p className="font-medium text-text">{a.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'medications' && (
          <motion.div key="medications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text">{t('medicationSchedule')}</h3>
                {isDoctor && (
                  <button onClick={() => setShowMedForm(!showMedForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all">
                    + Add Med
                  </button>
                )}
              </div>

              {/* Add medication form (doctor only) */}
              <AnimatePresence>
                {showMedForm && isDoctor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-4 bg-primary-50 rounded-xl border border-primary/20"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">Name</label>
                        <input type="text" value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Medication name" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">Dosage</label>
                        <input type="text" value={medForm.dosage} onChange={e => setMedForm(f => ({ ...f, dosage: e.target.value }))}
                          placeholder="e.g. 500mg" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">Frequency</label>
                        <select value={medForm.frequency} onChange={e => {
                          const freq = e.target.value;
                          const times = freq === 'once_daily' ? ['08:00'] : freq === 'twice_daily' ? ['08:00', '20:00'] : ['08:00', '14:00', '20:00'];
                          setMedForm(f => ({ ...f, frequency: freq, times }));
                        }} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="once_daily">Once Daily</option>
                          <option value="twice_daily">Twice Daily</option>
                          <option value="three_daily">Three Times Daily</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">Time(s)</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {medForm.times.map((time, idx) => (
                            <input key={idx} type="time" value={time} onChange={e => {
                              const newTimes = [...medForm.times];
                              newTimes[idx] = e.target.value;
                              setMedForm(f => ({ ...f, times: newTimes }));
                            }} className="px-2 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea value={medForm.instructions} onChange={e => setMedForm(f => ({ ...f, instructions: e.target.value }))}
                      placeholder="Special instructions (optional)" rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowMedForm(false)} className="px-4 py-2 text-xs font-medium text-text-light bg-muted rounded-lg">{t('cancel')}</button>
                      <button onClick={handleAddMed} className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:shadow-lg">{t('submit')}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {activeMeds.map(med => {
                  const todayLog = med.takenLog?.[today] || [];
                  const takenCount = todayLog.filter(Boolean).length;
                  // Overall adherence
                  let totalDoses = 0, takenDoses = 0;
                  Object.values(med.takenLog || {}).forEach(dayLog => {
                    totalDoses += dayLog.length;
                    takenDoses += dayLog.filter(Boolean).length;
                  });
                  const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

                  return (
                    <div key={med.id} className="p-4 rounded-xl border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-text">{med.name}</h4>
                          <p className="text-xs text-text-light">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                          {med.instructions && <p className="text-xs text-text-light mt-0.5">{med.instructions}</p>}
                        </div>
                        <div className="text-right">
                          <Badge variant={adherence >= 80 ? 'success' : adherence >= 50 ? 'warning' : 'danger'}>
                            {adherence}% {t('adherence')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-light">{t('today')}:</span>
                        {med.times.map((time, idx) => {
                          const taken = todayLog[idx];
                          return (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-lg font-medium ${taken ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                              {time} {taken ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text">{t('notesAndRecs')}</h3>
                {isDoctor && (
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                  >
                    <FiSend className="w-3.5 h-3.5" /> {t('addNote')}
                  </button>
                )}
              </div>

              {/* Add note form (doctor only) */}
              <AnimatePresence>
                {showNoteForm && isDoctor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-4 bg-primary-50 rounded-xl border border-primary/20"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">{t('type')}</label>
                        <select value={noteForm.type} onChange={e => setNoteForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="recommendation">{t('recommendation')}</option>
                          <option value="medication">{t('medicationChange')}</option>
                          <option value="comment">{t('generalComment')}</option>
                          <option value="alert_response">{t('alertResponse')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-light block mb-1">{t('category')}</label>
                        <select value={noteForm.category} onChange={e => setNoteForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="general">{t('general')}</option>
                          <option value="exercise">{t('exercise')}</option>
                          <option value="medication">{t('medication')}</option>
                          <option value="diet">Diet</option>
                          <option value="activity">{t('activity')}</option>
                          <option value="symptom">{t('symptomOverview')}</option>
                        </select>
                      </div>
                    </div>
                    <input type="text" value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={t('noteTitle')} className="w-full px-3 py-2 rounded-lg border border-border text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <textarea value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                      placeholder={t('writeRecommendation')} rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowNoteForm(false)} className="px-4 py-2 text-xs font-medium text-text-light bg-muted rounded-lg">{t('cancel')}</button>
                      <button onClick={handleAddNote} className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:shadow-lg">{t('submit')}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {notes.length === 0 ? (
                <p className="text-sm text-text-light text-center py-6">{t('noNotesYet')}</p>
              ) : (
                <div className="space-y-3">
                  {[...notes].reverse().map(note => {
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

        {activeTab === 'followups' && (
          <motion.div key="followups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FollowUpTracker patientId={patient.id} />
          </motion.div>
        )}

        {activeTab === 'milestones' && (
          <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MilestoneTracker patientId={patient.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <SummaryReport patientId={patient.id} doctorName={user?.name} onClose={() => setShowReport(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
