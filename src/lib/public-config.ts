// Only these public, browser-safe keys are ever read. The container writes them to /runtime-config.js at startup;
// the dev server leaves that file empty, so values fall back to .env (inlined by Vite at build time).
// Keep in sync with the ALLOWLIST in docker/40-runtime-config.sh.
export type PublicConfigKey =
  | 'VITE_ENTRA_TENANT_ID'
  | 'VITE_ENTRA_CLIENT_ID'
  | 'VITE_ENTRA_AUTHORITY'
  | 'VITE_ENTRA_API_SCOPE'
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_ANON_KEY';

const buildTime: Record<PublicConfigKey, string | undefined> = {
  VITE_ENTRA_TENANT_ID: import.meta.env.VITE_ENTRA_TENANT_ID,
  VITE_ENTRA_CLIENT_ID: import.meta.env.VITE_ENTRA_CLIENT_ID,
  VITE_ENTRA_AUTHORITY: import.meta.env.VITE_ENTRA_AUTHORITY,
  VITE_ENTRA_API_SCOPE: import.meta.env.VITE_ENTRA_API_SCOPE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

function runtimeValue(key: PublicConfigKey): string {
  const runtime: unknown = typeof window !== 'undefined' ? window.__RUNTIME_CONFIG__ : undefined;
  if (!runtime || typeof runtime !== 'object') return '';
  const value = (runtime as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function publicConfig(key: PublicConfigKey): string {
  return runtimeValue(key) || (buildTime[key] ?? '').trim();
}

export function missingDataConfig(): PublicConfigKey[] {
  return (['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const).filter((key) => !publicConfig(key));
}
