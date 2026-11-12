import { useState } from 'react';
import { AlertTriangle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { tr } from '@/control-tower/i18n.js';

type Props =
  | { mode: 'loading' }
  | { mode: 'misconfigured' }
  | { mode: 'signedOut'; error?: string; onSignIn: () => Promise<void> };

function MicrosoftMark() {
  return (
    <svg className="auth-ms" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function SignInScreen(props: Props) {
  const [redirecting, setRedirecting] = useState(false);

  const handleSignIn = async () => {
    if (props.mode !== 'signedOut') return;
    setRedirecting(true);
    await props.onSignIn();
    setRedirecting(false);
  };

  return (
    <main className="auth-shell">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="auth-title">
        <img src="/nexteer-logo.png" alt="Nexteer" className="auth-logo" />
        <span className="auth-eyebrow">Control Tower</span>
        <h1 id="auth-title">PC&amp;L Brasil</h1>
        <p className="auth-sub">{tr('Centralize, organize e acesse seus painéis operacionais.')}</p>

        {props.mode === 'loading' && (
          <div className="auth-status" role="status">
            <Loader2 className="auth-spin" size={18} aria-hidden="true" />
            <span>{tr('Verificando sua sessão...')}</span>
          </div>
        )}

        {props.mode === 'misconfigured' && (
          <div className="auth-alert" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{tr('O login da Microsoft não está configurado. Informe o Tenant ID e o Client ID do Entra ID.')}</span>
          </div>
        )}

        {props.mode === 'signedOut' && (
          <>
            {props.error && (
              <div className="auth-alert" role="alert">
                <AlertTriangle size={18} aria-hidden="true" />
                <span>{tr(props.error)}</span>
              </div>
            )}
            <button type="button" className="auth-btn" onClick={handleSignIn} disabled={redirecting}>
              {redirecting ? <Loader2 className="auth-spin" size={18} aria-hidden="true" /> : <MicrosoftMark />}
              <span>{redirecting ? tr('Redirecionando...') : tr('Entrar com Microsoft')}</span>
            </button>
          </>
        )}

        <footer className="auth-foot">
          <span><ShieldCheck size={14} aria-hidden="true" />{tr('Login único corporativo (SSO)')}</span>
          <span><Lock size={14} aria-hidden="true" />{tr('Acesso restrito a colaboradores Nexteer')}</span>
        </footer>
      </section>
    </main>
  );
}

export default SignInScreen;
