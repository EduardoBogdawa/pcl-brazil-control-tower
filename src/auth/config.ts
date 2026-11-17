const env = import.meta.env;

const clean = (value: string | undefined) => (value ?? '').trim();

const tenantId = clean(env.VITE_ENTRA_TENANT_ID);
const clientId = clean(env.VITE_ENTRA_CLIENT_ID);
const apiScope = clean(env.VITE_ENTRA_API_SCOPE);

export const authConfig = {
  // Dev mode is honored only by the dev server; a production build always requires Entra sign-in.
  devMode: env.DEV && clean(env.VITE_DEV_MODE).toLowerCase() === 'true',
  tenantId,
  clientId,
  authority: clean(env.VITE_ENTRA_AUTHORITY) || `https://login.microsoftonline.com/${tenantId}`,
  scopes: ['openid', 'profile', 'email', ...(apiScope ? [apiScope] : [])],
  configured: Boolean(tenantId && clientId),
};

// Bolt's isolated preview runs in a credentialless iframe: redirects are blocked and popups lose their WindowProxy.
export const isCredentiallessPreview = () => window.location.hostname.endsWith('.local-credentialless.webcontainer-api.io');
