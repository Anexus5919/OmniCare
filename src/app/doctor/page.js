'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp, FiCheckCircle,
  FiChevronRight, FiEye
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import StatCard from '@/components/common/StatCard';
import ProgressRing from '@/components/common/ProgressRing';
import SymptomChart from '@/components/patient/SymptomChart';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientsByIds, getAlerts, getSymptomLogsByPatient,
  getMedicationsByPatient, getRecoveryPlanByPatient, acknowledgeAlert
} from '@/services/storageService';
import { computeRecoveryScore } from '@/utils/recoveryScoring';
import { daysSince, getRelativeTime, formatDate } from '@/utils/dateHelpers';

const PIE_COLORS = ['#2a9d8f', '#1e6bb8', '#f4a261', '#e63946'];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!user?.assignedPatients) return;
    const pats = getPatientsByIds(user.assignedPatients).map(pat => {
      const logs = getSymptomLogsByPatient(pat.id);
      const meds = getMedicationsByPatient(pat.id);
      const plan = getRecoveryPlanByPatient(pat.id);
      const allTasks = plan?.phases.flatMap(p => p.tasks) || [];
      const score = computeRecoveryScore(pat, logs, meds, allTasks);
      const latestLog = logs[logs.length - 1];
      return { ...pat, logs, meds, plan, score, latestLog };
    });
    setPatients(pats);
    if (pats.length > 0) setSelectedPatient(pats[0].id);

    const allAlerts = getAlerts().filter(a => pats.some(p => p.id === a.patientId));
    setAlerts(allAlerts);
  }, [user]);

  const unackAlerts = alerts.filter(a => !a.acknowledged);
  const criticalCount = unackAlerts.filter(a => a.severity === 'critical').length;

  // Risk distribution for pie chart
  const riskData = [
    { name: 'Low', value: patients.filter(p => p.riskLevel === 'low').length },
    { name: 'Medium', value: patients.filter(p => p.riskLevel === 'medium').length },
    { name: 'High', value: patients.filter(p => p.riskLevel === 'high').length },
  ].filter(d => d.value > 0);

  // Recovery scores for bar chart
  const scoreData = patients.map(p => ({
    name: p.name.split(' ')[0],
    score: p.score,
  }));

  function handleAcknowledge(alertId) {
    acknowledgeAlert(alertId, user.id);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }

  const selected = patients.find(p => p.id === selectedPatient);

  return (
    <AppLayout title="Doctor Dashboard" requiredRole="doctor">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Total Patients" value={patients.length} color="text-primary" bgColor="bg-primary-light" />
          <StatCard icon={FiAlertTriangle} label="Active Alerts" value={unackAlerts.length} color="text-danger" bgColor="bg-red-50" />
          <StatCard icon={FiActivity} label="Critical" value={criticalCount} color="text-red-600" bgColor="bg-red-50" />
          <StatCard icon={FiTrendingUp} label="Avg Recovery" value={`${patients.length > 0 ? Math.round(patients.reduce((s, p) => s + p.score, 0) / patients.length) : 0}%`} color="text-secondary" bgColor="bg-secondary-light" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-text mb-4">Recovery Scores</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="score" fill="#1e6bb8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-text mb-4">Risk Distribution</h3>
            <div style={{ height: 220 }} className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {riskData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Patient table + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients table */}
          <Card className="lg:col-span-2" padding="p-0">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-text">Patient Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-5 text-text-light font-medium">Patient</th>
                    <th className="text-left py-3 px-3 text-text-light font-medium">Condition</th>
                    <th className="text-center py-3 px-3 text-text-light font-medium">Day</th>
                    <th className="text-center py-3 px-3 text-text-light font-medium">Score</th>
                    <th className="text-center py-3 px-3 text-text-light font-medium">Risk</th>
                    <th className="text-center py-3 px-3 text-text-light font-medium">Pain</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(pat => (
                    <tr
                      key={pat.id}
                      onClick={() => setSelectedPatient(pat.id)}
                      className={`border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${selectedPatient === pat.id ? 'bg-primary-light/50' : ''}`}
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-xs font-semibold">
                            {pat.avatar}
                          </div>
                          <span className="font-medium text-text">{pat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-light">{pat.condition}</td>
                      <td className="py-3 px-3 text-center">{daysSince(pat.dischargeDate)}</td>
                      <td className="py-3 px-3 text-center font-semibold text-primary">{pat.score}</td>
                      <td className="py-3 px-3 text-center"><Badge variant={pat.riskLevel}>{pat.riskLevel}</Badge></td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-medium ${(pat.latestLog?.painLevel || 0) > 6 ? 'text-red-600' : 'text-text'}`}>
                          {pat.latestLog?.painLevel || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-3"><FiChevronRight className="w-4 h-4 text-text-light" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Alerts panel */}
          <Card padding="p-0">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-text">Recent Alerts</h3>
              <Badge variant={unackAlerts.length > 0 ? 'warning' : 'success'}>
                {unackAlerts.length} active
              </Badge>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alerts.slice(0, 8).map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-border/50 ${alert.acknowledged ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={alert.severity}>{alert.severity}</Badge>
                        <span className="text-xs text-text-light">{getRelativeTime(alert.timestamp)}</span>
                      </div>
                      <p className="text-sm font-medium text-text">{alert.title}</p>
                      <p className="text-xs text-text-light mt-0.5">{alert.message}</p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-muted"
                        title="Acknowledge"
                      >
                        <FiCheckCircle className="w-4 h-4 text-secondary" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected patient detail */}
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SymptomChart logs={selected.logs} />
            </div>
            <Card>
              <h3 className="font-semibold text-text mb-4">{selected.name}</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing score={selected.score} size={110} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-light">Age</span><span>{selected.age}</span></div>
                <div className="flex justify-between"><span className="text-text-light">Surgery</span><span>{selected.surgeryType}</span></div>
                <div className="flex justify-between"><span className="text-text-light">Discharge</span><span>{formatDate(selected.dischargeDate)}</span></div>
                <div className="flex justify-between"><span className="text-text-light">Blood Group</span><span>{selected.bloodGroup}</span></div>
                <div className="flex justify-between"><span className="text-text-light">Allergies</span><span>{selected.allergies?.join(', ') || 'None'}</span></div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
