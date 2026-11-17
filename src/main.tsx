import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthGate } from '@/auth/AuthGate';
import { isAuthPopup } from '@/auth/msal';

// A Microsoft popup that ends up on the app URL must stay inert so the opener can read the response and close it.
if (!isAuthPopup()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthGate>{(session) => <App session={session} />}</AuthGate>
    </StrictMode>
  );
}
