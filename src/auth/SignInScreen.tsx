import { AlertTriangle, ExternalLink, Info, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { tr } from '@/control-tower/i18n.js';
import type { AuthMessage } from '@/auth/msalClient';

type Props =
  | { mode: 'loading' }
  | { mode: 'misconfigured' }
  | { mode: 'isolated' }
  | { mode: 'signedOut'; message?: AuthMessage; busy: boolean; onSignIn: () => void };

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

function AlertBox({ message }: { message: AuthMessage }) {
  const info = message.tone === 'info';
  return (
    <div className={'auth-alert' + (info ? ' info' : '')} role={info ? 'status' : 'alert'}>
      {info ? <Info size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
      <span>
        {tr(message.text)}
        {message.code && <code className="auth-code">{tr('Código')}: {message.code}</code>}
      </span>
    </div>
  );
}

function SignInScreen(props: Props) {
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
          <AlertBox message={{ tone: 'error', text: 'O login da Microsoft não está configurado. Informe o Tenant ID e o Client ID do Entra ID.' }} />
        )}

        {props.mode === 'isolated' && (
          <>
            <AlertBox
              message={{
                tone: 'info',
                code: 'credentialless_iframe',
                text: 'Esta prévia roda em um quadro isolado do navegador, que abre janelas sem vínculo com a página. Por isso o login da Microsoft não consegue retornar aqui. Abra o Control Tower em uma nova aba para entrar.',
              }}
            />
            <a className="auth-btn" href={window.location.href} target="_blank" rel="noopener">
              <ExternalLink size={18} aria-hidden="true" />
              <span>{tr('Abrir em nova aba para entrar')}</span>
            </a>
          </>
        )}

        {props.mode === 'signedOut' && (
          <>
            {props.message && <AlertBox message={props.message} />}
            <button type="button" className="auth-btn" onClick={props.onSignIn} disabled={props.busy} aria-busy={props.busy}>
              {props.busy ? <Loader2 className="auth-spin" size={18} aria-hidden="true" /> : <MicrosoftMark />}
              <span>{props.busy ? tr('Conclua o login na janela da Microsoft...') : tr('Entrar com Microsoft')}</span>
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
