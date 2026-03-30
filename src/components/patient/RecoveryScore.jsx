'use client';

import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';
import { useLanguage } from '@/context/LanguageContext';

export default function RecoveryScore({ score }) {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium text-text-light mb-4">{t('recoveryScore')}</h3>
      <ProgressRing score={score} />
      <p className="text-xs text-text-light mt-3 text-center">
        {t('basedOn')}
      </p>
    </Card>
  );
}
