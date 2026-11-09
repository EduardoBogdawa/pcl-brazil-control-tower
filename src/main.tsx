import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AuthGate from '@/auth/AuthGate';

// Apply the saved theme before first paint so the sign-in screen matches the dashboard.
try {
  const theme = localStorage.getItem('ct-theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    if (theme === 'nexteer') document.documentElement.setAttribute('data-palette', 'nexteer');
  }
} catch { /* preference is optional */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>
);
