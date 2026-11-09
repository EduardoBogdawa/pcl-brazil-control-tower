import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AuthGate from '@/auth/AuthGate';
import { PopupCallbackScreen, PopupRelayScreen } from '@/auth/PopupScreens';
import { isPopupAuthResponse, isPopupRelayPage } from '@/auth/popupBridge';

// Apply the saved theme before first paint so the sign-in screen matches the dashboard.
try {
  const theme = localStorage.getItem('ct-theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    if (theme === 'nexteer') document.documentElement.setAttribute('data-palette', 'nexteer');
  }
} catch { /* preference is optional */ }

// Decided once at load: the URL is rewritten by the callback, so it must not be re-checked on re-render.
const Screen = isPopupRelayPage() ? PopupRelayScreen : isPopupAuthResponse() ? PopupCallbackScreen : AuthGate;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Screen />
  </StrictMode>
);
