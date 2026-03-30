'use client';

import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import FollowUpTracker from '@/components/patient/FollowUpTracker';

export default function FollowUpsPage() {
  const { user } = useAuth();

  return (
    <AppLayout requiredRole="patient" title="Follow-up Appointments">
      <div className="max-w-2xl mx-auto">
        <FollowUpTracker patientId={user?.patientId} />
      </div>
    </AppLayout>
  );
}
