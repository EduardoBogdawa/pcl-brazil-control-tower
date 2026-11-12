import { LogLevel, PublicClientApplication, type AuthenticationResult, type Configuration } from '@azure/msal-browser';

const env = import.meta.env;

export const devMode = env.VITE_DEV_MODE === 'true';

const tenantId = env.VITE_ENTRA_TENANT_ID?.trim() ?? '';
const clientId = env.VITE_ENTRA_CLIENT_ID?.trim() ?? '';

export const entraConfigured = Boolean(tenantId && clientId);

const config: Configuration = {
  auth: {
    clientId,
    authority: env.VITE_ENTRA_AUTHORITY?.trim() || `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  // Session storage keeps tokens scoped to the tab and clears them when it closes.
  cache: { cacheLocation: 'sessionStorage' },
  system: {
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

export const msal = !devMode && entraConfigured ? new PublicClientApplication(config) : null;

let startup: Promise<AuthenticationResult | null> | null = null;

// Memoized so StrictMode's double effect never processes the same redirect response twice.
export function completeRedirect(client: PublicClientApplication) {
  startup ??= client.initialize().then(() => client.handleRedirectPromise());
  return startup;
}
