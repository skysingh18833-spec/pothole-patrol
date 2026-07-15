/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Set at build time when producing an Android APK with Capacitor.
   * Must point to the deployed API server (e.g. https://your-app.replit.app).
   * Relative /api/* paths won't resolve inside a Capacitor WebView, so the
   * custom-fetch layer uses this value to prefix every request.
   *
   * Example:
   *   VITE_API_BASE_URL=https://your-app.replit.app \
   *     pnpm --filter @workspace/pothole-reporter run android:build
   */
  readonly VITE_API_BASE_URL?: string;
  readonly BASE_PATH: string;
  readonly PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
