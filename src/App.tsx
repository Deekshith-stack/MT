import React from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { FoodLog } from './pages/FoodLog';
import { AddFood } from './pages/AddFood';
import { TMAIChat } from './pages/TMAIChat';
import { Activity } from './pages/Activity';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { FoodConfirmationModal } from './components/food/FoodConfirmationModal';
import { HealthConnectModal } from './components/activity/HealthConnectModal';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    pendingConfirmation,
    setPendingConfirmation,
    isHealthConnectModalOpen,
    setIsHealthConnectModalOpen,
  } = useTracker();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'food':
        return <FoodLog />;
      case 'add':
        return <AddFood />;
      case 'tmai':
        return <TMAIChat />;
      case 'activity':
        return <Activity />;
      case 'progress':
        return <Progress />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="main-content">
        <Header />
        <main style={{ flex: 1 }}>
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <BottomNav />

      {/* Global TM AI Food Confirmation Modal */}
      {pendingConfirmation && (
        <FoodConfirmationModal
          item={pendingConfirmation}
          onClose={() => setPendingConfirmation(null)}
        />
      )}

      {/* Health Connect Modal (Explanation / Connection / Denial / Settings) */}
      {isHealthConnectModalOpen && (
        <HealthConnectModal
          onClose={() => setIsHealthConnectModalOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <TrackerProvider>
      <MainAppContent />
    </TrackerProvider>
  );
}

export default App;
