// Inside an iframe (e.g. the Bolt preview) MSAL blocks redirects, and third-party storage partitioning stops a
// plain popup from reporting back. The popup relay routes the popup through a top-level page on our own origin.
export const POPUP_RELAY_URI = '/?msal=popup-relay';

export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function isPopupRelayPage(): boolean {
  return !isInIframe() && new URLSearchParams(window.location.search).get('msal') === 'popup-relay';
}

function base64UrlDecode(value: string): string {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

// True only when this top-level window holds a Microsoft response for a popup sign-in/sign-out;
// redirect responses are left to the normal handleRedirectPromise flow.
export function isPopupAuthResponse(): boolean {
  if (isInIframe()) return false;
  const sources = [window.location.hash.replace(/^#/, ''), window.location.search.replace(/^\?/, '')];
  for (const src of sources) {
    const state = new URLSearchParams(src).get('state');
    if (!state) continue;
    try {
      const library = JSON.parse(base64UrlDecode(state.split('|')[0]));
      return library?.meta?.interactionType === 'popup';
    } catch {
      return false;
    }
  }
  return false;
}
