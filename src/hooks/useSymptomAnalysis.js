'use client';

import { useCallback } from 'react';
import { addAlert } from '@/services/storageService';

export function useSymptomAnalysis() {
  const analyzeSymptoms = useCallback((patientId, logs) => {
    if (!logs || logs.length < 2) return [];
    const alerts = [];
    const latest = logs[logs.length - 1];
    const previous = logs[logs.length - 2];

    // Pain spike: increase of 3+
    if (latest.painLevel - previous.painLevel >= 3) {
      const alert = {
        patientId,
        type: 'symptom_spike',
        severity: 'critical',
        title: 'Sudden Pain Increase',
        message: `Pain level jumped from ${previous.painLevel} to ${latest.painLevel}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        acknowledgedBy: null,
      };
      addAlert(alert);
      alerts.push(alert);
    }

    // High temperature
    if (latest.temperature >= 100.4) {
      const alert = {
        patientId,
        type: 'symptom_spike',
        severity: latest.temperature >= 102 ? 'critical' : 'warning',
        title: 'Elevated Temperature',
        message: `Temperature recorded at ${latest.temperature}°F`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        acknowledgedBy: null,
      };
      addAlert(alert);
      alerts.push(alert);
    }

    // Trending worse: 3 consecutive pain increases
    if (logs.length >= 3) {
      const last3 = logs.slice(-3);
      if (last3[2].painLevel > last3[1].painLevel && last3[1].painLevel > last3[0].painLevel) {
        const alert = {
          patientId,
          type: 'symptom_spike',
          severity: 'warning',
          title: 'Pain Trending Upward',
          message: 'Pain level has increased for 3 consecutive days',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          acknowledgedBy: null,
        };
        addAlert(alert);
        alerts.push(alert);
      }
    }

    // Low mobility + high pain
    if (latest.mobility <= 3 && latest.painLevel >= 7) {
      const alert = {
        patientId,
        type: 'symptom_spike',
        severity: 'warning',
        title: 'Low Mobility with High Pain',
        message: `Mobility at ${latest.mobility}/10 with pain at ${latest.painLevel}/10`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        acknowledgedBy: null,
      };
      addAlert(alert);
      alerts.push(alert);
    }

    return alerts;
  }, []);

  return { analyzeSymptoms };
}
