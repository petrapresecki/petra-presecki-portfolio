import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Analytics, session replay and error tracking, only where a project key is set (.env.production).
// Loaded as its own chunk so it never delays the first paint. Memory persistence keeps it free of
// cookies and local storage, so the site needs no consent banner. Replay stays off on phones: on top
// of the ASCII canvas it was enough to get the page killed in iOS in-app browsers.
const posthogKey = import.meta.env.VITE_POSTHOG_KEY
if (posthogKey) {
  void import('posthog-js').then(({ default: posthog }) =>
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      defaults: '2025-05-24',
      persistence: 'memory',
      capture_exceptions: true,
      disable_session_recording: matchMedia('(pointer: coarse)').matches,
      disable_surveys: true,
    }),
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
