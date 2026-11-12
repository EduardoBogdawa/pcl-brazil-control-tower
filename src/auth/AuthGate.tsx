import { useCallback, useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import App from '@/App';
import { completeRedirect, devMode, loginRequest, msal } from '@/auth/authConfig';
import SignInScreen from '@/auth/SignInScreen';
import type { AuthUser } from '@/auth/types';
import '@/auth/auth.css';

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut'; error?: string }
  | { status: 'signedIn'; user: AuthUser }
  | { status: 'misconfigured' };

const DEV_USER: AuthUser = { name: 'Dev Mode', email: 'dev@localhost', dev: true };

const toUser = (account: AccountInfo): AuthUser => ({
  name: account.name || account.username,
  email: account.username,
  dev: false,
});

function initialState(): AuthState {
  if (devMode) return { status: 'signedIn', user: DEV_USER };
  return msal ? { status: 'loading' } : { status: 'misconfigured' };
}

function AuthGate() {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const client = msal;
    if (!client) return;
    let active = true;
    completeRedirect(client)
      .then((result) => {
        const account = result?.account ?? client.getActiveAccount() ?? client.getAllAccounts()[0];
        if (!active) return;
        if (!account) return setState({ status: 'signedOut' });
        client.setActiveAccount(account);
        if (result) console.info('[auth] signed in', account.username);
        setState({ status: 'signedIn', user: toUser(account) });
      })
      .catch((err: unknown) => {
        console.error('[auth] sign-in failed', err);
        if (active) setState({ status: 'signedOut', error: 'Não foi possível concluir o login. Tente novamente.' });
      });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async () => {
    if (!msal) return;
    try {
      await msal.loginRedirect(loginRequest);
    } catch (err) {
      console.error('[auth] redirect failed', err);
      setState({ status: 'signedOut', error: 'Não foi possível abrir o login da Microsoft. Tente novamente.' });
    }
  }, []);

  const signOut = useCallback(() => {
    if (!msal) return;
    const account = msal.getActiveAccount();
    console.info('[auth] signed out', account?.username);
    msal.logoutRedirect({ account: account ?? undefined });
  }, []);

  if (state.status === 'signedIn') return <App user={state.user} onSignOut={signOut} />;
  if (state.status === 'loading') return <SignInScreen mode="loading" />;
  if (state.status === 'misconfigured') return <SignInScreen mode="misconfigured" />;
  return <SignInScreen mode="signedOut" error={state.error} onSignIn={signIn} />;
}

export default AuthGate;
