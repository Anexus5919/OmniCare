'use client';

import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';

export default function RecoveryScore({ score }) {
  return (
    <Card className="flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium text-text-light mb-4">Recovery Score</h3>
      <ProgressRing score={score} />
      <p className="text-xs text-text-light mt-3 text-center">
        Based on task completion, symptoms, and medication adherence
      </p>
    </Card>
  );
}
