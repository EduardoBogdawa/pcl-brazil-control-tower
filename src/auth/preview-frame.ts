const ISOLATED_PREVIEW_SUFFIX = '.local-credentialless.webcontainer-api.io';

type WindowLike = { location: { hostname: string }; self: unknown; top: unknown };

function isFramed(win: WindowLike): boolean {
  try {
    return win.self !== win.top;
  } catch {
    // Reading window.top can throw across origins, which itself means we are framed.
    return true;
  }
}

// Bolt's isolated preview is a credentialless iframe where redirects are blocked and popups lose their WindowProxy.
// The same origin opened as a top-level tab ("Open in new window") works, so the hostname alone must not block sign-in.
export function isFramedIsolatedPreview(win: WindowLike = window): boolean {
  return win.location.hostname.endsWith(ISOLATED_PREVIEW_SUFFIX) && isFramed(win);
}
