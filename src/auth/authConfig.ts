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

export const inIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

// The Bolt preview is served from this host inside a credentialless iframe; window.credentialless is not
// reliably exposed there, so the host is checked too. Its raw URL only works through the editor's
// connect handshake, so a plain "open this URL" link fails and the editor's own control must be used.
const WEBCONTAINER_PREVIEW_SUFFIX = '.local-credentialless.webcontainer-api.io';
export const inWebContainerPreview = inIframe && window.location.hostname.endsWith(WEBCONTAINER_PREVIEW_SUFFIX);

// Credentialless iframes force every window.open into noopener: the window appears, but the opener gets no
// handle and the popup gets no opener, and storage is an isolated ephemeral partition. No popup or relay can
// hand a sign-in response back to such a frame, so sign-in must happen in a top-level window.
export const isolatedFrame = inWebContainerPreview
  || (inIframe && (window as Window & { credentialless?: boolean }).credentialless === true);

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    // In a regular cross-site iframe the popup's response can't reach this frame through partitioned
    // storage, so a same-origin relay window forwards it back via postMessage.
    popupRelayUri: inIframe && !isolatedFrame ? window.location.origin + RELAY_PATH : undefined,
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
