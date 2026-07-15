import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roaddamagereporter.app',
  appName: 'Road Damage Reporter',
  // Points at the Vite build output directory
  webDir: 'dist/public',
  server: {
    // Use https scheme in Android WebView so camera/GPS permissions work
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content only in debug builds; production enforces HTTPS
    allowMixedContent: false,
  },
};

export default config;
