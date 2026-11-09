// Public settings only. In a container the Node server serves /runtime-config.js from its environment
// (allowlisted keys); in the Bolt preview that file is an empty stub and the build-time values are used.
type ConfigKey =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'VITE_ENTRA_CLIENT_ID'
  | 'VITE_ENTRA_TENANT_ID'
  | 'VITE_ENTRA_AUTHORITY'
  | 'VITE_ENTRA_API_SCOPE'
  | 'VITE_DEV_MODE';

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<Record<ConfigKey, unknown>>;
  }
}

// Each key is referenced literally so the bundler can inline the build-time value.
const buildTime: Record<ConfigKey, string | undefined> = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_ENTRA_CLIENT_ID: import.meta.env.VITE_ENTRA_CLIENT_ID,
  VITE_ENTRA_TENANT_ID: import.meta.env.VITE_ENTRA_TENANT_ID,
  VITE_ENTRA_AUTHORITY: import.meta.env.VITE_ENTRA_AUTHORITY,
  VITE_ENTRA_API_SCOPE: import.meta.env.VITE_ENTRA_API_SCOPE,
  VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
};

const runtime = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {};

function read(key: ConfigKey): string {
  const value = runtime[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return buildTime[key]?.trim() ?? '';
}

const tenantId = read('VITE_ENTRA_TENANT_ID');

export const appConfig = {
  supabaseUrl: read('VITE_SUPABASE_URL'),
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY'),
  entraClientId: read('VITE_ENTRA_CLIENT_ID'),
  entraTenantId: tenantId,
  entraAuthority: read('VITE_ENTRA_AUTHORITY') || (tenantId ? `https://login.microsoftonline.com/${tenantId}` : ''),
  entraApiScope: read('VITE_ENTRA_API_SCOPE'),
  devMode: read('VITE_DEV_MODE') === 'true',
} as const;

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!appConfig.supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!appConfig.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!appConfig.devMode) {
    if (!appConfig.entraClientId) missing.push('VITE_ENTRA_CLIENT_ID');
    if (!appConfig.entraAuthority) missing.push('VITE_ENTRA_TENANT_ID');
  }
  return missing;
}
