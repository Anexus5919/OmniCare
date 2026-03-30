import { mockPatients } from '@/data/mockPatients';
import { mockUsers } from '@/data/mockUsers';
import { mockRecoveryPlans } from '@/data/mockRecoveryPlans';
import { mockMedications } from '@/data/mockMedications';
import { mockSymptomLogs } from '@/data/mockSymptomLogs';
import { mockAlerts } from '@/data/mockAlerts';
import { mockDoctorNotes } from '@/data/mockDoctorNotes';

const PREFIX = 'recoverai_';

function getKey(key) {
  return `${PREFIX}${key}`;
}

function get(key) {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(getKey(key));
  return data ? JSON.parse(data) : null;
}

function set(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getKey(key), JSON.stringify(value));
}

const SEED_VERSION = 2; // Bump this when mock data changes

export function seedData() {
  const currentVersion = get('seedVersion');
  if (currentVersion === SEED_VERSION) return;
  set('users', mockUsers);
  set('patients', mockPatients);
  set('recoveryPlans', mockRecoveryPlans);
  set('medications', mockMedications);
  set('symptomLogs', mockSymptomLogs);
  set('alerts', mockAlerts);
  set('doctorNotes', mockDoctorNotes);
  set('seeded', true);
  set('seedVersion', SEED_VERSION);
}

export function resetData() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
  seedData();
}

// Users
export function getUsers() { return get('users') || []; }
export function getUsersByRole(role) { return getUsers().filter(u => u.role === role); }
export function getUserById(id) { return getUsers().find(u => u.id === id); }

// Patients
export function getPatients() { return get('patients') || []; }
export function getPatientById(id) { return getPatients().find(p => p.id === id); }
export function getPatientsByIds(ids) { return getPatients().filter(p => ids.includes(p.id)); }

// Recovery Plans
export function getRecoveryPlans() { return get('recoveryPlans') || []; }
export function getRecoveryPlanByPatient(patientId) {
  return getRecoveryPlans().find(rp => rp.patientId === patientId);
}
export function updateRecoveryPlan(plan) {
  const plans = getRecoveryPlans();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  set('recoveryPlans', plans);
}

// Medications
export function getMedications() { return get('medications') || []; }
export function getMedicationsByPatient(patientId) {
  return getMedications().filter(m => m.patientId === patientId);
}
export function updateMedication(med) {
  const meds = getMedications();
  const idx = meds.findIndex(m => m.id === med.id);
  if (idx >= 0) meds[idx] = med;
  set('medications', meds);
}

// Symptom Logs
export function getSymptomLogs() { return get('symptomLogs') || []; }
export function getSymptomLogsByPatient(patientId) {
  return getSymptomLogs().filter(l => l.patientId === patientId);
}
export function addSymptomLog(log) {
  const logs = getSymptomLogs();
  logs.push({ ...log, id: `sym_${Date.now()}` });
  set('symptomLogs', logs);
  return logs;
}

// Alerts
export function getAlerts() { return get('alerts') || []; }
export function getAlertsByPatient(patientId) {
  return getAlerts().filter(a => a.patientId === patientId);
}
export function getUnacknowledgedAlerts() {
  return getAlerts().filter(a => !a.acknowledged);
}
export function addAlert(alert) {
  const alerts = getAlerts();
  alerts.push({ ...alert, id: `alert_${Date.now()}` });
  set('alerts', alerts);
}
export function acknowledgeAlert(alertId, userId) {
  const alerts = getAlerts();
  const idx = alerts.findIndex(a => a.id === alertId);
  if (idx >= 0) {
    alerts[idx].acknowledged = true;
    alerts[idx].acknowledgedBy = userId;
  }
  set('alerts', alerts);
}

// Task toggle — now marks as "pending_approval" instead of completed directly
export function toggleTask(planId, phaseId, taskId) {
  const plans = getRecoveryPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return;
  const phase = plan.phases.find(ph => ph.id === phaseId);
  if (!phase) return;
  const task = phase.tasks.find(t => t.id === taskId);
  if (!task) return;
  // If already completed, uncomplete. If not, mark pending_approval
  if (task.completed) {
    task.completed = false;
    task.pendingApproval = false;
  } else {
    task.pendingApproval = true;
    task.completed = false;
  }
  set('recoveryPlans', plans);
  return task;
}

// Caregiver approves task
export function approveTask(planId, phaseId, taskId, approverId) {
  const plans = getRecoveryPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return;
  const phase = plan.phases.find(ph => ph.id === phaseId);
  if (!phase) return;
  const task = phase.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = true;
  task.pendingApproval = false;
  task.approvedBy = approverId;
  task.approvedAt = new Date().toISOString();
  set('recoveryPlans', plans);
  return task;
}

// Caregiver rejects task
export function rejectTask(planId, phaseId, taskId) {
  const plans = getRecoveryPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return;
  const phase = plan.phases.find(ph => ph.id === phaseId);
  if (!phase) return;
  const task = phase.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = false;
  task.pendingApproval = false;
  set('recoveryPlans', plans);
  return task;
}

// Get pending tasks for caregiver validation
export function getPendingTasks(patientIds) {
  const plans = getRecoveryPlans();
  const pending = [];
  plans.forEach(plan => {
    if (!patientIds.includes(plan.patientId)) return;
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (task.pendingApproval) {
          const patient = getPatientById(plan.patientId);
          pending.push({ planId: plan.id, phaseId: phase.id, phaseName: phase.name, task, patientName: patient?.name, patientId: plan.patientId, patientAvatar: patient?.avatar });
        }
      });
    });
  });
  return pending;
}

// Add medication (doctor)
export function addMedication(med) {
  const meds = getMedications();
  meds.push({ ...med, id: `med_${Date.now()}`, takenLog: {} });
  set('medications', meds);
  return meds.filter(m => m.patientId === med.patientId);
}

// Get all doctor notes
export function getAllDoctorNotes() {
  return get('doctorNotes') || [];
}

// Doctor Notes & Recommendations
export function getDoctorNotes(patientId) {
  const all = get('doctorNotes') || [];
  return all.filter(n => n.patientId === patientId);
}
export function addDoctorNote(note) {
  const all = get('doctorNotes') || [];
  all.push({ ...note, id: `note_${Date.now()}`, timestamp: new Date().toISOString() });
  set('doctorNotes', all);
  return all.filter(n => n.patientId === note.patientId);
}

// Patient Photos
export function getPatientPhotos(patientId) {
  return (get('patientPhotos') || []).filter(p => p.patientId === patientId);
}
export function addPatientPhoto(photo) {
  const all = get('patientPhotos') || [];
  all.push({ ...photo, id: `photo_${Date.now()}` });
  set('patientPhotos', all);
  return all.filter(p => p.patientId === photo.patientId);
}

// Delete medication (doctor)
export function deleteMedication(medId) {
  const meds = getMedications();
  const filtered = meds.filter(m => m.id !== medId);
  set('medications', filtered);
  return filtered;
}

// Medication taken toggle
export function toggleMedicationTaken(medId, date, timeIndex) {
  const meds = getMedications();
  const med = meds.find(m => m.id === medId);
  if (!med) return;
  if (!med.takenLog) med.takenLog = {};
  if (!med.takenLog[date]) {
    med.takenLog[date] = med.times.map(() => false);
  }
  med.takenLog[date][timeIndex] = !med.takenLog[date][timeIndex];
  set('medications', meds);
  return med.takenLog[date][timeIndex];
}
