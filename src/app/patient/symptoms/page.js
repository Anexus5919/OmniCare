'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiActivity } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import SymptomChart from '@/components/patient/SymptomChart';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { useAuth } from '@/context/AuthContext';
import { useSymptomAnalysis } from '@/hooks/useSymptomAnalysis';
import { useNotifications } from '@/context/NotificationContext';
import { getSymptomLogsByPatient, addSymptomLog } from '@/services/storageService';
import { formatDateTime } from '@/utils/dateHelpers';

const defaultLog = {
  painLevel: 3,
  swelling: 2,
  mobility: 5,
  mood: 6,
  temperature: 98.4,
  fatigue: 4,
  appetite: 6,
  breathing: 8,
  notes: '',
};

function Slider({ label, value, onChange, max = 10, icon }) {
  const pct = (value / max) * 100;
  const color = label === 'Pain Level' || label === 'Swelling' || label === 'Fatigue'
    ? (value > 7 ? '#e63946' : value > 4 ? '#f4a261' : '#2a9d8f')
    : (value > 7 ? '#2a9d8f' : value > 4 ? '#f4a261' : '#e63946');

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-light">{icon} {label}</span>
        <span className="font-semibold" style={{ color }}>{value}/{max}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />
    </div>
  );
}

export default function SymptomPage() {
  const { user } = useAuth();
  const { analyzeSymptoms } = useSymptomAnalysis();
  const { addToast } = useNotifications();
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(defaultLog);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.patientId) {
      setLogs(getSymptomLogsByPatient(user.patientId));
    }
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    const newLog = {
      ...form,
      patientId: user.patientId,
      timestamp: new Date().toISOString(),
      flagged: false,
    };
    const updatedLogs = addSymptomLog(newLog);
    const patientLogs = updatedLogs.filter(l => l.patientId === user.patientId);
    setLogs(patientLogs);

    const alerts = analyzeSymptoms(user.patientId, patientLogs);
    if (alerts.length > 0) {
      alerts.forEach(a => addToast(a.title, a.severity === 'critical' ? 'error' : 'warning'));
    } else {
      addToast('Symptoms logged successfully', 'success');
    }

    setForm(defaultLog);
    setShowForm(false);
  }

  return (
    <AppLayout title="Symptom Tracking" requiredRole="patient">
      <div className="space-y-6">
        {/* Log button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-medium shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            New Check-in
          </motion.button>
        </div>

        {/* Symptom form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <h3 className="font-semibold text-text mb-4">Daily Symptom Check-in</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Slider icon="🔴" label="Pain Level" value={form.painLevel} onChange={v => setForm(p => ({ ...p, painLevel: v }))} />
                  <Slider icon="💧" label="Swelling" value={form.swelling} onChange={v => setForm(p => ({ ...p, swelling: v }))} />
                  <Slider icon="🚶" label="Mobility" value={form.mobility} onChange={v => setForm(p => ({ ...p, mobility: v }))} />
                  <Slider icon="😊" label="Mood" value={form.mood} onChange={v => setForm(p => ({ ...p, mood: v }))} />
                  <Slider icon="😴" label="Fatigue" value={form.fatigue} onChange={v => setForm(p => ({ ...p, fatigue: v }))} />
                  <Slider icon="🍽️" label="Appetite" value={form.appetite} onChange={v => setForm(p => ({ ...p, appetite: v }))} />
                  <Slider icon="💨" label="Breathing Ease" value={form.breathing} onChange={v => setForm(p => ({ ...p, breathing: v }))} />
                  <div className="space-y-2">
                    <label className="text-sm text-text-light">🌡️ Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="95"
                      max="106"
                      value={form.temperature}
                      onChange={e => setForm(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-light block mb-1">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Any additional observations..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-medium"
                  >
                    Submit Check-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 bg-muted text-text-light rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Chart */}
        <SymptomChart logs={logs} />

        {/* History */}
        <Card>
          <h3 className="font-semibold text-text mb-4">Symptom History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-light">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-center py-2 px-2">Pain</th>
                  <th className="text-center py-2 px-2">Mobility</th>
                  <th className="text-center py-2 px-2">Mood</th>
                  <th className="text-center py-2 px-2">Temp</th>
                  <th className="text-center py-2 px-2">Fatigue</th>
                </tr>
              </thead>
              <tbody>
                {[...logs].reverse().slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2.5 pr-4 text-text">{formatDateTime(log.timestamp)}</td>
                    <td className="text-center py-2.5 px-2">
                      <span className={`font-medium ${log.painLevel > 6 ? 'text-red-600' : log.painLevel > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {log.painLevel}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2">{log.mobility}</td>
                    <td className="text-center py-2.5 px-2">{log.mood}</td>
                    <td className="text-center py-2.5 px-2">{log.temperature}°F</td>
                    <td className="text-center py-2.5 px-2">{log.fatigue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
