'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiActivity, FiClipboard, FiCalendar, FiHeart,
  FiUsers, FiLogOut, FiBarChart2, FiFileText,
  FiMessageSquare, FiChevronDown, FiUser
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getPatientById } from '@/services/storageService';
import Badge from '@/components/common/Badge';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  // Get patient data for sidebar info panel
  const patientData = user.role === 'patient' ? getPatientById(user.patientId) : null;

  const navItems = {
    patient: [
      { href: '/patient', label: t('dashboard'), icon: FiHome },
      { href: '/patient/symptoms', label: t('symptoms'), icon: FiActivity },
      { href: '/patient/medications', label: t('medications'), icon: FiClipboard },
      { href: '/patient/recovery-plan', label: t('recoveryPlan'), icon: FiCalendar },
      { href: '/patient/calendar', label: t('calendar'), icon: FiBarChart2 },
      { href: '/patient/follow-ups', label: t('followUps'), icon: FiFileText },
    ],
    caregiver: [
      { href: '/caregiver', label: t('dashboard'), icon: FiHome },
      { href: '/caregiver/patients', label: t('allPatients'), icon: FiUsers },
      { href: '/caregiver/notes', label: t('allNotes'), icon: FiMessageSquare },
    ],
    doctor: [
      { href: '/doctor', label: t('dashboard'), icon: FiHome },
      { href: '/doctor/patients', label: t('allPatients'), icon: FiUsers },
      { href: '/doctor/caregivers', label: t('caregiver') + 's', icon: FiHeart },
      { href: '/doctor/notes', label: t('allNotes'), icon: FiMessageSquare },
    ],
  };

  const items = navItems[user.role] || [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <Link href={`/${user.role}`} className="flex items-center gap-3">
            <img src="/logo.png" alt="OmniCare" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-lg font-bold">Omni<span className="text-secondary">Care</span></h1>
              <p className="text-xs text-slate-400">{t(user.role)} {t('portal')}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section with expandable profile */}
        <div className="border-t border-white/10">
          {/* Clickable user row */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-3 p-4 px-5 hover:bg-sidebar-hover transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm font-semibold shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400">{t(user.role)}</p>
            </div>
            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Expandable profile panel */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-3 space-y-2">
                  {/* Patient info */}
                  {patientData && (
                    <div className="p-3 rounded-xl bg-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Condition</span><span className="text-white font-medium text-right max-w-[55%]">{patientData.condition}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Age</span><span className="text-white">{patientData.age} yrs, {patientData.gender}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Blood Group</span><span className="text-white">{patientData.bloodGroup}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Risk Level</span><span className={`font-medium capitalize ${patientData.riskLevel === 'high' ? 'text-red-400' : patientData.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{patientData.riskLevel}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Allergies</span><span className="text-white">{patientData.allergies?.join(', ') || 'None'}</span></div>
                    </div>
                  )}

                  {/* Non-patient info */}
                  {!patientData && (
                    <div className="p-3 rounded-xl bg-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{user.email}</span></div>
                      {user.specialization && (
                        <div className="flex justify-between"><span className="text-slate-400">Specialization</span><span className="text-white">{user.specialization}</span></div>
                      )}
                      {user.assignedPatients && (
                        <div className="flex justify-between"><span className="text-slate-400">Patients</span><span className="text-white">{user.assignedPatients.length} assigned</span></div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all w-full"
                  >
                    <FiLogOut className="w-4 h-4" />
                    {t('signOut')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
