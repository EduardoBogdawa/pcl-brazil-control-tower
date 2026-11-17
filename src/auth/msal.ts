import {
  BrowserCacheLocation,
  EventType,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';
import { authConfig } from '@/auth/config';

export type SignedInUser = { name: string; username: string };

let instance: PublicClientApplication | null = null;
let restoring: Promise<SignedInUser | null> | null = null;

function client() {
  if (!instance) {
    instance = new PublicClientApplication({
      auth: {
        clientId: authConfig.clientId,
        authority: authConfig.authority,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: true,
      },
      // Session storage keeps tokens out of long-lived storage and clears them when the tab closes.
      cache: { cacheLocation: BrowserCacheLocation.SessionStorage },
    });
    instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) console.info('[auth] sign-in succeeded');
      if (event.eventType === EventType.LOGIN_FAILURE) console.warn('[auth] sign-in failed');
      if (event.eventType === EventType.LOGOUT_SUCCESS) console.info('[auth] signed out');
    });
  }
  return instance;
}

const toUser = (account: AccountInfo): SignedInUser => ({ name: account.name || account.username, username: account.username });

// Completes a returning redirect, then picks the active account if one exists.
export function restoreSession(): Promise<SignedInUser | null> {
  restoring ??= completeRedirect().catch((error) => {
    restoring = null;
    throw error;
  });
  return restoring;
}

async function completeRedirect(): Promise<SignedInUser | null> {
  const msal = client();
  await msal.initialize();
  const result: AuthenticationResult | null = await msal.handleRedirectPromise();
  const account = result?.account ?? msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (!account) return null;
  msal.setActiveAccount(account);
  return toUser(account);
}

export function signIn() {
  return client().loginRedirect({ scopes: authConfig.scopes, prompt: 'select_account' });
}

export function signOut() {
  const msal = client();
  return msal.logoutRedirect({ account: msal.getActiveAccount() ?? undefined });
}
