function generateLogs(patientId, startDate, painBase, dayCount = 10) {
  const logs = [];
  const start = new Date(startDate);

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const progress = i / dayCount;
    const painDecay = Math.max(1, painBase - (progress * painBase * 0.6) + (Math.random() * 1.5 - 0.75));

    logs.push({
      id: `sym_${patientId}_${i + 1}`,
      patientId,
      timestamp: `${d.toISOString().split('T')[0]}T09:30:00Z`,
      painLevel: Math.round(Math.min(10, Math.max(0, painDecay)) * 10) / 10,
      swelling: Math.round(Math.max(0, (painBase * 0.7) - progress * painBase * 0.5 + (Math.random() - 0.5)) * 10) / 10,
      mobility: Math.round(Math.min(10, 3 + progress * 5 + (Math.random() - 0.5)) * 10) / 10,
      mood: Math.round(Math.min(10, 4 + progress * 4 + (Math.random() - 0.5)) * 10) / 10,
      temperature: Math.round((98.2 + Math.random() * 0.8) * 10) / 10,
      fatigue: Math.round(Math.max(1, 7 - progress * 4 + (Math.random() - 0.5)) * 10) / 10,
      appetite: Math.round(Math.min(10, 5 + progress * 3 + (Math.random() - 0.5)) * 10) / 10,
      breathing: Math.round(Math.min(10, 6 + progress * 3 + (Math.random() - 0.5)) * 10) / 10,
      notes: '',
      flagged: false,
    });
  }
  return logs;
}

export const mockSymptomLogs = [
  ...generateLogs('pat_001', '2026-03-21', 7, 10),
  ...generateLogs('pat_002', '2026-03-23', 5, 8),
  ...generateLogs('pat_003', '2026-03-26', 4, 5),
];
