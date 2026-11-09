import { Activity, AlertTriangle, ExternalLink, Loader2, Settings2 } from 'lucide-react';
import { tr } from '@/control-tower/i18n';
import '@/auth/auth.css';

type State = 'ready' | 'loading' | 'error' | 'missing-config';

interface Props {
  state: State;
  onSignIn?: () => void;
  missing?: string[];
  errorCode?: string | null;
  newTabUrl?: string | null;
  popupAvailable?: boolean;
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function SignInScreen({ state, onSignIn, missing = [], errorCode, newTabUrl, popupAvailable = true }: Props) {
  return (
    <main className="auth-screen">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-badge"><Activity size={22} /></span>
          <div>
            <span className="auth-eyebrow">Control Tower</span>
            <h1 id="auth-title">PC&amp;L Brasil</h1>
          </div>
        </div>

        {state === 'missing-config' ? (
          <div className="auth-note" role="alert">
            <Settings2 size={18} />
            <div>
              <b>{tr('Configuração incompleta')}</b>
              <p>{tr('O servidor não forneceu as configurações abaixo. Defina-as no ambiente do aplicativo e reinicie.')}</p>
              {missing.length > 0 && (
                <ul className="auth-missing">{missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="auth-lead">{tr('Entre com sua conta corporativa Nexteer para acessar os painéis operacionais.')}</p>
            {state === 'error' && (
              <div className="auth-note error" role="alert">
                <AlertTriangle size={18} />
                <div>
                  <b>{tr('Não foi possível entrar')}</b>
                  <p>{tr('Tente novamente. Se o problema continuar, fale com o suporte de TI.')}</p>
                  {errorCode && <p className="auth-code">{tr('Código do erro')}: <code>{errorCode}</code></p>}
                </div>
              </div>
            )}
            {newTabUrl && (
              <div className="auth-note" role="status">
                <ExternalLink size={18} />
                <div>
                  <b>{tr('Abra o app em uma aba própria')}</b>
                  <p>{tr('A prévia embutida do Bolt bloqueia a janela de login da Microsoft. Abra esta mesma prévia em uma nova aba e entre por lá.')}</p>
                </div>
              </div>
            )}
            {newTabUrl && (
              <a className="auth-btn auth-btn-primary" href={newTabUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} />
                <span>{tr('Abrir em nova aba')}</span>
              </a>
            )}
            {popupAvailable && (
              <button type="button" className="auth-btn" onClick={onSignIn} disabled={state === 'loading' || !onSignIn}>
                {state === 'loading' ? <Loader2 size={18} className="auth-spin" /> : <MicrosoftMark />}
                <span>{state === 'loading' ? tr('Conectando...') : tr('Entrar com Microsoft')}</span>
              </button>
            )}
          </>
        )}

        <footer className="auth-foot">{tr('Acesso restrito a colaboradores autorizados.')}</footer>
      </section>
    </main>
  );
}
