import React from 'react';
import { useTracker, AppPage } from '../../context/TrackerContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  Footprints,
  TrendingUp,
  User,
  Settings,
  Flame,
  Plus,
} from 'lucide-react';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, today } = useTracker();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'food', label: 'Food Log', icon: <UtensilsCrossed size={20} /> },
    { id: 'tmai', label: 'TM AI Assistant', icon: <Sparkles size={20} /> },
    { id: 'activity', label: 'Activity', icon: <Footprints size={20} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={20} /> },
    { id: 'profile', label: 'Profile & Targets', icon: <User size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'none',
        flexDirection: 'column',
        padding: '1.5rem 1.25rem',
        zIndex: 50,
      }}
      className="desktop-sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
        onClick={() => setActiveTab('home')}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--orange-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-orange)',
          }}
        >
          <Flame size={24} fill="#FFFFFF" />
        </div>
        <div>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: '800',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            TRACKER
            <span style={{ display: 'block', color: 'var(--primary-orange)' }}>MACROS</span>
          </h2>
        </div>
      </div>

      {/* Quick Add Food Button */}
      <div style={{ margin: '1.25rem 0 1rem' }}>
        <button
          onClick={() => setActiveTab('add')}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9375rem' }}
        >
          <Plus size={18} />
          <span>+ Add Food</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--primary-orange)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-orange-light)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255, 122, 0, 0.25)' : 'transparent'}`,
                textAlign: 'left',
              }}
            >
              <span style={{ color: isActive ? 'var(--primary-orange)' : 'currentColor' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mini Profile Card at Bottom */}
      <div
        onClick={() => setActiveTab('profile')}
        style={{
          padding: '0.85rem',
          borderRadius: '14px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--orange-gradient)',
            color: '#fff',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
          }}
        >
          {user.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {user.weight} kg → {user.targetWeight} kg
          </div>
        </div>
      </div>
    </aside>
  );
};
