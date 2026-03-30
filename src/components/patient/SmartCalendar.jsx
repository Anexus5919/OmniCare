'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiClock, FiMapPin, FiCheck } from 'react-icons/fi';
import { mockCalendarEvents } from '@/data/mockCalendarEvents';
import { useLanguage } from '@/context/LanguageContext';

function formatTime(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export default function SmartCalendar({ patientId }) {
  const { t, lang } = useLanguage();

  const typeConfig = {
    medication:  { color: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-200',  dot: 'bg-blue-500',    label: t('medication') },
    exercise:    { color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: t('exercise') },
    appointment: { color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500',  label: t('appointment') },
    checkin:     { color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500',   label: t('checkIn') },
    reminder:    { color: 'bg-rose-500', light: 'bg-rose-50 text-rose-700 border-rose-200',  dot: 'bg-rose-500',    label: t('reminder') },
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [weekOffset, setWeekOffset] = useState(0);

  const events = mockCalendarEvents[patientId] || [];

  // Generate week days
  const weekDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() + weekOffset * 7 - today.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        num: d.getDate(),
        isToday: d.toISOString().split('T')[0] === todayStr,
      };
    });
  }, [weekOffset, todayStr]);

  const dayEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcomingEvents = events
    .filter(e => e.date > todayStr && e.type === 'appointment')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Count events per day for dots
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = new Set();
      map[e.date].add(e.type);
    });
    return map;
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Week strip */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">
            {new Date(selectedDate).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setWeekOffset(0); setSelectedDate(todayStr); }}
              className="px-2.5 py-1 text-xs font-medium text-primary bg-primary-light rounded-lg hover:bg-primary/10 transition-colors"
            >
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                selectedDate === d.date
                  ? 'bg-primary text-white shadow-md'
                  : d.isToday
                    ? 'bg-primary-light text-primary'
                    : 'hover:bg-muted text-text'
              }`}
            >
              <span className="text-[10px] font-medium opacity-70">{d.day}</span>
              <span className="text-lg font-bold">{d.num}</span>
              {/* Event dots */}
              <div className="flex gap-0.5 mt-0.5">
                {eventsByDate[d.date] && Array.from(eventsByDate[d.date]).slice(0, 3).map((type, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedDate === d.date ? 'bg-white/80' : typeConfig[type]?.dot || 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Day events */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <h4 className="text-sm font-semibold text-text mb-3">
          {selectedDate === todayStr ? t('todaysSchedule') : new Date(selectedDate + 'T00:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h4>
        {dayEvents.length === 0 ? (
          <p className="text-sm text-text-light py-4 text-center">{t('noEventsToday')}</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map(ev => {
              const cfg = typeConfig[ev.type] || typeConfig.reminder;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${ev.done ? 'opacity-60' : ''} ${cfg.light}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${ev.done ? 'line-through' : ''}`}>{ev.title}</span>
                      {ev.done && <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs opacity-70">
                        <FiClock className="w-3 h-3" />{formatTime(ev.time)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 text-xs opacity-70">
                          <FiMapPin className="w-3 h-3" />{ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming appointments */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-text mb-3">{t('upcomingAppointments')}</h4>
          <div className="space-y-2">
            {upcomingEvents.map(ev => {
              const daysAway = Math.ceil((new Date(ev.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
              return (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {new Date(ev.date + 'T00:00').toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-purple-800">{ev.title}</div>
                    <div className="text-xs text-purple-600">{formatTime(ev.time)} • {ev.location}</div>
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-lg shrink-0">
                    {daysAway === 1 ? t('tomorrow') : `${daysAway}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-text-light">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
