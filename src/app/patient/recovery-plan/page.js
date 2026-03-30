'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ProgressRing from '@/components/common/ProgressRing';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { useAuth } from '@/context/AuthContext';
import { getRecoveryPlanByPatient, getPatientById, toggleTask } from '@/services/storageService';

const statusConfig = {
  completed: { color: 'bg-emerald-500', lineColor: 'border-emerald-300', icon: FiCheckCircle },
  active: { color: 'bg-primary', lineColor: 'border-primary/30', icon: FiClock },
  upcoming: { color: 'bg-slate-300', lineColor: 'border-slate-200', icon: FiCircle },
};

export default function RecoveryPlanPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [patient, setPatient] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (user?.patientId) {
      setPlan(getRecoveryPlanByPatient(user.patientId));
      setPatient(getPatientById(user.patientId));
    }
  }, [user]);

  useEffect(() => {
    if (plan) {
      const activeIdx = plan.phases.findIndex(p => p.status === 'active');
      if (activeIdx >= 0) setExpandedPhase(plan.phases[activeIdx].id);
    }
  }, [plan]);

  if (!plan) return <AppLayout title="Recovery Plan" requiredRole="patient"><div /></AppLayout>;

  const allTasks = plan.phases.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const overallProgress = Math.round((completedTasks / allTasks.length) * 100);

  function handleToggle(phaseId, taskId) {
    toggleTask(plan.id, phaseId, taskId);
    setPlan(getRecoveryPlanByPatient(user.patientId));
  }

  return (
    <AppLayout title="Recovery Plan" requiredRole="patient">
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center md:col-span-1">
            <ProgressRing score={overallProgress} size={140} />
            <p className="text-sm text-text-light mt-2">{completedTasks}/{allTasks.length} tasks done</p>
          </Card>
          <Card className="md:col-span-2">
            <h3 className="font-semibold text-text mb-3">Plan Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-light">Surgery Type</p>
                <p className="font-medium text-text">{plan.surgeryType}</p>
              </div>
              <div>
                <p className="text-text-light">Duration</p>
                <p className="font-medium text-text">{plan.totalWeeks} weeks</p>
              </div>
              <div>
                <p className="text-text-light">Discharge Date</p>
                <p className="font-medium text-text">{patient?.dischargeDate}</p>
              </div>
              <div>
                <p className="text-text-light">Total Phases</p>
                <p className="font-medium text-text">{plan.phases.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {plan.phases.map((phase, idx) => {
            const config = statusConfig[phase.status];
            const Icon = config.icon;
            const isExpanded = expandedPhase === phase.id;
            const phaseDone = phase.tasks.filter(t => t.completed).length;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card padding="p-0" className="overflow-hidden">
                  {/* Phase header */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {idx < plan.phases.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 border-l-2 ${config.lineColor}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text">{phase.name}</h3>
                        <Badge variant={phase.status}>{phase.status}</Badge>
                      </div>
                      <p className="text-sm text-text-light">{phase.description}</p>
                      <p className="text-xs text-text-light mt-1">Week {phase.weekStart}-{phase.weekEnd} &middot; {phaseDone}/{phase.tasks.length} tasks</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-20 hidden sm:block">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`}
                          style={{ width: `${(phaseDone / phase.tasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? <FiChevronUp className="w-5 h-5 text-text-light" /> : <FiChevronDown className="w-5 h-5 text-text-light" />}
                  </button>

                  {/* Tasks */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      className="border-t border-border px-5 py-3 space-y-2"
                    >
                      {phase.tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ x: 4 }}
                          onClick={() => handleToggle(phase.id, task.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            task.completed ? 'bg-emerald-50' : 'hover:bg-muted'
                          }`}
                        >
                          {task.completed ? (
                            <FiCheckCircle className="w-5 h-5 text-secondary shrink-0" />
                          ) : (
                            <FiCircle className="w-5 h-5 text-text-light shrink-0" />
                          )}
                          <span className={`text-sm ${task.completed ? 'line-through text-text-light' : 'text-text'}`}>
                            {task.title}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
