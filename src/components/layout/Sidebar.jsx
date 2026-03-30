'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiHome, FiActivity, FiClipboard, FiCalendar, FiHeart,
  FiUsers, FiAlertCircle, FiSettings, FiLogOut, FiShield,
  FiBarChart2, FiFileText
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

const navItems = {
  patient: [
    { href: '/patient', label: 'Dashboard', icon: FiHome },
    { href: '/patient/symptoms', label: 'Symptoms', icon: FiActivity },
    { href: '/patient/medications', label: 'Medications', icon: FiClipboard },
    { href: '/patient/recovery-plan', label: 'Recovery Plan', icon: FiCalendar },
  ],
  caregiver: [
    { href: '/caregiver', label: 'Dashboard', icon: FiHome },
    { href: '/caregiver', label: 'My Patients', icon: FiHeart, exact: false },
  ],
  doctor: [
    { href: '/doctor', label: 'Dashboard', icon: FiHome },
    { href: '/doctor', label: 'All Patients', icon: FiUsers, exact: false },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href={`/${user.role}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Recover<span className="text-blue-400">AI</span></h1>
              <p className="text-xs text-slate-400 capitalize">{user.role} Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = item.exact === false
              ? pathname.startsWith(item.href)
              : pathname === item.href;

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

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-semibold">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-sidebar-hover hover:text-white transition-all w-full"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
