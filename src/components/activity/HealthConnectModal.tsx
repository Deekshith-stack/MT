import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  HealthConnectStatus,
  openHealthConnectSettings,
} from '../../services/healthConnectService';
import {
  ShieldCheck,
  Footprints,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface HealthConnectModalProps {
  onClose: () => void;
}

export const HealthConnectModal: React.FC<HealthConnectModalProps> = ({ onClose }) => {
  const {
    healthState,
    setHealthConnectStatus,
    syncHealthSteps,
  } = useTracker();

  const [currentView, setCurrentView] = useState<'explanation' | 'status' | 'denied' | 'unavailable'>(
    healthState.status === 'denied'
      ? 'denied'
      : healthState.status === 'unavailable'
      ? 'unavailable'
      : healthState.status === 'connected'
      ? 'status'
      : 'explanation'
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async () => {
    setIsSyncing(true);
    setTimeout(async () => {
      setIsSyncing(false);
      setHealthConnectStatus('connected');
      await syncHealthSteps();
      setCurrentView('status');
    }, 600);
  };

  const handleDenySimulation = () => {
    setHealthConnectStatus('denied');
    setCurrentView('denied');
  };

  const handleUnavailableSimulation = () => {
    setHealthConnectStatus('unavailable');
    setCurrentView('unavailable');
  };

  const handleDisconnect = () => {
    setHealthConnectStatus('not_connected');
    setCurrentView('explanation');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '1.75rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--orange-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Footprints size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Health Connect</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Android Unified Health Data (2026)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* VIEW 1: EXPLANATION MODAL (Matching Section 8 of Prompt) */}
        {currentView === 'explanation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--primary-orange-light)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 122, 0, 0.25)',
                textAlign: 'center',
              }}
            >
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Connect your steps
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tracker Macros needs access to your step count so we can display your daily activity.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--primary-orange)',
                  marginTop: '0.75rem',
                }}
              >
                <ShieldCheck size={16} />
                <span>Your health data stays under your control.</span>
              </div>
            </div>

            <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Health Connect aggregates steps from your device sensor and connected fitness apps without using legacy Google Fit APIs. Only <strong>READ_STEPS</strong> permission is requested.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isSyncing}
                className="btn-primary"
                style={{ flex: 2, padding: '0.75rem' }}
              >
                <Footprints size={16} />
                <span>{isSyncing ? 'Connecting...' : 'Connect Steps'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CONNECTED STATUS (Matching Section 15 of Prompt) */}
        {currentView === 'status' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  HEALTH CONNECTIONS
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                  Connected
                </span>
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Steps
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Health Connect • Phone & Wearables
              </div>

              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Last synced: <strong style={{ color: 'var(--text-primary)' }}>{healthState.lastSynced}</strong>
                </span>
                <button
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncHealthSteps();
                    setTimeout(() => setIsSyncing(false), 400);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-orange)',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  Sync Now
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleDisconnect}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.8125rem' }}
              >
                Disconnect
              </button>
              <button
                onClick={openHealthConnectSettings}
                className="btn-primary"
                style={{ flex: 1.5, padding: '0.75rem', fontSize: '0.8125rem' }}
              >
                <ExternalLink size={15} />
                <span>Manage Access</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: PERMISSION DENIED (Matching Section 16 of Prompt) */}
        {currentView === 'denied' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <AlertCircle size={30} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Steps unavailable
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Tracker Macros doesn't have permission to read your steps.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleConnect}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Try Again
              </button>
              <button
                onClick={openHealthConnectSettings}
                className="btn-secondary"
                style={{ flex: 1.3, padding: '0.75rem' }}
              >
                Open Health Settings
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: HEALTH CONNECT UNAVAILABLE (Matching Section 17 of Prompt) */}
        {currentView === 'unavailable' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <AlertCircle size={30} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Health Connect isn't available
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Install or update Health Connect to connect your step data.
              </p>
            </div>

            <button
              onClick={openHealthConnectSettings}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <ExternalLink size={16} />
              <span>Set Up Health Connect</span>
            </button>
          </div>
        )}

        {/* Quick Simulator Bar for Desktop / Browser Testing */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>
            <Sliders size={12} />
            TEST PERMISSION STATES:
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => {
                setHealthConnectStatus('connected');
                setCurrentView('status');
              }}
              style={{
                flex: 1,
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.3rem',
                borderRadius: '6px',
                backgroundColor: healthState.status === 'connected' ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
                color: healthState.status === 'connected' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Connected
            </button>
            <button
              onClick={handleDisconnect}
              style={{
                flex: 1,
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.3rem',
                borderRadius: '6px',
                backgroundColor: healthState.status === 'not_connected' ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
                color: healthState.status === 'not_connected' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Not Connected
            </button>
            <button
              onClick={handleDenySimulation}
              style={{
                flex: 1,
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.3rem',
                borderRadius: '6px',
                backgroundColor: healthState.status === 'denied' ? '#EF4444' : 'var(--bg-card-subtle)',
                color: healthState.status === 'denied' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Denied
            </button>
            <button
              onClick={handleUnavailableSimulation}
              style={{
                flex: 1,
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.3rem',
                borderRadius: '6px',
                backgroundColor: healthState.status === 'unavailable' ? '#F59E0B' : 'var(--bg-card-subtle)',
                color: healthState.status === 'unavailable' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Unavailable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
