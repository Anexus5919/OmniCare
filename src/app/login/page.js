'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiHeart, FiActivity, FiArrowRight, FiShield } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getUsersByRole } from '@/services/storageService';

const roles = [
  {
    key: 'patient',
    label: 'Patient',
    icon: FiUser,
    color: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Track your recovery, log symptoms, and follow your personalized plan',
  },
  {
    key: 'caregiver',
    label: 'Caregiver',
    icon: FiHeart,
    color: 'from-emerald-500 to-emerald-700',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Monitor your loved one\'s recovery and receive alerts',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: FiActivity,
    color: 'from-purple-500 to-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'View patient trends, manage recovery plans, and intervene when needed',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const users = selectedRole ? getUsersByRole(selectedRole) : [];

  function handleLogin() {
    if (!selectedUser) return;
    const user = login(selectedUser);
    if (user) {
      router.push(`/${user.role}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white mb-4"
          >
            <FiShield className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl font-bold text-text mb-2">
            Recover<span className="text-primary">AI</span>
          </h1>
          <p className="text-text-light text-lg">Smart Post-Discharge Recovery Companion</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <motion.button
              key={role.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedRole(role.key); setSelectedUser(null); }}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === role.key
                  ? `${role.borderColor} ${role.bgLight} shadow-lg`
                  : 'border-border bg-white hover:shadow-md'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} text-white mb-4`}>
                <role.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-1">{role.label}</h3>
              <p className="text-sm text-text-light">{role.description}</p>
              {selectedRole === role.key && (
                <motion.div
                  layoutId="roleIndicator"
                  className={`absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br ${role.color}`}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* User Selection */}
        <AnimatePresence mode="wait">
          {selectedRole && (
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-text-light uppercase tracking-wider mb-4">
                Select Demo User
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {users.map((u) => (
                  <motion.button
                    key={u.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedUser(u.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedUser === u.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                      {u.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-text">{u.name}</div>
                      <div className="text-xs text-text-light">{u.email}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={!selectedUser}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                Continue to Dashboard <FiArrowRight />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
