/**
 * Smart Escalation Service
 *
 * Rules:
 * 1. If a critical alert is not acknowledged within 30 min → escalate to caregiver
 * 2. If caregiver doesn't acknowledge within 1 hour → escalate to doctor
 * 3. If patient misses 2+ consecutive check-ins → auto-alert caregiver
 * 4. If pain spikes and patient hasn't responded → escalate immediately
 *
 * For demo purposes, escalation timers are simulated with seeded data.
 */

import { getAlerts, getUsers } from './storageService';

export function getEscalationChain(patientId) {
  const users = getUsers();
  const caregiver = users.find(u => u.role === 'caregiver' && u.assignedPatients?.includes(patientId));
  const doctor = users.find(u => u.role === 'doctor' && u.assignedPatients?.includes(patientId));

  return [
    { level: 1, role: 'patient', label: 'Patient Self-Action', timeLimit: '15 min' },
    { level: 2, role: 'caregiver', label: caregiver?.name || 'Caregiver', timeLimit: '30 min' },
    { level: 3, role: 'doctor', label: doctor?.name || 'Doctor', timeLimit: 'Immediate' },
  ];
}

export function evaluateEscalation(alerts, patientId) {
  const patientAlerts = alerts.filter(a => a.patientId === patientId && !a.acknowledged);
  const escalated = [];

  for (const alert of patientAlerts) {
    const ageMs = Date.now() - new Date(alert.timestamp).getTime();
    const ageMinutes = ageMs / (1000 * 60);

    let escalationLevel = 1; // patient
    let escalationStatus = 'pending';

    if (alert.severity === 'critical') {
      if (ageMinutes > 60) {
        escalationLevel = 3; // doctor
        escalationStatus = 'escalated_to_doctor';
      } else if (ageMinutes > 30) {
        escalationLevel = 2; // caregiver
        escalationStatus = 'escalated_to_caregiver';
      }
    } else if (alert.severity === 'warning') {
      if (ageMinutes > 120) {
        escalationLevel = 2; // caregiver
        escalationStatus = 'escalated_to_caregiver';
      }
    }

    escalated.push({
      ...alert,
      escalationLevel,
      escalationStatus,
      ageMinutes: Math.round(ageMinutes),
    });
  }

  return escalated;
}

export function getEscalationSummary(patientId) {
  const alerts = getAlerts();
  const escalated = evaluateEscalation(alerts, patientId);

  const critical = escalated.filter(a => a.severity === 'critical');
  const escalatedToCaregiver = escalated.filter(a => a.escalationStatus === 'escalated_to_caregiver');
  const escalatedToDoctor = escalated.filter(a => a.escalationStatus === 'escalated_to_doctor');

  return {
    totalUnacknowledged: escalated.length,
    critical: critical.length,
    escalatedToCaregiver: escalatedToCaregiver.length,
    escalatedToDoctor: escalatedToDoctor.length,
    alerts: escalated,
  };
}
