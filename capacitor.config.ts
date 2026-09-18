import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackermacros.app',
  appName: 'Tracker Macros',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // Health Connect custom native plugin registration
    TrackerMacrosHealth: {
      enableHealthConnect: true,
      autoSyncOnResume: true,
    },
  },
};

export default config;
