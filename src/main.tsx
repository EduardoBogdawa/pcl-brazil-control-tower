import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AuthGate from '@/auth/AuthGate';

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthGate />
    </StrictMode>
  );
}

const hasAuthResponse = [window.location.hash.slice(1), window.location.search.slice(1)]
  .some((part) => new URLSearchParams(part).has('state'));

// Microsoft returns the sign-in/sign-out popup to this page; hand the response back to the
// window that opened it instead of booting the whole app inside the popup.
if (hasAuthResponse) {
  import('@azure/msal-browser/redirect-bridge')
    .then(({ broadcastResponseToMainFrame }) => broadcastResponseToMainFrame())
    .catch((err: unknown) => {
      console.error('[auth] could not hand off sign-in response', err);
      renderApp();
    });
} else {
  renderApp();
}
