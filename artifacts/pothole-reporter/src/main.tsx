import { createRoot } from 'react-dom/client';
import { Component, type ReactNode } from 'react';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// Top-level error boundary: catches render errors and shows a readable
// message instead of a blank white screen.
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#b91c1c' }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {err.message}
            {'\n'}
            {err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
