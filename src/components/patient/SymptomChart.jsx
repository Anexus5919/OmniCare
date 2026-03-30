'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '@/components/common/Card';
import { getDayOfWeek } from '@/utils/dateHelpers';
import { useLanguage } from '@/context/LanguageContext';

export default function SymptomChart({ logs, compact = false }) {
  const { t } = useLanguage();

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold text-text mb-2">{t('symptomTrends')}</h3>
        <p className="text-sm text-text-light">{t('noSymptomData')}</p>
      </Card>
    );
  }

  const chartData = logs.slice(-7).map((log) => ({
    date: getDayOfWeek(log.timestamp),
    Pain: log.painLevel,
    Mobility: log.mobility,
    Mood: log.mood,
    Fatigue: log.fatigue,
  }));

  return (
    <Card>
      <h3 className="font-semibold text-text mb-4">{t('symptomTrends')}</h3>
      <div style={{ height: compact ? 200 : 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              }}
            />
            {!compact && <Legend />}
            <Line type="monotone" dataKey="Pain" stroke="#e63946" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Mobility" stroke="#2a9d8f" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Mood" stroke="#457b9d" strokeWidth={2} dot={{ r: 4 }} />
            {!compact && <Line type="monotone" dataKey="Fatigue" stroke="#f4a261" strokeWidth={2} dot={{ r: 4 }} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
