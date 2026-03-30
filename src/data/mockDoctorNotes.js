function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

export const mockDoctorNotes = [
  {
    id: 'note_001',
    patientId: 'pat_001',
    doctorId: 'usr_003',
    doctorName: 'Dr. Meera Patel',
    type: 'recommendation',
    category: 'exercise',
    title: 'Increase knee flexion exercises',
    content: 'Patient is progressing well. Increase knee bending exercises from 10 to 15 reps per session. Add resistance band exercises starting next week if pain stays below 4.',
    timestamp: getDateStr(-2),
  },
  {
    id: 'note_002',
    patientId: 'pat_001',
    doctorId: 'usr_003',
    doctorName: 'Dr. Meera Patel',
    type: 'medication',
    category: 'medication',
    title: 'Reduce Ibuprofen dosage',
    content: 'Pain levels are decreasing steadily. Reduce Ibuprofen from 400mg to 200mg starting next week. Continue Enoxaparin at current dosage until blood test results.',
    timestamp: getDateStr(-1),
  },
  {
    id: 'note_003',
    patientId: 'pat_001',
    doctorId: 'usr_003',
    doctorName: 'Dr. Meera Patel',
    type: 'comment',
    category: 'general',
    title: 'Overall progress note',
    content: 'Patient Rajesh Kumar is showing good recovery trajectory for Day 10 post TKA. Knee ROM improving. Wound site clean, no signs of infection. Continue current recovery plan with minor adjustments noted above.',
    timestamp: getDateStr(0),
  },
  {
    id: 'note_004',
    patientId: 'pat_002',
    doctorId: 'usr_003',
    doctorName: 'Dr. Meera Patel',
    type: 'recommendation',
    category: 'activity',
    title: 'Cardiac rehabilitation guidelines',
    content: 'Anita should start cardiac rehab slowly — 5 min walks, increasing by 2 min every 3 days. Monitor heart rate and keep below 110 bpm during exercise. Report any chest discomfort immediately.',
    timestamp: getDateStr(-1),
  },
  {
    id: 'note_005',
    patientId: 'pat_002',
    doctorId: 'usr_003',
    doctorName: 'Dr. Meera Patel',
    type: 'alert_response',
    category: 'symptom',
    title: 'Response to elevated heart rate alert',
    content: 'Reviewed elevated heart rate alert. Likely due to anxiety. Continue monitoring. If heart rate stays above 100 bpm at rest for more than 2 hours, escalate immediately.',
    timestamp: getDateStr(0),
  },
  {
    id: 'note_006',
    patientId: 'pat_003',
    doctorId: 'usr_007',
    doctorName: 'Dr. Arjun Singh',
    type: 'recommendation',
    category: 'diet',
    title: 'Diet after appendectomy',
    content: 'Mohammed can resume normal diet gradually. Start with soft foods, avoid spicy/oily food for 2 more weeks. Increase fiber intake to prevent constipation. Hydration is key — minimum 8 glasses of water daily.',
    timestamp: getDateStr(-1),
  },
];
