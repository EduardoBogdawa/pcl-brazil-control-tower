import { useEffect, useState } from 'react';
import { InteractionStatus, type PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import App from '@/App';
import SignInScreen from '@/auth/SignInScreen';
import { authConfigured, authDevMode, createMsal, loginRequest } from '@/auth/msal';
import type { AppUser } from '@/auth/types';

const DEV_USER: AppUser = { name: 'Dev Mode', email: 'dev@localhost', devMode: true };

export default function AuthGate() {
  if (authDevMode) return <App user={DEV_USER} />;
  if (!authConfigured) return <SignInScreen state="missing-config" />;
  return <MsalBoot />;
}

function MsalBoot() {
  const [msal, setMsal] = useState<PublicClientApplication | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    createMsal()
      .then((m) => alive && setMsal(m))
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
      <Protected />
    </MsalProvider>
  );
}

function Protected() {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState(false);
  const account = instance.getActiveAccount() ?? accounts[0];

  if (isAuthenticated && account) {
    const user: AppUser = { name: account.name || account.username, email: account.username };
    return <App user={user} onSignOut={() => instance.logoutRedirect({ account })} />;
  }

  const busy = inProgress !== InteractionStatus.None;
  const signIn = () => {
    setError(false);
    instance.loginRedirect(loginRequest).catch((err) => {
      console.warn('[auth] sign-in failed', err);
      setError(true);
    });
  };

  return <SignInScreen state={busy ? 'loading' : error ? 'error' : 'ready'} onSignIn={signIn} />;
}
