export const mockUsers = [
  // Patients
  {
    id: 'usr_001',
    name: 'Rajesh Kumar',
    email: 'rajesh@demo.com',
    role: 'patient',
    avatar: 'RK',
    patientId: 'pat_001',
  },
  {
    id: 'usr_004',
    name: 'Anita Sharma',
    email: 'anita@demo.com',
    role: 'patient',
    avatar: 'AS',
    patientId: 'pat_002',
  },
  {
    id: 'usr_005',
    name: 'Mohammed Ali',
    email: 'mohammed@demo.com',
    role: 'patient',
    avatar: 'MA',
    patientId: 'pat_003',
  },
  // Caregivers
  {
    id: 'usr_002',
    name: 'Priya Kumar',
    email: 'priya@demo.com',
    role: 'caregiver',
    avatar: 'PK',
    assignedPatients: ['pat_001', 'pat_002'],
  },
  {
    id: 'usr_006',
    name: 'Sana Ali',
    email: 'sana@demo.com',
    role: 'caregiver',
    avatar: 'SA',
    assignedPatients: ['pat_003'],
  },
  // Doctors
  {
    id: 'usr_003',
    name: 'Dr. Meera Patel',
    email: 'drmeera@demo.com',
    role: 'doctor',
    avatar: 'MP',
    specialization: 'Orthopedic Surgeon',
    assignedPatients: ['pat_001', 'pat_002'],
  },
  {
    id: 'usr_007',
    name: 'Dr. Arjun Singh',
    email: 'drarjun@demo.com',
    role: 'doctor',
    avatar: 'AS',
    specialization: 'General Surgeon',
    assignedPatients: ['pat_003'],
  },
];
