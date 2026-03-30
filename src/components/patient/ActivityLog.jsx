'use client';

import { mockActivityLogs } from '@/data/mockActivityLogs';
import { FiActivity, FiMoon, FiDroplet } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

export default function ActivityLog({ patientId }) {
  const { t } = useLanguage();
  const logs = mockActivityLogs[patientId] || [];
  const today = logs[logs.length - 1];
  const yesterday = logs[logs.length - 2];

  if (!today) return null;

  const metrics = [
    {
      icon: FiActivity,
      label: t('stepsToday'),
      value: today.steps.toLocaleString(),
      sub: yesterday ? `${today.steps > yesterday.steps ? '+' : ''}${today.steps - yesterday.steps} ${t('vsYesterday')}` : '',
      color: 'text-blue-600 bg-blue-50',
      trend: yesterday ? (today.steps >= yesterday.steps ? 'up' : 'down') : 'neutral',
    },
    {
      icon: FiMoon,
      label: t('restHours'),
      value: `${today.restHours}h`,
      sub: today.restHours >= 7 ? t('goodRest') : t('belowTarget'),
      color: 'text-indigo-600 bg-indigo-50',
      trend: today.restHours >= 7 ? 'up' : 'down',
    },
    {
      icon: FiDroplet,
      label: t('waterIntake'),
      value: `${today.waterGlasses}`,
      sub: `${today.waterGlasses} / 8 glasses`,
      color: 'text-cyan-600 bg-cyan-50',
      trend: today.waterGlasses >= 7 ? 'up' : 'down',
    },
  ];

  // Steps trend for the week
  const maxSteps = Math.max(...logs.map(l => l.steps));

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-base font-semibold text-text mb-4">{t('activityLog')}</h3>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {metrics.map(m => (
          <div key={m.label} className={`p-3 rounded-xl ${m.color}`}>
            <m.icon className="w-4 h-4 mb-1.5" />
            <div className="text-lg font-bold">{m.value}</div>
            <div className="text-[10px] opacity-70">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Steps bar chart */}
      <h4 className="text-xs font-medium text-text-light uppercase tracking-wide mb-2">{t('stepsThisWeek')}</h4>
      <div className="flex items-end gap-1.5 h-20">
        {logs.map((l, i) => {
          const height = maxSteps > 0 ? (l.steps / maxSteps) * 100 : 0;
          const isToday = i === logs.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-text-light font-medium">{l.steps > 999 ? `${(l.steps / 1000).toFixed(1)}k` : l.steps}</span>
              <div
                className={`w-full rounded-md transition-all ${isToday ? 'bg-primary' : 'bg-primary/20'}`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className="text-[9px] text-text-light">
                {new Date(l.date).toLocaleDateString('en', { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
