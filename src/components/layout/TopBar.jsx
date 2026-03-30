'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getUnacknowledgedAlerts, acknowledgeAlert } from '@/services/storageService';
import { getRelativeTime } from '@/utils/dateHelpers';
import Badge from '@/components/common/Badge';

export default function TopBar({ onMenuClick, title }) {
  const { user } = useAuth();
  const [showAlerts, setShowAlerts] = useState(false);
  const alerts = getUnacknowledgedAlerts();

  const userAlerts = user?.role === 'patient'
    ? alerts.filter(a => a.patientId === user.patientId)
    : alerts;

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
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              <FiBell className="w-5 h-5 text-text-light" />
              {userAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {userAlerts.length}
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
                    <h3 className="font-semibold text-text">Notifications</h3>
                    <button onClick={() => setShowAlerts(false)}>
                      <FiX className="w-4 h-4 text-text-light" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {userAlerts.length === 0 ? (
                      <p className="p-4 text-sm text-text-light text-center">No new notifications</p>
                    ) : (
                      userAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className="p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            acknowledgeAlert(alert.id, user?.id);
                            setShowAlerts(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text">{alert.title}</p>
                              <p className="text-xs text-text-light mt-1">{alert.message}</p>
                            </div>
                            <Badge variant={alert.severity}>{alert.severity}</Badge>
                          </div>
                          <p className="text-xs text-text-light mt-2">{getRelativeTime(alert.timestamp)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-sm font-semibold">
            {user?.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
