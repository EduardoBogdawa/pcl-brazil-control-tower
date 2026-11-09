// Static server for the built SPA. Uses only Node built-ins so the runtime image needs no extra packages.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 8080;
const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const INDEX = join(ROOT, 'index.html');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
};

// Allowlist of public browser settings. Each entry lists accepted env names in priority order;
// nothing outside this list is ever read, so SQL_* credentials and secrets cannot leak.
const PUBLIC_CONFIG = {
  VITE_SUPABASE_URL: ['VITE_SUPABASE_URL', 'SUPABASE_URL'],
  VITE_SUPABASE_ANON_KEY: ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
  VITE_ENTRA_CLIENT_ID: ['VITE_ENTRA_CLIENT_ID', 'ENTRA_CLIENT_ID'],
  VITE_ENTRA_TENANT_ID: ['VITE_ENTRA_TENANT_ID', 'ENTRA_TENANT_ID'],
  VITE_ENTRA_AUTHORITY: ['VITE_ENTRA_AUTHORITY', 'ENTRA_AUTHORITY'],
  VITE_ENTRA_API_SCOPE: ['VITE_ENTRA_API_SCOPE', 'ENTRA_API_SCOPE'],
  VITE_DEV_MODE: ['VITE_DEV_MODE'],
};
const REQUIRED = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_ENTRA_CLIENT_ID', 'VITE_ENTRA_TENANT_ID'];

function jwtRole(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')).role;
  } catch {
    return undefined;
  }
}

function buildPublicConfig() {
  const config = {};
  for (const [key, names] of Object.entries(PUBLIC_CONFIG)) {
    const name = names.find((n) => typeof process.env[n] === 'string' && process.env[n].trim() !== '');
    if (name) config[key] = process.env[name].trim();
  }
  // A service_role key bypasses all row security; never hand it to browsers.
  const anon = config.VITE_SUPABASE_ANON_KEY;
  if (anon && (anon.startsWith('sb_secret_') || jwtRole(anon) === 'service_role')) {
    console.warn('[config] VITE_SUPABASE_ANON_KEY is not an anon key; it was withheld from the browser');
    delete config.VITE_SUPABASE_ANON_KEY;
  }
  if (config.VITE_DEV_MODE && config.VITE_DEV_MODE !== 'true') config.VITE_DEV_MODE = 'false';
  return config;
}

const PUBLIC_CONFIG_VALUES = buildPublicConfig();
// Escape "<" so a value can never close the script context.
const RUNTIME_CONFIG_JS = `window.__APP_CONFIG__ = ${JSON.stringify(PUBLIC_CONFIG_VALUES).replace(/</g, '\\u003c')};\n`;

function sendJson(res, status, body) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function fileAt(path) {
  try {
    const info = await stat(path);
    return info.isFile() ? info : null;
  } catch {
    return null;
  }
}

function sendFile(res, path, size, cache, head) {
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': TYPES[extname(path).toLowerCase()] || 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': cache,
  });
  if (head) return res.end();
  createReadStream(path).on('error', () => res.destroy()).pipe(res);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'method_not_allowed' });

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  } catch {
    return sendJson(res, 400, { error: 'bad_request' });
  }

  if (pathname === '/healthz') return sendJson(res, 200, { status: 'ok' });

  if (pathname === '/runtime-config.js') {
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/javascript; charset=utf-8',
      'Content-Length': Buffer.byteLength(RUNTIME_CONFIG_JS),
      'Cache-Control': 'no-store',
    });
    return res.end(req.method === 'HEAD' ? undefined : RUNTIME_CONFIG_JS);
  }

  // Resolve inside dist only; anything that escapes the folder is rejected.
  const target = normalize(join(ROOT, pathname));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return sendJson(res, 400, { error: 'bad_request' });

  const head = req.method === 'HEAD';
  const info = await fileAt(target);
  if (info) {
    const hashed = target.startsWith(join(ROOT, 'assets') + sep);
    return sendFile(res, target, info.size, hashed ? 'public, max-age=31536000, immutable' : 'no-cache', head);
  }

  if (pathname.startsWith('/assets/') || extname(pathname)) return sendJson(res, 404, { error: 'not_found' });

  // SPA fallback so the Entra redirect back to any route lands on the app.
  const index = await fileAt(INDEX);
  if (!index) return sendJson(res, 500, { error: 'app_not_built' });
  return sendFile(res, INDEX, index.size, 'no-cache', head);
});

server.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
  console.log(`[config] provided: ${Object.keys(PUBLIC_CONFIG_VALUES).join(', ') || 'none'}`);
  const missing = REQUIRED.filter((k) => !PUBLIC_CONFIG_VALUES[k]);
  if (missing.length) console.warn(`[config] missing (build-time values will be used if present): ${missing.join(', ')}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
