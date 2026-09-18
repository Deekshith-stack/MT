import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { formatKcal } from '../../services/nutritionService';
import { Flame } from 'lucide-react';

export const CalorieRing: React.FC = () => {
  const { today, user } = useTracker();

  const consumed = today.calories;
  const goal = user.calorieGoal;
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));

  // Circular progress params
  const radius = 94;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.75rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Flame size={16} color="var(--primary-orange)" />
          Today's Calories
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            backgroundColor: percentage >= 100 ? 'var(--color-warning-bg)' : 'var(--primary-orange-light)',
            color: percentage >= 100 ? 'var(--color-warning)' : 'var(--primary-orange)',
          }}
        >
          {percentage}% of goal
        </span>
      </div>

      {/* Circular Progress SVG */}
      <div
        style={{
          position: 'relative',
          width: '220px',
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg height="220" width="220" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFB03A" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            stroke="var(--bg-card-subtle)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="110"
            cy="110"
          />

          {/* Progress circle with smooth transition */}
          <circle
            stroke="url(#orangeGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              strokeLinecap: 'round',
            }}
            r={normalizedRadius}
            cx="110"
            cy="110"
          />
        </svg>

        {/* Center Calorie Display */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            {formatKcal(consumed)}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginTop: '0.2rem',
            }}
          >
            kcal eaten
          </span>
        </div>
      </div>

      {/* Goal & Remaining Row */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-around',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Daily Goal
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatKcal(goal)}{' '}
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>kcal</span>
          </div>
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Remaining
          </div>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: remaining === 0 ? 'var(--color-warning)' : 'var(--primary-orange)',
            }}
          >
            {formatKcal(remaining)}{' '}
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
