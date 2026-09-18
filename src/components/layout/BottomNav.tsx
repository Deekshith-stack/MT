import React from 'react';
import { useTracker, AppPage } from '../../context/TrackerContext';
import { Home, UtensilsCrossed, Sparkles, Footprints, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useTracker();

  const items: { id: AppPage; label: string; icon: React.ReactNode; isCenter?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Home size={22} /> },
    { id: 'food', label: 'Food', icon: <UtensilsCrossed size={22} /> },
    { id: 'tmai', label: 'TM AI', icon: <Sparkles size={22} />, isCenter: true },
    { id: 'activity', label: 'Activity', icon: <Footprints size={22} /> },
    { id: 'profile', label: 'Profile', icon: <User size={22} /> },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '68px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.5rem',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
      }}
      className="mobile-bottom-nav"
    >
      {items.map(item => {
        const isActive = activeTab === item.id;

        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label="TM AI Assistant"
              style={{
                position: 'relative',
                top: '-12px',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--orange-gradient)',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-orange)',
                border: '3px solid var(--bg-card)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Sparkles size={24} />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '0.4rem 0.6rem',
              color: isActive ? 'var(--primary-orange)' : 'var(--text-secondary)',
              fontWeight: isActive ? '700' : '500',
              fontSize: '0.6875rem',
              minWidth: '58px',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
