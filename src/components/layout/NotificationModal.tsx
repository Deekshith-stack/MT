import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { X, CheckCheck, Bell, Sparkles, Droplets, Footprints } from 'lucide-react';

interface NotificationModalProps {
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useTracker();

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('water') || title.toLowerCase().includes('hydration')) {
      return <Droplets size={18} color="#3B82F6" />;
    }
    if (title.toLowerCase().includes('step')) {
      return <Footprints size={18} color="#FF7A00" />;
    }
    return <Sparkles size={18} color="#22C55E" />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
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
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.85rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--primary-orange)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={clearAllNotifications}
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-orange)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <p>No notifications right now</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: n.read ? 'var(--bg-card-subtle)' : 'var(--primary-orange-light)',
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : 'rgba(255, 122, 0, 0.25)'}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(n.title)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
