'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { mockMilestones } from '@/data/mockActivityLogs';
import { useLanguage } from '@/context/LanguageContext';

export default function MilestoneTracker({ patientId }) {
  const { t } = useLanguage();
  const milestones = mockMilestones[patientId] || [];
  const achieved = milestones.filter(m => m.achieved).length;
  const total = milestones.length;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text">{t('recoveryMilestones')}</h3>
        <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-lg">
          {achieved}/{total} {t('achieved')}
        </span>
      </div>

      <div className="space-y-2">
        {milestones.map((ms, i) => (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              ms.achieved
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            {/* Icon / check */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              ms.achieved ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              {ms.achieved ? ms.icon : '🔒'}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${ms.achieved ? 'text-emerald-800' : 'text-slate-500'}`}>
                {ms.title}
              </div>
              {ms.achieved && ms.date && (
                <div className="text-xs text-emerald-600">
                  Achieved {new Date(ms.date + 'T00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              )}
              {!ms.achieved && (
                <div className="text-xs text-slate-400">{t('notYetAchieved')}</div>
              )}
            </div>

            {ms.achieved && (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <FiCheck className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-light mb-1">
          <span>{t('overallProgress')}</span>
          <span>{Math.round((achieved / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(achieved / total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
