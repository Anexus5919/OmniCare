'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Badge from '@/components/common/Badge';
import PatientDetailView from '@/components/doctor/PatientDetailView';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  getPatientsByIds, getSymptomLogsByPatient, getMedicationsByPatient,
  getRecoveryPlanByPatient
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { daysSince } from '@/utils/dateHelpers';

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!user?.assignedPatients) return;
    const pats = getPatientsByIds(user.assignedPatients).map(pat => {
      const logs = getSymptomLogsByPatient(pat.id);
      const meds = getMedicationsByPatient(pat.id);
      const plan = getRecoveryPlanByPatient(pat.id);
      const allTasks = plan?.phases?.flatMap(p => p.tasks) || [];
      const score = computeRecoveryScore(pat, logs, meds, allTasks);
      const latestLog = logs[logs.length - 1];
      return { ...pat, score, latestLog, medsCount: meds.length };
    });
    setPatients(pats);
  }, [user]);

  const filtered = patients.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  // If a patient is selected, show detail view
  if (selectedPatient) {
    const pat = patients.find(p => p.id === selectedPatient);
    if (pat) {
      return (
        <AppLayout title={t('allPatients')} requiredRole="doctor">
          <PatientDetailView patient={pat} user={user} onBack={() => setSelectedPatient(null)} />
        </AppLayout>
      );
    }
  }

  return (
    <AppLayout title={t('allPatients')} requiredRole="doctor">
      <div className="space-y-5">
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchByNameOrId')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-text-light" />
            {['all', 'low', 'medium', 'high'].map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  riskFilter === r ? 'bg-primary text-white' : 'bg-muted text-text-light hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? t('all') : r === 'low' ? t('low') : r === 'medium' ? t('medium') : t('high')}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-text-light">{filtered.length} {t('patientsFound')}</p>

        {/* Patient table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3.5 px-5 text-text-light font-medium">{t('patient')}</th>
                  <th className="text-left py-3.5 px-4 text-text-light font-medium">{t('condition')}</th>
                  <th className="text-center py-3.5 px-3 text-text-light font-medium">{t('day')}</th>
                  <th className="text-center py-3.5 px-3 text-text-light font-medium">{t('score')}</th>
                  <th className="text-center py-3.5 px-3 text-text-light font-medium">{t('riskLevel')}</th>
                  <th className="text-center py-3.5 px-3 text-text-light font-medium">{t('pain')}</th>
                  <th className="text-center py-3.5 px-3 text-text-light font-medium">{t('meds')}</th>
                  <th className="py-3.5 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(pat => (
                  <motion.tr
                    key={pat.id}
                    whileHover={{ backgroundColor: 'rgba(59,130,160,0.04)' }}
                    onClick={() => setSelectedPatient(pat.id)}
                    className="border-b border-border/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xs font-bold">
                          {pat.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-text">{pat.name}</div>
                          <div className="text-xs text-text-light">{pat.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-light text-xs">{pat.condition}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{daysSince(pat.dischargeDate)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-bold ${pat.score >= 70 ? 'text-secondary' : pat.score >= 50 ? 'text-primary' : 'text-danger'}`}>{pat.score}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center"><Badge variant={pat.riskLevel}>{pat.riskLevel}</Badge></td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-medium ${(pat.latestLog?.painLevel || 0) > 6 ? 'text-red-600' : 'text-text'}`}>
                        {pat.latestLog?.painLevel ?? 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-text-light">{pat.medsCount}</td>
                    <td className="py-3.5 px-3"><FiChevronRight className="w-4 h-4 text-text-light" /></td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-text-light">{t('noPatientsMatch')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
