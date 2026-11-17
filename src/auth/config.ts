import { publicConfig } from '@/lib/public-config';

const tenantId = publicConfig('VITE_ENTRA_TENANT_ID');
const clientId = publicConfig('VITE_ENTRA_CLIENT_ID');
const apiScope = publicConfig('VITE_ENTRA_API_SCOPE');

export const authConfig = {
  // Dev mode is honored only by the dev server; a production build always requires Entra sign-in.
  devMode: import.meta.env.DEV && (import.meta.env.VITE_DEV_MODE ?? '').trim().toLowerCase() === 'true',
  tenantId,
  clientId,
  authority: publicConfig('VITE_ENTRA_AUTHORITY') || `https://login.microsoftonline.com/${tenantId}`,
  scopes: ['openid', 'profile', 'email', ...(apiScope ? [apiScope] : [])],
  configured: Boolean(tenantId && clientId),
};
