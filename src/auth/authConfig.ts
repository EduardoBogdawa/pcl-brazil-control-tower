import { LogLevel, type Configuration } from '@azure/msal-browser';

const env = import.meta.env;

export const devMode = env.VITE_DEV_MODE === 'true';

const tenantId = env.VITE_ENTRA_TENANT_ID?.trim() ?? '';
const clientId = env.VITE_ENTRA_CLIENT_ID?.trim() ?? '';

export const entraConfigured = Boolean(tenantId && clientId);

const authority = env.VITE_ENTRA_AUTHORITY?.trim() || `https://login.microsoftonline.com/${tenantId}`;

export const authorityOrigin = (() => {
  try { return new URL(authority).origin; } catch { return 'https://login.microsoftonline.com'; }
})();

const RELAY_PATH = '/auth-relay.html';

const inIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    // Embedded (e.g. the Bolt preview), the popup's response can't reach this frame directly,
    // so a same-origin relay window forwards it back via postMessage.
    popupRelayUri: inIframe ? window.location.origin + RELAY_PATH : undefined,
  },
  // Session storage keeps tokens scoped to the tab and clears them when it closes.
  cache: { cacheLocation: 'sessionStorage' },
  system: {
    // The default (60s) is too short for users completing MFA.
    popupBridgeTimeout: 5 * 60_000,
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
        else console.warn(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', ...(env.VITE_ENTRA_API_SCOPE?.trim() ? [env.VITE_ENTRA_API_SCOPE.trim()] : [])],
};
