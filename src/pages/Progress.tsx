import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  TrendingUp,
  Scale,
  Plus,
  Target,
  Calendar,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export const Progress: React.FC = () => {
  const { user, weightHistory, addWeightEntry, today } = useTracker();
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('64.7');
  const [newNote, setNewNote] = useState('');

  // Weekly Nutrition Trend Data (Mon-Fri)
  const calorieTrendData = [
    { day: 'Mon', calories: 1920, protein: 98, carbs: 210, fat: 58 },
    { day: 'Tue', calories: 2050, protein: 112, carbs: 230, fat: 62 },
    { day: 'Wed', calories: 1880, protein: 91, carbs: 205, fat: 55 },
    { day: 'Thu', calories: 1960, protein: 105, carbs: 215, fat: 60 },
    { day: 'Fri (Today)', calories: today.calories, protein: today.protein, carbs: today.carbs, fat: today.fat },
  ];

  // Weight progression data
  const weightChartData = weightHistory.map(w => ({
    date: w.date.replace('2026-', ''),
    weight: w.weight,
    target: user.targetWeight,
  }));

  const currentWeight = user.weight;
  const targetWeight = user.targetWeight;
  const totalToLose = (currentWeight - targetWeight).toFixed(1);
  const startWeight = 65.4;
  const lostSoFar = (startWeight - currentWeight).toFixed(1);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 20) {
      addWeightEntry({
        date: new Date().toISOString().split('T')[0],
        weight: w,
        note: newNote || 'Check-in',
      });
      setShowAddWeight(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Progress & Analytics
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Review daily calorie trends, macro balances, and weight loss milestone trajectory
        </p>
      </div>

      {/* Weight Tracking Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--orange-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Weight Tracking</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Target: {targetWeight} kg • {lostSoFar} kg dropped since baseline
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddWeight(true)}
            className="btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
          >
            <Plus size={14} /> Log Weight
          </button>
        </div>

        {/* Current vs Target Indicators */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              CURRENT WEIGHT
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentWeight} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kg</span>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'var(--primary-orange-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-orange)' }}>
              TARGET
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-orange)', marginTop: '0.2rem' }}>
              {targetWeight} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kg</span>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              REMAINING TO GOAL
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {totalToLose} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kg</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar 65kg -> 60kg */}
        <div style={{ margin: '0.5rem 0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            <span>Start: {startWeight} kg</span>
            <span style={{ color: 'var(--primary-orange)' }}>Current: {currentWeight} kg</span>
            <span>Target: {targetWeight} kg 🎯</span>
          </div>
          <div style={{ height: '10px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(10, (parseFloat(lostSoFar) / (startWeight - targetWeight)) * 100))}%`,
                height: '100%',
                backgroundColor: 'var(--primary-orange)',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>

        {/* Weight Trajectory Chart */}
        <div style={{ width: '100%', height: '220px', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                }}
              />
              <ReferenceLine y={user.targetWeight} stroke="#22C55E" strokeDasharray="3 3" label={{ value: 'Target 60kg', fill: '#22C55E', fontSize: 11 }} />
              <Line type="monotone" dataKey="weight" stroke="#FF7A00" strokeWidth={3} dot={{ r: 5, fill: '#FF7A00' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weight History Table */}
        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Recent Weigh-ins:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {weightHistory.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {item.weight} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calories & Protein Trends (Monday - Friday) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Calorie Trend */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: '800' }}>Weekly Calories</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Goal: {user.calorieGoal} kcal</span>
          </div>

          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                  }}
                />
                <ReferenceLine y={user.calorieGoal} stroke="#FF7A00" strokeDasharray="3 3" />
                <Bar dataKey="calories" fill="#FF7A00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protein Trend */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: '800' }}>Average Protein</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Goal: {user.proteinGoal}g</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { day: 'Monday', amount: 98, pct: 81 },
              { day: 'Tuesday', amount: 112, pct: 93 },
              { day: 'Wednesday', amount: 91, pct: 75 },
              { day: 'Thursday', amount: 105, pct: 87 },
              { day: 'Friday (Today)', amount: Math.round(today.protein), pct: Math.min(100, Math.round((today.protein / user.proteinGoal) * 100)) },
            ].map(item => (
              <div key={item.day}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.day}</span>
                  <span style={{ color: 'var(--primary-orange)', fontWeight: '700' }}>{item.amount}g ({item.pct}%)</span>
                </div>
                <div style={{ height: '7px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', backgroundColor: 'var(--primary-orange)', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showAddWeight && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowAddWeight(false)}
        >
          <form
            onSubmit={handleSaveWeight}
            className="card animate-fade-in"
            style={{ width: '100%', maxWidth: '380px', padding: '1.5rem', backgroundColor: 'var(--bg-card)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>Log New Weigh-in</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Note
              </label>
              <input
                type="text"
                placeholder="e.g. Fasted morning weight"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowAddWeight(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.7rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: '0.7rem' }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
