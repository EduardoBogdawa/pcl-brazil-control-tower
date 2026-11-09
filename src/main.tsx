import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import SignInScreen from '@/auth/SignInScreen';
import { PopupCallbackScreen, PopupRelayScreen } from '@/auth/PopupScreens';
import { isPopupAuthResponse, isPopupRelayPage } from '@/auth/popupBridge';
import { missingConfig } from '@/config/appConfig';
import '@/control-tower/control-tower.css';

// Loaded only when configuration is complete, so the database client is never created with empty settings.
const AuthGate = lazy(() => import('@/auth/AuthGate'));

// Apply the saved theme before first paint so the sign-in screen matches the dashboard.
try {
  const theme = localStorage.getItem('ct-theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    if (theme === 'nexteer') document.documentElement.setAttribute('data-palette', 'nexteer');
  }
} catch { /* preference is optional */ }

function Root() {
  // Decided once at load: the URL is rewritten by the callback, so it must not be re-checked on re-render.
  if (isPopupRelayPage()) return <PopupRelayScreen />;
  if (isPopupAuthResponse()) return <PopupCallbackScreen />;
  const missing = missingConfig();
  if (missing.length) {
    console.error('[config] missing runtime settings:', missing.join(', '));
    return <SignInScreen state="missing-config" missing={missing} />;
  }
  return (
    <Suspense fallback={<SignInScreen state="loading" />}>
      <AuthGate />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
