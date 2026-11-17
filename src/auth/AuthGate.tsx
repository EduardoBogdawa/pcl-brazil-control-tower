import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { authConfig } from '@/auth/config';
import { restoreSession, signIn, signOut, type SignedInUser } from '@/auth/msal';
import '@/auth/auth.css';

export type Session = { user: SignedInUser; devMode: boolean; signOut: (() => void) | null };

type GateState =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'redirecting' }
  | { kind: 'error'; message: string }
  | { kind: 'signedIn'; user: SignedInUser };

const DEV_USER: SignedInUser = { name: 'Modo de desenvolvimento', username: 'dev@localhost' };

export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const [state, setState] = useState<GateState>({ kind: 'loading' });

  const restore = useCallback(() => {
    setState({ kind: 'loading' });
    restoreSession()
      .then((user) => setState(user ? { kind: 'signedIn', user } : { kind: 'signedOut' }))
      .catch(() => setState({ kind: 'error', message: 'Não foi possível concluir o login com a Microsoft. Tente novamente.' }));
  }, []);

  useEffect(() => {
    if (authConfig.devMode || !authConfig.configured) return;
    restore();
  }, [restore]);

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
        <div className="auth-alert" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <b>Login não configurado</b>
            <p>Os identificadores do tenant e do aplicativo Microsoft Entra não foram definidos para esta versão.</p>
          </div>
        </div>
      </AuthScreen>
    );
  }

  if (state.kind === 'signedIn') {
    return <>{children({ user: state.user, devMode: false, signOut: () => void signOut() })}</>;
  }

  const startSignIn = () => {
    setState({ kind: 'redirecting' });
    signIn().catch(() => setState({ kind: 'error', message: 'O login foi cancelado ou não pôde ser iniciado. Tente novamente.' }));
  };

  const busy = state.kind === 'loading' || state.kind === 'redirecting';

  return (
    <AuthScreen>
      {state.kind === 'error' && (
        <div className="auth-alert" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <b>Falha no login</b>
            <p>{state.message}</p>
          </div>
        </div>
      )}
      <button type="button" className="auth-button" onClick={startSignIn} disabled={busy} aria-busy={busy}>
        {busy ? <Loader2 className="auth-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {state.kind === 'loading' ? 'Verificando sessão...' : state.kind === 'redirecting' ? 'Abrindo Microsoft...' : 'Entrar com Microsoft'}
      </button>
      <p className="auth-hint">Use sua conta corporativa Nexteer. O acesso é feito pelo login único da Microsoft.</p>
    </AuthScreen>
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
