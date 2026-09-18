import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { exportBackupData, importBackupData, resetToDefaults } from '../services/storageService';
import {
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Footprints,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    user,
    updateUser,
    toggleDarkMode,
    healthState,
    setIsHealthConnectModalOpen,
  } = useTracker();

  const [exportNotice, setExportNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const isConnected = healthState.status === 'connected';

  const handleExport = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-macros-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        setImportNotice('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportNotice('Invalid backup file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the default Friday Sep 18 demo state?')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Configure app appearance, units, offline backup, and Health Connect permissions
        </p>
      </div>

      {exportNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontSize: '0.875rem',
            fontWeight: '700',
          }}
        >
          <Check size={18} />
          <span>Tracker Macros backup JSON downloaded successfully!</span>
        </div>
      )}

      {importNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-orange-light)',
            color: 'var(--primary-orange)',
            fontSize: '0.875rem',
            fontWeight: '700',
          }}
        >
          <Info size={18} />
          <span>{importNotice}</span>
        </div>
      )}

      {/* HEALTH CONNECTIONS (Section 15 of prompt) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
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
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-orange)' }}>
                HEALTH CONNECTIONS
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Steps
              </h3>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: isConnected ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
              color: isConnected ? 'var(--color-success)' : 'var(--color-warning)',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-warning)' }} />
            {isConnected ? '● Connected' : '○ Not connected'}
          </span>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Health Connect
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Last synced: <strong style={{ color: 'var(--text-primary)' }}>{healthState.lastSynced}</strong>
          </div>

          <button
            type="button"
            onClick={() => setIsHealthConnectModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '8px' }}
          >
            <ExternalLink size={13} />
            <span>{isConnected ? 'Manage Access' : 'Connect Health Data'}</span>
          </button>
        </div>
      </div>

      {/* GOOGLE PLAY REQUIREMENTS & HEALTH PRIVACY DISCLOSURE (Section 21) */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: '800' }}>
            Health Data Disclosure & Google Play Compliance
          </h3>
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Declaration of Health Data Usage:</strong>
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            "Tracker Macros reads step-count data from Health Connect solely to calculate and display the user's daily activity progress inside the app. No health or biometric data is shared with third parties or sold."
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.4rem 0' }}>
            <li><strong>Permission used:</strong> <code>android.permission.health.READ_STEPS</code> (Read-only).</li>
            <li><strong>Storage:</strong> Aggregated step totals are stored securely in local device storage.</li>
            <li><strong>Architecture:</strong> Android 14+ native on-device step sensor aggregation without legacy Google Fit API dependencies.</li>
          </ul>
        </div>
      </div>

      {/* Theme Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>
          Appearance & Theme
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-orange-light)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.darkMode ? <Moon size={22} /> : <Sun size={22} />}
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Dark Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Switch between signature Light and sleek Dark (#111111) theme
              </div>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={user.darkMode ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', borderRadius: '10px' }}
          >
            {user.darkMode ? 'Enabled (Dark)' : 'Disabled (Light)'}
          </button>
        </div>
      </div>

      {/* Unit System Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>
          Measurement Units
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => updateUser({ units: 'metric' })}
            style={{
              flex: 1,
              padding: '0.85rem',
              borderRadius: '12px',
              backgroundColor: user.units === 'metric' ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
              color: user.units === 'metric' ? '#FFFFFF' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: '700',
              fontSize: '0.875rem',
            }}
          >
            Metric (kg, cm, ml, g)
          </button>

          <button
            onClick={() => updateUser({ units: 'imperial' })}
            style={{
              flex: 1,
              padding: '0.85rem',
              borderRadius: '12px',
              backgroundColor: user.units === 'imperial' ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
              color: user.units === 'imperial' ? '#FFFFFF' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: '700',
              fontSize: '0.875rem',
            }}
          >
            Imperial (lbs, ft/in, oz)
          </button>
        </div>
      </div>

      {/* Offline Storage & Backup Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Offline Data & Storage</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            All your daily macros, steps, water, foods, and weight records are stored locally on your device.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            className="btn-secondary"
            style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', borderRadius: '10px' }}
          >
            <Download size={16} /> Export JSON Backup
          </button>

          <label
            className="btn-secondary"
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.8125rem',
              borderRadius: '10px',
              cursor: 'pointer',
              margin: 0,
            }}
          >
            <Upload size={16} /> Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={handleReset}
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.8125rem',
              borderRadius: '10px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RotateCcw size={16} /> Reset to Default Sample Data
          </button>
        </div>
      </div>

      {/* About TRACKER MACROS */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--primary-orange)" />
          <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>TRACKER MACROS v1.0.0 (Capacitor Android)</h4>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Smart Calories • Macros • Health Connect Steps • Water • TM AI Natural Language Nutrition Calculation.
          Built on Android Health Connect 2026 unified health architecture.
        </p>
      </div>
    </div>
  );
};
