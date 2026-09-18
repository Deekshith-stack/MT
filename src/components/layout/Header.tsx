import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Bell, Moon, Sun, Sparkles } from 'lucide-react';
import { NotificationModal } from './NotificationModal';

export const Header: React.FC = () => {
  const { user, unreadNotifsCount, toggleDarkMode, setActiveTab } = useTracker();
  const [showNotifs, setShowNotifs] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Formatted date (matching prompt "Friday, September 18" or active date)
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date('2026-09-18T10:00:00')); // seeded Friday, Sep 18

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 0.75rem',
          maxWidth: '1080px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            {getGreeting()}, {user.name} 👋
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: '500',
              marginTop: '0.15rem',
            }}
          >
            {formattedDate}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Quick AI shortcut on mobile header */}
          <button
            onClick={() => setActiveTab('tmai')}
            title="Ask TM AI"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '999px',
              background: 'var(--primary-orange-light)',
              color: 'var(--primary-orange)',
              fontSize: '0.8125rem',
              fontWeight: '700',
              border: '1px solid rgba(255, 122, 0, 0.25)',
            }}
          >
            <Sparkles size={14} />
            <span>TM AI</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            {user.darkMode ? <Sun size={18} color="#FF7A00" /> : <Moon size={18} />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotifs(true)}
            aria-label="Notifications"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: 'var(--primary-orange)',
                  boxShadow: '0 0 0 2px var(--bg-card)',
                }}
              />
            )}
          </button>
        </div>
      </header>

      {showNotifs && <NotificationModal onClose={() => setShowNotifs(false)} />}
    </>
  );
};
