'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiHeart, FiMail, FiUsers } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getUsers, getPatientsByIds } from '@/services/storageService';

export default function DoctorCaregiversPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [caregivers, setCaregivers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const users = getUsers();
    const cgs = users.filter(u => u.role === 'caregiver').map(cg => {
      const patients = cg.assignedPatients ? getPatientsByIds(cg.assignedPatients) : [];
      return { ...cg, patients };
    });
    setCaregivers(cgs);
  }, []);

  const filtered = caregivers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title={t('caregiver') + 's'} requiredRole="doctor">
      <div className="space-y-5">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search') + '...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3.5 px-5 text-text-light font-medium">{t('caregiver')}</th>
                <th className="text-left py-3.5 px-4 text-text-light font-medium">Email</th>
                <th className="text-center py-3.5 px-4 text-text-light font-medium">{t('myPatients')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cg => (
                <motion.tr
                  key={cg.id}
                  whileHover={{ backgroundColor: 'rgba(59,130,160,0.04)' }}
                  onClick={() => setSelected(selected === cg.id ? null : cg.id)}
                  className={`border-b border-border/50 cursor-pointer ${selected === cg.id ? 'bg-primary-light/50' : ''}`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-xs font-bold">{cg.avatar}</div>
                      <div>
                        <div className="font-semibold text-text">{cg.name}</div>
                        <div className="text-xs text-text-light">{cg.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-text-light">{cg.email}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-primary">{cg.patients.length}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected caregiver detail */}
        {selected && (() => {
          const cg = caregivers.find(c => c.id === selected);
          if (!cg) return null;
          return (
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-xl font-bold">{cg.avatar}</div>
                <div>
                  <h3 className="text-lg font-bold text-text">{cg.name}</h3>
                  <p className="text-sm text-text-light flex items-center gap-1"><FiMail className="w-3.5 h-3.5" /> {cg.email}</p>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2"><FiUsers className="w-4 h-4 text-primary" /> Assigned Patients</h4>
              <div className="space-y-2">
                {cg.patients.map(pat => (
                  <div key={pat.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xs font-bold">{pat.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-text">{pat.name}</p>
                      <p className="text-xs text-text-light">{pat.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}
      </div>
    </AppLayout>
  );
}
