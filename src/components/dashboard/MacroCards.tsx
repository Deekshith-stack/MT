import React from 'react';
import { useTracker } from '../../context/TrackerContext';

export const MacroCards: React.FC = () => {
  const { today, user } = useTracker();

  const macros = [
    {
      name: 'Protein',
      current: today.protein,
      goal: user.proteinGoal,
      unit: 'g',
      color: '#FF7A00',
      bgLight: 'rgba(255, 122, 0, 0.12)',
      description: 'Muscle synthesis',
    },
    {
      name: 'Carbs',
      current: today.carbs,
      goal: user.carbGoal,
      unit: 'g',
      color: '#3B82F6',
      bgLight: 'rgba(59, 130, 246, 0.12)',
      description: 'Daily energy',
    },
    {
      name: 'Fat',
      current: today.fat,
      goal: user.fatGoal,
      unit: 'g',
      color: '#F59E0B',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      description: 'Hormone balance',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      {macros.map(m => {
        const percentage = Math.min(100, Math.round((m.current / m.goal) * 100));

        return (
          <div
            key={m.name}
            className="card"
            style={{
              padding: '1.15rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Macro Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {m.name}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: m.color,
                  backgroundColor: m.bgLight,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                }}
              >
                {percentage}%
              </span>
            </div>

            {/* Current / Goal Numbers */}
            <div style={{ margin: '0.85rem 0 0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '1.375rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {Math.round(m.current)}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-tertiary)' }}>
                  /{m.goal}g
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: '999px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: m.color,
                  borderRadius: '999px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
