import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datalyst.app',
  appName: 'Datalyst',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
