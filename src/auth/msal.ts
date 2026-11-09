import { EventType, LogLevel, PublicClientApplication, type AccountInfo, type EventMessage, type IPublicClientApplication } from '@azure/msal-browser';
import { POPUP_RELAY_URI, isInIframe } from '@/auth/popupBridge';
import { appConfig } from '@/config/appConfig';

const { entraTenantId: tenantId, entraClientId: clientId, entraApiScope: apiScope, entraAuthority: authority } = appConfig;

export const authDevMode = appConfig.devMode;
export const authConfigured = Boolean(clientId && authority);

export const loginRequest = { scopes: ['openid', 'profile', 'email', 'User.Read', ...(apiScope ? [apiScope] : [])] };

export function authorityOrigin(): string {
  return new URL(authority).origin;
}

function isAccountInfo(value: unknown): value is AccountInfo {
  const v = value as Partial<AccountInfo> | null;
  return typeof v === 'object' && v !== null && typeof v.homeAccountId === 'string' && v.homeAccountId !== ''
    && typeof v.username === 'string' && v.username !== '';
}

// Event payloads vary by event and version: LOGIN_SUCCESS carries the account itself,
// ACQUIRE_TOKEN_SUCCESS carries a result object that holds it.
function accountFromPayload(payload: unknown): AccountInfo | null {
  if (isAccountInfo(payload)) return payload;
  const nested = (payload as { account?: unknown } | null)?.account;
  return isAccountInfo(nested) ? nested : null;
}

// Only accounts issued by the configured tenant can unlock the app.
function belongsToTenant(account: AccountInfo): boolean {
  return !tenantId || account.tenantId === tenantId;
}

export function pickAccount(msal: IPublicClientApplication): AccountInfo | null {
  const active = msal.getActiveAccount();
  if (isAccountInfo(active) && belongsToTenant(active)) return active;
  return msal.getAllAccounts().find((a) => isAccountInfo(a) && belongsToTenant(a)) ?? null;
}

export const POPUP_BLOCKED_CODES = ['empty_window_error', 'popup_window_error', 'block_nested_popups'];

// Only the MSAL error code is surfaced to the UI; messages can carry request details.
export function authErrorCode(err: unknown): string {
  const code = (err as { errorCode?: unknown } | null)?.errorCode;
  return typeof code === 'string' && /^[a-z0-9_]{1,64}$/i.test(code) ? code : 'unknown_error';
}

// Must be called synchronously from the click handler: MSAL opens the popup before its first await.
export async function signIn(msal: IPublicClientApplication): Promise<void> {
  if (!isInIframe()) return msal.loginRedirect(loginRequest);
  const result = await msal.loginPopup(loginRequest);
  const account = accountFromPayload(result);
  if (!account || !belongsToTenant(account)) throw new Error('Sign-in returned no account for this tenant');
  msal.setActiveAccount(account);
}

export async function signOut(msal: IPublicClientApplication, account: AccountInfo): Promise<void> {
  if (!isInIframe()) return msal.logoutRedirect({ account });
  // If the sign-out popup is blocked or closed, still end the session inside this app.
  await msal.logoutPopup({ account }).catch((err) => {
    console.warn('[auth] sign-out popup failed, clearing local session', err);
    return msal.clearCache({ account });
  });
  window.location.reload();
}

export async function createMsal(): Promise<{ msal: PublicClientApplication; redirectError: string | null }> {
  const msal = new PublicClientApplication({
    auth: {
      clientId,
      authority,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      ...(isInIframe() ? { popupRelayUri: POPUP_RELAY_URI } : {}),
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

  msal.addEventCallback((event: EventMessage) => {
    // Callbacks run inside MSAL's own flow; a throw here would abort the redirect handling.
    try {
      if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        const account = accountFromPayload(event.payload);
        if (account && belongsToTenant(account)) {
          msal.setActiveAccount(account);
          if (event.eventType === EventType.LOGIN_SUCCESS) console.info('[auth] sign-in', account.username);
        } else if (event.eventType === EventType.LOGIN_SUCCESS) {
          console.warn('[auth] sign-in event without a usable account');
        }
      }
      if (event.eventType === EventType.LOGOUT_START) console.info('[auth] sign-out');
    } catch (err) {
      console.warn('[auth] event handling failed', err);
    }
  });

  let redirectError: string | null = null;
  try {
    const result = await msal.handleRedirectPromise();
    const account = accountFromPayload(result);
    if (account && belongsToTenant(account)) msal.setActiveAccount(account);
    else if (result) console.warn('[auth] redirect result without a usable account');
  } catch (err) {
    // A failed or cancelled redirect must not block the app; the user lands back on the sign-in screen.
    redirectError = authErrorCode(err);
    console.warn('[auth] sign-in failed', redirectError);
  }

  const account = pickAccount(msal);
  if (account) msal.setActiveAccount(account);

  return { msal, redirectError };
}
