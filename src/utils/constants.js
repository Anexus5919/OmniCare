export const ROLES = {
  PATIENT: 'patient',
  CAREGIVER: 'caregiver',
  DOCTOR: 'doctor',
};

export const SYMPTOM_TYPES = {
  PAIN: { key: 'painLevel', label: 'Pain Level', max: 10, unit: '/10', icon: '🔴' },
  TEMPERATURE: { key: 'temperature', label: 'Temperature', max: 105, unit: '°F', icon: '🌡️' },
  SWELLING: { key: 'swelling', label: 'Swelling', max: 10, unit: '/10', icon: '💧' },
  MOBILITY: { key: 'mobility', label: 'Mobility', max: 10, unit: '/10', icon: '🚶' },
  MOOD: { key: 'mood', label: 'Mood', max: 10, unit: '/10', icon: '😊' },
  FATIGUE: { key: 'fatigue', label: 'Fatigue', max: 10, unit: '/10', icon: '😴' },
  APPETITE: { key: 'appetite', label: 'Appetite', max: 10, unit: '/10', icon: '🍽️' },
  BREATHING: { key: 'breathing', label: 'Breathing Ease', max: 10, unit: '/10', icon: '💨' },
};

export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

export const ALERT_TYPES = {
  SYMPTOM_SPIKE: 'symptom_spike',
  MISSED_MEDICATION: 'missed_medication',
  MISSED_CHECKIN: 'missed_checkin',
  RECOVERY_MILESTONE: 'recovery_milestone',
  FOLLOW_UP_REMINDER: 'follow_up_reminder',
};

export const MEDICATION_FREQUENCIES = {
  ONCE_DAILY: { key: 'once_daily', label: 'Once Daily' },
  TWICE_DAILY: { key: 'twice_daily', label: 'Twice Daily' },
  THREE_DAILY: { key: 'three_daily', label: 'Three Times Daily' },
  EVERY_8_HOURS: { key: 'every_8_hours', label: 'Every 8 Hours' },
  AS_NEEDED: { key: 'as_needed', label: 'As Needed' },
};

export const TASK_CATEGORIES = {
  MEDICATION: 'medication',
  EXERCISE: 'exercise',
  WOUND_CARE: 'wound_care',
  DIET: 'diet',
  REST: 'rest',
  FOLLOW_UP: 'follow_up',
};

export const SEVERITY_COLORS = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};
