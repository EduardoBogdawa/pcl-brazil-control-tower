import { AuthError, BrowserAuthErrorCodes, PublicClientApplication } from '@azure/msal-browser';
import { devMode, entraConfigured, msalConfig } from '@/auth/authConfig';

export const msal = !devMode && entraConfigured ? new PublicClientApplication(msalConfig) : null;

let ready: Promise<void> | null = null;

// Memoized so StrictMode's double effect never initializes the client twice.
export function initializeMsal(client: PublicClientApplication) {
  ready ??= client.initialize();
  return ready;
}

export type AuthMessage = { tone: 'info' | 'error'; text: string };

export function describeAuthError(err: unknown): AuthMessage {
  const code = err instanceof AuthError ? err.errorCode : '';
  switch (code) {
    case BrowserAuthErrorCodes.userCancelled:
    case 'access_denied':
      return { tone: 'info', text: 'Login cancelado. Clique em "Entrar com Microsoft" para tentar novamente.' };
    case BrowserAuthErrorCodes.popupWindowError:
    case BrowserAuthErrorCodes.emptyWindowError:
      return { tone: 'error', text: 'O navegador bloqueou a janela de login. Permita pop-ups para este site e tente novamente.' };
    case BrowserAuthErrorCodes.interactionInProgress:
    case BrowserAuthErrorCodes.interactionInProgressCancelled:
      return { tone: 'error', text: 'Já existe um login em andamento. Conclua-o na janela aberta ou feche-a e tente novamente.' };
    case BrowserAuthErrorCodes.timedOut:
      return { tone: 'error', text: 'O tempo para concluir o login expirou. Tente novamente.' };
    default:
      return { tone: 'error', text: 'Não foi possível concluir o login. Tente novamente.' };
  }
}
