'use client';

import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUser, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { mockFollowUps } from '@/data/mockFollowUps';
import { useLanguage } from '@/context/LanguageContext';

function getStatusConfig(t) {
  return {
    confirmed:   { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: FiCheckCircle, label: t('confirmed') },
    pending:     { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: FiAlertCircle, label: t('pending') },
    rescheduled: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: FiCalendar, label: t('rescheduled') },
  };
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatTime(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export default function FollowUpTracker({ patientId }) {
  const { t } = useLanguage();
  const followUps = mockFollowUps[patientId] || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const upcoming = followUps.filter(f => f.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0];

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5 text-center">
        <p className="text-sm text-text-light">{t('noUpcomingFollowUps')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Next appointment — hero card */}
      {next && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">{t('nextAppointment')}</p>
          <h3 className="text-lg font-bold mb-3">{next.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(next.date)} at {formatTime(next.time)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <FiUser className="w-4 h-4" />
              <span>{next.doctor} — {next.specialization}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <FiMapPin className="w-4 h-4" />
              <span>{next.location}</span>
            </div>
          </div>
          {(() => {
            const daysUntil = Math.ceil((new Date(next.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
            return (
              <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-medium">
                {daysUntil === 0 ? t('todayExclaim') : daysUntil === 1 ? t('tomorrow') : `${daysUntil} ${t('daysUntil')}`}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Preparation tips */}
      {next?.preparationTips && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-text mb-3">{t('prepareFor')}</h4>
          <ul className="space-y-2">
            {next.preparationTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-light">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All upcoming */}
      {upcoming.length > 1 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-text mb-3">{t('allUpcomingFollowUps')}</h4>
          <div className="space-y-2">
            {upcoming.map(fu => {
              const cfg = getStatusConfig(t)[fu.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={fu.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.color}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                    <span className="text-[10px] uppercase opacity-70">
                      {new Date(fu.date + 'T00:00').toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-base leading-tight">
                      {new Date(fu.date + 'T00:00').getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{fu.title}</div>
                    <div className="text-xs opacity-70">{fu.doctor} • {formatTime(fu.time)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium shrink-0">
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
