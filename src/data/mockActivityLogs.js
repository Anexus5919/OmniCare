function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const mockActivityLogs = {
  pat_001: [
    { date: getDateStr(-6), steps: 820,  restHours: 9.5, waterGlasses: 6 },
    { date: getDateStr(-5), steps: 1100, restHours: 8.0, waterGlasses: 7 },
    { date: getDateStr(-4), steps: 1350, restHours: 8.5, waterGlasses: 8 },
    { date: getDateStr(-3), steps: 1500, restHours: 7.5, waterGlasses: 7 },
    { date: getDateStr(-2), steps: 1800, restHours: 8.0, waterGlasses: 8 },
    { date: getDateStr(-1), steps: 2100, restHours: 7.0, waterGlasses: 9 },
    { date: getDateStr(0),  steps: 1400, restHours: 6.5, waterGlasses: 5 },
  ],
  pat_002: [
    { date: getDateStr(-6), steps: 400,  restHours: 10.0, waterGlasses: 5 },
    { date: getDateStr(-5), steps: 500,  restHours: 9.5,  waterGlasses: 6 },
    { date: getDateStr(-4), steps: 650,  restHours: 9.0,  waterGlasses: 6 },
    { date: getDateStr(-3), steps: 700,  restHours: 8.5,  waterGlasses: 7 },
    { date: getDateStr(-2), steps: 850,  restHours: 8.5,  waterGlasses: 7 },
    { date: getDateStr(-1), steps: 900,  restHours: 8.0,  waterGlasses: 8 },
    { date: getDateStr(0),  steps: 600,  restHours: 7.0,  waterGlasses: 4 },
  ],
  pat_003: [
    { date: getDateStr(-6), steps: 1200, restHours: 8.0, waterGlasses: 7 },
    { date: getDateStr(-5), steps: 1800, restHours: 7.5, waterGlasses: 8 },
    { date: getDateStr(-4), steps: 2200, restHours: 7.0, waterGlasses: 8 },
    { date: getDateStr(-3), steps: 2500, restHours: 7.0, waterGlasses: 9 },
    { date: getDateStr(-2), steps: 2800, restHours: 6.5, waterGlasses: 8 },
    { date: getDateStr(-1), steps: 3200, restHours: 7.0, waterGlasses: 9 },
    { date: getDateStr(0),  steps: 2000, restHours: 6.0, waterGlasses: 6 },
  ],
};

export const mockMilestones = {
  pat_001: [
    { id: 'ms_001', title: 'First Steps Post-Surgery', achieved: true, date: getDateStr(-8), icon: '🚶' },
    { id: 'ms_002', title: 'Pain Below 5/10', achieved: true, date: getDateStr(-4), icon: '💪' },
    { id: 'ms_003', title: '7-Day Medication Streak', achieved: true, date: getDateStr(-2), icon: '💊' },
    { id: 'ms_004', title: 'Knee Flexion > 90°', achieved: false, date: null, icon: '🦵' },
    { id: 'ms_005', title: '2000+ Steps in a Day', achieved: true, date: getDateStr(-1), icon: '🏅' },
    { id: 'ms_006', title: 'Independent Walking', achieved: false, date: null, icon: '🎯' },
    { id: 'ms_007', title: 'Recovery Score > 80', achieved: false, date: null, icon: '⭐' },
  ],
  pat_002: [
    { id: 'ms_101', title: 'First Walk Post-Surgery', achieved: true, date: getDateStr(-7), icon: '🚶' },
    { id: 'ms_102', title: 'Breathing Exercises Completed', achieved: true, date: getDateStr(-5), icon: '🫁' },
    { id: 'ms_103', title: 'Pain Below 5/10', achieved: true, date: getDateStr(-3), icon: '💪' },
    { id: 'ms_104', title: 'Cardiac Rehab Started', achieved: true, date: getDateStr(-1), icon: '❤️' },
    { id: 'ms_105', title: 'Blood Pressure Normalized', achieved: false, date: null, icon: '🩺' },
    { id: 'ms_106', title: 'Recovery Score > 70', achieved: false, date: null, icon: '⭐' },
  ],
  pat_003: [
    { id: 'ms_201', title: 'Discharged Home', achieved: true, date: getDateStr(-9), icon: '🏠' },
    { id: 'ms_202', title: 'First Solid Meal', achieved: true, date: getDateStr(-7), icon: '🍽️' },
    { id: 'ms_203', title: 'Pain Below 3/10', achieved: true, date: getDateStr(-3), icon: '💪' },
    { id: 'ms_204', title: '3000+ Steps in a Day', achieved: true, date: getDateStr(-1), icon: '🏅' },
    { id: 'ms_205', title: 'Wound Healing Well', achieved: false, date: null, icon: '🩹' },
    { id: 'ms_206', title: 'Full Recovery', achieved: false, date: null, icon: '⭐' },
  ],
};
