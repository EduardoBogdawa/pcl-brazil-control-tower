import { useEffect, useRef, useState } from 'react';
import { InteractionStatus, type PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import App from '@/App';
import SignInScreen from '@/auth/SignInScreen';
import { authConfigured, authDevMode, createMsal, pickAccount, signIn, signOut } from '@/auth/msal';
import type { AppUser } from '@/auth/types';

const DEV_USER: AppUser = { name: 'Dev Mode', email: 'dev@localhost', devMode: true };

export default function AuthGate() {
  if (authDevMode) return <App user={DEV_USER} />;
  if (!authConfigured) return <SignInScreen state="missing-config" missing={['VITE_ENTRA_CLIENT_ID', 'VITE_ENTRA_TENANT_ID']} />;
  return <MsalBoot />;
}

function MsalBoot() {
  const [msal, setMsal] = useState<PublicClientApplication | null>(null);
  const [redirectFailed, setRedirectFailed] = useState(false);
  const [failed, setFailed] = useState(false);
  // One MSAL instance per page: a second one would race the first for the redirect response.
  const boot = useRef<ReturnType<typeof createMsal> | null>(null);

  useEffect(() => {
    let alive = true;
    boot.current ??= createMsal();
    boot.current
      .then((r) => {
        if (!alive) return;
        setRedirectFailed(r.redirectFailed);
        setMsal(r.msal);
      })
      .catch((err) => {
        console.error('[auth] init failed', err);
        if (alive) setFailed(true);
      });
    return () => { alive = false; };
  }, []);

  if (failed) return <SignInScreen state="error" />;
  if (!msal) return <SignInScreen state="loading" />;
  return (
    <MsalProvider instance={msal}>
      <Protected redirectFailed={redirectFailed} />
    </MsalProvider>
  );
}

function Protected({ redirectFailed }: { redirectFailed: boolean }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState(redirectFailed);
  // `accounts` is read so this re-renders when MSAL's account list changes.
  const account = accounts.length ? pickAccount(instance) : null;

  if (isAuthenticated && account) {
    const user: AppUser = { name: account.name || account.username, email: account.username };
    return <App user={user} onSignOut={() => { signOut(instance, account).catch((err) => console.warn('[auth] sign-out failed', err)); }} />;
  }

  const busy = inProgress !== InteractionStatus.None;
  const handleSignIn = () => {
    setError(false);
    signIn(instance).catch((err: unknown) => {
      console.warn('[auth] sign-in failed', err);
      // Closing the Microsoft window is a choice, not a failure.
      if ((err as { errorCode?: string })?.errorCode !== 'user_cancelled') setError(true);
    });
  };

  return <SignInScreen state={busy ? 'loading' : error ? 'error' : 'ready'} onSignIn={handleSignIn} />;
}
