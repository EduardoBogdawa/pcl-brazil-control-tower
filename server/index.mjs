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

server.listen(PORT, () => console.log(`[server] listening on :${PORT}`));

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
