'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiX, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getUnacknowledgedAlerts, acknowledgeAlert, getDoctorNotes } from '@/services/storageService';
import { getRelativeTime } from '@/utils/dateHelpers';
import Badge from '@/components/common/Badge';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function TopBar({ onMenuClick, title }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [showAlerts, setShowAlerts] = useState(false);
  const alerts = getUnacknowledgedAlerts();

  const userAlerts = user?.role === 'patient'
    ? alerts.filter(a => a.patientId === user.patientId)
    : alerts;

  // Get doctor notes as notifications — for patients and caregivers
  const doctorNotes = (() => {
    if (user?.role === 'patient') {
      return getDoctorNotes(user.patientId).slice(-5).reverse();
    }
    if (user?.role === 'caregiver' && user?.assignedPatients) {
      return user.assignedPatients
        .flatMap(pid => getDoctorNotes(pid))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    }
    return [];
  })();

  // Combine alerts + doctor notes into notification items
  const notifications = [
    ...userAlerts.map(a => ({
      id: a.id,
      type: 'alert',
      title: a.title,
      message: a.message,
      severity: a.severity,
      timestamp: a.timestamp,
      alertId: a.id,
    })),
    ...doctorNotes.map(n => ({
      id: n.id,
      type: 'note',
      title: `${t('newNote')} ${n.doctorName}`,
      message: n.title,
      severity: 'info',
      timestamp: n.timestamp,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-border px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-muted">
            <FiMenu className="w-5 h-5 text-text" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text">{title}</h2>
            <p className="text-sm text-text-light">
              {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              <FiBell className="w-5 h-5 text-text-light" />
              {totalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {totalCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showAlerts && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-text">{t('notifications')}</h3>
                    <button onClick={() => setShowAlerts(false)}>
                      <FiX className="w-4 h-4 text-text-light" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-text-light text-center">{t('noNewNotifications')}</p>
                    ) : (
                      notifications.slice(0, 8).map((item, idx) => (
                        <div
                          key={`${item.type}_${item.id}_${idx}`}
                          className="p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            if (item.type === 'alert' && item.alertId) {
                              acknowledgeAlert(item.alertId, user?.id);
                            }
                            setShowAlerts(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              {item.type === 'note' && (
                                <FiMessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-text">{item.title}</p>
                                <p className="text-xs text-text-light mt-1">{item.message}</p>
                              </div>
                            </div>
                            <Badge variant={item.type === 'note' ? 'info' : item.severity}>
                              {item.type === 'note' ? 'note' : item.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-light mt-2">{getRelativeTime(item.timestamp)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-sm font-semibold">
            {user?.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
