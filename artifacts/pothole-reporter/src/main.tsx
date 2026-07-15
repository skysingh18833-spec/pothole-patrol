import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// When built for Android with Capacitor the app is served from a local WebView
// origin (capacitor://localhost), so relative /api/* paths won't resolve to
// the real server. Set an explicit base URL at build time via the
// VITE_API_BASE_URL env var (e.g. your published Replit deployment URL).
//
// Example build command:
//   VITE_API_BASE_URL=https://your-app.replit.app \
//     pnpm --filter @workspace/pothole-reporter run build
//
// In normal web/dev mode this var is unset and relative paths work fine.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
