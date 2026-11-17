import {
  AuthError,
  BrowserAuthErrorCodes,
  BrowserCacheLocation,
  BrowserUtils,
  EventType,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
} from '@azure/msal-browser';
import { authConfig } from '@/auth/config';

export type SignedInUser = { name: string; username: string };

export class SignInError extends Error {
  constructor(message: string, readonly code: string, readonly cancelled = false) {
    super(message);
  }
}

// Script-free page in /public: the opener reads the auth response from its URL, so the app must not boot there.
export const REDIRECT_PATH = '/auth-redirect.html';
const redirectUri = () => `${window.location.origin}${REDIRECT_PATH}`;

let instance: PublicClientApplication | null = null;
let ready: Promise<PublicClientApplication> | null = null;
let restoring: Promise<SignedInUser | null> | null = null;
let signingIn: Promise<SignedInUser> | null = null;
let signingOut: Promise<void> | null = null;

function client() {
  ready ??= (async () => {
    instance = new PublicClientApplication({
      auth: {
        clientId: authConfig.clientId,
        authority: authConfig.authority,
        redirectUri: redirectUri(),
        postLogoutRedirectUri: redirectUri(),
      },
      // Session storage keeps tokens out of long-lived storage and clears them when the tab closes.
      cache: { cacheLocation: BrowserCacheLocation.SessionStorage },
    });
    instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) console.info('[auth] sign-in succeeded');
      if (event.eventType === EventType.LOGIN_FAILURE) console.warn('[auth] sign-in failed', (event.error as AuthError | null)?.errorCode);
      if (event.eventType === EventType.LOGOUT_SUCCESS) console.info('[auth] signed out');
    });
    await instance.initialize();
    return instance;
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

/** True when this window is a sign-in/sign-out popup opened by MSAL (it should render nothing). */
export const isAuthPopup = () => BrowserUtils.isInPopup();

const toUser = (account: AccountInfo): SignedInUser => ({ name: account.name || account.username, username: account.username });

export function restoreSession(): Promise<SignedInUser | null> {
  restoring ??= loadSession().finally(() => {
    restoring = null;
  });
  return restoring;
}

async function loadSession(): Promise<SignedInUser | null> {
  const msal = await client();
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (!account) return null;
  try {
    // Confirms the cached account still has a usable session (refreshing tokens if needed) before trusting it.
    await msal.acquireTokenSilent({ scopes: authConfig.scopes, account });
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msal.clearCache({ account });
      return null;
    }
    throw toSignInError(error);
  }
  msal.setActiveAccount(account);
  return toUser(account);
}

// Concurrent clicks share the same popup instead of tripping MSAL's interaction_in_progress guard.
export function signIn(): Promise<SignedInUser> {
  signingIn ??= (async () => {
    const msal = await client();
    try {
      const result = await msal.loginPopup({ scopes: authConfig.scopes, prompt: 'select_account', redirectUri: redirectUri() });
      msal.setActiveAccount(result.account);
      return toUser(result.account);
    } catch (error) {
      throw toSignInError(error);
    }
  })().finally(() => {
    signingIn = null;
  });
  return signingIn;
}

export function signOut(): Promise<void> {
  signingOut ??= (async () => {
    const msal = await client();
    const account = msal.getActiveAccount() ?? undefined;
    try {
      await msal.logoutPopup({ account, postLogoutRedirectUri: redirectUri(), mainWindowRedirectUri: window.location.origin });
    } catch {
      // Popup blocked or closed early: still end the session in this tab so the app returns to the sign-in screen.
      await msal.clearCache({ account }).catch(() => undefined);
      window.location.assign(window.location.origin);
    }
  })().finally(() => {
    signingOut = null;
  });
  return signingOut;
}

function toSignInError(error: unknown): SignInError {
  if (!(error instanceof AuthError)) return new SignInError('Erro inesperado ao falar com a Microsoft. Tente novamente.', 'unknown');
  const code = error.errorCode;
  switch (code) {
    case BrowserAuthErrorCodes.userCancelled:
      return new SignInError('A janela de login foi fechada antes de concluir.', code, true);
    case BrowserAuthErrorCodes.popupWindowError:
    case BrowserAuthErrorCodes.emptyWindowError:
      return new SignInError('O navegador bloqueou a janela de login. Permita pop-ups para este site e tente novamente.', code);
    case BrowserAuthErrorCodes.interactionInProgress:
      return new SignInError('Já existe uma janela de login aberta. Conclua ou feche essa janela antes de tentar de novo.', code);
    case BrowserAuthErrorCodes.monitorWindowTimeout:
    case BrowserAuthErrorCodes.timedOut:
      return new SignInError('O login demorou demais para responder. Tente novamente.', code);
    case BrowserAuthErrorCodes.noNetworkConnectivity:
      return new SignInError('Sem conexão com a Microsoft. Verifique sua internet.', code);
  }
  const aadsts = /AADSTS\d+/.exec(`${error.errorMessage} ${error.subError}`)?.[0];
  if (aadsts === 'AADSTS50011') {
    return new SignInError(`O endereço de retorno ${redirectUri()} não está registrado no aplicativo Entra (plataforma "Single-page application").`, aadsts);
  }
  if (aadsts === 'AADSTS9002326') {
    return new SignInError('O aplicativo Entra está registrado como "Web". O endereço de retorno precisa estar na plataforma "Single-page application".', aadsts);
  }
  return new SignInError('A Microsoft recusou o login. Se persistir, informe o código abaixo ao suporte.', aadsts ?? code);
}
