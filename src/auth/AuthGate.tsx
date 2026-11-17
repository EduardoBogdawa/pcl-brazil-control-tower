import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, ExternalLink, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { authConfig, isCredentiallessPreview } from '@/auth/config';
import { restoreSession, signIn, signOut, SignInError, type SignedInUser } from '@/auth/msal';
import '@/auth/auth.css';

export type Session = { user: SignedInUser; devMode: boolean; signOut: (() => void) | null };

type GateState =
  | { kind: 'loading' }
  | { kind: 'signedOut'; notice?: string }
  | { kind: 'signingIn' }
  | { kind: 'error'; message: string; code: string }
  | { kind: 'signedIn'; user: SignedInUser };

const DEV_USER: SignedInUser = { name: 'Modo de desenvolvimento', username: 'dev@localhost' };

const toErrorState = (error: unknown): GateState =>
  error instanceof SignInError
    ? error.cancelled
      ? { kind: 'signedOut', notice: error.message }
      : { kind: 'error', message: error.message, code: error.code }
    : { kind: 'error', message: 'Não foi possível concluir o login com a Microsoft. Tente novamente.', code: 'unknown' };

export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const [state, setState] = useState<GateState>({ kind: 'loading' });
  const blocked = isCredentiallessPreview() || !window.isSecureContext;

  useEffect(() => {
    if (authConfig.devMode || !authConfig.configured || blocked) return;
    let active = true;
    restoreSession()
      .then((user) => active && setState(user ? { kind: 'signedIn', user } : { kind: 'signedOut' }))
      .catch((error) => active && setState(toErrorState(error)));
    return () => {
      active = false;
    };
  }, [blocked]);

  const startSignIn = useCallback(() => {
    setState({ kind: 'signingIn' });
    signIn()
      .then((user) => setState({ kind: 'signedIn', user }))
      .catch((error) => setState(toErrorState(error)));
  }, []);

  const endSession = useCallback(() => {
    void signOut();
  }, []);

  if (authConfig.devMode) {
    return (
      <>
        <div className="auth-dev-banner" role="status">
          <ShieldCheck aria-hidden="true" />
          Modo de desenvolvimento: login Microsoft desativado
        </div>
        {children({ user: DEV_USER, devMode: true, signOut: null })}
      </>
    );
  }

  if (!authConfig.configured) {
    return (
      <AuthScreen>
        <Alert title="Login não configurado">
          Os identificadores do tenant e do aplicativo Microsoft Entra não foram definidos para esta versão.
        </Alert>
      </AuthScreen>
    );
  }

  if (isCredentiallessPreview()) {
    return (
      <AuthScreen>
        <Alert title="Abra a prévia em uma nova janela" icon={<ExternalLink aria-hidden="true" />}>
          A prévia isolada do Bolt bloqueia a janela de login da Microsoft. Use <b>More preview controls &gt; Open in new window</b> e
          entre por lá.
        </Alert>
      </AuthScreen>
    );
  }

  if (!window.isSecureContext) {
    return (
      <AuthScreen>
        <Alert title="Conexão não segura">O login Microsoft exige HTTPS. Acesse o Control Tower por um endereço https://.</Alert>
      </AuthScreen>
    );
  }

  if (state.kind === 'signedIn') {
    return <>{children({ user: state.user, devMode: false, signOut: endSession })}</>;
  }

  const busy = state.kind === 'loading' || state.kind === 'signingIn';

  return (
    <AuthScreen>
      {state.kind === 'error' && (
        <Alert title="Falha no login">
          {state.message}
          <small className="auth-code">Código: {state.code}</small>
        </Alert>
      )}
      {state.kind === 'signedOut' && state.notice && (
        <p className="auth-notice" role="status">
          {state.notice}
        </p>
      )}
      <button type="button" className="auth-button" onClick={startSignIn} disabled={busy} aria-busy={busy}>
        {busy ? <Loader2 className="auth-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {state.kind === 'loading' ? 'Verificando sessão...' : state.kind === 'signingIn' ? 'Aguardando a janela da Microsoft...' : 'Entrar com Microsoft'}
      </button>
      <p className="auth-hint">Use sua conta corporativa Nexteer. Uma janela da Microsoft será aberta para o login.</p>
    </AuthScreen>
  );
}

function Alert({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="auth-alert" role="alert">
      {icon ?? <AlertTriangle aria-hidden="true" />}
      <div>
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </div>
  );
}

function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="auth-screen">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="authTitle">
        <img className="auth-logo" src="/nexteer-logo.png" alt="Nexteer Automotive" />
        <span className="auth-eyebrow">PC&amp;L Brasil</span>
        <h1 id="authTitle">Control Tower</h1>
        <p className="auth-lead">Entre para acessar os painéis operacionais da equipe.</p>
        {children}
      </section>
    </main>
  );
}
