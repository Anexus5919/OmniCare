'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiMessageSquare } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getPatientsByIds, getDoctorNotes } from '@/services/storageService';
import { getRelativeTime } from '@/utils/dateHelpers';

const noteTypeConfig = {
  recommendation: { badge: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Recommendation' },
  medication:     { badge: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Medication' },
  comment:        { badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Comment' },
  alert_response: { badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Alert Response' },
};

export default function DoctorNotesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [allNotes, setAllNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!user?.assignedPatients) return;
    const patients = getPatientsByIds(user.assignedPatients);
    const notes = patients.flatMap(pat => {
      return getDoctorNotes(pat.id).map(n => ({ ...n, patientName: pat.name, patientAvatar: pat.avatar }));
    });
    notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllNotes(notes);
  }, [user]);

  const filtered = allNotes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.patientName.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by date
  const grouped = {};
  filtered.forEach(n => {
    const date = new Date(n.timestamp).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(n);
  });

  return (
    <AppLayout title={t('allNotes')} requiredRole="doctor">
      <div className="space-y-5">
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchNotes')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'recommendation', 'medication', 'comment', 'alert_response'].map(filterKey => (
              <button
                key={filterKey}
                onClick={() => setTypeFilter(filterKey)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  typeFilter === filterKey ? 'bg-primary text-white' : 'bg-muted text-text-light hover:bg-slate-200'
                }`}
              >
                {filterKey === 'all' ? t('all') : filterKey === 'recommendation' ? t('recommendation') : filterKey === 'medication' ? t('medication') : filterKey === 'comment' ? t('comment') : t('alertResponse')}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-light">{filtered.length} {t('notesCount')}</p>

        {/* Notes grouped by date */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare className="w-10 h-10 text-text-light mx-auto mb-3" />
            <p className="text-sm text-text-light">{t('noNotesFound')}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, notes]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-text-light uppercase tracking-wide mb-3">{date}</h3>
              <div className="space-y-3">
                {notes.map(note => {
                  const cfg = noteTypeConfig[note.type] || noteTypeConfig.comment;
                  return (
                    <div key={note.id} className="bg-white rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-[10px] font-bold">
                            {note.patientAvatar}
                          </div>
                          <span className="text-xs font-medium text-text">{note.patientName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${cfg.badge}`}>{{ recommendation: t('recommendation'), medication: t('medication'), comment: t('comment'), alert_response: t('alertResponse') }[note.type] || cfg.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">{note.category}</span>
                        </div>
                        <span className="text-[10px] text-text-light whitespace-nowrap">
                          {new Date(note.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-text mb-1">{note.title}</h4>
                      <p className="text-xs text-text-light leading-relaxed">{note.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
