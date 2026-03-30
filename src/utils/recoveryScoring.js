export function computeRecoveryScore(patient, symptomLogs, medications, tasks) {
  let score = 0;

  // Task completion (40%)
  if (tasks && tasks.length > 0) {
    const completed = tasks.filter(t => t.completed).length;
    score += (completed / tasks.length) * 40;
  } else {
    score += 20;
  }

  // Symptom trajectory (30%) - lower pain + improving trend = better
  if (symptomLogs && symptomLogs.length >= 2) {
    const recent = symptomLogs.slice(-7);
    const avgPain = recent.reduce((s, l) => s + (l.painLevel || 0), 0) / recent.length;
    const painScore = Math.max(0, (10 - avgPain) / 10) * 20;

    // Trend: compare first half to second half
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);
    const avgFirst = firstHalf.reduce((s, l) => s + (l.painLevel || 0), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, l) => s + (l.painLevel || 0), 0) / secondHalf.length;
    const trendScore = avgSecond <= avgFirst ? 10 : 5;

    score += painScore + trendScore;
  } else {
    score += 15;
  }

  // Medication adherence (20%)
  if (medications && medications.length > 0) {
    let totalDoses = 0;
    let takenDoses = 0;
    medications.forEach(med => {
      if (med.takenLog) {
        Object.values(med.takenLog).forEach(dayLog => {
          totalDoses += dayLog.length;
          takenDoses += dayLog.filter(Boolean).length;
        });
      }
    });
    if (totalDoses > 0) {
      score += (takenDoses / totalDoses) * 20;
    } else {
      score += 10;
    }
  } else {
    score += 10;
  }

  // Check-in consistency (10%)
  if (symptomLogs && symptomLogs.length > 0 && patient?.dischargeDate) {
    const daysSinceDischarge = Math.max(1, Math.floor(
      (Date.now() - new Date(patient.dischargeDate).getTime()) / 86400000
    ));
    const uniqueDays = new Set(symptomLogs.map(l => l.timestamp?.split('T')[0])).size;
    score += Math.min(1, uniqueDays / daysSinceDischarge) * 10;
  } else {
    score += 5;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-600' };
  return { label: 'Needs Attention', color: 'text-red-600' };
}

export function getScoreColor(score) {
  if (score >= 80) return '#2a9d8f';
  if (score >= 60) return '#1e6bb8';
  if (score >= 40) return '#f4a261';
  return '#e63946';
}
