import { EventType, LogLevel, PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID?.trim();
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID?.trim();
const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE?.trim();
const authority = import.meta.env.VITE_ENTRA_AUTHORITY?.trim() || (tenantId ? `https://login.microsoftonline.com/${tenantId}` : '');

export const authDevMode = import.meta.env.VITE_DEV_MODE === 'true';
export const authConfigured = Boolean(clientId && authority);

export const loginRequest = { scopes: ['openid', 'profile', 'email', 'User.Read', ...(apiScope ? [apiScope] : [])] };

export async function createMsal(): Promise<PublicClientApplication> {
  const msal = new PublicClientApplication({
    auth: {
      clientId: clientId!,
      authority,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    // sessionStorage keeps tokens scoped to the tab and cleared when it closes.
    cache: { cacheLocation: 'sessionStorage' },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
        loggerCallback: (level, message) => {
          if (level === LogLevel.Error) console.error('[auth]', message);
          else if (level === LogLevel.Warning) console.warn('[auth]', message);
        },
      },
    },
  });

  await msal.initialize();

  msal.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const { account } = event.payload as AuthenticationResult;
      msal.setActiveAccount(account);
      console.info('[auth] sign-in', account.username);
    }
    if (event.eventType === EventType.LOGOUT_START) console.info('[auth] sign-out');
  });

  // A failed or cancelled redirect must not block the app; the user just lands back on the sign-in screen.
  const result = await msal.handleRedirectPromise().catch((err) => {
    console.warn('[auth] sign-in failed', err);
    return null;
  });
  if (result?.account) msal.setActiveAccount(result.account);
  else if (!msal.getActiveAccount() && msal.getAllAccounts().length) msal.setActiveAccount(msal.getAllAccounts()[0]);

  return msal;
}
