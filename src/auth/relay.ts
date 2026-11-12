import { runPopupRelay } from '@azure/msal-browser/popup-relay';
import { authorityOrigin } from '@/auth/authConfig';

// This window has its own storage, so the app's language setting isn't visible here.
const en = !navigator.language.toLowerCase().startsWith('pt');

const text = en
  ? {
    title: 'Microsoft account', desc: 'Click below to continue on the Microsoft page.', label: 'Continue with Microsoft',
    waiting: 'Finish the step in the Microsoft window...',
    invalid: 'This window must be opened from the Control Tower sign-in or sign-out button.',
  }
  : {
    title: 'Conta Microsoft', desc: 'Clique abaixo para continuar na página da Microsoft.', label: 'Continuar com Microsoft',
    waiting: 'Conclua a etapa na janela da Microsoft...',
    invalid: 'Esta janela deve ser aberta pelos botões de entrar ou sair do Control Tower.',
  };

const byId = (id: string) => document.getElementById(id)!;
const button = byId('continue') as HTMLButtonElement;
const status = byId('status');

document.documentElement.lang = en ? 'en' : 'pt-BR';
byId('title').textContent = text.title;
byId('desc').textContent = text.desc;
byId('label').textContent = text.label;

const showError = (message: string) => {
  status.textContent = message;
  status.className = 'error';
  button.hidden = true;
};

if (!window.opener || !new URLSearchParams(window.location.hash.slice(1)).has('req')) {
  showError(text.invalid);
} else {
  // The Microsoft window must be opened from a click here, or the browser will block it.
  button.addEventListener('click', () => {
    button.disabled = true;
    status.textContent = text.waiting;
    try {
      runPopupRelay({ allowedAuthorityOrigins: [authorityOrigin] });
    } catch (err) {
      console.error('[auth] relay failed', err);
      showError(text.invalid);
    }
  }, { once: true });
}
