import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { formatWaterLiters } from '../../services/nutritionService';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

export const WaterCard: React.FC = () => {
  const { today, user, addWater, resetWater } = useTracker();
  const [showCustom, setShowCustom] = useState(false);
  const [customMl, setCustomMl] = useState('300');

  const consumedMl = today.water;
  const goalMl = user.waterGoal;
  const percentage = Math.min(100, Math.round((consumedMl / goalMl) * 100));

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (!isNaN(val) && val > 0) {
      addWater(val);
      setShowCustom(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6',
            }}
          >
            <Droplets size={18} />
          </div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-secondary)',
            }}
          >
            Water Intake
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {percentage}%
          </span>
          <button
            onClick={resetWater}
            title="Reset water"
            style={{ color: 'var(--text-tertiary)', padding: '2px' }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Main Liter Count */}
      <div style={{ margin: '1rem 0 0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            💧 {formatWaterLiters(consumedMl)} L
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-tertiary)' }}>
            / {formatWaterLiters(goalMl)} L
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
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: '#3B82F6',
            borderRadius: '999px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Quick Add Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => addWater(250)}
          style={{
            flex: 1,
            fontSize: '0.8125rem',
            fontWeight: '700',
            padding: '0.45rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-orange)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            boxShadow: 'var(--shadow-orange)',
          }}
        >
          <Plus size={14} />
          250 ml
        </button>

        <button
          onClick={() => addWater(500)}
          style={{
            flex: 1,
            fontSize: '0.8125rem',
            fontWeight: '600',
            padding: '0.45rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          +500 ml
        </button>

        <button
          onClick={() => addWater(750)}
          style={{
            flex: 1,
            fontSize: '0.8125rem',
            fontWeight: '600',
            padding: '0.45rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          +750 ml
        </button>

        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            padding: '0.45rem 0.65rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <form
          onSubmit={handleAddCustom}
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '10px',
          }}
        >
          <input
            type="number"
            value={customMl}
            onChange={e => setCustomMl(e.target.value)}
            placeholder="ml"
            style={{
              width: '80px',
              padding: '0.35rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
};
