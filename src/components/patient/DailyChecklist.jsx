'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';
import Card from '@/components/common/Card';
import { toggleTask, getRecoveryPlanByPatient } from '@/services/storageService';
import { useLanguage } from '@/context/LanguageContext';

const categoryColors = {
  exercise: 'bg-blue-100 text-blue-700',
  wound_care: 'bg-red-100 text-red-700',
  diet: 'bg-emerald-100 text-emerald-700',
  medication: 'bg-purple-100 text-purple-700',
  rest: 'bg-amber-100 text-amber-700',
  follow_up: 'bg-indigo-100 text-indigo-700',
};

export default function DailyChecklist({ plan: initialPlan }) {
  const { t } = useLanguage();
  const [plan, setPlan] = useState(initialPlan);

  const handleToggle = useCallback((taskId) => {
    if (!plan) return;
    const activePhase = plan.phases.find(p => p.status === 'active');
    if (!activePhase) return;

    toggleTask(plan.id, activePhase.id, taskId);

    // Re-read fresh data from localStorage
    const freshPlan = getRecoveryPlanByPatient(plan.patientId);
    if (freshPlan) setPlan(freshPlan);
  }, [plan]);

  if (!plan) return null;

  const activePhase = plan.phases.find(p => p.status === 'active');
  if (!activePhase) return null;

  const completed = activePhase.tasks.filter(t => t.completed).length;
  const pending = activePhase.tasks.filter(t => t.pendingApproval).length;
  const total = activePhase.tasks.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">{t('todaysTasks')}</h3>
        <span className="text-sm text-text-light">{completed}/{total} {t('done')}{pending > 0 ? ` • ${pending} pending` : ''}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-secondary to-emerald-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="space-y-2">
        {activePhase.tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => !task.completed && !task.pendingApproval && handleToggle(task.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              task.completed ? 'bg-emerald-50' : task.pendingApproval ? 'bg-amber-50' : 'bg-muted hover:bg-slate-100'
            }`}
          >
            {task.completed ? (
              <FiCheckCircle className="w-5 h-5 text-secondary shrink-0" />
            ) : task.pendingApproval ? (
              <FiClock className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <FiCircle className="w-5 h-5 text-text-light shrink-0" />
            )}
            <span className={`text-sm flex-1 ${task.completed ? 'line-through text-text-light' : task.pendingApproval ? 'text-amber-700' : 'text-text'}`}>
              {task.title}
              {task.pendingApproval && <span className="ml-2 text-[10px] text-amber-500 font-medium">awaiting approval</span>}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[task.category] || 'bg-slate-100 text-slate-600'}`}>
              {task.category.replace('_', ' ')}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
