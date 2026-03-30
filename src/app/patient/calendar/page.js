'use client';

import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import SmartCalendar from '@/components/patient/SmartCalendar';

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <AppLayout requiredRole="patient" title="Smart Calendar">
      <div className="max-w-2xl mx-auto">
        <SmartCalendar patientId={user?.patientId} />
      </div>
    </AppLayout>
  );
}
