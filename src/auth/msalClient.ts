import { AuthError, BrowserAuthErrorCodes, PublicClientApplication } from '@azure/msal-browser';
import { devMode, entraConfigured, msalConfig } from '@/auth/authConfig';

export const msal = !devMode && entraConfigured ? new PublicClientApplication(msalConfig) : null;

let ready: Promise<void> | null = null;

// Memoized so StrictMode's double effect never initializes the client twice.
export function initializeMsal(client: PublicClientApplication) {
  ready ??= client.initialize();
  return ready;
}

export type AuthMessage = { tone: 'info' | 'error'; text: string; code?: string };

// Only the library's short error code is surfaced; messages can carry trace IDs or account hints.
const safeCode = (err: unknown) =>
  err instanceof AuthError && /^[a-z0-9_]{1,64}$/i.test(err.errorCode) ? err.errorCode : 'unknown_error';

export function describeAuthError(err: unknown): AuthMessage {
  const code = safeCode(err);
  switch (code) {
    case BrowserAuthErrorCodes.userCancelled:
    case 'access_denied':
      return { tone: 'info', code, text: 'Login cancelado. Clique em "Entrar com Microsoft" para tentar novamente.' };
    // MSAL reports a null window.open() result (blocked, or opened without a handle) under this code too.
    case BrowserAuthErrorCodes.popupWindowError:
    case BrowserAuthErrorCodes.emptyWindowError:
      return { tone: 'error', code, text: 'A janela de login foi solicitada, mas o navegador não deu ao app acesso a ela. Feche janelas de login abertas e tente novamente; se persistir, abra o app em uma nova aba.' };
    case BrowserAuthErrorCodes.interactionInProgress:
    case BrowserAuthErrorCodes.interactionInProgressCancelled:
      return { tone: 'error', code, text: 'Já existe um login em andamento. Conclua-o na janela aberta ou feche-a e tente novamente.' };
    case BrowserAuthErrorCodes.timedOut:
      return { tone: 'error', code, text: 'O tempo para concluir o login expirou. Tente novamente.' };
    default:
      return { tone: 'error', code, text: 'Não foi possível concluir o login. Tente novamente.' };
  }
}
