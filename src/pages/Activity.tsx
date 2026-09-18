import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Footprints,
  Plus,
  Flame,
  Timer,
  MapPin,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import { formatSteps, formatKcal } from '../services/nutritionService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const Activity: React.FC = () => {
  const {
    today,
    user,
    addSteps,
    healthState,
    setIsHealthConnectModalOpen,
    syncHealthSteps,
  } = useTracker();

  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const steps = today.steps;
  const goal = user.stepGoal;
  const percentage = Math.min(100, Math.round((steps / goal) * 100));

  // Estimated stats based on steps
  const distanceKm = (steps * 0.00075).toFixed(2);
  const activityCaloriesBurned = Math.round(steps * 0.04);
  const activeMinutes = Math.round(steps / 130);

  const isConnected = healthState.status === 'connected';

  // Real-time walking simulator
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingWalk) {
      interval = setInterval(() => {
        addSteps(15);
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatingWalk, addSteps]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncHealthSteps();
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Past 7 Days Step Data
  const weeklyStepData = [
    { day: 'Sat', steps: 9400 },
    { day: 'Sun', steps: 8800 },
    { day: 'Mon', steps: 10450 },
    { day: 'Tue', steps: 11200 },
    { day: 'Wed', steps: 9100 },
    { day: 'Thu', steps: 10250 },
    { day: 'Today', steps: today.steps },
  ];

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Activity & Health Connect
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Powered by Android Health Connect — unified step aggregation from phone sensors and connected wearables
        </p>
      </div>

      {/* HEALTH CONNECT ARCHITECTURE BANNER (Section 13 & 15) */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 122, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--orange-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Footprints size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '800' }}>Health Connect</h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: isConnected ? 'var(--color-success)' : 'var(--color-warning)',
                    backgroundColor: isConnected ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  {isConnected ? '● Connected' : '○ Not Connected'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {isConnected
                  ? `Source: ${healthState.source} • Last synced: ${healthState.lastSynced}`
                  : 'Tap Connect Steps to authorize Android Health Connect'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isConnected && (
              <button
                onClick={handleManualSync}
                className="btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            )}
            <button
              onClick={() => setIsHealthConnectModalOpen(true)}
              className="btn-primary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <ExternalLink size={14} />
              <span>{isConnected ? 'Manage Access' : 'Connect Steps'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEPARATE CALORIE INDICATORS (Section 20: Food vs Activity) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-orange-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-orange)',
            }}
          >
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              FOOD NUTRITION (INTAKE)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {formatKcal(today.calories)}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>From logged meals</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E',
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              ACTIVITY EXPENDITURE (BURN)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#22C55E' }}>
              ~{activityCaloriesBurned}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Estimated movement burn</div>
          </div>
        </div>
      </div>

      {/* Main Step Metric Dial & Sub-metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-orange-light)',
              color: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Footprints size={36} />
          </div>

          <div style={{ fontSize: '2.75rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {formatSteps(steps)}
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            / {formatSteps(goal)} daily step goal
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              height: '10px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '999px',
              overflow: 'hidden',
              margin: '1.25rem 0 0.5rem',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: 'var(--primary-orange)',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-orange)' }}>
            {percentage}% achieved
          </span>

          {/* Quick Add Buttons & Walk Simulator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => addSteps(500)}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <Plus size={14} /> 500
            </button>
            <button
              onClick={() => addSteps(1000)}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <Plus size={14} /> 1,000
            </button>
            <button
              onClick={() => setIsSimulatingWalk(!isSimulatingWalk)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                borderRadius: '10px',
                fontWeight: '700',
                backgroundColor: isSimulatingWalk ? '#EF4444' : 'var(--primary-orange)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {isSimulatingWalk ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulatingWalk ? 'Stop Walk' : 'Simulate Walk'}</span>
            </button>
          </div>
        </div>

        {/* 2 Activity Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6',
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Estimated Distance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {distanceKm} <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>km</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22C55E',
              }}
            >
              <Timer size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Active Movement Time
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {activeMinutes} <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>mins</span>
              </div>
            </div>
          </div>

          {/* Android 14+ Health Connect Explanation Card */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="var(--primary-orange)" />
              2026 Health Architecture
            </div>
            Health Connect aggregates phone step sensors, wearables, and third-party apps directly into Tracker Macros with zero Google Fit API dependency.
          </div>
        </div>
      </div>

      {/* 7-Day Step History Chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', marginBottom: '0.85rem' }}>
          7-Day Step History
        </h3>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <ReferenceLine y={goal} stroke="#FF7A00" strokeDasharray="3 3" label={{ value: '10k Goal', fill: '#FF7A00', fontSize: 10 }} />
              <Bar dataKey="steps" fill="#FF7A00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
