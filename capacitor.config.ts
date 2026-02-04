import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datalyst.app',
  appName: 'Datalyst',
  webDir: 'out',
  server: {
    url: 'https://datalyst.app',
    cleartext: true
  }
};

export default config;
