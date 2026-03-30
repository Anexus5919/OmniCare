// Smart calendar events seeded for demo — relative to today
function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const mockCalendarEvents = {
  pat_001: [
    // Past events
    { id: 'cal_001', date: getDateStr(-2), time: '08:00', title: 'Morning Medication', type: 'medication', done: true },
    { id: 'cal_002', date: getDateStr(-2), time: '09:00', title: 'Gentle Knee Bends (10 reps)', type: 'exercise', done: true },
    { id: 'cal_003', date: getDateStr(-2), time: '14:00', title: 'Afternoon Medication', type: 'medication', done: true },
    { id: 'cal_004', date: getDateStr(-1), time: '08:00', title: 'Morning Medication', type: 'medication', done: true },
    { id: 'cal_005', date: getDateStr(-1), time: '10:00', title: 'Physiotherapy Session', type: 'appointment', done: true, location: 'City Hospital, Room 204' },
    { id: 'cal_006', date: getDateStr(-1), time: '14:00', title: 'Afternoon Medication', type: 'medication', done: false },
    // Today
    { id: 'cal_007', date: getDateStr(0), time: '08:00', title: 'Morning Medication — Ibuprofen 400mg', type: 'medication', done: true },
    { id: 'cal_008', date: getDateStr(0), time: '09:00', title: 'Daily Check-in', type: 'checkin', done: false },
    { id: 'cal_009', date: getDateStr(0), time: '10:30', title: 'Quad Sets & Ankle Pumps', type: 'exercise', done: false },
    { id: 'cal_010', date: getDateStr(0), time: '14:00', title: 'Afternoon Medication — Ibuprofen 400mg', type: 'medication', done: false },
    { id: 'cal_011', date: getDateStr(0), time: '16:00', title: 'Ice Pack Application (15 min)', type: 'reminder', done: false },
    { id: 'cal_012', date: getDateStr(0), time: '22:00', title: 'Evening Medication — Enoxaparin', type: 'medication', done: false },
    // Tomorrow
    { id: 'cal_013', date: getDateStr(1), time: '08:00', title: 'Morning Medication', type: 'medication', done: false },
    { id: 'cal_014', date: getDateStr(1), time: '09:30', title: 'Wound Dressing Change', type: 'reminder', done: false },
    { id: 'cal_015', date: getDateStr(1), time: '11:00', title: 'Walking Practice (10 minutes)', type: 'exercise', done: false },
    { id: 'cal_016', date: getDateStr(1), time: '14:00', title: 'Afternoon Medication', type: 'medication', done: false },
    // Day after tomorrow
    { id: 'cal_017', date: getDateStr(2), time: '08:00', title: 'Morning Medication', type: 'medication', done: false },
    { id: 'cal_018', date: getDateStr(2), time: '10:00', title: 'Follow-up with Dr. Meera Patel', type: 'appointment', done: false, location: 'City Hospital, Ortho Dept' },
    { id: 'cal_019', date: getDateStr(2), time: '15:00', title: 'Straight Leg Raises (3 sets)', type: 'exercise', done: false },
    // Next week
    { id: 'cal_020', date: getDateStr(5), time: '10:00', title: 'Physiotherapy Session', type: 'appointment', done: false, location: 'PhysioFirst Clinic' },
    { id: 'cal_021', date: getDateStr(7), time: '09:00', title: 'Blood Test — INR Check', type: 'appointment', done: false, location: 'City Hospital Lab' },
    { id: 'cal_022', date: getDateStr(10), time: '10:00', title: 'Ortho Review — X-Ray', type: 'appointment', done: false, location: 'City Hospital, Ortho Dept' },
  ],
  pat_002: [
    { id: 'cal_101', date: getDateStr(0), time: '07:00', title: 'Morning Medication — Aspirin 75mg', type: 'medication', done: true },
    { id: 'cal_102', date: getDateStr(0), time: '08:30', title: 'Light Walking (5 min)', type: 'exercise', done: false },
    { id: 'cal_103', date: getDateStr(0), time: '09:00', title: 'Daily Check-in', type: 'checkin', done: false },
    { id: 'cal_104', date: getDateStr(0), time: '12:00', title: 'Afternoon Medication — Metoprolol', type: 'medication', done: false },
    { id: 'cal_105', date: getDateStr(0), time: '18:00', title: 'Breathing Exercises (10 min)', type: 'exercise', done: false },
    { id: 'cal_106', date: getDateStr(1), time: '10:00', title: 'Cardiac Rehabilitation Session', type: 'appointment', done: false, location: 'Heart Care Center' },
    { id: 'cal_107', date: getDateStr(3), time: '09:00', title: 'ECG Follow-up', type: 'appointment', done: false, location: 'City Hospital, Cardiology' },
    { id: 'cal_108', date: getDateStr(7), time: '10:00', title: 'Surgeon Review', type: 'appointment', done: false, location: 'City Hospital' },
  ],
  pat_003: [
    { id: 'cal_201', date: getDateStr(0), time: '08:00', title: 'Morning Medication — Paracetamol', type: 'medication', done: true },
    { id: 'cal_202', date: getDateStr(0), time: '09:00', title: 'Daily Check-in', type: 'checkin', done: false },
    { id: 'cal_203', date: getDateStr(0), time: '14:00', title: 'Afternoon Medication', type: 'medication', done: false },
    { id: 'cal_204', date: getDateStr(0), time: '16:00', title: 'Gentle Walking (15 min)', type: 'exercise', done: false },
    { id: 'cal_205', date: getDateStr(2), time: '10:00', title: 'Wound Check with Dr. Arjun Singh', type: 'appointment', done: false, location: 'City Hospital, Surgery OPD' },
    { id: 'cal_206', date: getDateStr(5), time: '09:00', title: 'Stitch Removal', type: 'appointment', done: false, location: 'City Hospital, Surgery OPD' },
  ],
};
