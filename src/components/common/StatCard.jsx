'use client';

import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sublabel, color = 'text-primary', bgColor = 'bg-primary-light' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-light mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sublabel && <p className="text-xs text-text-light mt-1">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
