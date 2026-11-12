import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import App from '@/App';
import { devMode, isolatedFrame, loginRequest } from '@/auth/authConfig';
import { describeAuthError, initializeMsal, msal, type AuthMessage } from '@/auth/msalClient';
import SignInScreen from '@/auth/SignInScreen';
import type { AuthUser } from '@/auth/types';
import '@/auth/auth.css';

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut'; message?: AuthMessage }
  | { status: 'signedIn'; user: AuthUser }
  | { status: 'misconfigured' }
  | { status: 'isolated' };

const DEV_USER: AuthUser = { name: 'Dev Mode', email: 'dev@localhost', dev: true };

// Survives the reload that follows sign-out so the user still sees why it was partial.
const NOTICE_KEY = 'ct-auth-notice';

const toUser = (account: AccountInfo): AuthUser => ({
  name: account.name || account.username,
  email: account.username,
  dev: false,
});

function takeNotice(): AuthMessage | undefined {
  try {
    const text = sessionStorage.getItem(NOTICE_KEY);
    sessionStorage.removeItem(NOTICE_KEY);
    return text ? { tone: 'info', text } : undefined;
  } catch {
    return undefined;
  }
}

function initialState(): AuthState {
  if (devMode) return { status: 'signedIn', user: DEV_USER };
  if (!msal) return { status: 'misconfigured' };
  return isolatedFrame ? { status: 'isolated' } : { status: 'loading' };
}

function AuthGate() {
  const [state, setState] = useState<AuthState>(initialState);
  const [busy, setBusy] = useState(false);
  // A ref (not state) so a fast double-click can't start two popups before React re-renders.
  const busyRef = useRef(false);

  useEffect(() => {
    const client = msal;
    if (!client || isolatedFrame) return;
    let active = true;
    initializeMsal(client)
      .then(() => {
        if (!active) return;
        const account = client.getActiveAccount() ?? client.getAllAccounts()[0];
        if (!account) return setState({ status: 'signedOut', message: takeNotice() });
        client.setActiveAccount(account);
        setState({ status: 'signedIn', user: toUser(account) });
      })
      .catch((err: unknown) => {
        console.error('[auth] initialization failed', err);
        if (active) setState({ status: 'signedOut', message: describeAuthError(err) });
      });
    return () => { active = false; };
  }, []);

  // Must call loginPopup synchronously from the click so the browser treats the popup as user-initiated.
  const signIn = useCallback(() => {
    const client = msal;
    if (!client || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setState({ status: 'signedOut' });
    client.loginPopup(loginRequest)
      .then((result) => {
        client.setActiveAccount(result.account);
        console.info('[auth] signed in', result.account.username);
        setState({ status: 'signedIn', user: toUser(result.account) });
      })
      .catch((err: unknown) => {
        console.warn('[auth] sign-in did not complete', err);
        setState({ status: 'signedOut', message: describeAuthError(err) });
      })
      .finally(() => {
        busyRef.current = false;
        setBusy(false);
      });
  }, []);

  const signOut = useCallback(() => {
    const client = msal;
    if (!client || busyRef.current) return;
    busyRef.current = true;
    const account = client.getActiveAccount();
    console.info('[auth] signing out', account?.username);
    // logoutPopup clears the local session before opening the window, so the app is signed out even if
    // the Microsoft window is blocked or closed. The reload gives the dashboard a clean start.
    client.logoutPopup({ account: account ?? undefined })
      .catch((err: unknown) => {
        console.warn('[auth] Microsoft sign-out window did not complete', err);
        try {
          sessionStorage.setItem(NOTICE_KEY, 'Você saiu do Control Tower, mas a janela de saída da Microsoft não pôde ser aberta; feche o navegador para encerrar também a sessão Microsoft.');
        } catch { /* notice is optional */ }
      })
      .finally(() => window.location.reload());
  }, []);

  if (state.status === 'signedIn') return <App user={state.user} onSignOut={signOut} />;
  if (state.status === 'loading') return <SignInScreen mode="loading" />;
  if (state.status === 'misconfigured') return <SignInScreen mode="misconfigured" />;
  if (state.status === 'isolated') return <SignInScreen mode="isolated" />;
  return <SignInScreen mode="signedOut" message={state.message} busy={busy} onSignIn={signIn} />;
}

export default AuthGate;
