import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { formatSteps } from '../../services/nutritionService';
import { Footprints, ArrowRight, Plus, RefreshCw } from 'lucide-react';

export const StepCard: React.FC = () => {
  const {
    today,
    user,
    addSteps,
    setActiveTab,
    healthState,
    setIsHealthConnectModalOpen,
    syncHealthSteps,
  } = useTracker();

  const steps = today.steps;
  const goal = user.stepGoal;
  const percentage = Math.min(100, Math.round((steps / goal) * 100));

  // Activity burn calculation (kept separate from food calories)
  const estimatedActivityBurn = Math.round(steps * 0.04);

  const isConnected = healthState.status === 'connected';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 122, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-orange)',
            }}
          >
            <Footprints size={18} />
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
            Steps
          </span>
        </div>

        {/* Health Connect Status Badge / Trigger */}
        <button
          onClick={() => setIsHealthConnectModalOpen(true)}
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: isConnected ? 'var(--color-success-bg)' : 'var(--primary-orange-light)',
            color: isConnected ? 'var(--color-success)' : 'var(--primary-orange)',
            border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 122, 0, 0.25)'}`,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--color-success)' : 'var(--primary-orange)',
            }}
          />
          {isConnected ? 'Health Connect' : 'Connect Steps'}
        </button>
      </div>

      <div style={{ margin: '0.85rem 0 0.65rem' }}>
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
            {formatSteps(steps)}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-tertiary)' }}>
            / {formatSteps(goal)} steps
          </span>
        </div>

        {/* Separate activity burn indicator */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Activity Burn: <strong style={{ color: 'var(--text-primary)' }}>~{estimatedActivityBurn} kcal</strong>
          {isConnected && (
            <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>
              • Synced {healthState.lastSynced}
            </span>
          )}
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
            backgroundColor: 'var(--primary-orange)',
            borderRadius: '999px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Quick Add and View Activity Links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => addSteps(500)}
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Plus size={12} />
            500
          </button>
          <button
            onClick={() => addSteps(1000)}
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Plus size={12} />
            1k
          </button>
          {isConnected && (
            <button
              onClick={() => syncHealthSteps()}
              title="Sync steps now"
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--primary-orange)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.8125rem',
            fontWeight: '700',
            color: 'var(--primary-orange)',
          }}
        >
          View Activity <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
